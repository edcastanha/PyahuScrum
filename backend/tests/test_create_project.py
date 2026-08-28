import json

from fastapi.testclient import TestClient

from app.firestore_client import get_client
from app.main import app
from app.messaging import QUEUE_NAME, get_connection
from app.status import ProjectStatus


def test_create_project_writes_initial_status_and_publishes_message():
    with TestClient(app) as client:
        response = client.post("/projects", json={"idea": "Uma ideia de projeto qualquer"})

    assert response.status_code == 201
    body = response.json()
    project_id = body["id"]
    assert body["status"] == ProjectStatus.TRIAGEM_INICIAL.value

    doc = get_client().collection("projects").document(project_id).get()
    assert doc.exists
    data = doc.to_dict()
    assert data["status"] == ProjectStatus.TRIAGEM_INICIAL.value
    assert data["raw_idea"] == "Uma ideia de projeto qualquer"

    connection = get_connection()
    channel = connection.channel()
    method, _properties, raw_body = channel.basic_get(queue=QUEUE_NAME, auto_ack=True)
    connection.close()

    assert method is not None, "esperava uma mensagem publicada na fila"
    message = json.loads(raw_body)
    assert message["project_id"] == project_id
