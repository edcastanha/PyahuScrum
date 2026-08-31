"""Pipeline ADK do Pyahu Scrum.

Workflow de 3 agentes em sequência:

  OrchestratorAgent (elicitação grill-style, HITL até 4 rounds)
        ↓ (após aprovação do escopo)
  ArtifactsAgent (ADRs + PRD)
        ↓
  SpecAgent (SPEC + Tickets)

O OrchestratorAgent é chamado rodada a rodada (via Runner.run_async por mensagem).
O par ArtifactsAgent → SpecAgent roda sequencialmente após aprovação do usuário.
"""
import asyncio
import json
import logging

from google.adk import Runner, Workflow
from google.adk.sessions import InMemorySessionService
from google.genai.types import Content, Part

from .artifacts_agent import build_artifacts_agent
from .orchestrator_agent import build_orchestrator_agent
from .spec_agent import build_spec_agent

logger = logging.getLogger(__name__)

# ── Session service compartilhado (in-memory; em prod usar DatabaseSessionService) ──

_session_service = InMemorySessionService()


# ── Workflow de geração de artefatos (pós-aprovação) ────────────────────────────

def _build_artifacts_workflow() -> Workflow:
    """SequentialAgent: ArtifactsAgent → SpecAgent."""
    artifacts_agent = build_artifacts_agent()
    spec_agent = build_spec_agent()
    return Workflow(
        name="pyahu_artifacts_workflow",
        description="Gera ADRs + PRD (ArtifactsAgent) e depois SPEC + Tickets (SpecAgent).",
        edges=[
            ("START", artifacts_agent),
            (artifacts_agent, spec_agent),
        ],
    )


# ── Runner do OrchestratorAgent (por rodada, com estado de sessão) ───────────────

async def run_orchestrator_round(
    project_id: str,
    idea: str,
    historico_json: str,
) -> dict:
    """Executa uma rodada de elicitação via OrchestratorAgent ADK.

    Args:
        project_id: ID do projeto (usado como session_id)
        idea: Ideia bruta do projeto
        historico_json: JSON com o histórico de rodadas anteriores

    Returns:
        dict com {pronto, perguntas} ou {pronto: true}
    """
    agent = build_orchestrator_agent()
    runner = Runner(
        agent=agent,
        session_service=_session_service,
        auto_create_session=True,
    )

    prompt = f"""
## Ideia do projeto
{idea}

## Histórico de elicitação (rounds anteriores)
{historico_json}

Analise o histórico e conduza o próximo round de elicitação.
Se já tiver contexto suficiente, responda com pronto: true.
"""

    response_text = ""
    async for event in runner.run_async(
        user_id="pyahu-system",
        session_id=f"elicitacao-{project_id}",
        new_message=Content(parts=[Part(text=prompt)]),
    ):
        if event.is_final_response() and event.content:
            for part in event.content.parts:
                if hasattr(part, "text") and part.text:
                    response_text += part.text

    # Parsear resposta JSON
    try:
        clean = response_text.strip()
        if clean.startswith("```"):
            clean = "\n".join(clean.split("\n")[1:-1])
        return json.loads(clean)
    except (json.JSONDecodeError, ValueError):
        logger.warning("OrchestratorAgent retornou resposta não-JSON: %r", response_text[:200])
        return {
            "pronto": False,
            "perguntas": [
                {
                    "id": "q_fallback",
                    "texto": "**Q1 — Contexto adicional**: Pode descrever melhor o projeto? Stack, público-alvo, restrições.",
                    "opcoes": [],
                    "permite_texto": True,
                    "recomendacao": "➡️ Detalhe o máximo possível para gerar documentação precisa.",
                }
            ],
        }


async def run_artifacts_pipeline(
    project_id: str,
    idea: str,
    historico_json: str,
    resumo_escopo: str,
) -> dict:
    """Executa o Workflow ADK: ArtifactsAgent → SpecAgent.

    Args:
        project_id: ID do projeto
        idea: Ideia bruta
        historico_json: Histórico completo de elicitação em JSON
        resumo_escopo: Resumo de escopo aprovado pelo usuário

    Returns:
        dict com {adrs, prd, spec, tickets}
    """
    workflow = _build_artifacts_workflow()
    runner = Runner(
        agent=workflow,
        session_service=_session_service,
        auto_create_session=True,
    )

    prompt = f"""
## Ideia do projeto
{idea}

## Resumo de escopo aprovado pelo usuário
{resumo_escopo}

## Histórico completo de elicitação
{historico_json}

Com base no histórico acima, gere os artefatos técnicos completos.
"""

    artifacts_text = ""
    spec_text = ""

    async for event in runner.run_async(
        user_id="pyahu-system",
        session_id=f"artifacts-{project_id}",
        new_message=Content(parts=[Part(text=prompt)]),
    ):
        if event.is_final_response() and event.content:
            agent_name = event.author if hasattr(event, "author") else ""
            for part in event.content.parts:
                if hasattr(part, "text") and part.text:
                    if "spec_agent" in str(agent_name):
                        spec_text += part.text
                    else:
                        artifacts_text += part.text

    # Parsear resultados
    result = {"adrs": [], "prd": "", "spec": "", "tickets": []}

    for raw in [artifacts_text, spec_text]:
        if not raw.strip():
            continue
        try:
            clean = raw.strip()
            if clean.startswith("```"):
                clean = "\n".join(clean.split("\n")[1:-1])
            data = json.loads(clean)
            if "adrs" in data:
                result["adrs"] = data["adrs"]
            if "prd" in data:
                result["prd"] = data["prd"]
            if "spec" in data:
                result["spec"] = data["spec"]
            if "tickets" in data:
                result["tickets"] = data["tickets"]
        except (json.JSONDecodeError, ValueError) as e:
            logger.warning("Falha ao parsear artefato: %s — raw: %r", e, raw[:200])

    return result


# ── Helpers síncronos (para uso no consumer/elicitacao que não é async) ──────────

def run_orchestrator_round_sync(project_id: str, idea: str, historico_json: str) -> dict:
    """Versão síncrona de run_orchestrator_round."""
    return asyncio.run(run_orchestrator_round(project_id, idea, historico_json))


def run_artifacts_pipeline_sync(
    project_id: str, idea: str, historico_json: str, resumo_escopo: str
) -> dict:
    """Versão síncrona de run_artifacts_pipeline."""
    return asyncio.run(run_artifacts_pipeline(project_id, idea, historico_json, resumo_escopo))
