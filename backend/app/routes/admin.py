"""
Admin-only health check endpoint.

Security model (defense in depth — 3 independent layers):
  Layer 1 — Network:  Nginx hard-blocks /admin/* before any request reaches this code.
  Layer 2 — Auth:     X-Admin-Key header required; constant-time comparison prevents
                      timing attacks. Returns 403 (not 401) to avoid revealing endpoint exists.
  Layer 3 — Output:   Raw exception strings are NEVER included in the response body.
                      Only sanitized, opaque messages are returned so that internal
                      service hostnames, file paths, and DB filenames cannot be
                      exfiltrated through error responses.
"""

import hashlib
import hmac
import logging
import os
import time

import httpx
from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse

from app.core.database import connect_db

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/admin")

# ---------------------------------------------------------------------------
# Auth dependency — Layer 2
# ---------------------------------------------------------------------------

_ADMIN_KEY = os.getenv("ADMIN_HEALTH_KEY", "")


def _verify_admin_key(request: Request) -> bool:
    """
    Constant-time comparison of the X-Admin-Key header value against the
    expected secret.  Using hmac.compare_digest prevents timing-oracle attacks
    where an attacker could brute-force the key one character at a time by
    measuring response latency differences.
    """
    if not _ADMIN_KEY:
        # If no key is configured, the endpoint is disabled entirely.
        return False
    provided = request.headers.get("X-Admin-Key", "")
    # Encode both sides before comparison to satisfy hmac.compare_digest's
    # requirement for identical types.
    return hmac.compare_digest(
        hashlib.sha256(provided.encode()).digest(),
        hashlib.sha256(_ADMIN_KEY.encode()).digest(),
    )


# ---------------------------------------------------------------------------
# Sanitised check helpers — Layer 3
# ---------------------------------------------------------------------------


async def _check_database() -> dict:
    """
    Verifies database is reachable and all required tables exist.
    Exception details are logged server-side only; the caller receives
    a generic opaque error code — never a raw exception string.
    """
    start = time.monotonic()
    try:
        conn = connect_db()
        cursor = conn.cursor()
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = {row[0] for row in cursor.fetchall()}
        conn.close()
        required = {"users", "user_integrations", "processed_whatsapp_messages"}
        missing = required - tables
        latency_ms = round((time.monotonic() - start) * 1000, 2)
        if missing:
            logger.error("DB health: missing tables %s", missing)
            return {
                "status": "degraded",
                "latency_ms": latency_ms,
                "error_code": "MISSING_TABLES",  # opaque — no path leaked
            }
        return {"status": "healthy", "latency_ms": latency_ms, "tables": sorted(tables)}
    except Exception:
        # Log the real error internally; respond with an opaque code only.
        logger.exception("DB health check failed")
        return {
            "status": "unhealthy",
            "latency_ms": round((time.monotonic() - start) * 1000, 2),
            "error_code": "DB_CONNECTION_FAILED",
        }


async def _check_ollama() -> dict:
    """
    Pings the Ollama API to confirm the Gemma model is loaded.
    Internal service URL and model list are never exposed in the response.
    """
    start = time.monotonic()
    model_name = os.getenv("GEMMA_MODEL_NAME", "gemma3:270m")
    ollama_base = os.getenv("OLLAMA_API_BASE", "http://gemma-backend:8080")
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(f"{ollama_base}/api/tags")
            latency_ms = round((time.monotonic() - start) * 1000, 2)
            if resp.status_code == 200:
                models = [
                    m.get("name") or m.get("model")
                    for m in resp.json().get("models", [])
                ]
                if model_name in models:
                    return {
                        "status": "healthy",
                        "latency_ms": latency_ms,
                        "model": model_name,
                    }
                logger.warning("Ollama: model '%s' not in available list", model_name)
                return {
                    "status": "degraded",
                    "latency_ms": latency_ms,
                    "error_code": "MODEL_NOT_LOADED",  # no internal URL leaked
                }
            logger.error("Ollama returned HTTP %s", resp.status_code)
            return {
                "status": "unhealthy",
                "latency_ms": latency_ms,
                "error_code": "OLLAMA_BAD_RESPONSE",
            }
    except Exception:
        logger.exception("Ollama health check failed")
        return {
            "status": "unhealthy",
            "latency_ms": round((time.monotonic() - start) * 1000, 2),
            "error_code": "OLLAMA_UNREACHABLE",
        }


async def _check_meta_api() -> dict:
    """
    Makes a lightweight probe to the Meta Graph API.
    A 400 response (missing token) confirms the endpoint is reachable —
    expected behaviour for an unauthenticated health probe.
    """
    start = time.monotonic()
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get("https://graph.facebook.com/v20.0/me")
            latency_ms = round((time.monotonic() - start) * 1000, 2)
            if resp.status_code in (200, 400, 401, 403):
                return {"status": "reachable", "latency_ms": latency_ms}
            logger.warning(
                "Meta API probe returned unexpected HTTP %s", resp.status_code
            )
            return {
                "status": "degraded",
                "latency_ms": latency_ms,
                "error_code": "META_UNEXPECTED_RESPONSE",
            }
    except Exception:
        logger.exception("Meta API health check failed")
        return {
            "status": "unreachable",
            "latency_ms": round((time.monotonic() - start) * 1000, 2),
            "error_code": "META_UNREACHABLE",
        }


# ---------------------------------------------------------------------------
# Endpoint
# ---------------------------------------------------------------------------

# Status priority: index 0 is worst, index 4 is best.
_STATUS_PRIORITY = ["unhealthy", "unreachable", "degraded", "reachable", "healthy"]


@router.get("/health", tags=["Admin"], include_in_schema=False)
async def admin_health(request: Request):
    """
    Proactive dependency health check — internal use only.

    Security:
      - Nginx hard-blocks this path at the edge (Layer 1).
      - X-Admin-Key header required (Layer 2).
      - All error details are logged server-side only; opaque error_codes
        are returned in the body — no stack traces, paths, or hostnames
        are ever exposed (Layer 3).
      - include_in_schema=False hides this route from /docs entirely.

    Usage:
      curl -H "X-Admin-Key: <secret>" http://localhost:8080/admin/health
    """
    # --- Layer 2: Authenticate ---
    if not _verify_admin_key(request):
        # Return 403 (not 401) — avoids revealing the endpoint exists or
        # hinting that authentication is the mechanism in play.
        logger.warning(
            "Rejected /admin/health request from %s — invalid or missing X-Admin-Key",
            request.client.host if request.client else "unknown",
        )
        return JSONResponse(status_code=403, content={"detail": "Forbidden"})

    db_result, ollama_result, meta_result = (
        await _check_database(),
        await _check_ollama(),
        await _check_meta_api(),
    )

    checks = {
        "database": db_result,
        "ollama_gemma": ollama_result,
        "meta_graph_api": meta_result,
    }

    # Overall = worst individual status
    all_statuses = [c["status"] for c in checks.values()]
    overall = min(
        all_statuses,
        key=lambda s: _STATUS_PRIORITY.index(s) if s in _STATUS_PRIORITY else -1,
    )

    return {
        "overall": overall,
        "checks": checks,
        "timestamp": time.time(),
    }
