import json
import base64
import boto3
from functools import lru_cache
from app.core.config import get_settings

BEDROCK_MODEL_ID = "mistral.mistral-large-3-675b-instruct"

PRESCRIPTION_PROMPT = """You are a medical document analyzer. Analyze this prescription image carefully.

Extract ALL medications/drugs mentioned and return a JSON response with this exact structure:
{
  "analysis_type": "prescription",
  "summary": "Brief 1-2 sentence summary of the prescription",
  "drugs": [
    {
      "name": "Drug name",
      "dosage": "Dosage (e.g., 500mg)",
      "frequency": "How often (e.g., Twice daily)",
      "duration": "For how long (e.g., 7 days)",
      "instructions": "Special instructions (e.g., After meals)"
    }
  ],
  "doctor_name": "Doctor name if visible",
  "date": "Prescription date if visible",
  "recommendations": ["Any general recommendations based on the prescription"]
}

If you cannot read or identify any field, use "Not specified" as the value.
Return ONLY valid JSON, no markdown or extra text."""

LAB_REPORT_PROMPT = """You are a medical lab report analyzer. Analyze this lab report image carefully.

Extract ALL test parameters and return a JSON response with this exact structure:
{
  "analysis_type": "lab_report",
  "summary": "Brief 2-3 sentence summary of overall health status based on results",
  "test_name": "Name of the test (e.g., Complete Blood Count, Lipid Profile)",
  "parameters": [
    {
      "name": "Parameter name (e.g., Hemoglobin)",
      "value": "Measured value with unit",
      "reference_range": "Normal reference range",
      "status": "normal | high | low | critical"
    }
  ],
  "abnormal_findings": ["List of concerning findings"],
  "recommendations": [
    "Specific actionable recommendations based on the results",
    "When the user should follow up",
    "Any lifestyle/dietary suggestions"
  ]
}

If you cannot read or identify any field, use "Not specified" as the value.
Flag parameters as "critical" if they are significantly outside normal range.
Return ONLY valid JSON, no markdown or extra text."""

GENERIC_PROMPT = """You are a medical document analyzer. Analyze this medical document image carefully.

Return a JSON response with this exact structure:
{
  "analysis_type": "medical_document",
  "summary": "Brief 2-3 sentence summary of the document",
  "key_findings": ["List of key information found in the document"],
  "recommendations": ["Any recommendations based on the document"]
}

Return ONLY valid JSON, no markdown or extra text."""


@lru_cache()
def get_bedrock_client():
    """Return a configured boto3 Bedrock Runtime client."""
    settings = get_settings()
    return boto3.client(
        "bedrock-runtime",
        region_name=settings.aws_bedrock_region,
        aws_access_key_id=settings.aws_access_key_id,
        aws_secret_access_key=settings.aws_secret_access_key,
    )


def _get_media_type(content_type: str) -> str:
    """Map content type to Bedrock-supported media type."""
    mapping = {
        "image/jpeg": "image/jpeg",
        "image/png": "image/png",
        "application/pdf": "application/pdf",
    }
    return mapping.get(content_type, "image/jpeg")


def analyze_medical_image(
    image_bytes: bytes,
    content_type: str,
    record_type: str,
) -> dict:
    """
    Analyze a medical document using Amazon Bedrock Mistral Large 3.

    Args:
        image_bytes: Raw file bytes
        content_type: MIME type (image/jpeg, image/png, application/pdf)
        record_type: 'record', 'report', or 'lab_report'

    Returns:
        Parsed JSON analysis result
    """
    # Select prompt based on record type
    if record_type == "lab_report":
        prompt = LAB_REPORT_PROMPT
    elif record_type in ("record", "report"):
        prompt = PRESCRIPTION_PROMPT
    else:
        prompt = GENERIC_PROMPT

    # Encode image to base64 data URL
    image_b64 = base64.b64encode(image_bytes).decode("utf-8")
    media_type = _get_media_type(content_type)
    data_url = f"data:{media_type};base64,{image_b64}"

    # Build Bedrock request body (Mistral chat completion format with vision)
    request_body = {
        "max_tokens": 4096,
        "messages": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": data_url,
                        },
                    },
                    {
                        "type": "text",
                        "text": prompt,
                    },
                ],
            }
        ],
    }

    client = get_bedrock_client()

    response = client.invoke_model(
        modelId=BEDROCK_MODEL_ID,
        contentType="application/json",
        accept="application/json",
        body=json.dumps(request_body),
    )

    # Parse response (Mistral format: choices[0].message.content)
    response_body = json.loads(response["body"].read())
    assistant_text = response_body["choices"][0]["message"]["content"]

    # Extract JSON from response (handle possible markdown wrapping)
    text = assistant_text.strip()
    if text.startswith("```"):
        # Remove markdown code fences
        lines = text.split("\n")
        text = "\n".join(lines[1:-1] if lines[-1].strip() == "```" else lines[1:])

    try:
        result = json.loads(text)
    except json.JSONDecodeError:
        # Fallback if JSON parsing fails
        result = {
            "analysis_type": "error",
            "summary": "Could not parse AI response. Raw output saved.",
            "raw_response": assistant_text,
            "recommendations": ["Please try analyzing again or consult a doctor."],
        }

    return result
