"""Módulo de Elicitação Interativa — E3-T11 (ticket #28).

Coordena o ciclo de Rodadas de Elicitação entre o Agent Orchestrator e o usuário.
Persiste o histórico no Firestore (subcoleção `elicitacao`) e chama o Gemini
com o conteúdo de `.agents/system-prompt.md` como system instruction.

Spec: specs/004-elicitacao-interativa/spec.md (US-7, US-8, US-9)
ADR:  docs/adr/006-pipeline-elicitacao-interativa.md
"""
import json
import logging
import os
import pathlib
from dataclasses import dataclass, field

from .firestore_client import get_client
from .status import ProjectStatus

logger = logging.getLogger(__name__)

MAX_RODADAS = 4

# Caminho do system prompt injetado em toda chamada ao Gemini
_SYSTEM_PROMPT_PATH = pathlib.Path(__file__).parent.parent.parent / ".agents" / "system-prompt.md"


def _load_system_prompt() -> str:
    """Carrega o system prompt do disco. Falha de forma clara se não encontrar."""
    if _SYSTEM_PROMPT_PATH.exists():
        return _SYSTEM_PROMPT_PATH.read_text(encoding="utf-8")
    # Fallback: caminho relativo ao CWD (útil em testes com cwd diferente)
    fallback = pathlib.Path(".agents") / "system-prompt.md"
    if fallback.exists():
        return fallback.read_text(encoding="utf-8")
    return ""  # Não bloquear — logar ausência


@dataclass
class Pergunta:
    id: str
    texto: str
    opcoes: list[str] = field(default_factory=list)
    permite_texto: bool = True


@dataclass
class Resposta:
    pergunta_id: str
    opcao: str | None = None
    texto: str | None = None


@dataclass
class RodadaElicitacao:
    rodada: int
    perguntas: list[Pergunta] = field(default_factory=list)
    respostas: list[Resposta] = field(default_factory=list)
    pronto: bool = False


def _montar_prompt(idea: str, historico: list[RodadaElicitacao]) -> str:
    """Monta o prompt completo com ideia + histórico de todas as rodadas anteriores."""
    partes = [
        f"## Ideia do projeto\n{idea}",
    ]
    for r in historico:
        if not r.perguntas:
            continue
        partes.append(f"\n## Rodada {r.rodada} — Perguntas e Respostas")
        for p in r.perguntas:
            resp = next((rs for rs in r.respostas if rs.pergunta_id == p.id), None)
            resposta_texto = ""
            if resp:
                parts_resp = []
                if resp.opcao:
                    parts_resp.append(f"opção: {resp.opcao}")
                if resp.texto:
                    parts_resp.append(f"detalhe: {resp.texto}")
                resposta_texto = "; ".join(parts_resp) if parts_resp else "(sem resposta)"
            else:
                resposta_texto = "(sem resposta)"
            partes.append(f"- **{p.texto}** → {resposta_texto}")

    instrucao = (
        "\n## Instrução\n"
        "Com base no histórico acima, faça até 5 perguntas de elicitação para entender melhor "
        "o projeto (stack, tipo de sistema, público-alvo, restrições, preferências arquiteturais). "
        "Quando tiver contexto suficiente para gerar documentação técnica de qualidade, "
        "responda com `pronto: true` e `perguntas: []`.\n\n"
        "Responda SOMENTE em JSON, sem markdown ao redor, no formato exato:\n"
        '{"pronto": false, "perguntas": [{"id": "q1", "texto": "...", '
        '"opcoes": ["A", "B", "C"], "permite_texto": true}]}\n'
        "— ou quando pronto:\n"
        '{"pronto": true, "perguntas": []}'
    )
    partes.append(instrucao)
    return "\n".join(partes)


def _montar_prompt_resumo(idea: str, historico: list[RodadaElicitacao], feedback: str | None = None) -> str:
    """Monta prompt para o Gemini gerar o resumo de escopo em markdown."""
    partes = [f"## Ideia do projeto\n{idea}"]
    for r in historico:
        if not r.perguntas:
            continue
        partes.append(f"\n## Rodada {r.rodada} — Perguntas e Respostas")
        for p in r.perguntas:
            resp = next((rs for rs in r.respostas if rs.pergunta_id == p.id), None)
            if resp:
                parts_resp = []
                if resp.opcao:
                    parts_resp.append(f"opção: {resp.opcao}")
                if resp.texto:
                    parts_resp.append(f"detalhe: {resp.texto}")
                resposta_texto = "; ".join(parts_resp) if parts_resp else "(sem resposta)"
            else:
                resposta_texto = "(sem resposta)"
            partes.append(f"- **{p.texto}** → {resposta_texto}")

    if feedback:
        partes.append(f"\n## Feedback / Revisão do usuário\n{feedback}")

    partes.append(
        "\n## Instrução\n"
        "Com base no histórico acima, gere um resumo de escopo do projeto em markdown com as seções:\n"
        "## Ideia resumida\n## Requisitos\n## Escopo\n## Fora do escopo\n\n"
        "Além do markdown, indique se precisa de mais informações do usuário respondendo em JSON:\n"
        '{"precisa_mais_info": false, "perguntas_adicionais": [], "resumo_markdown": "..."}\n'
        "Se `precisa_mais_info: true`, inclua até 3 perguntas em `perguntas_adicionais`.\n"
        "Responda SOMENTE em JSON, sem markdown ao redor."
    )
    return "\n".join(partes)


def _parse_resumo_gemini(raw: str) -> tuple[bool, list[Pergunta], str]:
    """Parseia resposta do Gemini para o resumo de escopo.
    Retorna (precisa_mais_info, perguntas_adicionais, resumo_markdown).
    """
    try:
        data = json.loads(raw.strip())
        precisa = bool(data.get("precisa_mais_info", False))
        perguntas = [
            Pergunta(
                id=p.get("id", f"qa{i}"),
                texto=p.get("texto", ""),
                opcoes=p.get("opcoes", []),
                permite_texto=p.get("permite_texto", True),
            )
            for i, p in enumerate(data.get("perguntas_adicionais", []), 1)
        ]
        resumo = data.get("resumo_markdown", "")
        return precisa, perguntas, resumo
    except (json.JSONDecodeError, KeyError, TypeError):
        return False, [], "## Resumo\n\nNão foi possível gerar o resumo automaticamente."


def _parse_resposta_gemini(raw: str) -> tuple[bool, list[Pergunta]]:
    """Parseia a resposta JSON do Gemini. Retorna (pronto, perguntas)."""
    try:
        data = json.loads(raw.strip())
        pronto = bool(data.get("pronto", False))
        perguntas = [
            Pergunta(
                id=p.get("id", f"q{i}"),
                texto=p.get("texto", ""),
                opcoes=p.get("opcoes", []),
                permite_texto=p.get("permite_texto", True),
            )
            for i, p in enumerate(data.get("perguntas", []), 1)
        ]
        return pronto, perguntas
    except (json.JSONDecodeError, KeyError, TypeError):
        # Resposta inválida: retornar uma pergunta de fallback para não travar o fluxo
        return False, [
            Pergunta(
                id="q_fallback",
                texto="Pode descrever melhor o contexto do projeto? (stack, público-alvo, restrições)",
                opcoes=[],
                permite_texto=True,
            )
        ]


def _carregar_historico(project_id: str) -> list[RodadaElicitacao]:
    """Lê todas as rodadas do Firestore para o projeto."""
    db = get_client()
    docs = (
        db.collection("projects")
        .document(project_id)
        .collection("elicitacao")
        .order_by("rodada")
        .stream()
    )
    historico = []
    for doc in docs:
        data = doc.to_dict()
        perguntas = [Pergunta(**p) for p in data.get("perguntas", [])]
        respostas = [Resposta(**r) for r in data.get("respostas", [])]
        historico.append(
            RodadaElicitacao(
                rodada=data["rodada"],
                perguntas=perguntas,
                respostas=respostas,
                pronto=data.get("pronto", False),
            )
        )
    return historico


def _salvar_rodada(project_id: str, rodada: RodadaElicitacao) -> None:
    """Persiste a rodada no Firestore."""
    db = get_client()
    db.collection("projects").document(project_id).collection("elicitacao").document(
        str(rodada.rodada)
    ).set(
        {
            "rodada": rodada.rodada,
            "perguntas": [
                {
                    "id": p.id,
                    "texto": p.texto,
                    "opcoes": p.opcoes,
                    "permite_texto": p.permite_texto,
                }
                for p in rodada.perguntas
            ],
            "respostas": [
                {
                    "pergunta_id": r.pergunta_id,
                    "opcao": r.opcao,
                    "texto": r.texto,
                }
                for r in rodada.respostas
            ],
            "pronto": rodada.pronto,
        }
    )


def _atualizar_status_projeto(project_id: str, perguntas: list[Pergunta]) -> None:
    """Atualiza o documento do projeto no Firestore com o novo status e perguntas."""
    db = get_client()
    db.collection("projects").document(project_id).update(
        {
            "status": ProjectStatus.ELICITANDO.value,
            "perguntas_abertas": [
                {
                    "id": p.id,
                    "texto": p.texto,
                    "opcoes": p.opcoes,
                    "permite_texto": p.permite_texto,
                }
                for p in perguntas
            ],
        }
    )


class ElicitacaoService:
    """Orquestra as Rodadas de Elicitação.

    O `ai_client` é injetado para permitir fake em testes (sem chamada real ao Gemini).
    """

    def __init__(self, ai_client=None):
        self._ai_client = ai_client  # None = usar VertexAIClient real (lazy import)

    def _get_client(self):
        if self._ai_client is not None:
            return self._ai_client
        from .ai_client import VertexAIClient  # lazy — não exige credencial em import-time
        return VertexAIClient()

    def iniciar_elicitacao(self, project_id: str, idea: str) -> dict:
        """Disparado pelo POST /projects — inicia a Rodada 1 sem respostas anteriores."""
        return self._processar_rodada(
            project_id=project_id,
            idea=idea,
            respostas_novas=[],
            numero_rodada=1,
        )

    def processar_respostas(
        self,
        project_id: str,
        numero_rodada: int,
        respostas_novas: list[Resposta],
        forcar_geracao: bool = False,
    ) -> dict:
        """Disparado pelo POST /projects/{id}/respostas."""
        db = get_client()
        doc = db.collection("projects").document(project_id).get()
        if not doc.exists:
            raise ValueError(f"Projeto {project_id} não encontrado.")
        doc_data = doc.to_dict() or {}
        idea = doc_data.get("raw_idea", "")

        # Salvar respostas na rodada atual antes de gerar a próxima
        historico = _carregar_historico(project_id)
        rodada_atual = next((r for r in historico if r.rodada == numero_rodada), None)
        if rodada_atual:
            rodada_atual.respostas = respostas_novas
            _salvar_rodada(project_id, rodada_atual)
            historico = _carregar_historico(project_id)

        proxima = numero_rodada + 1

        if forcar_geracao or proxima > MAX_RODADAS:
            return self._gerar_artefatos(project_id, idea, historico)

        return self._processar_rodada(
            project_id=project_id,
            idea=idea,
            respostas_novas=respostas_novas,
            numero_rodada=proxima,
            historico_anterior=historico,
        )

    def _processar_rodada(
        self,
        project_id: str,
        idea: str,
        respostas_novas: list[Resposta],
        numero_rodada: int,
        historico_anterior: list[RodadaElicitacao] | None = None,
    ) -> dict:
        historico = historico_anterior or []

        # ── ADK OrchestratorAgent (grill-style) ──────────────────────────────
        from .agents.pipeline import run_orchestrator_round_sync
        historico_json = json.dumps(
            [
                {
                    "rodada": r.rodada,
                    "perguntas": [{"id": p.id, "texto": p.texto, "opcoes": p.opcoes} for p in r.perguntas],
                    "respostas": [{"pergunta_id": rs.pergunta_id, "opcao": rs.opcao, "texto": rs.texto} for rs in r.respostas],
                }
                for r in historico
            ],
            ensure_ascii=False,
        )
        try:
            resultado = run_orchestrator_round_sync(project_id, idea, historico_json)
        except Exception as exc:
            logger.warning("ADK OrchestratorAgent falhou (%s) — fallback para google-genai direto", exc)
            resultado = self._processar_rodada_fallback(idea, historico)

        pronto = bool(resultado.get("pronto", False))
        perguntas_raw = resultado.get("perguntas", [])
        perguntas = [
            Pergunta(
                id=p.get("id", f"q{i}"),
                texto=p.get("texto", ""),
                opcoes=p.get("opcoes", []),
                permite_texto=p.get("permite_texto", True),
            )
            for i, p in enumerate(perguntas_raw, 1)
        ]

        nova_rodada = RodadaElicitacao(
            rodada=numero_rodada,
            perguntas=perguntas,
            respostas=respostas_novas,
            pronto=pronto,
        )
        _salvar_rodada(project_id, nova_rodada)
        _atualizar_status_projeto(project_id, perguntas)

        if pronto or numero_rodada >= MAX_RODADAS:
            historico_completo = _carregar_historico(project_id)
            return self._gerar_resumo_escopo(project_id, idea, historico_completo)

        return {
            "status": ProjectStatus.ELICITANDO.value,
            "rodada": numero_rodada,
            "pronto": pronto,
            "perguntas": [
                {"id": p.id, "texto": p.texto, "opcoes": p.opcoes, "permite_texto": p.permite_texto}
                for p in perguntas
            ],
        }

    def _processar_rodada_fallback(self, idea: str, historico: list[RodadaElicitacao]) -> dict:
        """Fallback para google-genai direto quando ADK não está disponível (quota/billing)."""
        system_prompt = _load_system_prompt()
        prompt = _montar_prompt(idea, historico)
        raw = self._get_client().gerar_elicitacao(system_prompt=system_prompt, prompt=prompt)
        pronto, perguntas = _parse_resposta_gemini(raw)
        return {
            "pronto": pronto,
            "perguntas": [{"id": p.id, "texto": p.texto, "opcoes": p.opcoes, "permite_texto": p.permite_texto} for p in perguntas],
        }

    def _gerar_resumo_escopo(
        self,
        project_id: str,
        idea: str,
        historico: list[RodadaElicitacao],
        feedback: str | None = None,
    ) -> dict:
        """Gera resumo de escopo em markdown e muda status para AGUARDANDO_APROVACAO_ESCOPO.

        Se o Gemini indicar que precisa de mais dados (precisa_mais_info: true),
        abre nova rodada de perguntas (volta para ELICITANDO).
        """
        db = get_client()
        system_prompt = _load_system_prompt()
        prompt = _montar_prompt_resumo(idea, historico, feedback=feedback)

        raw = self._get_client().gerar_elicitacao(
            system_prompt=system_prompt,
            prompt=prompt,
        )
        precisa_mais, perguntas_adicionais, resumo_markdown = _parse_resumo_gemini(raw)

        if precisa_mais and perguntas_adicionais:
            # Gemini precisa de mais info → abre nova rodada
            proxima_rodada = max((r.rodada for r in historico), default=0) + 1
            nova_rodada = RodadaElicitacao(
                rodada=proxima_rodada,
                perguntas=perguntas_adicionais,
                respostas=[],
                pronto=False,
            )
            _salvar_rodada(project_id, nova_rodada)
            _atualizar_status_projeto(project_id, perguntas_adicionais)
            return {
                "status": ProjectStatus.ELICITANDO.value,
                "rodada": proxima_rodada,
                "perguntas": [
                    {"id": p.id, "texto": p.texto, "opcoes": p.opcoes, "permite_texto": p.permite_texto}
                    for p in perguntas_adicionais
                ],
            }

        # Tem informação suficiente → aguardar aprovação humana
        db.collection("projects").document(project_id).update(
            {
                "status": ProjectStatus.AGUARDANDO_APROVACAO_ESCOPO.value,
                "resumo_escopo": resumo_markdown,
                "perguntas_abertas": [],
            }
        )
        return {
            "status": ProjectStatus.AGUARDANDO_APROVACAO_ESCOPO.value,
            "resumo_escopo": resumo_markdown,
        }

    def aprovar_escopo(self, project_id: str) -> dict:
        """Usuário aprovou o escopo → gerar artefatos."""
        db = get_client()
        doc = db.collection("projects").document(project_id).get()
        if not doc.exists:
            raise ValueError(f"Projeto {project_id} não encontrado.")
        data = doc.to_dict() or {}
        idea = data.get("raw_idea", "")
        historico = _carregar_historico(project_id)
        return self._gerar_artefatos(project_id, idea, historico)

    def revisar_escopo(self, project_id: str, feedback: str) -> dict:
        """Usuário enviou feedback de revisão.

        Gemini analisa e decide:
        - precisa_mais_info: true  → nova rodada de perguntas (ELICITANDO)
        - precisa_mais_info: false → resumo atualizado (AGUARDANDO_APROVACAO_ESCOPO)
        """
        db = get_client()
        doc = db.collection("projects").document(project_id).get()
        if not doc.exists:
            raise ValueError(f"Projeto {project_id} não encontrado.")
        data = doc.to_dict() or {}
        idea = data.get("raw_idea", "")
        historico = _carregar_historico(project_id)
        return self._gerar_resumo_escopo(project_id, idea, historico, feedback=feedback)

    def _gerar_artefatos(self, project_id: str, idea: str, historico: list[RodadaElicitacao]) -> dict:
        """Gera artefatos via pipeline ADK: ArtifactsAgent → SpecAgent.

        Fallback para google-genai direto se ADK falhar (quota/billing).
        """
        from .artefatos import GeneratedArtifactsV2, generate_artifacts_from_history
        from .ai_client import InvalidResponseError

        db = get_client()
        db.collection("projects").document(project_id).update(
            {"status": ProjectStatus.GERANDO_ADR.value}
        )

        # Recuperar resumo de escopo aprovado
        doc = db.collection("projects").document(project_id).get()
        resumo_escopo = (doc.to_dict() or {}).get("resumo_escopo", "")

        # ── Tentar ADK SequentialAgent: ArtifactsAgent → SpecAgent ──────────
        from .agents.pipeline import run_artifacts_pipeline_sync
        historico_json = json.dumps(
            [
                {
                    "rodada": r.rodada,
                    "perguntas": [{"id": p.id, "texto": p.texto} for p in r.perguntas],
                    "respostas": [{"pergunta_id": rs.pergunta_id, "opcao": rs.opcao, "texto": rs.texto} for rs in r.respostas],
                }
                for r in historico
            ],
            ensure_ascii=False,
        )

        adk_success = False
        artefatos = None
        try:
            resultado = run_artifacts_pipeline_sync(project_id, idea, historico_json, resumo_escopo)
            if resultado.get("spec") or resultado.get("adrs"):
                adk_success = True
                artefatos = GeneratedArtifactsV2(
                    spec=resultado.get("spec", ""),
                    prd=resultado.get("prd", ""),
                    adrs=resultado.get("adrs", []),
                    tickets=resultado.get("tickets", []),
                )
                logger.info("ADK pipeline concluído para projeto %s", project_id)
        except Exception as exc:
            logger.warning("ADK ArtifactsAgent/SpecAgent falhou (%s) — usando fallback", exc)

        # ── Fallback: google-genai direto ────────────────────────────────────
        if not adk_success or artefatos is None:
            try:
                artefatos = generate_artifacts_from_history(
                    idea=idea,
                    historico=historico,
                    ai_client=self._get_client(),
                )
            except InvalidResponseError:
                db.collection("projects").document(project_id).update(
                    {"status": ProjectStatus.FALHA_PROCESSAMENTO.value, "failure_reason": "RESPOSTA_INVALIDA"}
                )
                return {"status": ProjectStatus.FALHA_PROCESSAMENTO.value}

        db.collection("projects").document(project_id).update(
            {
                "status": ProjectStatus.CONCLUIDO.value,
                "artefatos": {
                    "spec": artefatos.spec,
                    "prd": artefatos.prd,
                    "adrs": artefatos.adrs,
                    "tickets": artefatos.tickets,
                },
            }
        )

        try:
            from .rag import RagService
            RagService().save_embedding(project_id=project_id, idea=idea)
        except Exception as exc:
            logger.warning("Falha ao salvar embedding RAG: %s", exc)

        return {"status": ProjectStatus.CONCLUIDO.value}
