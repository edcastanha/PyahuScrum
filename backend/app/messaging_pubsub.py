"""Mensageria via Google Cloud Pub/Sub (backend de produção — ADR-007).

Ativado via MESSAGING_BACKEND=pubsub.
Usa a Service Account já montada em GOOGLE_APPLICATION_CREDENTIALS.
"""
import json
import logging
import os

from google.cloud import pubsub_v1

logger = logging.getLogger(__name__)

PROJECT_ID = os.environ.get("GOOGLE_CLOUD_PROJECT", "pyahu-scrum")

TOPIC_PIPELINE   = f"projects/{PROJECT_ID}/topics/pyahu-pipeline"
TOPIC_ELICITACAO = f"projects/{PROJECT_ID}/topics/pyahu-elicitacao"
SUB_PIPELINE     = f"projects/{PROJECT_ID}/subscriptions/pyahu-pipeline-sub"
SUB_ELICITACAO   = f"projects/{PROJECT_ID}/subscriptions/pyahu-elicitacao-sub"

# Nomes expostos para o consumer (equivalente às constantes do RabbitMQ)
QUEUE_PIPELINE   = "pyahu-pipeline-sub"
QUEUE_ELICITACAO = "pyahu-elicitacao-sub"


def publish_to_pipeline(body: dict) -> None:
    """Publica na fila de nova criação de projeto."""
    _publish(TOPIC_PIPELINE, body)


def publish_to_elicitacao(body: dict) -> None:
    """Publica na fila de respostas de elicitação."""
    _publish(TOPIC_ELICITACAO, body)


def _publish(topic_path: str, body: dict) -> None:
    publisher = pubsub_v1.PublisherClient()
    data = json.dumps(body).encode("utf-8")
    future = publisher.publish(topic_path, data)
    future.result()  # bloqueia até confirmação do GCP
    logger.debug("Publicado em %s", topic_path)


def check_connection() -> bool:
    try:
        publisher = pubsub_v1.PublisherClient()
        publisher.get_topic(topic=TOPIC_PIPELINE)
        return True
    except Exception as exc:
        logger.warning("Pub/Sub check_connection falhou: %s", exc)
        return False


def start_consuming(handlers: dict) -> None:
    """Pull loop para as duas subscriptions em threads separadas.

    handlers: {
        "pipeline":   fn(project_id, idea) -> bool,
        "elicitacao": fn(project_id, message_dict) -> bool,
    }
    """
    import threading

    def _pull_loop(subscription_path: str, handler_key: str) -> None:
        subscriber = pubsub_v1.SubscriberClient()
        logger.info("Pub/Sub consumer iniciado: %s", subscription_path)
        while True:
            try:
                response = subscriber.pull(
                    subscription=subscription_path,
                    max_messages=1,
                    timeout=10,
                )
                for received in response.received_messages:
                    try:
                        body = json.loads(received.message.data)
                        ok = handlers[handler_key](body)
                        if ok:
                            subscriber.acknowledge(
                                subscription=subscription_path,
                                ack_ids=[received.ack_id],
                            )
                        # nack implícito: não acknowledge → Pub/Sub reentrega até DLQ
                    except Exception as exc:
                        logger.error("Erro ao processar mensagem [%s]: %s", handler_key, exc)
            except Exception as exc:
                # timeout ou erro de rede — continua o loop
                if "504" not in str(exc) and "timeout" not in str(exc).lower():
                    logger.warning("Pull loop [%s] erro: %s", handler_key, exc)

    threading.Thread(
        target=_pull_loop,
        args=(SUB_PIPELINE, "pipeline"),
        daemon=True,
    ).start()
    threading.Thread(
        target=_pull_loop,
        args=(SUB_ELICITACAO, "elicitacao"),
        daemon=True,
    ).start()
