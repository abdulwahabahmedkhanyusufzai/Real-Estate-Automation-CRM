from fastapi import APIRouter, Query, HTTPException, Request, BackgroundTasks
from typing import Dict, Any, List, Optional
from app.integrations.whatsapp import (
    verify_whatsapp_webhook,
    parse_whatsapp_message,
    send_whatsapp_message,
)
from app.integrations.email_imap import fetch_unread_emails
from app.integrations.portal_webhook import parse_portal_webhook
from app.services.lead_service import (
    extract_omnichannel_lead,
    extract_lead_with_gemma,
    generate_whatsapp_reply,
)
from app.services.integration_service import (
    save_user_integrations,
    get_user_integrations,
    get_user_by_whatsapp_phone_id,
    is_whatsapp_message_processed,
    mark_whatsapp_message_processed,
    flag_whatsapp_disconnected,
)
from pydantic import BaseModel
import logging
import json
import time

logger = logging.getLogger(__name__)


def _log(level: str, event: str, **kwargs) -> None:
    """
    Emits a structured JSON log line so that log-aggregation tools
    (Datadog, CloudWatch, Loki) can parse fields without regex.
    Every call produces one JSON object per line, e.g.:
      {"ts": 1720..., "level": "INFO", "event": "whatsapp.received", "message_id": "wamid.abc"}
    """
    record = {"ts": time.time(), "level": level.upper(), "event": event, **kwargs}
    getattr(logger, level.lower())(json.dumps(record))


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


@router.post("/integrations")
def save_config(config: IntegrationConfigSchema):
    """
    Saves or updates integration credentials for a specific logged-in user.
    """
    success = save_user_integrations(config.user_id, config.model_dump())
    if success:
        return {"status": "success", "message": "Integrations saved successfully"}
    raise HTTPException(status_code=500, detail="Failed to save integrations config")


@router.get("/integrations/{user_id}")
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
async def post_whatsapp_webhook(request: Request, background_tasks: BackgroundTasks):
    """
    Receives incoming text messages from clients via WhatsApp API.
    Returns 200 OK to Meta immediately, then processes the lead in the background.
    This prevents Meta from retrying the webhook due to slow AI processing.
    """
    payload = await request.json()
    message_data = parse_whatsapp_message(payload)

    if not message_data:
        _log("info", "whatsapp.ignored", reason="no_valid_text_message")
        return {"status": "ignored", "reason": "No valid text message found"}

    # --- IDEMPOTENCY CHECK ---
    # Extract message_id from the raw payload to prevent duplicate processing
    try:
        message_id = payload["entry"][0]["changes"][0]["value"]["messages"][0]["id"]
    except (KeyError, IndexError):
        message_id = None

    if message_id and is_whatsapp_message_processed(message_id):
        _log(
            "info",
            "whatsapp.duplicate_discarded",
            message_id=message_id,
            outcome="ignored",
            reason="idempotency_key_already_seen",
        )
        return {"status": "ignored", "reason": "Duplicate message already processed"}

    # Mark as processed immediately before background task starts
    if message_id:
        mark_whatsapp_message_processed(message_id)

    _log(
        "info",
        "whatsapp.received",
        message_id=message_id,
        sender=message_data.get("name"),
        phone=message_data.get("phone"),
        phone_number_id=message_data.get("phone_number_id"),
    )

    # --- BACKGROUND PROCESSING ---
    # Offload AI qualification + reply to background so Meta gets 200 OK instantly
    async def process_lead_background():
        phone_number_id = message_data.get("phone_number_id")
        user_id = None
        user_config = None

        if phone_number_id:
            user_id = get_user_by_whatsapp_phone_id(phone_number_id)
            if user_id:
                user_config = get_user_integrations(user_id)

        # Qualify the lead using Gemma
        qualified_data = await extract_lead_with_gemma(
            message_data["message"], "WhatsApp"
        )

        _log(
            "info",
            "whatsapp.lead_qualified",
            message_id=message_id,
            user_id=user_id,
            sender=message_data.get("name"),
            phone=message_data.get("phone"),
            budget=qualified_data.get("budget"),
            area=qualified_data.get("area"),
            urgency=qualified_data.get("urgency"),
        )

        # Generate a personalized reply using Gemma
        reply_text = await generate_whatsapp_reply(message_data["name"], qualified_data)

        # --- SEND REPLY ---
        if user_config:
            access_token = user_config.get("whatsapp_access_token")
            success = await send_whatsapp_message(
                to_phone=message_data["phone"],
                text=reply_text,
                access_token=access_token,
                phone_number_id=phone_number_id,
            )
            if success:
                _log(
                    "info",
                    "whatsapp.reply_sent",
                    message_id=message_id,
                    user_id=user_id,
                    to_phone=message_data["phone"],
                    outcome="success",
                )
            else:
                # --- TOKEN REVOCATION HANDLING ---
                # Auth failure: flag integration as disconnected for UI alert
                flag_whatsapp_disconnected(user_id)
                _log(
                    "warning",
                    "whatsapp.auth_expired",
                    message_id=message_id,
                    user_id=user_id,
                    phone_number_id=phone_number_id,
                    outcome="integration_flagged_disconnected",
                    action_required="user_must_reconnect_whatsapp",
                )

    background_tasks.add_task(process_lead_background)

    # Return 200 OK to Meta immediately (within the required timeout)
    return {"status": "received"}


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


@router.post("/integrations/email/sync")
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
