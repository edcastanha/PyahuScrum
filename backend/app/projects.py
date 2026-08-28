from . import messaging
from .firestore_client import get_client
from .status import ProjectStatus


def create_project(idea: str) -> dict:
    doc_ref = get_client().collection("projects").document()
    doc_ref.set(
        {
            "raw_idea": idea,
            "status": ProjectStatus.TRIAGEM_INICIAL.value,
        }
    )

    messaging.publish_to_pipeline({"project_id": doc_ref.id})

    return {"id": doc_ref.id, "status": ProjectStatus.TRIAGEM_INICIAL.value}
