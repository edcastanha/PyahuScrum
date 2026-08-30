import json
import os
from dataclasses import dataclass, field


@dataclass
class GeneratedArtifacts:
    readme: str
    adrs: list[str] = field(default_factory=list)
    tickets: list[str] = field(default_factory=list)


class QuotaExceededError(Exception):
    """Quota/crédito do Vertex AI excedido. Não adianta tentar de novo sozinho --
    exige intervenção humana (ver FailureReason.QUOTA_EXCEDIDA)."""


class TransientServiceError(Exception):
    """Erro transitório de rede/serviço do Vertex AI. Vale tentar de novo."""


class InvalidResponseError(Exception):
    """O modelo respondeu, mas fora do formato esperado (JSON malformado,
    campos faltando). Vale tentar de novo -- pode ser um lapso pontual do modelo."""


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

    def _call_gemini(self, system_instruction: str, prompt: str) -> str:
        """Chama o Gemini com system instruction + prompt e retorna o texto bruto."""
        from google import genai
        from google.genai import errors as genai_errors
        from google.genai import types as genai_types

        try:
            client = genai.Client()
            response = client.models.generate_content(
                model=self._model,
                contents=prompt,
                config=genai_types.GenerateContentConfig(
                    system_instruction=system_instruction,
                ) if system_instruction else None,
            )
            return response.text or ""
        except genai_errors.ClientError as exc:
            if getattr(exc, "code", None) == 429:
                raise QuotaExceededError(str(exc)) from exc
            raise TransientServiceError(str(exc)) from exc

    def gerar_elicitacao(self, system_prompt: str, prompt: str) -> str:
        """Gera perguntas de elicitação (Rodada N). Retorna JSON bruto do Gemini."""
        return self._call_gemini(system_instruction=system_prompt, prompt=prompt)

    def gerar_artefatos(self, system_prompt: str, prompt: str) -> str:
        """Gera os artefatos finais (spec, prd, adrs, tickets). Retorna JSON bruto do Gemini."""
        return self._call_gemini(system_instruction=system_prompt, prompt=prompt)

    def generate_artifacts(self, idea: str) -> GeneratedArtifacts:
        # Import local: só os testes com fake exercitam este método; evita exigir
        # credencial/config do SDK real em import-time.
        from google import genai
        from google.genai import errors as genai_errors

        try:
            client = genai.Client()
            response = client.models.generate_content(
                model=self._model,
                contents=_PROMPT.format(idea=idea),
            )
        except genai_errors.ClientError as exc:
            # Mapeamento best-effort: nao verificado contra credencial real
            # (ticket 02 pendente no momento desta escrita). 429 = quota/rate
            # limit; qualquer outro erro do cliente tratado como transitorio.
            if getattr(exc, "code", None) == 429:
                raise QuotaExceededError(str(exc)) from exc
            raise TransientServiceError(str(exc)) from exc
        except Exception as exc:
            raise TransientServiceError(str(exc)) from exc

        try:
            data = json.loads(response.text)
            return GeneratedArtifacts(
                readme=data["readme"],
                adrs=data.get("adrs", []),
                tickets=data.get("tickets", []),
            )
        except (json.JSONDecodeError, KeyError, TypeError) as exc:
            raise InvalidResponseError(str(exc)) from exc


_client: VertexAIClient | None = None


def get_client() -> VertexAIClient:
    global _client
    if _client is None:
        _client = VertexAIClient()
    return _client
