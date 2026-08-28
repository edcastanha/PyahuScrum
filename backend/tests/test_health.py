from fastapi.testclient import TestClient

from app.main import app


def test_health_returns_ok_when_dependencies_are_reachable():
    with TestClient(app) as client:
        response = client.get("/health")

    assert response.status_code == 200
    body = response.json()
    assert body == {"status": "ok", "rabbitmq": True, "firestore": True}
