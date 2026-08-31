# ADR-007: Plano de Migração RabbitMQ → Google Cloud Pub/Sub

**Data:** 01 de Setembro de 2026
**Status:** Aceito

## Contexto

A [ADR-005](./005-stack-local-mvp-3-dias.md) adotou RabbitMQ como broker de mensagens para o MVP, reconhecendo explicitamente que o código do consumer **não é portável 1:1** para Pub/Sub. Com o backend publicado e funcionando em homologação (Easypanel), a próxima barreira para produção no GCP é substituir o RabbitMQ — serviço gerenciado próprio, externo ao ecossistema Google — pelo **Cloud Pub/Sub**, que já consta como componente alvo na ADR-004 e elimina a necessidade de operar um broker AMQP em container.

## Decisão

Migrar a camada de mensageria do `backend/` de RabbitMQ/pika para Google Cloud Pub/Sub, mantendo **zero mudança** na lógica de negócio (`consumer.py`, `pipeline.py`, `elicitacao.py`). A migração é confinada a um único módulo (`messaging.py`) e a variáveis de ambiente/infra.

## Mapeamento de Conceitos

| RabbitMQ | Pub/Sub | Notas |
|---|---|---|
| Exchange `pyahu.direct` | — | Pub/Sub não usa exchange; routing é por topic |
| Fila `pyahu.pipeline` | Topic `pyahu-pipeline` + Subscription `pyahu-pipeline-sub` | |
| Fila `pyahu.elicitacao` | Topic `pyahu-elicitacao` + Subscription `pyahu-elicitacao-sub` | |
| Dead-letter-exchange → `pyahu.pipeline.dlq` | `dead_letter_topic: pyahu-dlq` nas subscriptions | Config declarativa no Pub/Sub |
| `basic_publish()` | `publisher.publish(topic_path, data)` | |
| `basic_consume()` loop bloqueante | Pull loop: `subscriber.pull()` + `acknowledge()` | Mantém modelo do consumer atual |
| `delivery_mode=2` (persistente) | padrão — Pub/Sub sempre persiste | |
| `check_connection()` ping AMQP | `publisher.get_topic()` ou `subscriber.get_subscription()` | |

## Plano de Implementação

### Pré-requisitos (infra GCP — uma vez)
```bash
# Topics
gcloud pubsub topics create pyahu-pipeline
gcloud pubsub topics create pyahu-elicitacao
gcloud pubsub topics create pyahu-dlq

# Subscriptions com dead-letter configurado
gcloud pubsub subscriptions create pyahu-pipeline-sub \
  --topic=pyahu-pipeline \
  --dead-letter-topic=pyahu-dlq \
  --max-delivery-attempts=5 \
  --ack-deadline=60

gcloud pubsub subscriptions create pyahu-elicitacao-sub \
  --topic=pyahu-elicitacao \
  --dead-letter-topic=pyahu-dlq \
  --max-delivery-attempts=5 \
  --ack-deadline=60

# IAM: Service Account precisa de ambos os roles
gcloud projects add-iam-policy-binding pyahu-scrum \
  --member="serviceAccount:<SA>@pyahu-scrum.iam.gserviceaccount.com" \
  --role="roles/pubsub.publisher"

gcloud projects add-iam-policy-binding pyahu-scrum \
  --member="serviceAccount:<SA>@pyahu-scrum.iam.gserviceaccount.com" \
  --role="roles/pubsub.subscriber"
```

### Mudanças de código

**`backend/requirements.txt`** — trocar `pika` por:
```
google-cloud-pubsub>=2.21,<3
```

**`backend/app/messaging.py`** — reescrever completamente:
```python
"""Mensageria via Google Cloud Pub/Sub."""
import json, os
from google.cloud import pubsub_v1

PROJECT_ID = os.environ.get("GOOGLE_CLOUD_PROJECT", "pyahu-scrum")

TOPIC_PIPELINE    = f"projects/{PROJECT_ID}/topics/pyahu-pipeline"
TOPIC_ELICITACAO  = f"projects/{PROJECT_ID}/topics/pyahu-elicitacao"
SUB_PIPELINE      = f"projects/{PROJECT_ID}/subscriptions/pyahu-pipeline-sub"
SUB_ELICITACAO    = f"projects/{PROJECT_ID}/subscriptions/pyahu-elicitacao-sub"

def publish_to_pipeline(body: dict) -> None:
    _publish(TOPIC_PIPELINE, body)

def publish_to_elicitacao(body: dict) -> None:
    _publish(TOPIC_ELICITACAO, body)

def _publish(topic_path: str, body: dict) -> None:
    publisher = pubsub_v1.PublisherClient()
    data = json.dumps(body).encode("utf-8")
    future = publisher.publish(topic_path, data)
    future.result()  # aguarda confirmação

def check_connection() -> bool:
    try:
        publisher = pubsub_v1.PublisherClient()
        publisher.get_topic(topic=TOPIC_PIPELINE)
        return True
    except Exception:
        return False
```

**`backend/app/consumer.py`** — trocar o loop `pika` por pull do Pub/Sub:
```python
# substituir basic_consume() por:
subscriber = pubsub_v1.SubscriberClient()

def _pull_loop(subscription_path: str, handler):
    while True:
        response = subscriber.pull(
            subscription=subscription_path, max_messages=1, timeout=10
        )
        for msg in response.received_messages:
            try:
                body = json.loads(msg.message.data)
                handler(body)
                subscriber.acknowledge(
                    subscription=subscription_path,
                    ack_ids=[msg.ack_id]
                )
            except Exception as e:
                logger.error("Erro ao processar mensagem: %s", e)
                # não faz ack → Pub/Sub reentrega até max_delivery_attempts → DLQ
```

**`infra/docker-compose.homolog.yml`** — remover serviço `rabbitmq`:
```yaml
# remover:
#   pyahuscrum-rabbitmq-homolog: ...
# remover depends_on rabbitmq da API
# remover variável RABBITMQ_URL
```

**Variáveis de ambiente** — remover `RABBITMQ_URL`, manter `GOOGLE_CLOUD_PROJECT`.
A autenticação usa a SA já montada via volume (`pyahu-scrum-sa.json`), sem mudança.

### Estratégia de rollout (feature flag)

Para virar a chave sem downtime:
```bash
# .env
MESSAGING_BACKEND=pubsub   # ou rabbitmq (default atual)
```

```python
# messaging.py
if os.environ.get("MESSAGING_BACKEND") == "pubsub":
    from .messaging_pubsub import publish_to_pipeline, publish_to_elicitacao, check_connection
else:
    from .messaging_rabbitmq import publish_to_pipeline, publish_to_elicitacao, check_connection
```

Permite testar Pub/Sub em homolog sem remover o RabbitMQ, e virar a chave em produção com um único `docker compose up -d`.

## Consequências

**Positivas**
- Elimina o container `rabbitmq` — menos um serviço para operar, monitorar e escalar.
- DLQ gerenciada pelo GCP — visível no Console, sem configurar dead-letter-exchange manualmente.
- Auth via Service Account já existente (`pyahu-scrum-sa.json`) — zero credencial nova.
- `consumer.py` e toda a lógica de negócio ficam intocados.
- Alinha o código ao desenho da ADR-004 (arquitetura alvo em GCP).

**Negativas / Riscos**
- Pull loop não é push HTTP (Cloud Run nativo) — se no futuro quiser escalar o consumer horizontalmente via Cloud Run, precisará mudar o modelo de consumo de pull para push (endpoint HTTP). Aceitável para esta fase.
- `future.result()` em `_publish()` é síncrono — latência de publish pode aumentar levemente. Mitigação: usar `asyncio` + `await future` se necessário.
- Custo: Pub/Sub cobra por volume de dados trafegados. Para o volume atual (elicitação interativa de projetos) o free tier (10 GB/mês) cobre com folga.

## Referências

- [ADR-004](./004-arquitetura-orientada-a-eventos-google-cloud.md) — arquitetura alvo GCP
- [ADR-005](./005-stack-local-mvp-3-dias.md) — decisão original pelo RabbitMQ no MVP
- [google-cloud-pubsub Python SDK](https://cloud.google.com/python/docs/reference/pubsub/latest)
- [Pub/Sub dead letter topics](https://cloud.google.com/pubsub/docs/dead-letter-topics)
