# Copyright 2026 Google LLC
import os
import time
import threading
from collections import defaultdict
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse


class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, calls: int = 100, period: int = 60):
        """
        Rate limiter middleware using a sliding window counter.
        Defaults to 100 calls per 60 seconds per IP address.
        """
        super().__init__(app)
        self.calls = calls
        self.period = period
        self.requests = defaultdict(list)
        self.lock = threading.Lock()

    async def dispatch(self, request: Request, call_next) -> Response:
        path = request.url.path
        # Exclude documentation and health check endpoints
        if path in ["/health", "/docs", "/openapi.json"] or path.startswith("/static"):
            return await call_next(request)

        # Bypass rate limiter during unit tests unless testing rate limiter specifically
        if os.getenv("TESTING") == "1" and not request.headers.get("X-Test-Rate-Limit"):
            return await call_next(request)

        client_ip = request.client.host if request.client else "unknown"
        now = time.time()

        with self.lock:
            timestamps = self.requests[client_ip]
            # Keep only timestamps within the active sliding window
            valid_timestamps = [t for t in timestamps if now - t < self.period]
            self.requests[client_ip] = valid_timestamps

            if len(valid_timestamps) >= self.calls:
                return JSONResponse(
                    status_code=429,
                    content={
                        "detail": "Too many requests. Rate limit exceeded. Please try again later."
                    },
                )
            self.requests[client_ip].append(now)

        return await call_next(request)
