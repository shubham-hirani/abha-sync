"""
AWS Textract client for extracting text from PDF documents.

For PDFs > 1 page, uses the async StartDocumentTextDetection API.
Polls until the job completes (max ~2 min).
"""

import time
import boto3
from functools import lru_cache
from app.core.config import get_settings


@lru_cache()
def get_textract_client():
    """Return a configured boto3 Textract client."""
    settings = get_settings()
    return boto3.client(
        "textract",
        region_name=settings.aws_textract_region,
        aws_access_key_id=settings.aws_access_key_id,
        aws_secret_access_key=settings.aws_secret_access_key,
    )


def extract_text_from_pdf(s3_key: str, max_wait_seconds: int = 120) -> str:
    """
    Extract all text from a PDF stored in S3 using Textract async API.

    Uses StartDocumentTextDetection (async) which handles multi-page PDFs.
    Polls every 3 seconds until done or timeout.

    Args:
        s3_key: The S3 object key of the PDF file
        max_wait_seconds: Maximum time to wait for Textract to finish

    Returns:
        Extracted text as a single string (lines joined with newlines)

    Raises:
        RuntimeError: If Textract job fails or times out
    """
    settings = get_settings()
    client = get_textract_client()

    # Start async job — Textract reads directly from S3
    start_response = client.start_document_text_detection(
        DocumentLocation={
            "S3Object": {
                "Bucket": settings.aws_s3_bucket_name,
                "Name": s3_key,
            }
        }
    )
    job_id = start_response["JobId"]

    # Poll until complete
    elapsed = 0
    poll_interval = 3

    while elapsed < max_wait_seconds:
        result = client.get_document_text_detection(JobId=job_id)
        status = result["JobStatus"]

        if status == "SUCCEEDED":
            return _collect_all_pages(client, job_id, result)

        if status == "FAILED":
            error_msg = result.get("StatusMessage", "Unknown Textract error")
            raise RuntimeError(f"Textract job failed: {error_msg}")

        # PARTIAL or IN_PROGRESS — keep waiting
        time.sleep(poll_interval)
        elapsed += poll_interval

    raise RuntimeError(
        f"Textract job timed out after {max_wait_seconds}s. "
        "Try again — large PDFs can take longer."
    )


def _collect_all_pages(client, job_id: str, first_result: dict) -> str:
    """
    Collect LINE blocks from all result pages (Textract paginates large docs).
    """
    lines: list[str] = []
    result = first_result

    while True:
        for block in result.get("Blocks", []):
            if block["BlockType"] == "LINE":
                lines.append(block["Text"])

        next_token = result.get("NextToken")
        if not next_token:
            break

        result = client.get_document_text_detection(JobId=job_id, NextToken=next_token)

    return "\n".join(lines)
