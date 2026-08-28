import json
import os
from dataclasses import dataclass, field


@dataclass
class GeneratedArtifacts:
    readme: str
    adrs: list[str] = field(default_factory=list)
    tickets: list[str] = field(default_factory=list)


_PROMPT = """Você é um agente de engenharia autônomo do Pyahu Scrum, seguindo as diretrizes \
de .agents/system-prompt.md: specs com Problem Statement/Solution/User Stories/Implementation \
Decisions/Testing Decisions, tickets em vertical slices com critérios de aceite testáveis.

A partir da ideia de projeto abaixo, gere:
1. Um README executivo (visão, proposta de valor, arquitetura macro).
2. Uma ou mais ADRs justificando as decisões arquiteturais.
3. Tickets de execução (vertical slices, critérios de aceite testáveis, exigindo
   tipagem forte explícita em qualquer interface pública sugerida -- zero `any`).

Ideia: {idea}

Responda em JSON, sem markdown ao redor, no formato exato:
{{"readme": "...", "adrs": ["..."], "tickets": ["..."]}}"""


class VertexAIClient:
    """Wrapper fino em volta do Vertex AI SDK (Gemini). Não coberto por teste automatizado
    nesta fase: depende de credenciais reais do projeto GCP (ticket 02)."""

    def __init__(self, project: str | None = None, model: str = "gemini-2.5-flash"):
        self._project = project or os.environ.get("GOOGLE_CLOUD_PROJECT", "pyahu-scrum-local")
        self._model = model

    def generate_artifacts(self, idea: str) -> GeneratedArtifacts:
        # Import local: só os testes com fake exercitam este método; evita exigir
        # credencial/config do SDK real em import-time.
        from google import genai

        client = genai.Client()
        response = client.models.generate_content(
            model=self._model,
            contents=_PROMPT.format(idea=idea),
        )
        data = json.loads(response.text)
        return GeneratedArtifacts(
            readme=data["readme"],
            adrs=data.get("adrs", []),
            tickets=data.get("tickets", []),
        )


_client: VertexAIClient | None = None


def get_client() -> VertexAIClient:
    global _client
    if _client is None:
        _client = VertexAIClient()
    return _client
