import os
from pathlib import Path
from dotenv import load_dotenv

PROJECT_ROOT = Path(__file__).resolve().parents[1]
ENV_PATH = PROJECT_ROOT / ".env"
load_dotenv(ENV_PATH)

def get_env_var(name: str, required=True):
    value = os.getenv(name)
    if required and not value:
        raise ValueError(f"⚠️ La variable d'environnement {name} doit être définie dans .env")
    return value
