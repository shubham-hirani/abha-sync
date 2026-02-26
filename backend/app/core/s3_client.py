import boto3
from functools import lru_cache
from app.core.config import get_settings


@lru_cache()
def get_s3_client():
    """Return a configured boto3 S3 client."""
    settings = get_settings()
    return boto3.client(
        "s3",
        region_name=settings.aws_s3_region,
        aws_access_key_id=settings.aws_access_key_id,
        aws_secret_access_key=settings.aws_secret_access_key,
    )


def upload_file_to_s3(file_bytes: bytes, s3_key: str, content_type: str) -> str:
    """
    Upload a file to the private S3 bucket.
    Returns the S3 key for future reference.
    """
    settings = get_settings()
    client = get_s3_client()
    client.put_object(
        Bucket=settings.aws_s3_bucket_name,
        Key=s3_key,
        Body=file_bytes,
        ContentType=content_type,
    )
    return s3_key


def generate_presigned_url(s3_key: str, expires_in: int = 3600) -> str:
    """
    Generate a presigned GET URL for a private S3 object.
    Default expiry: 1 hour (3600 seconds).
    The frontend can use this URL directly in <img> tags or download links.
    """
    settings = get_settings()
    client = get_s3_client()
    url = client.generate_presigned_url(
        "get_object",
        Params={
            "Bucket": settings.aws_s3_bucket_name,
            "Key": s3_key,
        },
        ExpiresIn=expires_in,
    )
    return url


def download_file_from_s3(s3_key: str) -> bytes:
    """Download a file from S3 and return its bytes."""
    settings = get_settings()
    client = get_s3_client()
    response = client.get_object(
        Bucket=settings.aws_s3_bucket_name,
        Key=s3_key,
    )
    return response["Body"].read()


def delete_file_from_s3(s3_key: str) -> None:
    """Delete a file from the S3 bucket."""
    settings = get_settings()
    client = get_s3_client()
    client.delete_object(
        Bucket=settings.aws_s3_bucket_name,
        Key=s3_key,
    )
