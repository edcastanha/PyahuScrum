import json

from fastapi.testclient import TestClient

from app import ai_client
from app.consumer import process_message
from app.firestore_client import get_client
from app.main import app
from app.messaging import QUEUE_NAME, get_connection
from app.status import FailureReason, ProjectStatus


class _FakeAIClient:
    """fail_times: quantas chamadas seguidas falham antes de suceder (0 = nunca falha).
    failure: a exceção classificada levantada em cada falha."""

    def __init__(
        self,
        artifacts: ai_client.GeneratedArtifacts | None = None,
        fail_times: int = 0,
        failure: type[Exception] = ai_client.TransientServiceError,
    ):
        self._artifacts = artifacts or ai_client.GeneratedArtifacts(
            readme="# Fake README",
            adrs=["# Fake ADR"],
            tickets=["# Fake Ticket"],
        )
        self._fail_times = fail_times
        self._failure = failure
        self.calls = 0

    def generate_artifacts(self, idea: str) -> ai_client.GeneratedArtifacts:
        self.calls += 1
        if self.calls <= self._fail_times:
            raise self._failure(f"falha simulada #{self.calls}")
        return self._artifacts


def _create_project(idea: str) -> str:
    doc_ref = get_client().collection("projects").document()
    doc_ref.set({"raw_idea": idea, "status": ProjectStatus.TRIAGEM_INICIAL.value})
    return doc_ref.id


def _consume_one_message(fake_client: _FakeAIClient) -> tuple[str, bool]:
    """Consome uma mensagem real da fila e processa com o fake injetado,
    replicando exatamente o ack/nack que consumer._on_message faria."""
    connection = get_connection()
    channel = connection.channel()
    method, _properties, body = channel.basic_get(queue=QUEUE_NAME, auto_ack=False)
    assert method is not None, "esperava uma mensagem na fila"

    payload = json.loads(body)
    should_ack = process_message(payload["project_id"], client=fake_client)
    if should_ack:
        channel.basic_ack(delivery_tag=method.delivery_tag)
    else:
        channel.basic_nack(delivery_tag=method.delivery_tag, requeue=False)
    connection.close()
    return payload["project_id"], should_ack


def test_create_and_process_end_to_end_success():
    with TestClient(app) as client:
        response = client.post("/projects", json={"idea": "Uma ideia qualquer"})
    project_id = response.json()["id"]

    consumed_id, should_ack = _consume_one_message(_FakeAIClient())
    assert consumed_id == project_id
    assert should_ack is True

    data = get_client().collection("projects").document(project_id).get().to_dict()
    assert data["status"] == ProjectStatus.CONCLUIDO.value
    assert data["readme"] == "# Fake README"
    assert data["adrs"] == ["# Fake ADR"]
    assert data["tickets"] == ["# Fake Ticket"]


def test_quota_exceeded_goes_straight_to_dlq_without_retry():
    with TestClient(app) as client:
        response = client.post("/projects", json={"idea": "Ideia sem quota"})
    project_id = response.json()["id"]

    fake = _FakeAIClient(fail_times=1, failure=ai_client.QuotaExceededError)
    consumed_id, should_ack = _consume_one_message(fake)
    assert consumed_id == project_id
    assert should_ack is False, "quota excedida deve ir direto pra DLQ (nack sem requeue)"
    assert fake.calls == 1, "quota excedida nao deve tentar de novo"

    data = get_client().collection("projects").document(project_id).get().to_dict()
    assert data["status"] == ProjectStatus.FALHA_DLQ.value
    assert data["failure_reason"] == FailureReason.QUOTA_EXCEDIDA.value
    assert data["attempts"] == 1


def test_transient_error_retries_and_eventually_succeeds():
    with TestClient(app) as client:
        response = client.post("/projects", json={"idea": "Ideia com hiccup transitorio"})
    project_id = response.json()["id"]

    fake = _FakeAIClient(fail_times=2, failure=ai_client.TransientServiceError)
    consumed_id, should_ack = _consume_one_message(fake)
    assert consumed_id == project_id
    assert should_ack is True
    assert fake.calls == 3

    data = get_client().collection("projects").document(project_id).get().to_dict()
    assert data["status"] == ProjectStatus.CONCLUIDO.value
    assert data["attempts"] == 3


def test_invalid_response_exhausts_retries_and_goes_to_dlq():
    with TestClient(app) as client:
        response = client.post("/projects", json={"idea": "Ideia com resposta sempre invalida"})
    project_id = response.json()["id"]

    fake = _FakeAIClient(fail_times=99, failure=ai_client.InvalidResponseError)
    consumed_id, should_ack = _consume_one_message(fake)
    assert consumed_id == project_id
    assert should_ack is False
    assert fake.calls == 3, "deve parar exatamente no limite de tentativas"

    data = get_client().collection("projects").document(project_id).get().to_dict()
    assert data["status"] == ProjectStatus.FALHA_DLQ.value
    assert data["failure_reason"] == FailureReason.RESPOSTA_INVALIDA.value
    assert data["attempts"] == 3
