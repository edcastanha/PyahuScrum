"""Cliente Firestore — Projeto pyahu-scrum (real).

Autenticação (por prioridade, padrão do SDK google-cloud):
  1. GOOGLE_APPLICATION_CREDENTIALS=/app/pyahu-scrum-sa.json  (service account)
  2. ADC — Application Default Credentials (gcloud auth / Cloud Run / GCE)

Para desenvolvimento local com emulador:
  export FIRESTORE_EMULATOR_HOST=localhost:8080
  (o SDK detecta automaticamente e aponta pro emulador)
"""
import os

from google.cloud import firestore

_PROJECT_ID = os.environ.get("GOOGLE_CLOUD_PROJECT", "pyahu-scrum")

# Aponta para service account se o arquivo existir e a var não estiver setada
_SA_PATH = "/app/pyahu-scrum-sa.json"
if os.path.exists(_SA_PATH) and not os.environ.get("GOOGLE_APPLICATION_CREDENTIALS"):
    os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = _SA_PATH

_client: firestore.Client | None = None


def get_client() -> firestore.Client:
    global _client
    if _client is None:
        _client = firestore.Client(project=_PROJECT_ID)
    return _client


def check_connection() -> bool:
    try:
        list(get_client().collections())
        return True
    except Exception:
        return False
