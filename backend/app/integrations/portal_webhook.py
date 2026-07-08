import logging
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)


def parse_portal_webhook(payload: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """
    Parses incoming webhook requests from real estate portals (Property Finder, Bayut, etc.).
    Standardizes the payload schema to extract lead contact and message content.
    """
    try:
        # Standard Property Finder / portal webhook payload structure
        client_info = payload.get("client", {})
        message = payload.get("message", "") or payload.get("inquiry_message", "")

        # If no explicit message, construct from template references
        if not message:
            ref_id = payload.get("property_reference", "")
            title = payload.get("property_title", "")
            message = f"Inquiry for property {ref_id} ({title}). Interested in details."

        return {
            "name": client_info.get("name")
            or payload.get("client_name", "Portal Client"),
            "email": client_info.get("email") or payload.get("client_email"),
            "phone": client_info.get("phone") or payload.get("client_phone"),
            "message": message,
            "source": payload.get("portal_name")
            or payload.get("source", "Property Finder / Bayut"),
        }
    except Exception as e:
        logger.error(f"Error parsing Portal webhook payload: {e}")
        return None
