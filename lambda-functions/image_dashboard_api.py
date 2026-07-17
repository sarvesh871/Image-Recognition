import json
import os
from decimal import Decimal
from botocore.config import Config
import boto3

# ------------------------------------------------------------
# AWS Clients
# ------------------------------------------------------------

s3 = boto3.client(
    "s3",
    region_name="ap-south-1",
    endpoint_url="https://s3.ap-south-1.amazonaws.com",
    config=Config(
        signature_version="s3v4",
        s3={
            "addressing_style": "virtual"
        }
    )
)
dynamodb = boto3.resource("dynamodb")

# ------------------------------------------------------------
# Environment Variables
# ------------------------------------------------------------

BUCKET_NAME = os.environ["BUCKET_NAME"]
TABLE_NAME = os.environ["TABLE_NAME"]

table = dynamodb.Table(TABLE_NAME)

# ------------------------------------------------------------
# Helpers
# ------------------------------------------------------------

def decimal_default(obj):

    if isinstance(obj, Decimal):

        if obj % 1 == 0:
            return int(obj)

        return float(obj)

    raise TypeError


def response(status, body):

    return {
        "statusCode": status,
        "headers": {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Allow-Methods": "GET,OPTIONS"
        },
        "body": json.dumps(body, default=decimal_default)
    }


def image_url(key):

    return s3.generate_presigned_url(
        "get_object",
        Params={
            "Bucket": BUCKET_NAME,
            "Key": key
        },
        ExpiresIn=3600
    )


def audio_url(key):

    return s3.generate_presigned_url(
        "get_object",
        Params={
            "Bucket": BUCKET_NAME,
            "Key": key
        },
        ExpiresIn=3600
    )


# ------------------------------------------------------------
# Lambda Handler
# ------------------------------------------------------------

def lambda_handler(event, context):

    route = event.get("rawPath", "")

    # ========================================================
    # GET /images
    # ========================================================

    if route.endswith("/images"):

        response_items = table.scan()

        items = response_items.get("Items", [])

        items.sort(
            key=lambda x: x.get("captureTimestamp", 0),
            reverse=True
        )

        results = []

        for item in items:

            results.append({

                "imageId": item["imageId"],

                "featuredObject": item["featuredObject"],

                "summary": item["summary"],

                "recognitionGrade": item["recognitionGrade"],

                "captureTimestamp": item["captureTimestamp"],

                "imageUrl": image_url(
                    item["imageKey"]
                ),

                "audioUrl": audio_url(
                    item["audioKey"]
                )

            })

        return response(
            200,
            results
        )

    # ========================================================
    # GET /image/{id}
    # ========================================================

    image_id = event["pathParameters"]["id"]

    result = table.get_item(

        Key={
            "imageId": image_id
        }

    )

    if "Item" not in result:

        return response(
            404,
            {
                "message": "Image not found"
            }
        )

    item = result["Item"]

    item["imageUrl"] = image_url(
        item["imageKey"]
    )

    item["audioUrl"] = audio_url(
        item["audioKey"]
    )

    return response(
        200,
        item
    )