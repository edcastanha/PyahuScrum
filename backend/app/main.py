import os
import threading
from contextlib import asynccontextmanager

from fastapi import FastAPI, Response, status
from pydantic import BaseModel

from . import consumer, dlq_sweeper, firestore_client, messaging, projects


@asynccontextmanager
async def lifespan(app: FastAPI):
    connection = messaging.get_connection()
    try:
        messaging.declare_topology(connection.channel())
    finally:
        connection.close()

    if os.environ.get("START_CONSUMER", "false").lower() == "true":
        # Threads daemon: morrem com o processo, sem shutdown gracioso. Aceitável
        # pro escopo atual (MVP); revisitar se isso virar um problema real.
        threading.Thread(target=consumer.start_consuming, daemon=True).start()
        threading.Thread(target=dlq_sweeper.start_sweeping, daemon=True).start()

    yield


app = FastAPI(title="Pyahu Scrum — Agent Orchestrator", lifespan=lifespan)


@app.get("/health")
def health(response: Response) -> dict:
    rabbitmq_ok = messaging.check_connection()
    firestore_ok = firestore_client.check_connection()
    healthy = rabbitmq_ok and firestore_ok

    response.status_code = status.HTTP_200_OK if healthy else status.HTTP_503_SERVICE_UNAVAILABLE
    return {
        "status": "ok" if healthy else "degraded",
        "rabbitmq": rabbitmq_ok,
        "firestore": firestore_ok,
    }


class ProjectCreateRequest(BaseModel):
    idea: str


@app.post("/projects", status_code=status.HTTP_201_CREATED)
def create_project(payload: ProjectCreateRequest) -> dict:
    return projects.create_project(payload.idea)
