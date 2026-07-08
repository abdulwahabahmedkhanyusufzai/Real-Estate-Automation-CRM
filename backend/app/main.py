import os
import asyncio
import httpx
from fastapi import FastAPI
from google.adk.cli.fast_api import get_fast_api_app
from app.routes.auth import router as auth_router
from app.routes.leads import router as leads_router
from app.routes.webhooks import router as webhooks_router
from app.routes.oauth import router as oauth_router
from app.core.config import settings
from app.core.database import init_db

# Locate agents directory relative to this file
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
AGENT_DIR = os.path.join(CURRENT_DIR, "agents")
app_args = {"agents_dir": AGENT_DIR, "web": True}

# Initialize database
init_db()

# Create FastAPI app with ADK integration
app: FastAPI = get_fast_api_app(**app_args)

app.title = settings.PROJECT_NAME
app.description = settings.PROJECT_DESCRIPTION
app.version = settings.VERSION

# Include routers
app.include_router(auth_router)
app.include_router(leads_router)
app.include_router(webhooks_router)
app.include_router(oauth_router)


@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "production-adk-agent"}


@app.get("/")
def root():
    return {
        "service": settings.PROJECT_NAME,
        "description": settings.PROJECT_DESCRIPTION,
        "docs": "/docs",
        "health": "/health",
    }


@app.on_event("startup")
async def pull_ollama_model():
    """
    Checks if the configured Gemma model exists in Ollama,
    and pulls it asynchronously in the background if it is missing.
    """
    import logging

    logger = logging.getLogger(__name__)

    async def check_and_pull():
        # Map internal Docker network service name or fallback to base
        ollama_base = os.getenv("OLLAMA_API_BASE", "http://gemma-backend:8080")
        model_name = os.getenv("GEMMA_MODEL_NAME", "gemma3:270m")

        # Add a short delay to allow Ollama server boot
        await asyncio.sleep(5)

        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                # Check current models
                list_response = await client.get(f"{ollama_base}/api/tags")
                if list_response.status_code == 200:
                    models = list_response.json().get("models", [])
                    if any(
                        m.get("name") == model_name or m.get("model") == model_name
                        for m in models
                    ):
                        logger.info(
                            f"Ollama model '{model_name}' is already available."
                        )
                        return

                logger.info(
                    f"Ollama model '{model_name}' not found. Pulling in background..."
                )
                pull_response = await client.post(
                    f"{ollama_base}/api/pull", json={"name": model_name}, timeout=600.0
                )
                if pull_response.status_code == 200:
                    logger.info(f"Successfully pulled Ollama model '{model_name}'.")
                else:
                    logger.error(f"Failed to pull Ollama model: {pull_response.text}")
        except Exception as e:
            logger.warning(
                f"Could not connect to Ollama to verify model '{model_name}': {e}"
            )

    asyncio.create_task(check_and_pull())
