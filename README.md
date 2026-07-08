# pixxi CRM AI 🏢 — Dubai Real Estate Lead Qualification SaaS

`pixxi CRM AI` is a production-grade, multi-tenant real estate lead qualification SaaS powered by **Google's Gemma** and built on top of the **Google Agent Development Kit (ADK)**. It automatically captures, qualifies, and replies to property inquiry leads from WhatsApp, email inboxes, and real estate portals — all without any manual intervention.

---

## 🚀 Key Features

*   **Omnichannel Lead Qualification:**
    *   **WhatsApp Gateway:** Directly parses Meta Cloud API payloads (supports UAE slang like `"3m"` = AED 3,000,000, `"dxb hills"` = Dubai Hills, `"mbrc"` = MBR City) and sends instant automated AI-qualified replies.
    *   **Real Estate Portals (Property Finder / Bayut):** Webhook handlers extract user inquiry messages from boilerplate portal layouts.
    *   **Gmail Inbox:** IMAP synchronization filters email noise (signatures, disclaimers, greetings) and extracts clean property specifications.
*   **3-Legged OAuth Integration:** Securely connects agency accounts via official Meta and Google login flows — no passwords ever stored.
*   **Automatic Webhook Registration:** During OAuth, your server auto-registers the Meta webhook endpoint programmatically — the agency owner never needs to touch the Meta Developer Dashboard.
*   **Multi-Tenant Database:** Each agency's credentials (WhatsApp tokens, IMAP passwords, phone IDs) are isolated per `user_id` in SQLite.
*   **Idempotency (No Duplicate Replies):** Every incoming WhatsApp `message_id` is tracked in the database. Duplicate Meta webhook deliveries are safely detected and ignored, preventing clients from receiving the same reply twice.
*   **Background Task Processing:** WhatsApp lead qualification and AI replies run in a FastAPI `BackgroundTask`, returning `200 OK` to Meta within milliseconds — preventing Meta from retrying the webhook.
*   **Token Revocation Detection:** If a user revokes access in their Meta settings, the backend detects the resulting `401` error, flags the integration as `Disconnected` in the database, and the UI prompts re-authentication.
*   **In-Memory Rate Limiting:** Thread-safe sliding window middleware (60 req/60s per IP) prevents API abuse.
*   **Gemma LLM Auto-Pulling:** `gemma3:270m` is pulled automatically on startup into a persistent host volume — no custom Docker builds required.
*   **Structured Lead Extraction:** Outputs standardized JSON: `budget`, `area`, `property_type`, `bedrooms`, `urgency`.
*   **Interactive Web UI:** React + TypeScript frontend with dynamic webhook URL display, live integration status, and OAuth connect flows.

---

## 🏗️ System Architecture

```
                     ┌─────────────────────────────────────────────┐
                     │              Web Browser                    │
                     │  (Real Estate Agency Owner / Admin)         │
                     └──────────────────┬──────────────────────────┘
                                        │  HTTPS Port 443 / 8081
                                        ▼
                     ┌─────────────────────────────────────────────┐
                     │       Frontend Container (Nginx)            │
                     │   React + TypeScript + Vite SPA             │
                     │                                             │
                     │  /           → serves static React app      │
                     │  /api/*      → strips /api, proxies backend │
                     │  /webhooks/* → proxies backend directly     │
                     └──────────────────┬──────────────────────────┘
                                        │ Docker internal network
                                        ▼
                     ┌─────────────────────────────────────────────┐
                     │    Backend Container (FastAPI / ADK)        │
                     │                                             │
                     │  ┌─────────────────────────────────────┐   │
                     │  │       Rate Limiter Middleware        │   │
                     │  │   (60 req/60s sliding window/IP)     │   │
                     │  └────────────────┬────────────────────┘   │
                     │                   │                         │
                     │         ┌─────────┴──────────┐             │
                     │         │                    │             │
                     │  ┌──────▼──────┐   ┌─────────▼─────────┐  │
                     │  │ Auth Router │   │   ADK Runner       │  │
                     │  │ /register   │   │   /run  /apps/*    │  │
                     │  │ /login      │   │   (Gemma Agent)    │  │
                     │  └─────────────┘   └─────────┬─────────┘  │
                     │                              │             │
                     │         ┌────────────────────┘             │
                     │         │                                  │
                     │  ┌──────▼──────────────────────────────┐  │
                     │  │       Omnichannel Webhooks           │  │
                     │  │                                      │  │
                     │  │  POST /webhooks/whatsapp             │  │
                     │  │    → Idempotency Check (DB)          │  │
                     │  │    → 200 OK returned immediately     │  │
                     │  │    → BackgroundTask:                 │  │
                     │  │        Gemma Lead Qualification      │  │
                     │  │        Auto WhatsApp Reply           │  │
                     │  │        Token Revocation Detection    │  │
                     │  │                                      │  │
                     │  │  POST /webhooks/portal               │  │
                     │  │  GET  /oauth/facebook/login          │  │
                     │  │  GET  /oauth/facebook/callback       │  │
                     │  │    → Token Exchange (short→long)     │  │
                     │  │    → Auto Webhook Registration       │  │
                     │  │    → Save to Multi-tenant DB         │  │
                     │  │  GET  /oauth/google/login            │  │
                     │  │  GET  /oauth/google/callback         │  │
                     │  └────────────┬──────────────┬──────────┘  │
                     │               │              │             │
                     └───────────────┼──────────────┼─────────────┘
                                     │              │
                          ┌──────────▼────┐  ┌──────▼──────────┐
                          │   SQLite DB   │  │  Gemma Backend  │
                          │  (users.db)   │  │ (Ollama:8080)   │
                          │               │  │                 │
                          │ users          │  │ gemma3:270m     │
                          │ user_integr..  │  │ (auto-pulled,   │
                          │ processed_wa.. │  │  volume cached) │
                          └───────────────┘  └─────────────────┘

External Flows:
  Client WhatsApp ──────→ Meta Cloud API ──→ POST /webhooks/whatsapp
  Agency OAuth    ──────→ Meta/Google    ──→ GET  /oauth/*/callback
  Portal Inquiry  ──────→ PF / Bayut     ──→ POST /webhooks/portal
```

---

## 📋 WhatsApp Integration Flow (End-to-End)

```
1. Agency owner clicks "Connect Channel" in the Integrations panel
        │
        ▼
2. Browser redirected to /api/oauth/facebook/login?user_id=<id>
        │
        ▼
3. Backend redirects to Meta's official OAuth consent screen
   (Agency owner logs in with their own Facebook/Meta account)
        │
        ▼
4. Meta redirects back → /oauth/facebook/callback?code=AUTH_CODE
        │
        ├── Exchange AUTH_CODE → short-lived token
        ├── Upgrade → long-lived token (valid 60 days)
        ├── Discover WABA ID + phone_number_id
        ├── Save credentials to users.db (linked to user_id)
        └── AUTO-REGISTER webhook with Meta API → /webhooks/whatsapp
              (One-click: no Meta Dashboard required!)
        │
        ▼
5. Client sends WhatsApp message to agency's number
        │
        ▼
6. Meta sends POST /webhooks/whatsapp
        │
        ├── IDEMPOTENCY: check message_id in DB → skip if duplicate
        ├── Mark message_id as processed
        ├── Return 200 OK to Meta immediately (< 200ms)
        └── Background Task:
              ├── Look up agency by phone_number_id
              ├── Run Gemma AI → extract lead {budget, area, type...}
              ├── Send automated reply to client via Meta Cloud API
              └── If 401 error → flag integration as Disconnected
```

---

## 📁 Repository Structure

```
AgenticGemma/
├── README.md
├── docker-compose.yml           # Multi-container orchestration
├── ollama-backend/
│   └── Dockerfile
├── frontend/
│   ├── nginx.conf               # Nginx proxy config (/api/*, /webhooks/*)
│   ├── vite.config.ts           # Vite dev proxy + Vitest config
│   └── src/
│       ├── App.tsx              # Main app with session management
│       ├── components/
│       │   └── IntegrationsManager.tsx  # OAuth connect + dynamic webhook URLs
│       └── tests/
│           ├── MessageContent.test.tsx
│           ├── SuggestionCards.test.tsx
│           └── IntegrationsManager.test.tsx
└── backend/
    ├── server.py
    ├── pyproject.toml
    └── app/
        ├── main.py              # FastAPI app + RateLimitMiddleware + Ollama auto-pull
        ├── core/
        │   ├── config.py
        │   ├── database.py      # 3-table schema: users, user_integrations,
        │   │                    #   processed_whatsapp_messages (idempotency)
        │   └── rate_limiter.py  # Sliding window rate limiter
        ├── models/
        │   └── schemas.py
        ├── routes/
        │   ├── auth.py          # /register  /login
        │   ├── leads.py         # /qualify-lead
        │   ├── oauth.py         # /oauth/google/*  /oauth/facebook/*
        │   │                    #   + auto webhook registration
        │   └── webhooks.py      # /webhooks/whatsapp (BackgroundTasks + idempotency)
        │                        # /webhooks/portal
        │                        # /integrations CRUD
        ├── services/
        │   ├── auth_service.py
        │   ├── lead_service.py
        │   └── integration_service.py  # save/get/flag_disconnected/idempotency
        ├── integrations/
        │   ├── whatsapp.py      # Meta Cloud API parser + reply sender
        │   ├── email_imap.py    # IMAP crawler
        │   └── portal_webhook.py
        ├── agents/
        │   └── production_agent/agent.py
        └── tests/
            ├── core/
            │   └── test_rate_limiter.py
            ├── routes/
            │   ├── test_auth.py
            │   ├── test_leads.py
            │   ├── test_oauth.py
            │   └── test_webhooks.py
            └── services/
                ├── test_auth_service.py
                └── test_lead_service.py
```

---

## 🛠️ API Reference

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/register` | Register new agency user |
| `POST` | `/login` | Authenticate and return user object |

### Lead Qualification
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/qualify-lead` | Qualify a lead message via Gemma AI |
| `POST` | `/run` | ADK conversational agent runner |

### Webhooks
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/webhooks/whatsapp` | Meta webhook verification challenge |
| `POST` | `/webhooks/whatsapp` | Incoming WhatsApp messages (idempotent, background-processed) |
| `POST` | `/webhooks/portal` | Property Finder / Bayut inquiry payloads |

### Multi-Tenant Integrations
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/integrations` | Save agency integration credentials |
| `GET` | `/integrations/{user_id}` | Get masked credentials for a user |
| `POST` | `/integrations/email/sync` | Trigger IMAP inbox synchronization |

### OAuth
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/oauth/google/login` | Redirect to Google consent screen |
| `GET` | `/oauth/google/callback` | Exchange code → save Gmail token |
| `GET` | `/oauth/facebook/login` | Redirect to Meta consent screen |
| `GET` | `/oauth/facebook/callback` | Exchange code → save token + auto-register webhook |

---

## ⚙️ Required Environment Variables

Add these to your `docker-compose.yml` or server `.env` file:

```env
# Meta / WhatsApp
FACEBOOK_CLIENT_ID=your_meta_app_id
FACEBOOK_CLIENT_SECRET=your_meta_app_secret
FACEBOOK_REDIRECT_URI=https://your-domain.com/oauth/facebook/callback
WHATSAPP_VERIFY_TOKEN=your_custom_verify_token

# Google / Gmail OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=https://your-domain.com/oauth/google/callback

# Webhook base URL (used for auto-registration with Meta)
WEBHOOK_BASE_URL=https://your-domain.com

# Frontend redirect after OAuth
FRONTEND_URL=https://your-domain.com

# Model config
GEMMA_MODEL_NAME=gemma3:270m
OLLAMA_API_BASE=http://gemma-backend:8080

# Admin health endpoint — generate with: python -c "import secrets; print(secrets.token_hex(32))"
# If unset, /admin/health is disabled entirely (returns 403 for all requests).
ADMIN_HEALTH_KEY=your_very_long_random_secret_here
```

---

## 🧪 Test Coverage

| Suite | Tests | Status |
|-------|-------|--------|
| `test_rate_limiter.py` | Sliding window blocking & exclusions | ✅ |
| `test_auth.py` | Register + Login flows | ✅ |
| `test_leads.py` | Omnichannel lead extraction | ✅ |
| `test_oauth.py` | Google + Meta redirects & callbacks | ✅ |
| `test_webhooks.py` | WhatsApp verify, parse, routing, portal, email sync | ✅ |
| `test_auth_service.py` | Password hashing, authentication | ✅ |
| `test_lead_service.py` | Prompt generation, UAE slang parsing | ✅ |
| Frontend Vitest | Component rendering, OAuth redirect, UI interactions | ✅ |

**Backend: 20/20 passing · Frontend: 9/9 passing · 0 warnings**

---

## 📚 Getting Started

### Local Development

**1. Start the AI model (Ollama):**
```bash
ollama run gemma3:270m
```

**2. Run the backend:**
```bash
cd backend
uv sync
uv run server.py
# → http://localhost:8080
```

**3. Run the frontend:**
```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173  (auto-proxies /api to :8080)
```

---

### Docker Deployment (Production)
```bash
docker compose up -d --build
```

| Service | URL |
|---------|-----|
| Frontend UI | `http://your-server:8081` |
| Backend API | `http://your-server:8080` |
| API Docs | `http://your-server:8080/docs` |
| Ollama | `http://your-server:8080` (internal) |

---

## 📊 Observability

### Structured Logging
Every event in `webhooks.py` emits a single-line JSON object — no regex parsing needed by log aggregators like **Datadog**, **AWS CloudWatch**, or **Grafana Loki**.

| Event name | Level | When it fires |
|---|---|---|
| `whatsapp.received` | INFO | New message accepted, background task queued |
| `whatsapp.ignored` | INFO | Payload had no valid text message |
| `whatsapp.duplicate_discarded` | INFO | Same `message_id` seen again (Meta retry) |
| `whatsapp.lead_qualified` | INFO | Gemma returned structured lead data |
| `whatsapp.reply_sent` | INFO | Reply successfully delivered to client |
| `whatsapp.auth_expired` | WARNING | Meta returned 401 — token revoked, integration flagged |

**Example log line:**
```json
{"ts": 1720434182.4, "level": "WARNING", "event": "whatsapp.auth_expired",
 "message_id": "wamid.abc123", "user_id": 42,
 "outcome": "integration_flagged_disconnected",
 "action_required": "user_must_reconnect_whatsapp"}
```

### `/admin/health` Dashboard
`GET /admin/health` runs three independent dependency checks and returns a unified status:

```json
{
  "overall": "healthy",
  "timestamp": 1720434182.4,
  "checks": {
    "database": {"status": "healthy", "latency_ms": 1.8, "tables": ["users", "user_integrations", "processed_whatsapp_messages"]},
    "ollama_gemma": {"status": "healthy", "latency_ms": 38.4, "model": "gemma3:270m"},
    "meta_graph_api": {"status": "reachable", "latency_ms": 92.1, "http_status": 400}
  }
}
```

**Status ladder (worst-case wins):** `unhealthy` → `unreachable` → `degraded` → `reachable` → `healthy`

Use this endpoint in:
- **Docker** `HEALTHCHECK` directive
- **Uptime monitors** (UptimeRobot, Betterstack, Grafana)
- **CI/CD pre-deploy smoke tests**

---

## ⚖️ Production Trade-offs

This section documents the *why* behind key architectural decisions — not just the *what*.

### 1. Asynchronous Background Tasks vs. Blocking Calls

**Decision:** WhatsApp lead qualification runs in a FastAPI `BackgroundTask`, not inline.

**Why:** Meta's Webhook documentation mandates a `200 OK` response within **~5 seconds**, or it flags your endpoint as failed and begins exponential-backoff retries. Our Gemma model can take **10–30 seconds** on limited hardware. Blocking the HTTP response for that duration would cause Meta to flood us with retry traffic, creating a feedback loop.

**Trade-off accepted:** The HTTP response no longer contains qualified lead data. Internal consumers (dashboards, CRM sync) must subscribe to the database or a queue for results rather than reading the webhook response body.

**At scale, replace with:** A proper task queue (Celery + Redis or Google Cloud Tasks). `BackgroundTasks` runs in the same process, so a server restart mid-processing will silently drop in-flight leads.

---

### 2. DB-Based Idempotency vs. Redis Distributed Lock

**Decision:** We use a `processed_whatsapp_messages` SQLite table keyed on `message_id`.

**Why:** Meta guarantees that every message has a globally unique `message_id` (e.g., `wamid.abc123`). Storing these in SQLite with a `PRIMARY KEY` gives us O(1) lookup and `INSERT OR IGNORE` atomicity at zero infrastructure cost.

**Trade-off accepted:** SQLite is not safe under multiple concurrent write processes. This works correctly for a **single-process** deployment (one Uvicorn worker, one container). If you horizontally scale to 3+ replicas, two processes could pass the idempotency check simultaneously for the same message.

**At scale, replace with:** A Redis `SETNX` (set-if-not-exists) call with a TTL of ~24 hours. This provides distributed atomic idempotency across all replicas.

---

### 3. SQLite vs. PostgreSQL

**Decision:** SQLite for the multi-tenant user and integration store.

**Why:** Zero infrastructure overhead for a PoC/MVP. The entire database is a single file, trivially backed up with `cp`, and Docker-volume-persistent. For a team of 1–5 agency users with low concurrent writes, SQLite performs identically to Postgres.

**Trade-off accepted:** SQLite's write concurrency model (WAL mode aside) becomes a bottleneck above ~50 concurrent writers. Foreign key enforcement is opt-in (enabled via `PRAGMA foreign_keys = ON`).

**At scale, replace with:** PostgreSQL via SQLAlchemy ORM + Alembic migrations. The service layer is already abstracted (`integration_service.py`) so the DB swap would not touch any router or business logic code.

---

### 4. Auto Webhook Registration vs. Manual Meta Dashboard Setup

**Decision:** The `/oauth/facebook/callback` handler calls Meta's `/{phone_number_id}/subscribed_apps` API to register the webhook programmatically.

**Why:** For a SaaS platform, requiring users to navigate the Meta Developer Dashboard is a 5-step technical process that will cause drop-off. Automating it during OAuth creates a true **one-click connect** experience.

**Trade-off accepted:** The Meta API for programmatic webhook subscription requires the app to be in **Live mode** (not Development mode) and the token must have the `whatsapp_business_management` scope. During development, the registration call will silently fail (logged as a warning) and the developer must still use the Dashboard.

---

### 5. Long-Lived Token (60-Day) vs. Refresh Flow

**Decision:** Upgrade the short-lived OAuth code to a 60-day long-lived token via Meta's `fb_exchange_token` grant.

**Why:** Meta's System User tokens for the WhatsApp Business API do not follow the standard OAuth refresh-token pattern. The long-lived token approach is the official recommended pattern for server-to-server integrations.

**Trade-off accepted:** Tokens expire silently after 60 days. Without a re-auth prompt, all WhatsApp sends will start returning `401`. Mitigation: the `flag_whatsapp_disconnected()` function catches the first `401`, marks the integration as disconnected in the DB, and the frontend's integration panel must display a "Reconnect" button to re-initiate OAuth.

**At scale, add:** A daily cron job that checks `updated_at` on `user_integrations` and proactively re-prompts users whose token is older than 50 days, before it silently expires.

