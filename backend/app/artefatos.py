"""Módulo de Geração de Artefatos — E3-T12 (ticket #29).

Gera spec.md, prd.md, ADR(s) e tickets a partir do histórico completo
da Sessão de Elicitação, e monta o ZIP para download.

Spec: specs/004-elicitacao-interativa/spec.md (US-10, CA-5)
ADR:  docs/adr/006-pipeline-elicitacao-interativa.md
"""
import io
import json
import pathlib
import re
import unicodedata
import zipfile
from dataclasses import dataclass, field

from .ai_client import InvalidResponseError
from .elicitacao import RodadaElicitacao, _montar_prompt

# Reutiliza o system prompt do módulo de elicitação
_SYSTEM_PROMPT_PATH = pathlib.Path(__file__).parent.parent.parent / ".agents" / "system-prompt.md"

# Número de início para ADRs geradas (após as 5 existentes)
_ADR_START_INDEX = 6


def _load_system_prompt() -> str:
    if _SYSTEM_PROMPT_PATH.exists():
        return _SYSTEM_PROMPT_PATH.read_text(encoding="utf-8")
    fallback = pathlib.Path(".agents") / "system-prompt.md"
    if fallback.exists():
        return fallback.read_text(encoding="utf-8")
    return ""


def _slugify(name: str) -> str:
    """Converte um nome de projeto em slug (lowercase, hyphens, sem acentos)."""
    # Normalizar unicode (remover acentos)
    normalized = unicodedata.normalize("NFKD", name)
    ascii_str = normalized.encode("ascii", "ignore").decode("ascii")
    # Lowercase e substituir não-alfanuméricos por hífen
    slug = re.sub(r"[^a-z0-9]+", "-", ascii_str.lower())
    # Remover hifens no início e fim
    return slug.strip("-")


@dataclass
class GeneratedArtifactsV2:
    """Artefatos gerados pelo Agent Orchestrator (Fatia 3)."""
    spec: str
    prd: str
    adrs: list[str] = field(default_factory=list)
    tickets: list[str] = field(default_factory=list)


_PROMPT_ARTEFATOS = """\
Com base em toda a Sessão de Elicitação acima, gere a documentação técnica completa do projeto.

Produza SOMENTE JSON válido, sem markdown ao redor, no formato exato:
{{
  "spec": "<conteúdo completo do spec.md em markdown — Problem Statement, Solution, User Stories, Implementation Decisions, Testing Decisions, Out of Scope>",
  "prd": "<conteúdo completo do prd.md em markdown — objetivo, usuário-alvo, critérios de aceite>",
  "adrs": ["<conteúdo completo de cada ADR em markdown>"],
  "tickets": ["<conteúdo completo de cada ticket em markdown — vertical slice, critérios de aceite testáveis>"]
}}

Requisitos obrigatórios:
- Spec: seguir padrão mattpocock/skills (Problem Statement / Solution / User Stories / Implementation Decisions / Testing Decisions / Out of Scope)
- Tickets: vertical slices cortando todas as camadas (schema → API → UI → tests); zero `any` em interfaces TypeScript
- ADRs: apenas quando a decisão é difícil de reverter E surpreendente sem contexto E resultado de trade-off real
- Linguagem: PT-BR"""


def generate_artifacts_from_history(
    idea: str,
    historico: list[RodadaElicitacao],
    ai_client=None,
) -> GeneratedArtifactsV2:
    """Gera artefatos completos a partir do histórico da Sessão de Elicitação.

    O `ai_client` é injetado para permitir fake em testes.
    """
    if ai_client is None:
        from .ai_client import VertexAIClient
        ai_client = VertexAIClient()

    system_prompt = _load_system_prompt()
    # Monta prompt com histórico completo + instrução de geração
    base = _montar_prompt(idea, historico)
    prompt = base + "\n\n" + _PROMPT_ARTEFATOS

    raw = ai_client.gerar_artefatos(system_prompt=system_prompt, prompt=prompt)

    try:
        data = json.loads(raw.strip())
        return GeneratedArtifactsV2(
            spec=data.get("spec", ""),
            prd=data.get("prd", ""),
            adrs=data.get("adrs", []),
            tickets=data.get("tickets", []),
        )
    except (json.JSONDecodeError, KeyError, TypeError) as exc:
        raise InvalidResponseError(
            f"Gemini retornou resposta inválida ao gerar artefatos: {exc!r}"
        ) from exc


def _build_zip(slug: str, artefatos: GeneratedArtifactsV2) -> io.BytesIO:
    """Monta o ZIP em memória com a estrutura canônica do repo.

    Estrutura:
        specs/<slug>/spec.md
        specs/<slug>/prd.md
        docs/adr/006-<slug>.md  (e 007-, 008-... para cada ADR adicional)
        .scratch/<slug>/tickets/01-ticket.md  (numerados com zero à esquerda)
    """
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, mode="w", compression=zipfile.ZIP_DEFLATED) as zf:
        # spec e prd
        zf.writestr(f"specs/{slug}/spec.md", artefatos.spec)
        zf.writestr(f"specs/{slug}/prd.md", artefatos.prd)

        # ADRs numeradas a partir de _ADR_START_INDEX
        for i, adr_content in enumerate(artefatos.adrs, start=_ADR_START_INDEX):
            filename = f"docs/adr/{i:03d}-{slug}.md"
            zf.writestr(filename, adr_content)

        # Tickets numerados com zero à esquerda (01-, 02-, ...)
        for i, ticket_content in enumerate(artefatos.tickets, start=1):
            filename = f".scratch/{slug}/tickets/{i:02d}-ticket.md"
            zf.writestr(filename, ticket_content)

    buf.seek(0)
    return buf
