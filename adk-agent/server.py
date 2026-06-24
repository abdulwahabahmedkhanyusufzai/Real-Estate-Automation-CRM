# Copyright 2026 Google LLC
import os
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from google.adk.cli.fast_api import get_fast_api_app
from agents import extract_omnichannel_lead

# Load environment variables
load_dotenv()

AGENT_DIR = os.path.dirname(os.path.abspath(__file__))
app_args = {"agents_dir": AGENT_DIR, "web": True}

# Create FastAPI app with ADK integration
app: FastAPI = get_fast_api_app(**app_args)

# Update app metadata
app.title = "Production ADK Agent - Lab 3"
app.description = "Gemma agent with GPU-accelerated backend"
app.version = "1.0.0"

class LeadPayload(BaseModel):
    lead_id: int
    message: str
    source: str  # 'WhatsApp', 'Property Finder / Bayut', 'Email Inbox', 'Website / Dribbble Form'

@app.post("/api/v1/qualify-lead")
async def qualify_lead(payload: LeadPayload):
    try:
        # Pass both the message and the source to the specialized extraction engine
        extracted_data = extract_omnichannel_lead(payload.message, payload.source)
        
        # (Rest of your PyTorch scoring and Supabase update logic runs here)
        return {"status": "success", "data": extracted_data}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "production-adk-agent"}

@app.get("/")
def root():
    return {
        "service": "Production ADK Agent - Lab 3",
        "description": "GPU-accelerated Gemma agent",
        "docs": "/docs",
        "health": "/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080, log_level="info")

