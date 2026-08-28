import logging
import os
import time

from google.cloud.firestore_v1.base_query import FieldFilter

from . import firestore_client, messaging
from .status import FailureReason, ProjectStatus

logger = logging.getLogger(__name__)

DEFAULT_INTERVAL_SECONDS = 300

RECOVERABLE_REASONS = [FailureReason.ERRO_TRANSITORIO.value, FailureReason.RESPOSTA_INVALIDA.value]


def sweep_dlq() -> int:
    """Reenfileira pedidos em FALHA_DLQ com motivo recuperável (nunca
    QUOTA_EXCEDIDA -- essa exige intervenção humana, ver CONTEXT.md).
    Retorna quantos pedidos foram reenfileirados."""
    collection = firestore_client.get_client().collection("projects")
    query = collection.where(
        filter=FieldFilter("status", "==", ProjectStatus.FALHA_DLQ.value)
    ).where(filter=FieldFilter("failure_reason", "in", RECOVERABLE_REASONS))

    requeued = 0
    for doc in query.stream():
        try:
            # Publica primeiro: se falhar, o doc continua em FALHA_DLQ e volta
            # a ser candidato no próximo sweep. Se a ordem fosse invertida, uma
            # falha na publicação depois do update deixaria o doc preso --
            # fora do filtro de FALHA_DLQ, mas nunca de fato enfileirado.
            messaging.publish_to_pipeline({"project_id": doc.id})
            doc.reference.update({"status": ProjectStatus.TRIAGEM_INICIAL.value, "attempts": 0})
        except Exception:
            logger.exception("Falha ao reenfileirar o projeto %s, tentando de novo no próximo sweep", doc.id)
            continue
        requeued += 1

    if requeued:
        logger.info("DLQ sweep: %s pedido(s) reenfileirado(s)", requeued)
    return requeued


def start_sweeping(interval_seconds: int | None = None) -> None:
    """Loop de fundo: varre a DLQ periodicamente. Roda numa thread daemon
    separada (ver main.py), só no ambiente real (mesmo controle de
    START_CONSUMER usado pelo consumidor)."""
    interval = interval_seconds or int(
        os.environ.get("DLQ_SWEEP_INTERVAL_SECONDS", DEFAULT_INTERVAL_SECONDS)
    )
    while True:
        try:
            sweep_dlq()
        except Exception:
            logger.exception("Falha ao varrer a DLQ")
        time.sleep(interval)
