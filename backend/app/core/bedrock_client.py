import json
import base64
import boto3
from functools import lru_cache
from app.core.config import get_settings

BEDROCK_MODEL_ID = "mistral.mistral-large-3-675b-instruct"

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
- Suggest over-the-counter remedies or supplements only if they are widely accepted and safe (e.g., iron supplements for low iron). Always say "consult your doctor before taking any supplement".
- Always indicate clearly whether the person needs to see a doctor and how urgently.

Return this exact JSON structure:
{
  "analysis_type": "lab_report",
  "test_name": "Full name of the test in plain words (e.g., Complete Blood Count - a test that checks your blood cells)",
  "summary": "2-3 sentence overall plain-language summary. E.g., 'Overall your blood test results look mostly normal. Your iron levels are a little low, which might explain why you have been feeling tired. Everything else is within a healthy range.'",
  "overall_health_verdict": "good | attention_needed | action_required",
  "parameters": [
    {
      "name": "Parameter name and what it stands for in plain terms (e.g., Hemoglobin - the protein in blood that carries oxygen)",
      "value": "Your measured value with unit (e.g., 10.5 g/dL)",
      "reference_range": "Healthy range (e.g., 12-16 g/dL for women)",
      "status": "normal | high | low | critical",
      "plain_meaning": "In 1-2 simple sentences, explain what this result means for this person. E.g., 'Your hemoglobin is a little low. This means your blood is not carrying as much oxygen as it should, which can make you feel tired or short of breath.'",
      "what_to_do": "Specific, practical action for this parameter. E.g., 'Eat more iron-rich foods like spinach, lentils, eggs, and red meat. You can also ask your doctor about iron supplements.'"
    }
  ],
  "abnormal_findings": [
    {
      "parameter": "Name of the abnormal finding",
      "concern": "Plain-language explanation of why this is concerning",
      "severity": "mild | moderate | severe"
    }
  ],
  "diet_and_lifestyle": [
    "Specific dietary suggestions based on the results. E.g., Include more leafy greens in your meals for better iron levels.",
    "Lifestyle suggestions. E.g., Avoid alcohol as it can affect your liver test results.",
    "Exercise or rest suggestions if relevant."
  ],
  "medicines_and_supplements": [
    {
      "name": "Name of supplement or OTC remedy (e.g., Iron supplement, Vitamin D)",
      "reason": "Why it might help based on the results",
      "caution": "Always consult your doctor before starting any supplement or medicine."
    }
  ],
  "when_to_see_doctor": {
    "urgency": "not_needed | routine_checkup | within_a_week | see_doctor_soon | emergency",
    "plain_recommendation": "Clear, warm guidance. E.g., 'Your results look mostly fine. We suggest you share these results with your doctor at your next routine visit, ideally within the next month.' OR 'Some of your results are significantly outside normal range. Please see your doctor within the next few days to discuss these results and get proper treatment.'",
    "red_flags": ["Any symptoms that if present means they should go to emergency/doctor immediately, in plain language. E.g., If you feel severe chest pain or difficulty breathing, go to the hospital immediately."]
  },
  "recommendations": [
    "Overall actionable recommendations in plain language, prioritized from most to least important"
  ]
}

If you cannot read or identify any field, use "Not specified".
Flag parameters as critical only if they are significantly outside normal range and pose immediate health risk.
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
  "key_findings": [
    "Key piece of information from the document, explained in plain language"
  ],
  "what_this_means_for_you": "1-2 sentence plain explanation of what the document means for the patient's health",
  "recommendations": [
    "Practical, actionable recommendations in plain language"
  ],
  "when_to_see_doctor": {
    "urgency": "not_needed | routine_checkup | within_a_week | see_doctor_soon | emergency",
    "reason": "Plain-language explanation of when and why to see a doctor"
  }
}

If you cannot read or identify any field, use "Not specified".
Return ONLY valid JSON, no markdown, no extra text."""


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
        "max_tokens": 8192,
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


def analyze_medical_text(extracted_text: str, record_type: str) -> dict:
    """
    Analyze extracted text (from Textract) using Amazon Bedrock Mistral Large 3.
    Used for PDF documents where text is extracted first via Textract.

    Args:
        extracted_text: Raw text extracted from the PDF
        record_type: 'record', 'report', or 'lab_report'

    Returns:
        Parsed JSON analysis result
    """
    if record_type == "lab_report":
        prompt = LAB_REPORT_PROMPT
    elif record_type in ("record", "report"):
        prompt = PRESCRIPTION_PROMPT
    else:
        prompt = GENERIC_PROMPT

    full_message = f"{prompt}\n\n--- DOCUMENT TEXT ---\n{extracted_text}"

    request_body = {
        "max_tokens": 8192,
        "messages": [
            {
                "role": "user",
                "content": full_message,
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

    response_body = json.loads(response["body"].read())
    assistant_text = response_body["choices"][0]["message"]["content"]

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
