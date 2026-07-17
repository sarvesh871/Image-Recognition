import json
import uuid
import os
import boto3
from botocore.config import Config

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

BUCKET_NAME = os.environ["BUCKET_NAME"]


def response(status, body):
    return {
        "statusCode": status,
        "headers": {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Allow-Methods": "POST,OPTIONS"
        },
        "body": json.dumps(body)
    }


def lambda_handler(event, context):

    image_id = str(uuid.uuid4())

    body = {}

    if event.get("body"):
        body = json.loads(event["body"])

    extension = body.get("extension", "jpg").lower()

    allowed = {
        "jpg",
        "jpeg",
        "png",
        "webp"
    }

    if extension not in allowed:
        extension = "jpg"

    content_types = {
        "jpg": "image/jpeg",
        "jpeg": "image/jpeg",
        "png": "image/png",
        "webp": "image/webp"
    }

    content_type = content_types[extension]

    object_key = f"images/{image_id}.{extension}"

    upload_url = s3.generate_presigned_url(
        ClientMethod="put_object",
        Params={
            "Bucket": BUCKET_NAME,
            "Key": object_key,
            "ContentType": content_type
        },
        ExpiresIn=300
    )

    return response(
        200,
        {
            "imageId": image_id,
            "objectKey": object_key,
            "uploadUrl": upload_url
        }
    )