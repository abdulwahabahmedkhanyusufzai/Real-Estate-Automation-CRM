from fastapi import APIRouter, Query, HTTPException, Request
from typing import Dict, Any, List, Optional
from app.integrations.whatsapp import verify_whatsapp_webhook, parse_whatsapp_message
from app.integrations.email_imap import fetch_unread_emails
from app.integrations.portal_webhook import parse_portal_webhook
from app.services.lead_service import extract_omnichannel_lead
from app.services.integration_service import (
    save_user_integrations,
    get_user_integrations,
    get_user_by_whatsapp_phone_id,
)
from pydantic import BaseModel

router = APIRouter()


class IntegrationConfigSchema(BaseModel):
    user_id: int
    whatsapp_phone_number_id: Optional[str] = None
    whatsapp_access_token: Optional[str] = None
    whatsapp_verify_token: Optional[str] = None
    imap_host: Optional[str] = None
    imap_port: Optional[int] = 993
    imap_user: Optional[str] = None
    imap_password: Optional[str] = None


@router.post("/api/integrations")
def save_config(config: IntegrationConfigSchema):
    """
    Saves or updates integration credentials for a specific logged-in user.
    """
    success = save_user_integrations(config.user_id, config.model_dump())
    if success:
        return {"status": "success", "message": "Integrations saved successfully"}
    raise HTTPException(status_code=500, detail="Failed to save integrations config")


@router.get("/api/integrations/{user_id}")
def get_config(user_id: int):
    """
    Retrieves the integrations configuration for a specific user.
    """
    config = get_user_integrations(user_id)
    if config:
        # Strip sensitive credentials before returning to UI
        if config.get("whatsapp_access_token"):
            config["whatsapp_access_token"] = "********"
        if config.get("imap_password"):
            config["imap_password"] = "********"
        return {"status": "success", "config": config}
    return {"status": "success", "config": None}


@router.get("/webhooks/whatsapp")
def get_whatsapp_webhook(
    hub_mode: str = Query(..., alias="hub.mode"),
    hub_verify_token: str = Query(..., alias="hub.verify_token"),
    hub_challenge: str = Query(..., alias="hub.challenge"),
):
    """
    Handles WhatsApp webhook subscription verification from Meta.
    """
    challenge = verify_whatsapp_webhook(hub_mode, hub_verify_token, hub_challenge)
    if challenge is not None:
        from fastapi.responses import PlainTextResponse

        return PlainTextResponse(content=challenge)
    raise HTTPException(status_code=403, detail="Verification token mismatch")


@router.post("/webhooks/whatsapp")
async def post_whatsapp_webhook(request: Request):
    """
    Receives incoming text messages from clients via WhatsApp API,
    automatically qualifies them using the Gemma lead-extraction service,
    and attributes them to the correct user who owns this phone connection.
    """
    payload = await request.json()
    message_data = parse_whatsapp_message(payload)

    if not message_data:
        return {"status": "ignored", "reason": "No valid text message found"}

    phone_number_id = message_data.get("phone_number_id")
    user_id = None
    if phone_number_id:
        user_id = get_user_by_whatsapp_phone_id(phone_number_id)

    # Extract details using our omnichannel Gemma qualifier engine
    qualified_data = extract_omnichannel_lead(message_data["message"], "WhatsApp")

    return {
        "status": "success",
        "user_id": user_id,  # Associated user context
        "sender": message_data["name"],
        "phone": message_data["phone"],
        "raw_message": message_data["message"],
        "qualified_lead": qualified_data,
    }


@router.post("/webhooks/portal")
async def post_portal_webhook(request: Request, user_id: Optional[int] = None):
    """
    Receives webhook inquiries from property portals (Property Finder, Bayut, etc.)
    and qualifies them under the specified user_id.
    """
    payload = await request.json()
    portal_data = parse_portal_webhook(payload)

    if not portal_data:
        raise HTTPException(status_code=400, detail="Invalid portal payload format")

    qualified_data = extract_omnichannel_lead(
        portal_data["message"], portal_data["source"]
    )

    return {
        "status": "success",
        "user_id": user_id,
        "client_name": portal_data["name"],
        "client_phone": portal_data["phone"],
        "client_email": portal_data["email"],
        "source": portal_data["source"],
        "raw_message": portal_data["message"],
        "qualified_lead": qualified_data,
    }


@router.post("/api/integrations/email/sync")
async def sync_emails(user_id: Optional[int] = None):
    """
    Triggers an IMAP connection to check for unread emails and processes
    each as a real estate lead.
    Can be run globally (using env variables) or per tenant by passing user_id.
    """
    imap_config = {}
    if user_id:
        user_config = get_user_integrations(user_id)
        if user_config:
            imap_config = {
                "host": user_config.get("imap_host"),
                "port": user_config.get("imap_port"),
                "user": user_config.get("imap_user"),
                "password": user_config.get("imap_password"),
            }

    unread_emails = fetch_unread_emails(**imap_config)
    processed_leads: List[Dict[str, Any]] = []

    for email_data in unread_emails:
        qualified_data = extract_omnichannel_lead(email_data["body"], "Email Inbox")
        processed_leads.append(
            {
                "email_id": email_data["email_id"],
                "sender": email_data["sender"],
                "subject": email_data["subject"],
                "qualified_lead": qualified_data,
            }
        )

    return {
        "status": "success",
        "user_id": user_id,
        "synchronized_emails_count": len(unread_emails),
        "leads": processed_leads,
    }
