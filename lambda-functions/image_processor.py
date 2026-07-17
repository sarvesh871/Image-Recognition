import json
import os
import time
from decimal import Decimal
from urllib.parse import unquote_plus

import boto3


# ------------------------------------------------------------------
# AWS Clients
# ------------------------------------------------------------------

s3 = boto3.client("s3")
rekognition = boto3.client("rekognition")
polly = boto3.client("polly")
dynamodb = boto3.resource("dynamodb")


# ------------------------------------------------------------------
# Environment Variables
# ------------------------------------------------------------------

BUCKET_NAME = os.environ["BUCKET_NAME"]
TABLE_NAME = os.environ["TABLE_NAME"]
VOICE_ID = os.environ["VOICE_ID"]

table = dynamodb.Table(TABLE_NAME)


# ------------------------------------------------------------------
# Decimal Helper
# ------------------------------------------------------------------

def d(value):
    """
    Convert float to Decimal for DynamoDB.
    """
    return Decimal(str(round(float(value), 2)))


# ------------------------------------------------------------------
# Recognition Grade
# ------------------------------------------------------------------

def recognition_grade(avg):

    if avg >= 99:
        return "★★★★★ Excellent"

    elif avg >= 95:
        return "★★★★☆ Very High"

    elif avg >= 90:
        return "★★★★ High"

    elif avg >= 80:
        return "★★★ Moderate"

    else:
        return "★★ Low"


# ------------------------------------------------------------------
# Build Object Hierarchy
# ------------------------------------------------------------------

def build_objects(labels):

    parent_names = set()

    for label in labels:

        for parent in label.get("Parents", []):

            parent_names.add(parent["Name"])

    featured_labels = []

    for label in labels:

        if label["Name"] not in parent_names:

            featured_labels.append(label)

    objects = []

    categories = set()

    confidences = []

    for label in featured_labels:

        confidence = float(label["Confidence"])

        confidences.append(confidence)

        count = len(label.get("Instances", []))

        if count == 0:
            count = 1

        aliases = []

        for alias in label.get("Aliases", []):

            aliases.append(alias["Name"])

        category = None

        if label.get("Categories"):

            category = label["Categories"][0]["Name"]

            categories.add(category)

        boxes = []

        for instance in label.get("Instances", []):

            bbox = instance["BoundingBox"]
            
            boxes.append({
                "Width": d(bbox["Width"]),
                "Height": d(bbox["Height"]),
                "Left": d(bbox["Left"]),
                "Top": d(bbox["Top"])
            })

        objects.append({

            "name": label["Name"],

            "confidence": d(confidence),

            "count": count,

            "category": category,

            "aliases": aliases,

            "boxes": boxes

        })

    avg_confidence = 0

    if confidences:

        avg_confidence = sum(confidences) / len(confidences)

    return (
        objects,
        sorted(list(categories)),
        avg_confidence
    )


# ------------------------------------------------------------------
# Extract Text
# ------------------------------------------------------------------

def extract_text(text_response):

    detected = []

    for item in text_response["TextDetections"]:

        if item["Type"] == "LINE":

            detected.append(item["DetectedText"])

    return detected


# ------------------------------------------------------------------
# Build Natural Summary
# ------------------------------------------------------------------

def pluralize(word, count):

    if count == 1:
        return word.lower()

    irregular = {
        "Person": "people",
        "Man": "men",
        "Woman": "women",
        "Child": "children",
        "Mouse": "mice",
        "Goose": "geese",
        "Fish": "fish",
        "Sheep": "sheep"
    }

    if word in irregular:
        return irregular[word]

    return word.lower() + "s"

def build_summary(
    featured_object,
    objects,
    categories,
    detected_text
):

    summary = []

    summary.append(
        f"The primary object detected is {featured_object}."
    )

    if objects:

        obj = objects[0]

        if obj["count"] == 1:

            summary.append(
                f"One {obj['name'].lower()} was detected."
            )

        else:

            summary.append(
                f"Approximately {obj['count']} {pluralize(obj['name'], obj['count'])} were detected."
            )

    if len(objects) > 1:

        others = []

        for obj in objects[1:4]:

            others.append(obj["name"])

        summary.append(
            "Other important objects include "
            + ", ".join(others)
            + "."
        )

    if categories:

        summary.append(
            "It belongs to the "
            + ", ".join(categories)
            + " category."
        )

    if detected_text:

        summary.append(
            "Visible text includes "
            + ", ".join(detected_text[:3])
            + "."
        )

    else:

        summary.append(
            "No readable text was detected."
        )

    return " ".join(summary)


# ------------------------------------------------------------------
# Polly Helper
# ------------------------------------------------------------------

def generate_audio(summary, audio_key):

    response = polly.synthesize_speech(

        Text=summary,

        OutputFormat="mp3",

        VoiceId=VOICE_ID

    )

    s3.put_object(

        Bucket=BUCKET_NAME,

        Key=audio_key,

        Body=response["AudioStream"].read(),

        ContentType="audio/mpeg"

    )


# ------------------------------------------------------------------
# DynamoDB Formatter
# ------------------------------------------------------------------

def build_item(

    image_id,

    image_key,

    audio_key,

    featured_object,

    summary,

    objects,

    categories,

    detected_text,

    avg_confidence,

    model_version

):

    return {

        "imageId": image_id,

        "imageKey": image_key,

        "audioKey": audio_key,

        "featuredObject": featured_object,

        "summary": summary,

        "objects": objects,

        "categories": categories,

        "detectedText": detected_text,

        "averageConfidence": d(avg_confidence),

        "recognitionGrade": recognition_grade(avg_confidence),

        "modelVersion": model_version,

        "captureTimestamp": int(time.time()),

        "status": "READY"

    }

def lambda_handler(event, context):

    print(json.dumps(event))

    for record in event["Records"]:

        try:

            # ------------------------------------------------------
            # S3 Event Details
            # ------------------------------------------------------

            bucket = record["s3"]["bucket"]["name"]

            key = unquote_plus(
                record["s3"]["object"]["key"]
            )

            print(f"Processing: {key}")

            image_id = os.path.splitext(
                os.path.basename(key)
            )[0]

            audio_key = (
                f"audio-summary/{image_id}.mp3"
            )

            # ------------------------------------------------------
            # Amazon Rekognition
            # ------------------------------------------------------

            labels_response = rekognition.detect_labels(

                Image={
                    "S3Object": {
                        "Bucket": bucket,
                        "Name": key
                    }
                },

                MaxLabels=20,

                MinConfidence=80

            )

            text_response = rekognition.detect_text(

                Image={
                    "S3Object": {
                        "Bucket": bucket,
                        "Name": key
                    }
                }

            )

            labels = labels_response["Labels"]

            model_version = labels_response.get(
                "LabelModelVersion",
                "Unknown"
            )

            # ------------------------------------------------------
            # Build Objects
            # ------------------------------------------------------

            (
                objects,
                categories,
                avg_confidence
            ) = build_objects(labels)

            detected_text = extract_text(
                text_response
            )

            # ------------------------------------------------------
            # Featured Object
            # ------------------------------------------------------

            if objects:

                featured_object = objects[0]["name"]

            elif labels:

                featured_object = labels[0]["Name"]

            else:

                featured_object = "Unknown Object"

            # ------------------------------------------------------
            # Summary
            # ------------------------------------------------------

            summary = build_summary(

                featured_object,

                objects,

                categories,

                detected_text

            )

            print(summary)

            # ------------------------------------------------------
            # Amazon Polly
            # ------------------------------------------------------

            generate_audio(

                summary,

                audio_key

            )

            # ------------------------------------------------------
            # DynamoDB Item
            # ------------------------------------------------------

            item = build_item(

                image_id=image_id,

                image_key=key,

                audio_key=audio_key,

                featured_object=featured_object,

                summary=summary,

                objects=objects,

                categories=categories,

                detected_text=detected_text,

                avg_confidence=avg_confidence,

                model_version=model_version

            )

            table.put_item(

                Item=item

            )

            print("Successfully stored metadata.")

        except Exception as e:

            print(f"Error processing {key}")

            print(str(e))

            raise

    return {

        "statusCode": 200,

        "body": json.dumps({

            "message": "Processing completed."

        })

    }