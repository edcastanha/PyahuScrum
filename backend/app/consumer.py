"""Consumer do Agent Orchestrator — duas filas (ADR-004 + ADR-005).

pyahu.pipeline   → handle_nova_elicitacao: inicia Rodada 1 via ElicitacaoService
pyahu.elicitacao → handle_resposta: processa respostas de rodadas via ElicitacaoService

Ambos verificam se o projeto ainda existe antes de processar (guard de delete).
"""
import json
import logging

from . import firestore_client, messaging
from .elicitacao import ElicitacaoService, Resposta
from .status import FailureReason, ProjectStatus

logger = logging.getLogger(__name__)

MAX_ATTEMPTS = 3


# ── Guard de existência ────────────────────────────────────────────────────────


def _project_exists(project_id: str) -> bool:
    """Verifica se o documento do projeto ainda existe no Firestore."""
    doc = firestore_client.get_client().collection("projects").document(project_id).get()
    return doc.exists


# ── Classificação de falha ─────────────────────────────────────────────────────


def _classify(exc: Exception) -> FailureReason:
    from . import ai_client
    if isinstance(exc, ai_client.QuotaExceededError):
        return FailureReason.QUOTA_EXCEDIDA
    if isinstance(exc, ai_client.InvalidResponseError):
        return FailureReason.RESPOSTA_INVALIDA
    return FailureReason.ERRO_TRANSITORIO


def _record_failure(project_id: str, status: ProjectStatus, reason: FailureReason, attempt: int) -> None:
    firestore_client.get_client().collection("projects").document(project_id).update(
        {"status": status.value, "failure_reason": reason.value, "attempts": attempt}
    )


# ── Handler: nova criação ─────────────────────────────────────────────────────


def handle_nova_elicitacao(project_id: str, idea: str, ai_client=None) -> bool:
    """Inicia a Rodada 1 de elicitação para um projeto recém-criado.

    Retorna True se deve dar ack, False se deve dar nack (→ DLQ).
    """
    if not _project_exists(project_id):
        logger.info("Projeto %s não existe mais — mensagem descartada (delete).", project_id)
        return True  # ack — mensagem pode ser descartada

    service = ElicitacaoService(ai_client=ai_client)
    for attempt in range(1, MAX_ATTEMPTS + 1):
        try:
            service.iniciar_elicitacao(project_id=project_id, idea=idea)
            return True
        except Exception as exc:
            reason = _classify(exc)
            exhausted = reason == FailureReason.QUOTA_EXCEDIDA or attempt >= MAX_ATTEMPTS
            logger.warning(
                "handle_nova_elicitacao: tentativa %d/%d falhou (%s): %s",
                attempt, MAX_ATTEMPTS, reason.value, exc,
            )
            if exhausted:
                _record_failure(project_id, ProjectStatus.FALHA_PROCESSAMENTO, reason, attempt)
                return False  # nack → DLQ
    return False


# ── Handler: respostas de rodadas ──────────────────────────────────────────────


def handle_resposta(
    project_id: str,
    numero_rodada: int,
    respostas: list[dict],
    forcar_geracao: bool = False,
    ai_client=None,
) -> bool:
    """Processa as respostas de uma Rodada de Elicitação.

    Retorna True se deve dar ack, False se deve dar nack (→ DLQ).
    """
    if not _project_exists(project_id):
        logger.info("Projeto %s não existe mais — mensagem de resposta descartada.", project_id)
        return True

    respostas_obj = [
        Resposta(pergunta_id=r["pergunta_id"], opcao=r.get("opcao"), texto=r.get("texto"))
        for r in respostas
    ]

    service = ElicitacaoService(ai_client=ai_client)
    for attempt in range(1, MAX_ATTEMPTS + 1):
        try:
            service.processar_respostas(
                project_id=project_id,
                numero_rodada=numero_rodada,
                respostas_novas=respostas_obj,
                forcar_geracao=forcar_geracao,
            )
            return True
        except ValueError as exc:
            # Projeto inválido / não encontrado — ack e descarta
            logger.warning("handle_resposta: projeto inválido (%s) — descartando.", exc)
            return True
        except Exception as exc:
            reason = _classify(exc)
            exhausted = reason == FailureReason.QUOTA_EXCEDIDA or attempt >= MAX_ATTEMPTS
            logger.warning(
                "handle_resposta: tentativa %d/%d falhou (%s): %s",
                attempt, MAX_ATTEMPTS, reason.value, exc,
            )
            if exhausted:
                _record_failure(project_id, ProjectStatus.FALHA_PROCESSAMENTO, reason, attempt)
                return False
    return False


# ── Loop de consumo ────────────────────────────────────────────────────────────


def _make_callback(queue_name: str):
    """Cria callback para a fila especificada."""
    def callback(ch, method, _properties, body):
        try:
            message = json.loads(body)
        except json.JSONDecodeError:
            logger.error("[%s] Mensagem inválida (não é JSON): %r", queue_name, body[:100])
            ch.basic_ack(delivery_tag=method.delivery_tag)
            return

        project_id = message.get("project_id", "")

        if queue_name == messaging.QUEUE_PIPELINE:
            idea = message.get("idea", "")
            ok = handle_nova_elicitacao(project_id=project_id, idea=idea)
        elif queue_name == messaging.QUEUE_ELICITACAO:
            ok = handle_resposta(
                project_id=project_id,
                numero_rodada=message.get("rodada", 1),
                respostas=message.get("respostas", []),
                forcar_geracao=message.get("forcar_geracao", False),
            )
        else:
            logger.error("Fila desconhecida: %s", queue_name)
            ok = True  # ack e ignora

        if ok:
            ch.basic_ack(delivery_tag=method.delivery_tag)
        else:
            ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)

    return callback


def start_consuming() -> None:
    """Inicia o consumo das duas filas em threads separadas via basic_consume."""
    import threading

    def _consume(queue_name: str) -> None:
        while True:
            try:
                connection = messaging.get_connection()
                channel = connection.channel()
                channel.basic_qos(prefetch_count=1)
                channel.basic_consume(
                    queue=queue_name,
                    on_message_callback=_make_callback(queue_name),
                )
                logger.info("Consumer iniciado: fila '%s'", queue_name)
                channel.start_consuming()
            except Exception as exc:
                logger.error("Consumer [%s] caiu: %s — reconectando...", queue_name, exc)
                import time
                time.sleep(5)

    for q in (messaging.QUEUE_PIPELINE, messaging.QUEUE_ELICITACAO):
        threading.Thread(target=_consume, args=(q,), daemon=True).start()
