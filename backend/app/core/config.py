import os
from pathlib import Path
from dotenv import load_dotenv

# Base directory of the adk-agent package
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Load environment variables from .env
dotenv_path = BASE_DIR / ".env"
load_dotenv(dotenv_path=dotenv_path)

class Settings:
    PROJECT_NAME: str = "Production ADK Agent - Lab 3"
    PROJECT_DESCRIPTION: str = "Gemma agent with GPU-accelerated backend"
    VERSION: str = "1.0.0"
    
    GOOGLE_CLOUD_PROJECT: str = os.getenv("GOOGLE_CLOUD_PROJECT", "local-dev")
    GOOGLE_CLOUD_LOCATION: str = os.getenv("GOOGLE_CLOUD_LOCATION", "local")
    GEMMA_MODEL_NAME: str = os.getenv("GEMMA_MODEL_NAME", "gemma3:270m")
    OLLAMA_API_BASE: str = os.getenv("OLLAMA_API_BASE", "localhost:10010")
    PORT: int = int(os.getenv("PORT", "8080"))

settings = Settings()
