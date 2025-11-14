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
    # Essayer d'abord directement depuis os.getenv (pour les variables système)
    value = os.getenv(name)
    
    # Si pas trouvé et qu'on est en CI, essayer de recharger (au cas où)
    if not value and os.getenv("CI") == "true":
        # En CI, les variables devraient être directement disponibles
        value = os.environ.get(name)
    
    if required and not value:
        # Message d'erreur plus détaillé pour le debug
        is_ci = os.getenv("CI") == "true"
        env_source = "secrets GitHub" if is_ci else "fichier .env"
        raise ValueError(
            f"⚠️ La variable d'environnement {name} doit être définie ({env_source}).\n"
            f"Vérifiez que le secret {name} est configuré dans GitHub Settings → Secrets and variables → Actions."
        )
    return value
