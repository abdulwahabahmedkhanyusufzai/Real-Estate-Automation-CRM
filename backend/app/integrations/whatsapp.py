import logging
import os
from typing import Dict, Any, Optional
import httpx

logger = logging.getLogger(__name__)

# Load config from environment variables
WHATSAPP_VERIFY_TOKEN = os.getenv("WHATSAPP_VERIFY_TOKEN", "pixxi_verify_token")
WHATSAPP_ACCESS_TOKEN = os.getenv("WHATSAPP_ACCESS_TOKEN", "")
WHATSAPP_PHONE_NUMBER_ID = os.getenv("WHATSAPP_PHONE_NUMBER_ID", "")


def verify_whatsapp_webhook(mode: str, token: str, challenge: str) -> Optional[str]:
    """
    Verifies the WhatsApp webhook challenge sent by Meta Cloud API.
    """
    if mode == "subscribe" and token == WHATSAPP_VERIFY_TOKEN:
        logger.info("WhatsApp webhook verified successfully.")
        return challenge
    logger.warning("WhatsApp webhook verification failed. Incorrect token.")
    return None


def parse_whatsapp_message(payload: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """
    Parses incoming Meta Cloud API WhatsApp webhook payload.
    Extracts the sender name, phone number, and message text.
    """
    try:
        entry = payload.get("entry", [])[0]
        changes = entry.get("changes", [])[0]
        value = changes.get("value", {})

        messages = value.get("messages", [])
        if not messages:
            return None

        message = messages[0]
        if message.get("type") != "text":
            return None  # Skip media/other message types for now

        sender_phone = message.get("from")
        message_body = message.get("text", {}).get("body", "")

        # Get sender name from contacts
        contacts = value.get("contacts", [])
        sender_name = (
            contacts[0].get("profile", {}).get("name", "Unknown Contact")
            if contacts
            else "Unknown Contact"
        )

        # Get recipient phone number ID from metadata
        metadata = value.get("metadata", {})
        phone_number_id = metadata.get("phone_number_id")

        return {
            "name": sender_name,
            "phone": sender_phone,
            "message": message_body,
            "phone_number_id": phone_number_id,
        }
    except (IndexError, KeyError, TypeError) as e:
        logger.error(f"Error parsing WhatsApp webhook payload: {e}")
        return None


async def send_whatsapp_message(
    to_phone: str,
    text: str,
    access_token: Optional[str] = None,
    phone_number_id: Optional[str] = None,
) -> bool:
    """
    Sends a text message using Meta Cloud API to a user.
    """
    token = access_token or WHATSAPP_ACCESS_TOKEN
    phone_id = phone_number_id or WHATSAPP_PHONE_NUMBER_ID

    if not token or not phone_id:
        logger.warning("WhatsApp API credentials missing. Cannot send message.")
        return False

    url = f"https://graph.facebook.com/v20.0/{phone_id}/messages"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }
    payload = {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": to_phone,
        "type": "text",
        "text": {"body": text},
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(url, headers=headers, json=payload)
            if response.status_code == 200:
                logger.info(f"WhatsApp message sent successfully to {to_phone}")
                return True
            else:
                logger.error(
                    f"Failed to send WhatsApp message: {response.status_code} - {response.text}"
                )
                return False
    except Exception as e:
        logger.error(f"Exception sending WhatsApp message: {e}")
        return False
