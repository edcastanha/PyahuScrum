import json
import logging

from . import ai_client, firestore_client, messaging
from .status import ProjectStatus

logger = logging.getLogger(__name__)


def process_message(project_id: str, client: ai_client.VertexAIClient | None = None) -> None:
    client = client or ai_client.get_client()
    doc_ref = firestore_client.get_client().collection("projects").document(project_id)

    idea = doc_ref.get().to_dict()["raw_idea"]
    doc_ref.update({"status": ProjectStatus.TRIAGEM_EM_ANDAMENTO.value})

    try:
        doc_ref.update({"status": ProjectStatus.GERANDO_ADR.value})
        artifacts = client.generate_artifacts(idea)
    except Exception:
        logger.exception("Falha ao processar o projeto %s", project_id)
        doc_ref.update({"status": ProjectStatus.FALHA_PROCESSAMENTO.value})
        return

    doc_ref.update(
        {
            "status": ProjectStatus.CONCLUIDO.value,
            "readme": artifacts.readme,
            "adrs": artifacts.adrs,
            "tickets": artifacts.tickets,
        }
    )


def start_consuming() -> None:
    """Loop bloqueante: consome a fila principal e processa cada mensagem.
    Roda numa thread separada (ver main.py); nunca move a mensagem pra DLQ em
    caso de falha de processamento -- so a ack normalmente, registrando
    FALHA_PROCESSAMENTO no documento."""
    connection = messaging.get_connection()
    channel = connection.channel()
    channel.basic_qos(prefetch_count=1)

    def _on_message(ch, method, _properties, body):
        try:
            payload = json.loads(body)
            process_message(payload["project_id"])
        except Exception:
            logger.exception("Mensagem descartada: payload malformado ou falha inesperada")
        finally:
            ch.basic_ack(delivery_tag=method.delivery_tag)

    channel.basic_consume(queue=messaging.QUEUE_NAME, on_message_callback=_on_message)
    channel.start_consuming()
