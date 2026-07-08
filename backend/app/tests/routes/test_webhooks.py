from unittest.mock import patch
from app.integrations.whatsapp import WHATSAPP_VERIFY_TOKEN


def test_whatsapp_webhook_verification(client):
    # Test successful verification
    response = client.get(
        "/webhooks/whatsapp",
        params={
            "hub.mode": "subscribe",
            "hub.verify_token": WHATSAPP_VERIFY_TOKEN,
            "hub.challenge": "test_challenge",
        },
    )
    assert response.status_code == 200
    assert response.text == "test_challenge"

    # Test failed verification
    response = client.get(
        "/webhooks/whatsapp",
        params={
            "hub.mode": "subscribe",
            "hub.verify_token": "wrong_token",
            "hub.challenge": "test_challenge",
        },
    )
    assert response.status_code == 403


def test_whatsapp_incoming_message(client):
    payload = {
        "object": "whatsapp_business_account",
        "entry": [
            {
                "id": "12345",
                "changes": [
                    {
                        "value": {
                            "messaging_product": "whatsapp",
                            "metadata": {
                                "display_phone_number": "123",
                                "phone_number_id": "456",
                            },
                            "contacts": [
                                {
                                    "profile": {"name": "John Doe"},
                                    "wa_id": "971501234567",
                                }
                            ],
                            "messages": [
                                {
                                    "from": "971501234567",
                                    "id": "wamid.123",
                                    "timestamp": "12345678",
                                    "text": {
                                        "body": "looking for 4b villa in dxb hills budget 3m urgent"
                                    },
                                    "type": "text",
                                }
                            ],
                        },
                        "field": "messages",
                    }
                ],
            }
        ],
    }

    response = client.post("/webhooks/whatsapp", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["sender"] == "John Doe"
    assert data["phone"] == "971501234567"
    assert data["qualified_lead"]["budget"] == "AED 3M"


def test_portal_webhook(client):
    payload = {
        "source": "Property Finder",
        "client_name": "Sarah Smith",
        "client_phone": "+971509998877",
        "client_email": "sarah@example.com",
        "inquiry_message": "Hi, I am interested in viewing this 3-bedroom townhouse in Arabian Ranches.",
    }

    response = client.post("/webhooks/portal", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["client_name"] == "Sarah Smith"
    assert data["source"] == "Property Finder"


@patch("app.routes.webhooks.fetch_unread_emails")
def test_email_sync_route(mock_fetch, client):
    mock_fetch.return_value = [
        {
            "email_id": "1",
            "sender": "investor@example.com",
            "subject": "Dubai Hills Villa Inquiry",
            "body": "Hi, I'm looking for a 4 bed villa in dxb hills budget 3m urgent.",
        }
    ]

    response = client.post("/integrations/email/sync")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["synchronized_emails_count"] == 1
    assert data["leads"][0]["sender"] == "investor@example.com"
    assert data["leads"][0]["qualified_lead"]["budget"] == "AED 3M"


def test_save_and_get_integration_config(client):
    # Save config
    payload = {
        "user_id": 99,
        "whatsapp_phone_number_id": "wa-99",
        "whatsapp_access_token": "secret-token",
        "imap_host": "imap.example.com",
        "imap_user": "user@example.com",
        "imap_password": "my-password",
    }
    response = client.post("/integrations", json=payload)
    assert response.status_code == 200
    assert response.json()["status"] == "success"

    # Get config
    response = client.get("/integrations/99")
    assert response.status_code == 200
    config = response.json()["config"]
    assert config["whatsapp_phone_number_id"] == "wa-99"
    assert config["whatsapp_access_token"] == "********"  # Masked
    assert config["imap_password"] == "********"  # Masked


def test_whatsapp_webhook_routing_to_user(client):
    # Register integration
    payload = {
        "user_id": 100,
        "whatsapp_phone_number_id": "tenant-phone-id-777",
        "whatsapp_access_token": "token-100",
    }
    client.post("/integrations", json=payload)

    # Trigger webhook with metadata matching this ID
    webhook_payload = {
        "object": "whatsapp_business_account",
        "entry": [
            {
                "id": "12345",
                "changes": [
                    {
                        "value": {
                            "messaging_product": "whatsapp",
                            "metadata": {
                                "display_phone_number": "123",
                                "phone_number_id": "tenant-phone-id-777",
                            },
                            "contacts": [{"profile": {"name": "Tenant Contact"}}],
                            "messages": [
                                {
                                    "from": "971500000000",
                                    "id": "wamid.tenant",
                                    "timestamp": "12345678",
                                    "text": {
                                        "body": "looking for 4b villa in dxb hills budget 3m urgent"
                                    },
                                    "type": "text",
                                }
                            ],
                        },
                        "field": "messages",
                    }
                ],
            }
        ],
    }

    response = client.post("/webhooks/whatsapp", json=webhook_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["user_id"] == 100  # Asserts webhook mapped to user_id 100!
