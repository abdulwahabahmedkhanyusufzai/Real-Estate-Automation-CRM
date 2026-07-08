from typing import Dict, Any

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
