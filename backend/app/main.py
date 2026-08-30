import os
import threading
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI, HTTPException, Response, status
from pydantic import BaseModel

from . import consumer, dlq_sweeper, firestore_client, messaging, projects
from .elicitacao import ElicitacaoService, Resposta


@asynccontextmanager
async def lifespan(app: FastAPI):
    connection = messaging.get_connection()
    try:
        messaging.declare_topology(connection.channel())
    finally:
        connection.close()

    if os.environ.get("START_CONSUMER", "false").lower() == "true":
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


# ── Modelos de entrada ─────────────────────────────────────────────────────────


class ProjectCreateRequest(BaseModel):
    idea: str


class RespostaInput(BaseModel):
    pergunta_id: str
    opcao: Optional[str] = None
    texto: Optional[str] = None


class RespostasRequest(BaseModel):
    rodada: int
    respostas: list[RespostaInput]
    forcar_geracao: bool = False


# ── Endpoints ──────────────────────────────────────────────────────────────────


@app.post("/projects", status_code=status.HTTP_201_CREATED)
def create_project(payload: ProjectCreateRequest, ai_client=None) -> dict:
    """Cria o projeto no Firestore e inicia a Rodada 1 de Elicitação.

    O `ai_client` pode ser injetado nos testes para evitar chamada real ao Gemini.
    """
    project_data = projects.create_project(payload.idea)
    project_id = project_data["id"]

    service = ElicitacaoService(ai_client=ai_client)
    resultado = service.iniciar_elicitacao(project_id=project_id, idea=payload.idea)

    return {"id": project_id, **resultado}


@app.post("/projects/{project_id}/respostas")
def enviar_respostas(project_id: str, payload: RespostasRequest, ai_client=None) -> dict:
    """Recebe as respostas da Rodada N e avança para a próxima rodada (ou gera artefatos).

    O `ai_client` pode ser injetado nos testes para evitar chamada real ao Gemini.
    """
    respostas = [
        Resposta(
            pergunta_id=r.pergunta_id,
            opcao=r.opcao,
            texto=r.texto,
        )
        for r in payload.respostas
    ]

    service = ElicitacaoService(ai_client=ai_client)
    try:
        resultado = service.processar_respostas(
            project_id=project_id,
            numero_rodada=payload.rodada,
            respostas_novas=respostas,
            forcar_geracao=payload.forcar_geracao,
        )
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc

    return resultado
