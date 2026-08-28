import os

import pika
from pika.adapters.blocking_connection import BlockingChannel

RABBITMQ_URL = os.environ.get("RABBITMQ_URL", "amqp://guest:guest@rabbitmq:5672/")

EXCHANGE_NAME = "pyahu.direct"
QUEUE_NAME = "pyahu.pipeline"
ROUTING_KEY = "pipeline"

DLX_NAME = "pyahu.dlx"
DLQ_NAME = "pyahu.pipeline.dlq"
DLQ_ROUTING_KEY = "pipeline.dead"


def get_connection() -> pika.BlockingConnection:
    return pika.BlockingConnection(pika.URLParameters(RABBITMQ_URL))


def declare_topology(channel: BlockingChannel) -> None:
    """Declara a fila principal e o dead-letter-exchange. Idempotente."""
    channel.exchange_declare(exchange=DLX_NAME, exchange_type="direct", durable=True)
    channel.queue_declare(queue=DLQ_NAME, durable=True)
    channel.queue_bind(queue=DLQ_NAME, exchange=DLX_NAME, routing_key=DLQ_ROUTING_KEY)

    channel.exchange_declare(exchange=EXCHANGE_NAME, exchange_type="direct", durable=True)
    channel.queue_declare(
        queue=QUEUE_NAME,
        durable=True,
        arguments={
            "x-dead-letter-exchange": DLX_NAME,
            "x-dead-letter-routing-key": DLQ_ROUTING_KEY,
        },
    )
    channel.queue_bind(queue=QUEUE_NAME, exchange=EXCHANGE_NAME, routing_key=ROUTING_KEY)


def check_connection() -> bool:
    try:
        connection = get_connection()
    except Exception:
        return False
    connection.close()
    return True
