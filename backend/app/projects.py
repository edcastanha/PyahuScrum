from .firestore_client import get_client
from .status import ProjectStatus


def create_project(idea: str) -> dict:
    """Cria o documento do projeto no Firestore com status TRIAGEM_INICIAL.

    Não publica mais na fila RabbitMQ — o fluxo de elicitação (E3-T11) é
    disparado diretamente pelo endpoint POST /projects via ElicitacaoService.
    A fila RabbitMQ continua em uso para o processamento legado (Fatia 1/2)
    e para o consumer de reprocessamento de DLQ.
    """
    doc_ref = get_client().collection("projects").document()
    doc_ref.set(
        {
            "raw_idea": idea,
            "status": ProjectStatus.TRIAGEM_INICIAL.value,
        }
    )
    return {"id": doc_ref.id, "status": ProjectStatus.TRIAGEM_INICIAL.value}
