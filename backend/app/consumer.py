import json
import logging

from . import ai_client, firestore_client, messaging
from .status import FailureReason, ProjectStatus

logger = logging.getLogger(__name__)

MAX_ATTEMPTS = 3


def _classify(exc: Exception) -> FailureReason:
    if isinstance(exc, ai_client.QuotaExceededError):
        return FailureReason.QUOTA_EXCEDIDA
    if isinstance(exc, ai_client.InvalidResponseError):
        return FailureReason.RESPOSTA_INVALIDA
    return FailureReason.ERRO_TRANSITORIO


def _record_failure(doc_ref, status: ProjectStatus, reason: FailureReason, attempt: int) -> None:
    doc_ref.update({"status": status.value, "failure_reason": reason.value, "attempts": attempt})


def process_message(project_id: str, client: ai_client.VertexAIClient | None = None) -> bool:
    """Processa um pedido, com retry e classificação de falha.

    Retorna True se a mensagem deve ser confirmada (ack) normalmente, False
    se deve ser rejeitada sem requeue (nack -> roteada pra DLQ pelo
    dead-letter-exchange já declarado em messaging.py)."""
    client = client or ai_client.get_client()
    doc_ref = firestore_client.get_client().collection("projects").document(project_id)

    idea = doc_ref.get().to_dict()["raw_idea"]
    doc_ref.update({"status": ProjectStatus.TRIAGEM_EM_ANDAMENTO.value})

    attempt = 0
    while True:
        attempt += 1
        try:
            doc_ref.update({"status": ProjectStatus.GERANDO_ADR.value, "attempts": attempt})
            artifacts = client.generate_artifacts(idea)
        except (ai_client.QuotaExceededError, ai_client.TransientServiceError, ai_client.InvalidResponseError) as exc:
            reason = _classify(exc)
            # Quota excedida nunca vale retry -- insistir so desperdica chamada.
            exhausted = reason == FailureReason.QUOTA_EXCEDIDA or attempt >= MAX_ATTEMPTS
            if exhausted:
                logger.exception("Falha definitiva (%s) para o projeto %s", reason.value, project_id)
                _record_failure(doc_ref, ProjectStatus.FALHA_DLQ, reason, attempt)
                return False
            logger.warning("Tentativa %s falhou para o projeto %s: %s", attempt, project_id, exc)
            _record_failure(doc_ref, ProjectStatus.FALHA_PROCESSAMENTO, reason, attempt)
            continue
        else:
            break

    doc_ref.update(
        {
            "status": ProjectStatus.CONCLUIDO.value,
            "readme": artifacts.readme,
            "adrs": artifacts.adrs,
            "tickets": artifacts.tickets,
        }
    )
    return True


def start_consuming() -> None:
    """Loop bloqueante: consome a fila principal e processa cada mensagem.
    Roda numa thread separada (ver main.py). Confirma (ack) em sucesso ou
    falha ainda dentro do limite de retentativas; rejeita sem requeue (nack)
    quando process_message decide que a falha é definitiva, roteando de
    verdade pra DLQ via o dead-letter-exchange já declarado."""
    connection = messaging.get_connection()
    channel = connection.channel()
    channel.basic_qos(prefetch_count=1)

    def _on_message(ch, method, _properties, body):
        try:
            payload = json.loads(body)
            should_ack = process_message(payload["project_id"])
        except Exception:
            logger.exception("Mensagem descartada (payload malformado ou falha inesperada), roteando pra DLQ")
            should_ack = False

        if should_ack:
            ch.basic_ack(delivery_tag=method.delivery_tag)
        else:
            ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)

    channel.basic_consume(queue=messaging.QUEUE_NAME, on_message_callback=_on_message)
    channel.start_consuming()
