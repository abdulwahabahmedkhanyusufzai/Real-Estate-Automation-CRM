from fastapi import APIRouter, Query, HTTPException
from fastapi.responses import RedirectResponse
import os
from pathlib import Path
from dotenv import load_dotenv
import httpx
import urllib.parse
from app.services.integration_service import save_user_integrations

# Base directory of the adk-agent package
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Load environment variables from .env (check backend/.env first, then backend/app/.env)
dotenv_path = BASE_DIR / ".env"
if not dotenv_path.exists():
    dotenv_path = BASE_DIR / "app" / ".env"
load_dotenv(dotenv_path=dotenv_path)

router = APIRouter(prefix="/oauth", tags=["OAuth"])

# Configuration (normally loaded from env)
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "dummy_google_client_id")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "dummy_google_client_secret")
GOOGLE_REDIRECT_URI = os.getenv(
    "GOOGLE_REDIRECT_URI", "http://localhost:8000/oauth/google/callback"
)

FB_CLIENT_ID = os.getenv("FACEBOOK_CLIENT_ID", "dummy_fb_client_id")
FB_CLIENT_SECRET = os.getenv("FACEBOOK_CLIENT_SECRET", "dummy_fb_client_secret")
FB_REDIRECT_URI = os.getenv(
    "FACEBOOK_REDIRECT_URI", "http://localhost:8000/oauth/facebook/callback"
)

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")


# --- Google OAuth (for Gmail API Integration) ---


@router.get("/google/login")
def google_login(user_id: int):
    """
    Redirects the user to Google's consent screen.
    We pass user_id in the state parameter to map the callback to this user.
    """
    auth_url = "https://accounts.google.com/o/oauth2/v2/auth"
    params = {
        "client_id": GOOGLE_CLIENT_ID,
        "redirect_uri": GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": "https://www.googleapis.com/auth/gmail.readonly",
        "access_type": "offline",
        "prompt": "consent",
        "state": str(user_id),  # Carry user context through the redirect
    }
    redirect_url = f"{auth_url}?{urllib.parse.urlencode(params)}"
    return RedirectResponse(url=redirect_url)


@router.get("/google/callback")
async def google_callback(code: str = Query(...), state: str = Query(...)):
    """
    Handles redirect callback from Google. Exchanges the auth code for access/refresh tokens.
    """
    user_id = int(state)
    token_url = "https://oauth2.googleapis.com/token"
    data = {
        "code": code,
        "client_id": GOOGLE_CLIENT_ID,
        "client_secret": GOOGLE_CLIENT_SECRET,
        "redirect_uri": GOOGLE_REDIRECT_URI,
        "grant_type": "authorization_code",
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(token_url, data=data)
            if response.status_code != 200:
                raise HTTPException(
                    status_code=400, detail=f"Failed to exchange code: {response.text}"
                )

            tokens = response.json()
            refresh_token = tokens.get("refresh_token")
            access_token = tokens.get("access_token")

            # Extract user's email address using access token
            email_info_url = "https://www.googleapis.com/oauth2/v2/userinfo"
            headers = {"Authorization": f"Bearer {access_token}"}
            email_response = await client.get(email_info_url, headers=headers)
            email_address = (
                email_response.json().get("email", "")
                if email_response.status_code == 200
                else ""
            )

            # Save the refresh token and email configuration to user integrations database
            config = {
                "imap_host": "imap.gmail.com",
                "imap_port": 993,
                "imap_user": email_address,
                # Store the OAuth refresh token in the password field
                "imap_password": refresh_token,
            }
            save_user_integrations(user_id, config)

            # Redirect user back to frontend dashboard
            return RedirectResponse(
                url=f"{FRONTEND_URL}/integrations?status=success&platform=google"
            )

    except Exception as e:
        return RedirectResponse(
            url=f"{FRONTEND_URL}/integrations?status=error&error={urllib.parse.quote(str(e))}"
        )


# --- Meta / Facebook OAuth (for WhatsApp Business Cloud API Integration) ---


@router.get("/facebook/login")
def facebook_login(user_id: int):
    """
    Redirects the user to Facebook's OAuth flow.
    We ask for permissions to manage the WhatsApp business account.
    """
    auth_url = "https://www.facebook.com/v20.0/dialog/oauth"
    params = {
        "client_id": FB_CLIENT_ID,
        "redirect_uri": FB_REDIRECT_URI,
        "state": str(user_id),
        "scope": "whatsapp_business_management,whatsapp_business_messaging",
    }
    redirect_url = f"{auth_url}?{urllib.parse.urlencode(params)}"
    return RedirectResponse(url=redirect_url)


@router.get("/facebook/callback")
async def facebook_callback(code: str = Query(...), state: str = Query(...)):
    """
    Handles redirect callback from Meta. Exchanges authorization code for long-lived Access Token.
    """
    user_id = int(state)
    token_url = "https://graph.facebook.com/v20.0/oauth/access_token"
    params = {
        "client_id": FB_CLIENT_ID,
        "redirect_uri": FB_REDIRECT_URI,
        "client_secret": FB_CLIENT_SECRET,
        "code": code,
    }

    try:
        async with httpx.AsyncClient() as client:
            # Exchange short-lived code for access token
            response = await client.get(token_url, params=params)
            if response.status_code != 200:
                raise HTTPException(
                    status_code=400, detail="Failed to retrieve Facebook access token"
                )

            tokens = response.json()
            short_token = tokens.get("access_token")

            # Exchange for long-lived access token
            exchange_url = "https://graph.facebook.com/v20.0/oauth/access_token"
            exchange_params = {
                "grant_type": "fb_exchange_token",
                "client_id": FB_CLIENT_ID,
                "client_secret": FB_CLIENT_SECRET,
                "fb_exchange_token": short_token,
            }
            exchange_response = await client.get(exchange_url, params=exchange_params)
            long_token = (
                exchange_response.json().get("access_token", short_token)
                if exchange_response.status_code == 200
                else short_token
            )

            # Get user's WhatsApp Business Accounts listing to extract phone number ID
            accounts_url = (
                "https://graph.facebook.com/v20.0/me/whatsapp_business_accounts"
            )
            headers = {"Authorization": f"Bearer {long_token}"}
            accounts_response = await client.get(accounts_url, headers=headers)

            phone_number_id = ""
            if accounts_response.status_code == 200:
                data = accounts_response.json().get("data", [])
                if data:
                    # Capture the first associated phone ID for this account
                    waba_id = data[0].get("id")
                    phone_url = (
                        f"https://graph.facebook.com/v20.0/{waba_id}/phone_numbers"
                    )
                    phone_response = await client.get(phone_url, headers=headers)
                    if phone_response.status_code == 200:
                        phones = phone_response.json().get("data", [])
                        if phones:
                            phone_number_id = phones[0].get("id")

            # Save to user integrations database
            verify_token = f"verify_user_{user_id}"
            config = {
                "whatsapp_phone_number_id": phone_number_id,
                "whatsapp_access_token": long_token,
                "whatsapp_verify_token": verify_token,
            }
            save_user_integrations(user_id, config)

            # --- AUTO WEBHOOK REGISTRATION ---
            # Programmatically register our webhook with Meta so the owner
            # never has to touch the Meta Developer Dashboard manually.
            if phone_number_id:
                webhook_url = (
                    os.getenv("WEBHOOK_BASE_URL", FRONTEND_URL).rstrip("/")
                    + "/webhooks/whatsapp"
                )
                try:
                    subscribe_resp = await client.post(
                        f"https://graph.facebook.com/v20.0/{phone_number_id}/subscribed_apps",
                        headers=headers,
                        json={
                            "callback_url": webhook_url,
                            "verify_token": verify_token,
                            "subscribed_fields": ["messages"],
                        },
                    )
                    if subscribe_resp.status_code == 200:
                        import logging

                        logging.getLogger(__name__).info(
                            f"WhatsApp webhook auto-registered at {webhook_url} for phone_id={phone_number_id}"
                        )
                except Exception as sub_err:
                    import logging

                    logging.getLogger(__name__).warning(
                        f"Auto webhook registration failed (non-fatal): {sub_err}"
                    )

            return RedirectResponse(
                url=f"{FRONTEND_URL}/integrations?status=success&platform=facebook"
            )

    except Exception as e:
        return RedirectResponse(
            url=f"{FRONTEND_URL}/integrations?status=error&error={urllib.parse.quote(str(e))}"
        )
