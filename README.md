# pixxi CRM AI 🏢 — Dubai Real Estate Lead Qualification SaaS

`pixxi CRM AI` is a multi-container real estate lead qualification SaaS powered by **Google's Gemma** and built on top of the **Google Agent Development Kit (ADK)**. It is designed to automatically capture, parse, and qualify property inquiry leads from multiple communication channels in Dubai's real estate market.

---

## 🚀 Key Features

*   **Omnichannel Lead Qualification:** Normalizes and extracts structured criteria from messy, raw communications across different sources:
    *   **WhatsApp Gateway:** Directly parses WhatsApp message payloads (supporting local slang like `"3m"`/`"3M"` for AED 3,000,000, `"dxb hills"` for Dubai Hills, `"mbrc"` for Mohammed Bin Rashid City) and replies to leads automatically.
    *   **Real Estate Portals (Property Finder / Bayut):** Webhook handlers isolate user messages embedded within boilerplate portal layouts.
    *   **Email Inbox:** Filters out greetings, email signatures, headers, and disclaimers to extract clean property specifications via automatic IMAP synchronization.
    *   **Web Forms:** Extracts structured parameters directly from clean inputs.
*   **3-Legged OAuth Integration:** Securely authorizes access to Meta (for WhatsApp Cloud accounts discovery) and Google (for Gmail inbox synchronization) using official login flows.
*   **Multi-Tenant Database Settings:** Dynamically stores credentials and integration configs per user/agency in a persistent SQLite database.
*   **Gemma LLM Auto-Pulling:** Uses the lightweight and powerful `gemma3:270m` model for local inference and parsing, pulled automatically on startup into a persistent local volume cache.
*   **In-Memory Rate Limiting:** Core middleware utilizing a thread-safe sliding window counter to prevent API abuse and client spam.
*   **Structured Lead Extraction:** Outputs standardized JSON objects containing keys: `budget`, `area`, `property_type`, `bedrooms`, and `urgency`.
*   **Interactive Web UI:** Interactive frontend designed to converse with agents, qualify leads, and manage property search criteria in real time.
*   **Elasticity & Scale Testing:** Features integrated Locust-based performance testing (`elasticity_test.py`) to simulate user queries and validate system scaling behavior under load.

---

## 🏗️ System Architecture

The application is structured as a multi-container microservice system orchestrated via Docker Compose:

```
                                 ┌──────────────────────┐
                                 │      Web Browser     │
                                 │     (Frontend UI)    │
                                 └──────────┬───────────┘
                                            │ Port 8081 (Nginx Port 80)
                                            ▼
                                 ┌──────────────────────┐
                                 │       Frontend       │
                                 │     (Nginx/Static)   │
                                 └──────────┬───────────┘
                                            │ Proxies Requests
                                            ▼
                     ┌──────────────────────────────────────────────┐
                     │              Backend Service (FastAPI)       │
                     │                                              │
                     │  ┌──────────────┐          ┌──────────────┐  │
                     │  │ Rate Limiter │          │ Auth Router  │  │
                     │  └──────┬───────┘          └──────────────┘  │
                     │         │                                    │
                     │         ▼                                    │
                     │  ┌────────────────────────────────────────┐  │
                     │  │             ADK Runner                 │  │
                     │  │    (Production Gemma Conversational)   │  │
                     │  └──────┬─────────────────────────────────┘  │
                     │         │                                    │
                     │         ▼                                    │
                     │  ┌────────────────────────────────────────┐  │
                     │  │      Omnichannel Webhooks & OAuth      │  │
                     │  │ (WhatsApp, Google Gmail, Portals API) │  │
                     │  └──────┬──────────────────────┬──────────┘  │
                     │         │                      │             │
                     └─────────┼──────────────────────┼─────────────┘
                               │                      │
                               ▼                      ▼
                     ┌──────────────────┐    ┌──────────────────┐
                     │    SQLite DB     │    │  Gemma Backend   │
                     │    (users.db)    │    │ (Ollama Service) │
                     └──────────────────┘    └──────────────────┘
                      Multi-tenant Settings    Port 8080 (Local Model)
```

1.  **Gemma Backend (`ollama-backend/`)**: Containerizes the official Ollama server and mounts a local persistent volume cache (`./ollama-models`) on the host to avoid rebuilding model weights on every release.
2.  **Backend Service (`backend/`)**: FastAPI-based server integrating Google's Agent Development Kit (ADK) and LiteLLM to coordinate conversation flows, expose API endpoints, and execute channel-aware prompt tuning. Exposes endpoints for authentication, OAuth, webhook handlers, and integrations manager.
3.  **Frontend (`frontend/`)**: Static UI server powered by Nginx serving the `pixxi CRM AI` web interface (Vite + React + TypeScript). Features Vitest test coverage and handles relative API proxies.

---

## 📁 Repository Structure

```
AgenticGemma/
├── README.md                    # This description file
├── docker-compose.yml           # Multi-container orchestration config
├── ollama-backend/              # Ollama server configuration
│   └── Dockerfile               # Backend container recipe
├── frontend/                    # Web UI client (Vite + React + TS)
│   ├── index.html               # React app entry template
│   ├── nginx.conf               # Nginx server configuration
│   ├── package.json             # NPM dependencies & scripts
│   ├── vite.config.ts           # Vite and Vitest configuration
│   ├── src/                     # React source files (components, styles, hooks)
│   └── src/tests/               # Frontend test suites (Vitest + React Testing Library)
│       ├── SuggestionCards.test.tsx
│       ├── MessageContent.test.tsx
│       └── IntegrationsManager.test.tsx # OAuth and panel render tests
└── backend/                     # Agent API and Logic
    ├── pyproject.toml           # Python package dependencies
    ├── server.py                # ADK application server launcher
    └── app/                     # Packaged Backend Application
        ├── main.py              # Main FastAPI application router, middleware & setup
        ├── core/                # Core configurations
        │   ├── config.py        # Environment variables & settings config
        │   ├── database.py      # SQLite database initialization
        │   └── rate_limiter.py  # Sliding window rate limiter middleware
        ├── models/              # Pydantic data schemas
        │   └── schemas.py       # Request and response payloads
        ├── routes/              # FastAPI Route controllers
        │   ├── auth.py          # /login & /register endpoints
        │   ├── leads.py         # /api/v1/qualify-lead endpoint
        │   ├── oauth.py         # Google and Facebook login & callback endpoints
        │   └── webhooks.py      # Meta webhooks & portal ingestion routes
        ├── services/            # Business & helper logic
        │   ├── auth_service.py  # User authentication & hashing service
        │   ├── lead_service.py  # Omnichannel lead extraction engine
        │   └── integration_service.py # Database integration settings CRUD
        ├── integrations/        # Channel parsers
        │   ├── whatsapp.py      # Meta Cloud API message/reply processor
        │   ├── email_imap.py    # IMAP unread email crawler
        │   └── portal_webhook.py # Portal payload normalizers
        ├── agents/              # ADK Conversational Agents
        │   └── production_agent/
        │       └── agent.py     # LiteLLM connection setup for Gemma
        └── tests/               # Backend Pytest test suite
            ├── core/            # Core tests
            │   └── test_rate_limiter.py
            ├── routes/          # API route endpoint tests
            │   ├── test_auth.py
            │   ├── test_leads.py
            │   ├── test_oauth.py
            │   └── test_webhooks.py
            └── services/        # Service logic unit tests
                ├── test_auth_service.py
                └── test_lead_service.py
```

---

## 🛠️ API Reference

### 1. Webhook Handlers
*   **Endpoint:** `GET /webhooks/whatsapp`
    *   **Purpose:** Verifies Meta's verification challenge tokens.
*   **Endpoint:** `POST /webhooks/whatsapp`
    *   **Purpose:** Ingests incoming user messages from the Meta Cloud API and sends automated qualified replies.
*   **Endpoint:** `POST /webhooks/portal`
    *   **Payload:** Property Finder or Bayut lead ingestion schema.

### 2. Multi-Tenant Integrations CRUD
*   **Endpoint:** `POST /integrations`
    *   **Payload:** Integrations settings schema containing tokens/IMAP credentials.
*   **Endpoint:** `GET /integrations/{user_id}`
    *   **Response:** Masked integrations configuration settings for security.
*   **Endpoint:** `POST /integrations/email/sync`
    *   **Purpose:** Synchronizes unread inbox messages dynamically using tenant credentials.

### 3. Google & Meta OAuth Flow
*   **Endpoints:** `GET /oauth/google/login` & `GET /oauth/facebook/login`
    *   **Purpose:** Redirects browser to official consent login pages.
*   **Endpoints:** `GET /oauth/google/callback` & `GET /oauth/facebook/callback`
    *   **Purpose:** Receives redirect authorization codes, exchanges them for access tokens, and registers settings in the database.

---

## 📚 Getting Started

### Local Setup
Ensure you have Ollama installed and running locally:
```bash
ollama run gemma3:270m
```

#### Run Backend Locally:
```bash
cd backend
uv sync
uv run server.py
```
*(Runs on `http://localhost:8080`)*

#### Run Frontend Locally:
```bash
cd frontend
npm install
npm run dev
```
*(Runs on `http://localhost:5173`, automatically proxies `/api` to the backend)*

---

### Docker Deployment
Start all the services using:
```bash
docker compose up -d --build
```

Once running, access the services on:
*   **Frontend UI:** `http://localhost:8081`
*   **ADK Backend API:** `http://localhost:8000`
*   **FastAPI Interactive Docs:** `http://localhost:8000/docs`
