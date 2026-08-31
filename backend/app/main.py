"""API do Agent Orchestrator — endpoints FastAPI.

Fluxo assíncrono (ADR-004 + ADR-005):
  POST /projects          → salva Firestore (TRIAGEM_INICIAL) + publica pyahu.pipeline
  POST /projects/{id}/respostas → publica pyahu.elicitacao, retorna 202
  GET  /projects/{id}/download  → ZIP dos artefatos (status CONCLUIDO)
  DELETE /projects/{id}   → delete cascade (Firestore + subcoleções)
"""
import os
import threading
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI, HTTPException, Response, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from . import consumer, firestore_client, messaging, projects
from .firestore_client import get_client

_CORS_ORIGINS = [
    o.strip()
    for o in os.environ.get(
        "CORS_ALLOWED_ORIGINS",
        "https://homolog.pyahuscrum.adbfn6.easypanel.host,"
        "https://pyahuscrum.adbfn6.easypanel.host,"
        "http://localhost:3000,"
        "http://localhost:3001",
    ).split(",")
    if o.strip()
]


@asynccontextmanager
async def lifespan(app: FastAPI):
    connection = messaging.get_connection()
    try:
        messaging.declare_topology(connection.channel())
    finally:
        connection.close()

    if os.environ.get("START_CONSUMER", "false").lower() == "true":
        threading.Thread(target=consumer.start_consuming, daemon=True).start()

    yield


app = FastAPI(title="Pyahu Scrum — Agent Orchestrator", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Health ─────────────────────────────────────────────────────────────────────

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


# ── Modelos ────────────────────────────────────────────────────────────────────

class ProjectCreateRequest(BaseModel):
    idea: str
    github_login: Optional[str] = None


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
def create_project(payload: ProjectCreateRequest) -> dict:
    """Cria o projeto e publica na fila de elicitação (assíncrono).

    Retorna imediatamente com {id, status: TRIAGEM_INICIAL}.
    O consumer processará a Rodada 1 e atualizará o Firestore para ELICITANDO.
    """
    project_data = projects.create_project(payload.idea, github_login=payload.github_login)
    project_id = project_data["id"]

    messaging.publish_to_pipeline({
        "project_id": project_id,
        "idea": payload.idea,
    })

    return {"id": project_id, "status": project_data["status"]}


@app.post("/projects/{project_id}/respostas", status_code=status.HTTP_202_ACCEPTED)
def enviar_respostas(project_id: str, payload: RespostasRequest) -> dict:
    """Publica as respostas na fila de elicitação (assíncrono).

    Retorna 202 imediatamente. O consumer processará e atualizará o Firestore.
    """
    doc = get_client().collection("projects").document(project_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail=f"Projeto {project_id} não encontrado.")

    messaging.publish_to_elicitacao({
        "project_id": project_id,
        "rodada": payload.rodada,
        "respostas": [
            {"pergunta_id": r.pergunta_id, "opcao": r.opcao, "texto": r.texto}
            for r in payload.respostas
        ],
        "forcar_geracao": payload.forcar_geracao,
    })

    return {"status": "PROCESSANDO", "mensagem": "Respostas recebidas e em processamento."}


@app.delete("/projects/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(project_id: str) -> None:
    """Remove o projeto e todos os dados associados (delete cascade).

    Remove: documento principal + subcoleção elicitacao.
    Mensagens pendentes na fila serão descartadas pelo consumer (_project_exists guard).
    """
    found = projects.delete_project(project_id)
    if not found:
        raise HTTPException(status_code=404, detail=f"Projeto {project_id} não encontrado.")


class RevisaoRequest(BaseModel):
    feedback: str


@app.post("/projects/{project_id}/aprovar", status_code=status.HTTP_202_ACCEPTED)
def aprovar_escopo(project_id: str) -> dict:
    """Usuário aprovou o resumo de escopo → dispara geração de artefatos (assíncrono)."""
    doc = get_client().collection("projects").document(project_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail=f"Projeto {project_id} não encontrado.")
    data = doc.to_dict() or {}
    if data.get("status") != "AGUARDANDO_APROVACAO_ESCOPO":
        raise HTTPException(
            status_code=409,
            detail=f"Projeto não está aguardando aprovação — status atual: {data.get('status')}.",
        )
    messaging.publish_to_elicitacao({
        "project_id": project_id,
        "tipo": "aprovar",
    })
    return {"status": "PROCESSANDO", "mensagem": "Aprovação recebida — gerando artefatos."}


@app.post("/projects/{project_id}/revisao", status_code=status.HTTP_202_ACCEPTED)
def revisar_escopo(project_id: str, payload: RevisaoRequest) -> dict:
    """Usuário enviou feedback de revisão → Gemini analisa e decide se precisa mais info."""
    doc = get_client().collection("projects").document(project_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail=f"Projeto {project_id} não encontrado.")
    messaging.publish_to_elicitacao({
        "project_id": project_id,
        "tipo": "revisao",
        "feedback": payload.feedback,
    })
    return {"status": "PROCESSANDO", "mensagem": "Feedback recebido — analisando revisão."}


@app.get("/projects/{project_id}/download")
def download_artefatos(project_id: str):
    from fastapi.responses import StreamingResponse
    from .artefatos import GeneratedArtifactsV2, _build_zip, _slugify

    doc = get_client().collection("projects").document(project_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail=f"Projeto {project_id} não encontrado.")

    data = doc.to_dict() or {}
    if data.get("status") != "CONCLUIDO":
        raise HTTPException(
            status_code=409,
            detail=f"Artefatos ainda não disponíveis — status: {data.get('status')}.",
        )

    raw = data.get("artefatos", {})
    artefatos = GeneratedArtifactsV2(
        spec=raw.get("spec", ""),
        prd=raw.get("prd", ""),
        adrs=raw.get("adrs", []),
        tickets=raw.get("tickets", []),
    )

    slug = _slugify(data.get("raw_idea", "projeto")[:50])
    buf = _build_zip(slug, artefatos)

    return StreamingResponse(
        buf,
        media_type="application/zip",
        headers={"Content-Disposition": f'attachment; filename="{slug}.zip"'},
    )
