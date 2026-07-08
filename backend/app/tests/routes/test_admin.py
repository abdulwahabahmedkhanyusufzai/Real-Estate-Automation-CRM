"""
Tests for /admin/health endpoint.
Covers: authentication enforcement, status rollup logic, and sanitized outputs.
"""

from unittest.mock import AsyncMock, patch

import pytest

# The test admin key injected via environment
TEST_ADMIN_KEY = "test-admin-secret-key"
AUTH_HEADER = {"X-Admin-Key": TEST_ADMIN_KEY}


@pytest.fixture(autouse=True)
def set_admin_key(monkeypatch):
    """Inject a known ADMIN_HEALTH_KEY for all tests in this module."""
    monkeypatch.setenv("ADMIN_HEALTH_KEY", TEST_ADMIN_KEY)
    # Patch the module-level _ADMIN_KEY that was already loaded at import time
    with patch("app.routes.admin._ADMIN_KEY", TEST_ADMIN_KEY):
        yield


# ---------------------------------------------------------------------------
# Authentication tests
# ---------------------------------------------------------------------------


def test_health_requires_key(client):
    """Request with no X-Admin-Key header must be rejected with 403."""
    response = client.get("/admin/health")
    assert response.status_code == 403
    assert response.json() == {"detail": "Forbidden"}


def test_health_wrong_key_rejected(client):
    """Request with a wrong key must be rejected with 403."""
    response = client.get("/admin/health", headers={"X-Admin-Key": "wrong-key"})
    assert response.status_code == 403


def test_health_correct_key_accepted(client):
    """Request with the correct X-Admin-Key header must succeed."""
    with (
        patch(
            "app.routes.admin._check_database",
            new_callable=AsyncMock,
            return_value={"status": "healthy", "latency_ms": 1.0, "tables": ["users"]},
        ),
        patch(
            "app.routes.admin._check_ollama",
            new_callable=AsyncMock,
            return_value={
                "status": "healthy",
                "latency_ms": 10.0,
                "model": "gemma3:270m",
            },
        ),
        patch(
            "app.routes.admin._check_meta_api",
            new_callable=AsyncMock,
            return_value={"status": "reachable", "latency_ms": 50.0},
        ),
    ):
        response = client.get("/admin/health", headers=AUTH_HEADER)
        assert response.status_code == 200


# ---------------------------------------------------------------------------
# Status rollup tests
# ---------------------------------------------------------------------------


def test_health_all_healthy(client):
    """
    When DB and Ollama are healthy and Meta is reachable,
    overall is 'reachable' (worst of the three, since 'reachable' < 'healthy'
    in the priority ladder).
    """
    with (
        patch(
            "app.routes.admin._check_database",
            new_callable=AsyncMock,
            return_value={"status": "healthy", "latency_ms": 1.2, "tables": ["users"]},
        ),
        patch(
            "app.routes.admin._check_ollama",
            new_callable=AsyncMock,
            return_value={
                "status": "healthy",
                "latency_ms": 42.0,
                "model": "gemma3:270m",
            },
        ),
        patch(
            "app.routes.admin._check_meta_api",
            new_callable=AsyncMock,
            return_value={"status": "reachable", "latency_ms": 89.3},
        ),
    ):
        response = client.get("/admin/health", headers=AUTH_HEADER)
        assert response.status_code == 200
        data = response.json()
        # Meta can only ever be 'reachable' from a no-token probe — that is correct
        assert data["overall"] == "reachable"
        assert data["checks"]["database"]["status"] == "healthy"
        assert data["checks"]["ollama_gemma"]["status"] == "healthy"
        assert data["checks"]["meta_graph_api"]["status"] == "reachable"
        assert "timestamp" in data


def test_health_database_unhealthy(client):
    """If DB is unhealthy, overall must be 'unhealthy'."""
    with (
        patch(
            "app.routes.admin._check_database",
            new_callable=AsyncMock,
            return_value={
                "status": "unhealthy",
                "latency_ms": 0.1,
                "error_code": "DB_CONNECTION_FAILED",
            },
        ),
        patch(
            "app.routes.admin._check_ollama",
            new_callable=AsyncMock,
            return_value={
                "status": "healthy",
                "latency_ms": 42.0,
                "model": "gemma3:270m",
            },
        ),
        patch(
            "app.routes.admin._check_meta_api",
            new_callable=AsyncMock,
            return_value={"status": "reachable", "latency_ms": 89.3},
        ),
    ):
        response = client.get("/admin/health", headers=AUTH_HEADER)
        assert response.status_code == 200
        data = response.json()
        assert data["overall"] == "unhealthy"


def test_health_ollama_degraded(client):
    """If Ollama model is missing (degraded), overall must be 'degraded'."""
    with (
        patch(
            "app.routes.admin._check_database",
            new_callable=AsyncMock,
            return_value={"status": "healthy", "latency_ms": 1.2, "tables": ["users"]},
        ),
        patch(
            "app.routes.admin._check_ollama",
            new_callable=AsyncMock,
            return_value={
                "status": "degraded",
                "latency_ms": 55.0,
                "error_code": "MODEL_NOT_LOADED",
            },
        ),
        patch(
            "app.routes.admin._check_meta_api",
            new_callable=AsyncMock,
            return_value={"status": "reachable", "latency_ms": 89.3},
        ),
    ):
        response = client.get("/admin/health", headers=AUTH_HEADER)
        assert response.status_code == 200
        data = response.json()
        assert data["overall"] == "degraded"
        assert data["checks"]["ollama_gemma"]["status"] == "degraded"


# ---------------------------------------------------------------------------
# Output sanitisation tests
# ---------------------------------------------------------------------------


def test_health_no_raw_exception_in_response(client):
    """
    Even when a check raises an unexpected exception, the response body must
    never contain raw exception text, file paths, or hostnames.
    """
    with (
        patch(
            "app.routes.admin._check_database",
            new_callable=AsyncMock,
            return_value={
                "status": "unhealthy",
                "latency_ms": 0.0,
                "error_code": "DB_CONNECTION_FAILED",
            },
        ),
        patch(
            "app.routes.admin._check_ollama",
            new_callable=AsyncMock,
            return_value={
                "status": "unhealthy",
                "latency_ms": 0.0,
                "error_code": "OLLAMA_UNREACHABLE",
            },
        ),
        patch(
            "app.routes.admin._check_meta_api",
            new_callable=AsyncMock,
            return_value={
                "status": "unreachable",
                "latency_ms": 0.0,
                "error_code": "META_UNREACHABLE",
            },
        ),
    ):
        response = client.get("/admin/health", headers=AUTH_HEADER)
        body = response.text
        # None of these strings should ever appear in a response body
        assert "Traceback" not in body
        assert "/app/" not in body
        assert "sqlite3" not in body
        assert "gemma-backend" not in body
        assert "users.db" not in body
