from unittest.mock import patch, MagicMock, AsyncMock


def test_google_login_redirect(client):
    response = client.get("/api/oauth/google/login?user_id=123", follow_redirects=False)
    # Check that it returns a 307 Temporary Redirect to Google's consent screen
    assert response.status_code == 307
    assert "accounts.google.com" in response.headers["location"]
    assert "state=123" in response.headers["location"]


def test_facebook_login_redirect(client):
    response = client.get(
        "/api/oauth/facebook/login?user_id=456", follow_redirects=False
    )
    # Check that it returns a 307 Temporary Redirect to Facebook's OAuth page
    assert response.status_code == 307
    assert "facebook.com" in response.headers["location"]
    assert "state=456" in response.headers["location"]


@patch("app.routes.oauth.httpx.AsyncClient")
def test_google_callback_success(mock_client_class, client):
    # Mock httpx responses for token exchange and user info
    mock_client = MagicMock()
    mock_client_class.return_value.__aenter__.return_value = mock_client

    # 1. Token response
    mock_token_resp = MagicMock()
    mock_token_resp.status_code = 200
    mock_token_resp.json.return_value = {
        "access_token": "mock-access-token",
        "refresh_token": "mock-refresh-token",
    }

    # 2. User info response
    mock_info_resp = MagicMock()
    mock_info_resp.status_code = 200
    mock_info_resp.json.return_value = {"email": "agent@example.com"}

    # Setup AsyncMock to allow awaiting
    mock_client.post = AsyncMock(return_value=mock_token_resp)
    mock_client.get = AsyncMock(return_value=mock_info_resp)

    response = client.get(
        "/api/oauth/google/callback",
        params={"code": "auth-code-123", "state": "99"},
        follow_redirects=False,
    )
    assert response.status_code == 307
    assert "integrations?status=success" in response.headers["location"]


@patch("app.routes.oauth.httpx.AsyncClient")
def test_facebook_callback_success(mock_client_class, client):
    # Mock httpx responses for Facebook oauth exchange and WABA lists
    mock_client = MagicMock()
    mock_client_class.return_value.__aenter__.return_value = mock_client

    # 1. Short access token response
    mock_token_resp = MagicMock()
    mock_token_resp.status_code = 200
    mock_token_resp.json.return_value = {"access_token": "short-token"}

    # 2. Long access token exchange
    mock_exchange_resp = MagicMock()
    mock_exchange_resp.status_code = 200
    mock_exchange_resp.json.return_value = {"access_token": "long-token-777"}

    # 3. WhatsApp Business Accounts response
    mock_waba_resp = MagicMock()
    mock_waba_resp.status_code = 200
    mock_waba_resp.json.return_value = {"data": [{"id": "waba-account-1"}]}

    # 4. Phone Numbers response
    mock_phone_resp = MagicMock()
    mock_phone_resp.status_code = 200
    mock_phone_resp.json.return_value = {"data": [{"id": "phone-id-999"}]}

    # Setup AsyncMock to allow awaiting and define side effects
    mock_client.get = AsyncMock()
    mock_client.get.side_effect = [
        mock_token_resp,  # First call: exchange code for short token
        mock_exchange_resp,  # Second call: exchange for long token
        mock_waba_resp,  # Third call: fetch accounts
        mock_phone_resp,  # Fourth call: fetch phone numbers
    ]

    response = client.get(
        "/api/oauth/facebook/callback",
        params={"code": "fb-code-123", "state": "100"},
        follow_redirects=False,
    )
    assert response.status_code == 307
    assert "integrations?status=success" in response.headers["location"]
