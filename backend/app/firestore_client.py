import os

from google.cloud import firestore

_PROJECT_ID = os.environ.get("GOOGLE_CLOUD_PROJECT", "pyahu-scrum-local")


def get_client() -> firestore.Client:
    """Aponta pro emulador quando FIRESTORE_EMULATOR_HOST está setado (padrão do SDK)."""
    return firestore.Client(project=_PROJECT_ID)


def check_connection() -> bool:
    try:
        client = get_client()
        list(client.collections())
    except Exception:
        return False
    return True
