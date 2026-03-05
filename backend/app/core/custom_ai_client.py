"""
NVIDIA AI client for medical image analysis.
Used when AI_SERVICE=nvidia in the environment.

Uses the NVIDIA Inference API (OpenAI-compatible) with a vision-capable model.
"""

import json
import base64
import requests
from app.core.config import get_settings

NVIDIA_INVOKE_URL = "https://integrate.api.nvidia.com/v1/chat/completions"
NVIDIA_MODEL = "mistralai/mistral-large-3-675b-instruct-2512"

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


def analyze_medical_image(
    image_bytes: bytes,
    content_type: str,
    record_type: str,
) -> dict:
    """
    Analyze a medical document using the NVIDIA Inference API (Kimi K2.5).

    Args:
        image_bytes: Raw file bytes
        content_type: MIME type (image/jpeg, image/png, application/pdf)
        record_type: 'record', 'report', or 'lab_report'

    Returns:
        Parsed JSON analysis result
    """
    settings = get_settings()

    # Select prompt based on record type
    if record_type == "lab_report":
        prompt = LAB_REPORT_PROMPT
    elif record_type in ("record", "report"):
        prompt = PRESCRIPTION_PROMPT
    else:
        prompt = GENERIC_PROMPT

    # Encode image as base64 data URL
    image_b64 = base64.b64encode(image_bytes).decode("utf-8")
    data_url = f"data:{content_type};base64,{image_b64}"

    headers = {
        "Authorization": f"Bearer {settings.nvidia_api_key}",
        "Accept": "application/json",
    }

    payload = {
        "model": NVIDIA_MODEL,
        "messages": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "image_url",
                        "image_url": {"url": data_url},
                    },
                    {
                        "type": "text",
                        "text": prompt,
                    },
                ],
            }
        ],
        "max_tokens": 4096,
        "temperature": 0.2,   # lower temp for structured extraction
        "top_p": 1.00,
        "stream": False,
    }

    response = requests.post(NVIDIA_INVOKE_URL, headers=headers, json=payload, timeout=120)
    response.raise_for_status()

    response_data = response.json()
    assistant_text = response_data["choices"][0]["message"]["content"]

    # Strip possible markdown fences
    text = assistant_text.strip()
    if text.startswith("```"):
        lines = text.split("\n")
        text = "\n".join(lines[1:-1] if lines[-1].strip() == "```" else lines[1:])

    try:
        result = json.loads(text)
    except json.JSONDecodeError:
        result = {
            "analysis_type": "error",
            "summary": "Could not parse AI response. Raw output saved.",
            "raw_response": assistant_text,
            "recommendations": ["Please try analyzing again or consult a doctor."],
        }

    return result
