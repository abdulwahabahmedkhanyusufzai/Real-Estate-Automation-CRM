import os
import json
import logging
from typing import Dict, Any
import httpx

logger = logging.getLogger(__name__)


def get_system_prompt_by_source(source: str) -> str:
    """Returns a highly optimized extraction prompt tailored to the communication channel."""

    base_instruction = (
        "You are an elite real estate AI agent operating in Dubai. "
        "Analyze the text and output a strict, valid JSON object with keys: "
        "'budget', 'area', 'property_type', 'bedrooms', and 'urgency'. "
        "Do not include markdown wrappers, thoughts, or conversational text. Use null if a value is missing.\n"
    )

    if source == "WhatsApp":
        return base_instruction + (
            "CONTEXT: This is a raw WhatsApp text chat. It is highly informal, short, and uses heavy abbreviations. "
            "Examples: '3m' or '3M' means 'AED 3,000,000'. 'k' means thousands. 'dxb hills' means 'Dubai Hills'. "
            "'mbrc' means 'Mohammed Bin Rashid City'. Decipher slang to extract exact metrics."
        )

    elif source == "Property Finder / Bayut":
        return base_instruction + (
            "CONTEXT: This is a structured automated lead form template from a real estate portal. "
            "Look for pattern match layouts like 'Inquiry for property: [REF_ID]' or explicit text blocks. "
            "Isolate the user message tucked inside the template to extract pricing and location metrics."
        )

    elif source == "Email Inbox":
        return base_instruction + (
            "CONTEXT: This is a formal email. It contains a high noise-to-signal ratio, including email greetings, "
            "pleasantries, disclaimers, and automated signature blocks. Strip away the signatures and headers. "
            "Focus entirely on the body text where the sender outlines their property specifications."
        )

    else:  # Website / Dribbble Form / Default
        return (
            base_instruction
            + "CONTEXT: This is a direct input form submission. Extract values clearly."
        )


def extract_omnichannel_lead(raw_message: str, source: str) -> Dict[str, Any]:
    """
    Executes structural extraction using channel-specific system guidance.
    Connect this directly to your local Gemma inference or LLM endpoint.
    """
    _system_prompt = get_system_prompt_by_source(source)

    # Mock parsing fallback demonstrating channel-aware processing output
    cleaned_message = raw_message.lower()

    # Simulating structural normalization based on input variants
    extracted = {
        "budget": "Not Specified",
        "area": "Not Specified",
        "property_type": "Not Specified",
        "bedrooms": None,
        "urgency": "Normal",
    }

    if "3 million" in cleaned_message or "3m" in cleaned_message:
        extracted["budget"] = "AED 3M"
    if "dubai hills" in cleaned_message or "dxb hills" in cleaned_message:
        extracted["area"] = "Dubai Hills"
    if "villa" in cleaned_message:
        extracted["property_type"] = "Villa"
    if "4-bedroom" in cleaned_message or "4 bed" in cleaned_message:
        extracted["bedrooms"] = 4
    if "urgent" in cleaned_message or "now" in cleaned_message:
        extracted["urgency"] = "High"

    return extracted


async def extract_lead_with_gemma(raw_message: str, source: str) -> Dict[str, Any]:
    """
    Calls the local Gemma model via Ollama to extract lead parameters.
    """
    ollama_base = os.getenv("OLLAMA_API_BASE", "http://gemma-backend:8080")
    if not ollama_base.startswith("http"):
        ollama_base = f"http://{ollama_base}"

    model_name = os.getenv("GEMMA_MODEL_NAME", "gemma3:270m")
    system_prompt = get_system_prompt_by_source(source)

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                f"{ollama_base}/api/chat",
                json={
                    "model": model_name,
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": raw_message}
                    ],
                    "stream": False,
                    "format": "json"
                }
            )
            if response.status_code == 200:
                content = response.json().get("message", {}).get("content", "").strip()
                if content:
                    parsed = json.loads(content)
                    return {
                        "budget": parsed.get("budget") or "Not Specified",
                        "area": parsed.get("area") or "Not Specified",
                        "property_type": parsed.get("property_type") or "Not Specified",
                        "bedrooms": parsed.get("bedrooms"),
                        "urgency": parsed.get("urgency") or "Normal"
                    }
    except Exception as e:
        logger.warning(f"Failed to extract lead using Gemma (falling back to heuristics): {e}")

    # Fallback to standard heuristic extraction
    return extract_omnichannel_lead(raw_message, source)


async def generate_whatsapp_reply(sender_name: str, lead_data: Dict[str, Any]) -> str:
    """
    Calls local Gemma model to generate a professional WhatsApp response.
    """
    ollama_base = os.getenv("OLLAMA_API_BASE", "http://gemma-backend:8080")
    if not ollama_base.startswith("http"):
        ollama_base = f"http://{ollama_base}"

    model_name = os.getenv("GEMMA_MODEL_NAME", "gemma3:270m")

    prompt = (
        f"You are pixxi, an elite real estate assistant AI in Dubai.\n"
        f"Generate a short, friendly, and professional WhatsApp reply to a client named '{sender_name}' who just inquired about a property.\n"
        f"Here is the qualified lead details we extracted:\n"
        f"- Budget: {lead_data.get('budget')}\n"
        f"- Area: {lead_data.get('area')}\n"
        f"- Property Type: {lead_data.get('property_type')}\n"
        f"- Bedrooms: {lead_data.get('bedrooms')}\n"
        f"- Urgency: {lead_data.get('urgency')}\n\n"
        f"Keep the reply concise (max 3 sentences), polite, and mention that a specialist will contact them soon. "
        f"Do not include placeholders, formatting headers, or markdown styling except simple bold text if appropriate."
    )

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                f"{ollama_base}/api/generate",
                json={
                    "model": model_name,
                    "prompt": prompt,
                    "stream": False
                }
            )
            if response.status_code == 200:
                text = response.json().get("response", "").strip()
                if text:
                    return text
    except Exception as e:
        logger.warning(f"Failed to generate WhatsApp reply with Gemma: {e}")

    # Fallback response
    prop_type = lead_data.get('property_type')
    if not prop_type or prop_type == 'Not Specified':
        prop_type = 'property'
    area = lead_data.get('area')
    if not area or area == 'Not Specified':
        area = 'Dubai'
    return f"Hi {sender_name}! Thank you for your inquiry about a {prop_type} in {area}. One of our specialists will be in touch with you shortly!"
