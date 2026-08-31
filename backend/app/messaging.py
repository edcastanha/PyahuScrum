"""Roteador de mensageria — seleciona o backend via MESSAGING_BACKEND.

  MESSAGING_BACKEND=rabbitmq  (padrão) → RabbitMQ/pika  — homologação
  MESSAGING_BACKEND=pubsub             → Cloud Pub/Sub   — produção GCP

Ambos os backends expõem a mesma interface pública:
  publish_to_pipeline(body: dict) -> None
  publish_to_elicitacao(body: dict) -> None
  check_connection() -> bool
  QUEUE_PIPELINE, QUEUE_ELICITACAO   (nomes das filas/subscriptions)

O consumer.py usa apenas esta interface — não importa o backend diretamente.
"""
import os

_BACKEND = os.environ.get("MESSAGING_BACKEND", "rabbitmq").lower()

if _BACKEND == "pubsub":
    from .messaging_pubsub import (  # noqa: F401
        publish_to_pipeline,
        publish_to_elicitacao,
        check_connection,
        QUEUE_PIPELINE,
        QUEUE_ELICITACAO,
        start_consuming as _pubsub_start_consuming,
    )
    _backend_name = "pubsub"
else:
    from .messaging_rabbitmq import (  # noqa: F401
        publish_to_pipeline,
        publish_to_elicitacao,
        check_connection,
        QUEUE_PIPELINE,
        QUEUE_ELICITACAO,
        get_connection,
        declare_topology,
    )
    _backend_name = "rabbitmq"


def get_backend() -> str:
    return _backend_name
