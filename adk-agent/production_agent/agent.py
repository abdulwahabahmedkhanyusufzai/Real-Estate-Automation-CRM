# Copyright 2026 Google LLC
import os
from pathlib import Path

from dotenv import load_dotenv
from google.adk.agents import Agent
from google.adk.models.lite_llm import LiteLlm
import google.auth

# Load environment variables
root_dir = Path(__file__).parent.parent
dotenv_path = root_dir / ".env"
load_dotenv(dotenv_path=dotenv_path)

# Configure Google Cloud
try:
    _, project_id = google.auth.default()
    os.environ.setdefault("GOOGLE_CLOUD_PROJECT", project_id)
except Exception:
    pass

os.environ.setdefault("GOOGLE_CLOUD_LOCATION", "europe-west4")

# Configure model connection
gemma_model_name = os.getenv("GEMMA_MODEL_NAME", "gemma3:270m")
api_base = os.getenv("OLLAMA_API_BASE", "localhost:10010")  # Location of Ollama server

# Production Gemma Agent - GPU-accelerated conversational assistant
production_agent = Agent(
    model=LiteLlm(model=f"ollama_chat/{gemma_model_name}", api_base=api_base),
    name="production_agent",
    description="A production-ready conversational assistant powered by GPU-accelerated Gemma.",
    instruction="""You are a helpful, capable, and honest AI assistant powered by Google's Gemma model.
   Your goal is to provide accurate, clear, and objective answers to the user's queries across a wide range of topics, including coding, writing, analysis, and general knowledge.

   Guidelines:
   - Be direct and concise unless the user asks for a detailed explanation.
   - If you do not know the answer or lack access to real-time information, state so clearly without making up facts.
   - Format technical explanations or code clearly using standard markdown.
   - Maintain a neutral, professional, and helpful tone.""",
    tools=[],  # Gemma focuses on conversational capabilities
)
# Set as root agent
root_agent = production_agent
