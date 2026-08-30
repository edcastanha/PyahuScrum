"""Topologia de filas RabbitMQ do Pyahu Scrum.

Duas filas independentes com DLX compartilhado:

  pyahu.pipeline   ← nova criação de projeto (tipo: nova_elicitacao)
  pyahu.elicitacao ← respostas de rodadas (tipo: resposta)

Ambas usam dead-letter routing para pyahu.dlx → pyahu.pipeline.dlq.
"""
import json
import os

import pika
from pika.adapters.blocking_connection import BlockingChannel

RABBITMQ_URL = os.environ.get("RABBITMQ_URL", "amqp://guest:guest@rabbitmq:5672/")

# ── Exchange e DLX ─────────────────────────────────────────────────────────────
EXCHANGE_NAME = "pyahu.direct"
DLX_NAME = "pyahu.dlx"
DLQ_NAME = "pyahu.pipeline.dlq"
DLQ_ROUTING_KEY = "pipeline.dead"

# ── Fila 1: nova criação ───────────────────────────────────────────────────────
QUEUE_PIPELINE = "pyahu.pipeline"
ROUTING_PIPELINE = "pipeline"

# ── Fila 2: respostas de elicitação ────────────────────────────────────────────
QUEUE_ELICITACAO = "pyahu.elicitacao"
ROUTING_ELICITACAO = "elicitacao"


def get_connection() -> pika.BlockingConnection:
    return pika.BlockingConnection(pika.URLParameters(RABBITMQ_URL))


def declare_topology(channel: BlockingChannel) -> None:
    """Declara exchange, DLX e as duas filas. Idempotente."""
    # DLX + DLQ
    channel.exchange_declare(exchange=DLX_NAME, exchange_type="direct", durable=True)
    channel.queue_declare(queue=DLQ_NAME, durable=True)
    channel.queue_bind(queue=DLQ_NAME, exchange=DLX_NAME, routing_key=DLQ_ROUTING_KEY)

    # Exchange principal
    channel.exchange_declare(exchange=EXCHANGE_NAME, exchange_type="direct", durable=True)

    _dlx_args = {
        "x-dead-letter-exchange": DLX_NAME,
        "x-dead-letter-routing-key": DLQ_ROUTING_KEY,
    }

    # Fila 1: nova criação
    channel.queue_declare(queue=QUEUE_PIPELINE, durable=True, arguments=_dlx_args)
    channel.queue_bind(queue=QUEUE_PIPELINE, exchange=EXCHANGE_NAME, routing_key=ROUTING_PIPELINE)

    # Fila 2: respostas de elicitação
    channel.queue_declare(queue=QUEUE_ELICITACAO, durable=True, arguments=_dlx_args)
    channel.queue_bind(queue=QUEUE_ELICITACAO, exchange=EXCHANGE_NAME, routing_key=ROUTING_ELICITACAO)


def publish_to_pipeline(body: dict) -> None:
    """Publica na fila de nova criação de projeto."""
    _publish(routing_key=ROUTING_PIPELINE, body=body)


def publish_to_elicitacao(body: dict) -> None:
    """Publica na fila de respostas de elicitação."""
    _publish(routing_key=ROUTING_ELICITACAO, body=body)


def _publish(routing_key: str, body: dict) -> None:
    connection = get_connection()
    try:
        channel = connection.channel()
        channel.basic_publish(
            exchange=EXCHANGE_NAME,
            routing_key=routing_key,
            body=json.dumps(body),
            properties=pika.BasicProperties(delivery_mode=2, content_type="application/json"),
        )
    finally:
        connection.close()


def check_connection() -> bool:
    try:
        connection = get_connection()
        connection.close()
        return True
    except Exception:
        return False
