# pixxi CRM AI 🏢 — Dubai Real Estate Lead Qualification

`pixxi CRM AI` is a multi-container real estate lead qualification system powered by **Google's Gemma** and built on top of the **Google Agent Development Kit (ADK)**. It is designed to automatically capture, parse, and qualify property inquiry leads from multiple communication channels in Dubai's real estate market.

---

## 🚀 Key Features

*   **Omnichannel Lead Qualification:** Normalizes and extracts structured criteria from messy, raw communications across different sources:
    *   **WhatsApp Chat:** Extracts details from informal text containing heavy local abbreviations and slang (e.g., `"3m"`/`"3M"` for AED 3,000,000, `"dxb hills"` for Dubai Hills, `"mbrc"` for Mohammed Bin Rashid City).
    *   **Real Estate Portals (Property Finder / Bayut):** Automatically isolates actual client messages embedded within boilerplate template layouts.
    *   **Email Inbox:** Filters out greetings, email signatures, headers, and disclaimers to extract clean property specifications.
    *   **Web Forms:** Extracts structured parameters directly from clean inputs.
*   **Gemma LLM Integration:** Uses the lightweight and powerful `gemma3:270m` model for local inference and parsing.
*   **Structured Lead Extraction:** Outputs standardized JSON objects containing keys: `budget`, `area`, `property_type`, `bedrooms`, and `urgency`.
*   **Interactive Web UI:** Interactive frontend called **pixxi CRM AI** designed to converse with agents, qualify leads, and manage property search criteria in real time.
*   **Elasticity & Scale Testing:** Features integrated Locust-based performance testing (`elasticity_test.py`) to simulate user queries and validate system scaling behavior under load.

---

## 🏗️ System Architecture

The application is structured as a multi-container microservice system orchestrated via Docker Compose:

```
                  ┌─────────────────┐
                  │   Web Browser   │
                  │  (Frontend UI)  │
                  └────────┬────────┘
                           │ Port 8081 (mapped to Nginx Port 80)
                           ▼
                  ┌─────────────────┐
                  │    Frontend     │
                  │  (Nginx/Static) │
                  └────────┬────────┘
                           │ Proxies requests
                           ▼
                  ┌─────────────────┐
                  │    ADK Agent    │
                  │ (FastAPI / ADK) │
                  └────────┬────────┘
                           │ Port 8000 (ADK Run & Qualify API)
                           ▼
                  ┌─────────────────┐
                  │  Gemma Backend  │
                  │ (Ollama server) │
                  └─────────────────┘
                            Port 8080 (serves gemma3:270m)
```

1.  **Gemma Backend (`ollama-backend/`)**: Containerizes the Ollama server to pull and serve `gemma3:270m` model locally.
2.  **ADK Agent (`adk-agent/`)**: FastAPI-based server integrating Google's Agent Development Kit (ADK) and LiteLLM to coordinate conversation flows, expose API endpoints, and execute channel-aware prompt tuning.
3.  **Frontend (`frontend/`)**: Static UI server powered by Nginx serving the `pixxi CRM AI` web interface.

---

## 📁 Repository Structure

```
AgenticGemma/
├── README.md                    # This description file
├── docker-compose.yml           # Multi-container orchestration config
├── ollama-backend/              # Ollama server configuration
│   └── Dockerfile               # Backend container recipe
├── frontend/                    # Web UI client
│   ├── index.html               # Lead qualification chat screen
│   ├── nginx.conf               # Nginx server configuration
│   └── Dockerfile               # Frontend container recipe
└── adk-agent/                   # Agent API and Logic
    ├── pyproject.toml           # Python package dependencies
    ├── main.py                  # Primary FastAPI router
    ├── server.py                # ADK application server launcher
    ├── agents.py                # Omnichannel lead qualification rules
    ├── elasticity_test.py       # Locust load-testing script
    └── production_agent/        # Subagent modules
        └── agent.py             # LiteLLM connection setup for Gemma
```

---

## 🛠️ API Reference

### 1. Qualify Lead
*   **Endpoint:** `POST /api/v1/qualify-lead`
*   **Payload:**
    ```json
    {
      "lead_id": 101,
      "message": "looking for a 4 bed villa in dxb hills urgent. budget around 3m.",
      "source": "WhatsApp"
    }
    ```
*   **Response:**
    ```json
    {
      "status": "success",
      "data": {
        "budget": "AED 3M",
        "area": "Dubai Hills",
        "property_type": "Villa",
        "bedrooms": 4,
        "urgency": "High"
      }
    }
    ```

### 2. Register User
*   **Endpoint:** `POST /api/register` (Proxied to `/register` on the backend)
*   **Payload:**
    ```json
    {
      "username": "agent_user",
      "password": "secure_password"
    }
    ```
*   **Response:**
    ```json
    {
      "status": "success",
      "user": {
        "id": 1,
        "username": "agent_user"
      }
    }
    ```

### 3. Authenticate User (Login)
*   **Endpoint:** `POST /api/login` (Proxied to `/login` on the backend)
*   **Payload:**
    ```json
    {
      "username": "agent_user",
      "password": "secure_password"
    }
    ```
*   **Response:**
    ```json
    {
      "status": "success",
      "user": {
        "id": 1,
        "username": "agent_user"
      }
    }
    ```

### 4. Conversational Agent Runner (ADK)
*   **Endpoint:** `POST /run` (Exposed by ADK)
*   **Purpose:** Triggers conversational session states with the Gemma-powered assistant.

---

## 📚 Getting Started

### Prerequisites
*   Docker & Docker Compose installed on your system.

### Build and Run
Start all the services using:
```bash
docker-compose up --build
```

Once running, access the services locally at:
*   **Frontend UI:** [http://localhost:8081](http://localhost:8081)
*   **ADK Backend API:** [http://localhost:8000](http://localhost:8000)
*   **FastAPI Interactive Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)
*   **Gemma Ollama Endpoint:** [http://localhost:8080](http://localhost:8080)
