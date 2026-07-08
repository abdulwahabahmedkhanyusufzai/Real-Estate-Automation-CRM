import os
from fastapi import FastAPI
from google.adk.cli.fast_api import get_fast_api_app
from app.routes.auth import router as auth_router
from app.routes.leads import router as leads_router
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
