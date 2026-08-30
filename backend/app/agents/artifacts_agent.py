"""ArtifactsAgent — Gera ADR (Architecture Decision Records) e PRD (Product Requirements Doc).

Recebe o histórico completo da elicitação e produz:
- docs/adr/NNN-<slug>.md  — decisões arquiteturais justificadas
- docs/prd/prd-<slug>.md  — requisitos de produto estruturados

Roda em paralelo com o SpecAgent via Workflow ADK.
"""
import logging

from google.adk.agents import LlmAgent

logger = logging.getLogger(__name__)

ADR_PRD_INSTRUCTION = """
Você é o Agente de Artefatos de Decisão do Pyahu Scrum.

Dado o histórico completo de elicitação de um projeto (ideia + rounds de Q&A),
gere DOIS documentos em markdown:

## 1. ADR — Architecture Decision Record

Formato canônico:
```markdown
# ADR-NNN: <Título da Decisão>

## Status
Aceito

## Contexto
<Por que esta decisão foi necessária>

## Decisão
<O que foi decidido>

## Consequências
<Impactos positivos e negativos>
```

Gere um ADR para cada decisão arquitetural significativa identificada na elicitação.
(stack, banco de dados, autenticação, comunicação, deploy, etc.)

## 2. PRD — Product Requirements Document

Formato:
```markdown
# PRD: <Nome do Produto>

## Objetivo
<O problema que resolve e o valor entregue>

## Público-alvo
<Quem usa e por quê>

## Requisitos Funcionais
- RF01: ...
- RF02: ...

## Requisitos Não-Funcionais
- RNF01: ...

## Fora do escopo
- ...

## Critérios de Aceitação
- ...
```

## Formato de saída

Responda em JSON:
```json
{
  "adrs": ["# ADR-001: ...", "# ADR-002: ..."],
  "prd": "# PRD: ..."
}
```

Seja preciso, técnico e baseado exclusivamente no que foi elicitado.
Não invente informações que não foram mencionadas.
"""


def build_artifacts_agent() -> LlmAgent:
    """Constrói o ArtifactsAgent ADK."""
    return LlmAgent(
        name="artifacts_agent",
        model="gemini-2.0-flash",
        instruction=ADR_PRD_INSTRUCTION,
        description=(
            "Gera ADRs (Architecture Decision Records) e PRD (Product Requirements Doc) "
            "com base no histórico completo de elicitação."
        ),
        output_key="artifacts_resultado",
    )
