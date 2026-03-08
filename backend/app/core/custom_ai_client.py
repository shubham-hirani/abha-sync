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

PRESCRIPTION_PROMPT = """You are a friendly medical assistant helping a regular person (not a doctor) understand their prescription.
Analyze the prescription image and return a detailed JSON response.

RULES:
- Use simple, everyday language. Avoid medical jargon. If a medical term must be used, explain it in plain words.
- Explain what each medicine is FOR and WHY the doctor likely prescribed it.
- Mention common side effects the patient might notice.
- Flag any important warnings (e.g., do not drink alcohol, avoid driving, do not stop suddenly).
- Mention if the medicine interacts with common foods.
- Be warm and reassuring in tone.

Return this exact JSON structure:
{
  "analysis_type": "prescription",
  "summary": "A 2-3 sentence plain-English overview of what this prescription is for and what condition it is treating.",
  "doctor_name": "Doctor name if visible, else Not specified",
  "date": "Prescription date if visible, else Not specified",
  "drugs": [
    {
      "name": "Medicine name",
      "what_it_is": "In 1-2 plain sentences: what this medicine does and what condition it treats (no jargon)",
      "dosage": "How much to take (e.g., 500mg, 1 tablet)",
      "frequency": "How often to take it in plain words (e.g., Once every morning, Twice a day - morning and night)",
      "duration": "How long to take it (e.g., For 7 days, Until finished)",
      "when_to_take": "Best time to take it, e.g., After breakfast, Before going to sleep, On empty stomach",
      "side_effects": ["Common side effects in plain words, e.g., May cause mild stomach upset", "May make you feel drowsy"],
      "warnings": ["Important warnings, e.g., Do not drink alcohol while on this medicine", "Do not skip doses even if you feel better"],
      "food_interactions": "Any food to avoid or take with, e.g., Take with food to avoid stomach upset. Avoid grapefruit juice.",
      "instructions": "Any other special instructions from the prescription"
    }
  ],
  "general_precautions": [
    "Simple actionable precautions for the patient to follow while on these medicines"
  ],
  "when_to_see_doctor": {
    "urgency": "routine | soon | urgent",
    "reason": "Plain-language explanation of when and why they should contact their doctor, e.g., Go back to your doctor if your symptoms do not improve in 3 days, or if you have difficulty breathing."
  },
  "reassurance": "A short, warm, encouraging note to the patient about their treatment."
}

If you cannot read or identify any field, use "Not specified".
Return ONLY valid JSON, no markdown, no extra text."""

LAB_REPORT_PROMPT = """You are a friendly health advisor helping a regular person (not a doctor) understand their lab report results.
Analyze the lab report and return a detailed, patient-friendly JSON response.

RULES:
- Explain EVERY parameter in simple, everyday language. Pretend you are explaining to someone who has never seen a lab report before.
- For each parameter, explain: what it measures in the body, what the result means for THIS person, and what they should do.
- Never use unexplained medical abbreviations.
- Be honest but not alarming. Be informative and empowering.
- Suggest practical dietary and lifestyle changes where relevant.
- Suggest supplements only if widely accepted and safe. Always note "consult your doctor before taking any supplement".
- Always indicate clearly whether the person needs to see a doctor and how urgently.
- You MUST return every key in the JSON schema below, even if empty. Use [] for empty arrays and "Not specified" for empty strings.

Return ONLY this exact JSON structure, no markdown fences, no extra text:
{
  "analysis_type": "lab_report",
  "summary": "2-3 sentence overall plain-language summary of the test results.",
  "doctor_name": "Doctor or lab name if visible, else Not specified",
  "patient_name": "Patient name if visible on the report, else Not specified",
  "date": "Report date if visible, else Not specified",
  "overall_health_verdict": "good | attention_needed | action_required",
  "parameters": [
    {
      "name": "Parameter name and what it stands for in plain terms (e.g., Hemoglobin - carries oxygen in blood)",
      "value": "Measured value with unit (e.g., 10.5 g/dL)",
      "reference_range": "Healthy range (e.g., 12-16 g/dL for women)",
      "status": "normal | high | low | critical",
      "plain_meaning": "1-2 simple sentences explaining what this result means.",
      "what_to_do": "Specific practical action for this parameter."
    }
  ],
  "abnormal_findings": [
    {
      "parameter": "Name of the abnormal finding",
      "concern": "Plain-language explanation of why this is concerning",
      "severity": "mild | moderate | severe"
    }
  ],
  "drugs": [
    {
      "name": "Name of supplement or medication suggested based on results (e.g., Vitamin D Supplement)",
      "what_it_is": "1-2 plain sentences: what this supplement does and why the results suggest it",
      "dosage": "Typical dosage if known, else Not specified",
      "frequency": "How often to take it",
      "duration": "How long typically",
      "when_to_take": "Best time to take it",
      "side_effects": ["Common side effects in plain words"],
      "warnings": ["Important warnings"],
      "food_interactions": "Any food to avoid or take with",
      "instructions": "Any other special instructions"
    }
  ],
  "diet_and_lifestyle": [
    "Specific dietary suggestion based on the results.",
    "Lifestyle suggestion.",
    "Exercise or rest suggestion if relevant."
  ],
  "general_precautions": [
    "Simple actionable precaution for the patient to follow"
  ],
  "when_to_see_doctor": {
    "urgency": "routine | soon | urgent | immediate",
    "reason": "Plain-language explanation of when and why they should contact their doctor."
  },
  "reassurance": "A short, warm, encouraging note to the patient about their health."
}

If you cannot read or identify any field, use "Not specified" for strings or [] for arrays.
Flag parameters as critical only if significantly outside normal range and pose immediate risk.
Return ONLY valid JSON, no markdown, no extra text."""

GENERIC_PROMPT = """You are a friendly medical assistant helping a regular person (not a doctor) understand a medical document.
Analyze the document and return a plain-language summary.

RULES:
- Use simple everyday language. Explain any medical terms in plain words.
- Be warm, informative, and reassuring.

Return this exact JSON structure:
{
  "analysis_type": "medical_document",
  "summary": "2-3 sentence plain-language overview of what this document is about",
  "doctor_name": "Doctor or hospital name if visible, else Not specified",
  "patient_name": "Patient name if visible, else Not specified",
  "date": "Document date if visible, else Not specified",
  "key_findings": [
    "Key piece of information from the document, explained in plain language"
  ],
  "what_this_means_for_you": "1-2 sentence plain explanation of what the document means for the patient's health",
  "recommendations": [
    "Practical, actionable recommendations in plain language"
  ],
  "when_to_see_doctor": {
    "urgency": "routine | soon | urgent | immediate",
    "reason": "Plain-language explanation of when and why to see a doctor"
  },
  "reassurance": "A short, warm, encouraging note to the patient about their health."
}

If you cannot read or identify any field, use "Not specified" for strings or [] for arrays.
Return ONLY valid JSON, no markdown, no extra text."""


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
        "max_tokens": 8192,
        "temperature": 0.2,   # lower temp for structured extraction
        "top_p": 1.00,
        "stream": False,
    }

    response = requests.post(NVIDIA_INVOKE_URL, headers=headers, json=payload, timeout=1200)
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


def analyze_medical_text(extracted_text: str, record_type: str) -> dict:
    """
    Analyze extracted text (from Textract) using the NVIDIA Inference API.
    Used for PDF documents where text is extracted first via Textract.

    Args:
        extracted_text: Raw text extracted from the PDF
        record_type: 'record', 'report', or 'lab_report'

    Returns:
        Parsed JSON analysis result
    """
    settings = get_settings()

    if record_type == "lab_report":
        prompt = LAB_REPORT_PROMPT
    elif record_type in ("record", "report"):
        prompt = PRESCRIPTION_PROMPT
    else:
        prompt = GENERIC_PROMPT

    full_message = f"{prompt}\n\n--- DOCUMENT TEXT ---\n{extracted_text}"

    headers = {
        "Authorization": f"Bearer {settings.nvidia_api_key}",
        "Accept": "application/json",
    }

    payload = {
        "model": NVIDIA_MODEL,
        "messages": [
            {
                "role": "user",
                "content": full_message,
            }
        ],
        "max_tokens": 8192,
        "temperature": 0.2,
        "top_p": 1.00,
        "stream": False,
    }

    response = requests.post(NVIDIA_INVOKE_URL, headers=headers, json=payload, timeout=1200)
    response.raise_for_status()

    response_data = response.json()
    assistant_text = response_data["choices"][0]["message"]["content"]

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
