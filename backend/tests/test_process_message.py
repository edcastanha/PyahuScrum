import json

from fastapi.testclient import TestClient

from app import ai_client
from app.consumer import process_message
from app.firestore_client import get_client
from app.main import app
from app.messaging import QUEUE_NAME, get_connection
from app.status import ProjectStatus


class _FakeAIClient:
    def __init__(self, artifacts: ai_client.GeneratedArtifacts | None = None, should_fail: bool = False):
        self._artifacts = artifacts or ai_client.GeneratedArtifacts(
            readme="# Fake README",
            adrs=["# Fake ADR"],
            tickets=["# Fake Ticket"],
        )
        self._should_fail = should_fail

    def generate_artifacts(self, idea: str) -> ai_client.GeneratedArtifacts:
        if self._should_fail:
            raise RuntimeError("falha simulada do Gemini")
        return self._artifacts


def _consume_one_message(fake_client: _FakeAIClient) -> str:
    """Consome uma mensagem real da fila (basic_get, não o loop bloqueante de
    consumer.start_consuming) e processa com o fake injetado. Ponta a ponta de
    verdade: HTTP -> Firestore -> fila -> processamento -> Firestore final."""
    connection = get_connection()
    channel = connection.channel()
    method, _properties, body = channel.basic_get(queue=QUEUE_NAME, auto_ack=False)
    assert method is not None, "esperava uma mensagem na fila"

    payload = json.loads(body)
    process_message(payload["project_id"], client=fake_client)
    channel.basic_ack(delivery_tag=method.delivery_tag)
    connection.close()
    return payload["project_id"]


def test_create_and_process_end_to_end_success():
    with TestClient(app) as client:
        response = client.post("/projects", json={"idea": "Uma ideia qualquer"})
    project_id = response.json()["id"]

    consumed_id = _consume_one_message(_FakeAIClient())
    assert consumed_id == project_id

    data = get_client().collection("projects").document(project_id).get().to_dict()
    assert data["status"] == ProjectStatus.CONCLUIDO.value
    assert data["readme"] == "# Fake README"
    assert data["adrs"] == ["# Fake ADR"]
    assert data["tickets"] == ["# Fake Ticket"]


def test_create_and_process_end_to_end_failure():
    with TestClient(app) as client:
        response = client.post("/projects", json={"idea": "Uma ideia que vai falhar"})
    project_id = response.json()["id"]

    consumed_id = _consume_one_message(_FakeAIClient(should_fail=True))
    assert consumed_id == project_id

    data = get_client().collection("projects").document(project_id).get().to_dict()
    assert data["status"] == ProjectStatus.FALHA_PROCESSAMENTO.value
