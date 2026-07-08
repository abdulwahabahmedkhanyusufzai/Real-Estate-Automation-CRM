from app.services.lead_service import (
    get_system_prompt_by_source,
    extract_omnichannel_lead,
)


def test_system_prompt_generation():
    prompt_whatsapp = get_system_prompt_by_source("WhatsApp")
    assert "WhatsApp" in prompt_whatsapp
    assert "budget" in prompt_whatsapp

    prompt_portal = get_system_prompt_by_source("Property Finder / Bayut")
    assert "Property Finder" in prompt_portal

    prompt_email = get_system_prompt_by_source("Email Inbox")
    assert "Email" in prompt_email

    prompt_default = get_system_prompt_by_source("Other Source")
    assert "elite real estate" in prompt_default


def test_extract_whatsapp_lead():
    message = "looking for 4 bed villa in dxb hills budget 3m urgent"
    extracted = extract_omnichannel_lead(message, "WhatsApp")

    assert extracted["budget"] == "AED 3M"
    assert extracted["area"] == "Dubai Hills"
    assert extracted["property_type"] == "Villa"
    assert extracted["bedrooms"] == 4
    assert extracted["urgency"] == "High"


def test_extract_empty_lead():
    message = "hello there"
    extracted = extract_omnichannel_lead(message, "Website / Dribbble Form")

    assert extracted["budget"] == "Not Specified"
    assert extracted["area"] == "Not Specified"
    assert extracted["property_type"] == "Not Specified"
    assert extracted["bedrooms"] is None
    assert extracted["urgency"] == "Normal"
