# Copyright 2026 Google LLC


def test_rate_limiter_exclusions_and_blocking(client):
    """
    Verifies that:
    1. Excluded routes (like /health) are not rate-limited even when called frequently.
    2. Regular routes (like /) are blocked with a 429 response code once the limit is exceeded.
    """
    # 1. Excluded route should always pass
    for _ in range(70):
        resp = client.get("/health", headers={"X-Test-Rate-Limit": "true"})
        assert resp.status_code == 200

    # 2. Regular route should eventually be blocked
    limit_blocked = False
    for _ in range(80):
        resp = client.get("/", headers={"X-Test-Rate-Limit": "true"})
        if resp.status_code == 429:
            limit_blocked = True
            assert "Rate limit exceeded" in resp.json()["detail"]
            break

    assert limit_blocked, (
        "Rate limiter failed to block requests after limit was exceeded"
    )
