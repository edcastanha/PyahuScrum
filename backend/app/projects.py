"""Operações CRUD de projetos no Firestore."""
import logging

from .firestore_client import get_client
from .status import ProjectStatus

logger = logging.getLogger(__name__)


def create_project(idea: str) -> dict:
    """Cria o documento do projeto com status TRIAGEM_INICIAL.

    Não chama o Gemini — apenas persiste e retorna o ID.
    O chamador é responsável por publicar na fila (fluxo assíncrono).
    """
    doc_ref = get_client().collection("projects").document()
    doc_ref.set({"raw_idea": idea, "status": ProjectStatus.TRIAGEM_INICIAL.value})
    return {"id": doc_ref.id, "status": ProjectStatus.TRIAGEM_INICIAL.value}


def delete_project(project_id: str) -> bool:
    """Remove o projeto e todos os dados associados (delete cascade).

    Remove:
    - Subcoleção 'elicitacao' (rodadas e respostas)
    - Documento principal 'projects/{id}'

    O consumer verifica _project_exists() antes de processar qualquer mensagem
    pendente na fila — mensagens órfãs são descartadas com ack.

    Retorna True se o projeto existia, False se já havia sido removido.
    """
    db = get_client()
    doc_ref = db.collection("projects").document(project_id)

    if not doc_ref.get().exists:
        logger.warning("delete_project: projeto %s não encontrado.", project_id)
        return False

    # 1. Apagar subcoleção elicitacao (Firestore não faz cascade automaticamente)
    _delete_subcollection(db, f"projects/{project_id}/elicitacao")

    # 2. Apagar o documento principal
    doc_ref.delete()
    logger.info("Projeto %s removido com cascade.", project_id)
    return True


def _delete_subcollection(db, collection_path: str, batch_size: int = 50) -> None:
    """Remove todos os documentos de uma subcoleção em lotes."""
    col_ref = db.collection(collection_path)
    while True:
        docs = list(col_ref.limit(batch_size).stream())
        if not docs:
            break
        batch = db.batch()
        for doc in docs:
            batch.delete(doc.reference)
        batch.commit()
