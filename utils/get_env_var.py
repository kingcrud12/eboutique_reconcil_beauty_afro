import os
from pathlib import Path
from dotenv import load_dotenv

PROJECT_ROOT = Path(__file__).resolve().parents[1]
ENV_PATH = PROJECT_ROOT / ".env"

# Charger le fichier .env seulement s'il existe (pas nécessaire en CI)
# override=False pour ne pas écraser les variables d'environnement système
if ENV_PATH.exists():
    load_dotenv(ENV_PATH, override=False)
else:
    # En CI, charger depuis la racine si le fichier n'existe pas
    load_dotenv(override=False)

def get_env_var(name: str, required=True):
    value = os.getenv(name)
    if required and not value:
        raise ValueError(f"⚠️ La variable d'environnement {name} doit être définie (dans .env ou comme variable d'environnement système)")
    return value
