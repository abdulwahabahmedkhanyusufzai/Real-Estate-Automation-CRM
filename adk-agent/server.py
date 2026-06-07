# TODO: Complete this file
import os
from dotenv import load_dotenv
from fastapi import FastAPI, Request
from google.adk.cli.fast_api import get_fast_api_app
from typing import Dict

# Load environment variables
load_dotenv()

AGENT_DIR = os.path.dirname(os.path.abspath(__file__))
app_args = {"agents_dir": AGENT_DIR, "web": True}

# Create FastAPI app with ADK integration
app: FastAPI = get_fast_api_app(**app_args)

# In-memory database to store response callbacks from n8n
n8n_responses: Dict[str, str] = {}

# Update app metadata
app.title = "Production ADK Agent - Lab 3"
app.description = "Gemma agent with GPU-accelerated backend"
app.version = "1.0.0"

@app.post("/response-n8n")
async def receive_n8n_response(request: Request):
    try:
        data = await request.json()
    except Exception:
        return {"status": "error", "message": "Invalid JSON"}
    
    user_email = data.get("user_email")
    if not user_email:
        return {"status": "error", "message": "Missing user_email"}
        
    response_text = data.get("response") or data.get("output") or data.get("message") or data.get("text")
    if not response_text:
        return {"status": "error", "message": "No response content found in webhook body"}
        
    n8n_responses[user_email] = response_text
    return {"status": "success", "message": f"Stored response for {user_email}"}

@app.get("/response-n8n")
def get_n8n_response(user_email: str):
    if user_email in n8n_responses:
        # Retrieve and clear from queue
        response_text = n8n_responses.pop(user_email)
        return {"status": "success", "response": response_text}
    return {"status": "pending"}

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
