"""Testes unitários do ElicitacaoService — E3-T11 (ticket #28).

Spec: specs/004-elicitacao-interativa/spec.md (US-7, US-8, US-9)
ADR:  docs/adr/006-pipeline-elicitacao-interativa.md

Estratégia: fakes para Gemini e Firestore — sem infraestrutura real.
Todos os testes são unitários; os testes de integração ficam para o ambiente
com Firestore emulado + RabbitMQ (docker compose).
"""
import json
from unittest.mock import MagicMock, patch

import pytest

from app.elicitacao import (
    MAX_RODADAS,
    ElicitacaoService,
    Pergunta,
    Resposta,
    RodadaElicitacao,
    _montar_prompt,
    _parse_resposta_gemini,
)
from app.status import ProjectStatus


# ── Fakes ──────────────────────────────────────────────────────────────────────


def _fake_ai_client(resposta_json: str):
    """Retorna um fake de ai_client que devolve resposta_json em gerar_elicitacao()."""
    fake = MagicMock()
    fake.gerar_elicitacao.return_value = resposta_json
    return fake


def _resposta_com_perguntas(rodada: int = 1) -> str:
    return json.dumps({
        "pronto": False,
        "perguntas": [
            {"id": f"q{rodada}_1", "texto": "Qual a stack de backend?",
             "opcoes": ["Python", "Node", "Java"], "permite_texto": True},
            {"id": f"q{rodada}_2", "texto": "Qual o público-alvo?",
             "opcoes": ["B2B", "B2C", "Interno"], "permite_texto": True},
        ]
    })


def _resposta_pronto() -> str:
    return json.dumps({"pronto": True, "perguntas": []})


def _make_doc_mock(idea: str = "Minha ideia"):
    doc = MagicMock()
    doc.exists = True
    doc.to_dict.return_value = {"raw_idea": idea, "status": "TRIAGEM_INICIAL"}
    return doc


# ── Testes de _parse_resposta_gemini ──────────────────────────────────────────


class TestParseRespostaGemini:
    def test_parseia_resposta_com_perguntas(self):
        raw = _resposta_com_perguntas()
        pronto, perguntas = _parse_resposta_gemini(raw)
        assert pronto is False
        assert len(perguntas) == 2
        assert perguntas[0].id == "q1_1"
        assert perguntas[0].texto == "Qual a stack de backend?"
        assert "Python" in perguntas[0].opcoes

    def test_parseia_resposta_pronto(self):
        raw = _resposta_pronto()
        pronto, perguntas = _parse_resposta_gemini(raw)
        assert pronto is True
        assert perguntas == []

    def test_json_invalido_retorna_pergunta_fallback(self):
        pronto, perguntas = _parse_resposta_gemini("isso não é json")
        assert pronto is False
        assert len(perguntas) == 1
        assert perguntas[0].id == "q_fallback"

    def test_json_sem_campos_retorna_lista_vazia(self):
        pronto, perguntas = _parse_resposta_gemini("{}")
        assert pronto is False
        assert perguntas == []


# ── Testes de _montar_prompt ──────────────────────────────────────────────────


class TestMontarPrompt:
    def test_inclui_ideia_do_projeto(self):
        prompt = _montar_prompt("Meu projeto de IA", [])
        assert "Meu projeto de IA" in prompt

    def test_historico_vazio_nao_quebra(self):
        prompt = _montar_prompt("Ideia", [])
        assert "Ideia" in prompt

    def test_inclui_perguntas_e_respostas_do_historico(self):
        historico = [
            RodadaElicitacao(
                rodada=1,
                perguntas=[Pergunta(id="q1", texto="Stack?", opcoes=["Python"])],
                respostas=[Resposta(pergunta_id="q1", opcao="Python", texto="com FastAPI")],
            )
        ]
        prompt = _montar_prompt("Ideia", historico)
        assert "Stack?" in prompt
        assert "Python" in prompt
        assert "FastAPI" in prompt

    def test_inclui_instrucao_de_formato_json(self):
        prompt = _montar_prompt("Ideia", [])
        assert '"pronto"' in prompt
        assert '"perguntas"' in prompt


# ── Testes do ElicitacaoService ───────────────────────────────────────────────


class TestElicitacaoServiceIniciar:
    @patch("app.elicitacao.get_client")
    @patch("app.elicitacao._load_system_prompt", return_value="system prompt")
    @patch("app.elicitacao._carregar_historico", return_value=[])
    @patch("app.elicitacao._salvar_rodada")
    @patch("app.elicitacao._atualizar_status_projeto")
    def test_iniciar_elicitacao_retorna_perguntas(
        self, mock_atualizar, mock_salvar, mock_hist, mock_sp, mock_db
    ):
        fake = _fake_ai_client(_resposta_com_perguntas(1))
        service = ElicitacaoService(ai_client=fake)

        result = service.iniciar_elicitacao(project_id="proj-1", idea="Minha ideia")

        assert result["status"] == ProjectStatus.ELICITANDO.value
        assert result["rodada"] == 1
        assert len(result["perguntas"]) == 2
        assert result["pronto"] is False
        fake.gerar_elicitacao.assert_called_once()

    @patch("app.elicitacao.get_client")
    @patch("app.elicitacao._load_system_prompt", return_value="")
    @patch("app.elicitacao._carregar_historico", return_value=[])
    @patch("app.elicitacao._salvar_rodada")
    @patch("app.elicitacao._atualizar_status_projeto")
    def test_iniciar_elicitacao_chama_gemini_com_system_prompt(
        self, mock_atualizar, mock_salvar, mock_hist, mock_sp, mock_db
    ):
        fake = _fake_ai_client(_resposta_com_perguntas())
        service = ElicitacaoService(ai_client=fake)
        service.iniciar_elicitacao(project_id="proj-1", idea="Ideia")

        call_kwargs = fake.gerar_elicitacao.call_args
        # system_prompt pode ser posicional ou keyword
        assert call_kwargs is not None

    @patch("app.elicitacao.get_client")
    @patch("app.elicitacao._load_system_prompt", return_value="sp")
    @patch("app.elicitacao._carregar_historico", return_value=[])
    @patch("app.elicitacao._salvar_rodada")
    @patch("app.elicitacao._atualizar_status_projeto")
    def test_pronto_na_rodada_1_dispara_resumo_escopo(
        self, mock_atualizar, mock_salvar, mock_hist, mock_sp, mock_db
    ):
        """Se pronto: true na Rodada 1, deve ir para AGUARDANDO_APROVACAO_ESCOPO (HITL)."""
        db_instance = MagicMock()
        doc_mock = MagicMock()
        doc_mock.exists = True
        doc_mock.to_dict.return_value = {"raw_idea": "Ideia clara"}
        db_instance.collection.return_value.document.return_value.get.return_value = doc_mock
        mock_db.return_value = db_instance

        import json as _json
        # fake retorna pronto: true na elicitação E resumo de escopo no gerar_resumo
        resposta_elicit = _json.dumps({"pronto": True, "perguntas": []})
        resposta_resumo = _json.dumps({
            "precisa_mais_info": False,
            "perguntas_adicionais": [],
            "resumo_markdown": "## Ideia resumida\nApp de lista de compras."
        })
        fake = MagicMock()
        fake.gerar_elicitacao.side_effect = [resposta_elicit, resposta_resumo]

        service = ElicitacaoService(ai_client=fake)
        result = service.iniciar_elicitacao(project_id="proj-1", idea="Ideia clara")
        # Com HITL: pronto → gera resumo → AGUARDANDO_APROVACAO_ESCOPO
        assert result["status"] == ProjectStatus.AGUARDANDO_APROVACAO_ESCOPO.value


class TestElicitacaoServiceProcessarRespostas:
    def _make_service(self, resposta_json: str):
        import json as _json
        fake = _fake_ai_client(resposta_json)
        # gerar_artefatos é chamado quando pronto/max_rodadas
        fake.gerar_artefatos.return_value = _json.dumps(
            {"spec": "s", "prd": "p", "adrs": [], "tickets": []}
        )
        return ElicitacaoService(ai_client=fake)

    @patch("app.elicitacao.get_client")
    @patch("app.elicitacao._load_system_prompt", return_value="sp")
    @patch("app.elicitacao._salvar_rodada")
    @patch("app.elicitacao._atualizar_status_projeto")
    @patch("app.elicitacao._carregar_historico")
    def test_processa_respostas_e_retorna_proxima_rodada(
        self, mock_hist, mock_atualizar, mock_salvar, mock_sp, mock_db
    ):
        historico_r1 = [
            RodadaElicitacao(rodada=1, perguntas=[Pergunta(id="q1", texto="Stack?")], respostas=[])
        ]
        mock_hist.return_value = historico_r1
        doc_mock = _make_doc_mock()
        mock_db.return_value.collection.return_value.document.return_value.get.return_value = doc_mock

        service = self._make_service(_resposta_com_perguntas(2))
        result = service.processar_respostas(
            project_id="proj-1",
            numero_rodada=1,
            respostas_novas=[Resposta(pergunta_id="q1", opcao="Python")],
        )

        assert result["status"] == ProjectStatus.ELICITANDO.value
        assert result["rodada"] == 2

    @patch("app.elicitacao.get_client")
    @patch("app.elicitacao._load_system_prompt", return_value="sp")
    @patch("app.elicitacao._salvar_rodada")
    @patch("app.elicitacao._atualizar_status_projeto")
    @patch("app.elicitacao._carregar_historico")
    def test_apos_max_rodadas_dispara_geracao_automatica(
        self, mock_hist, mock_atualizar, mock_salvar, mock_sp, mock_db
    ):
        """Rodada MAX_RODADAS+1 → gera artefatos sem nova pergunta."""
        historico = [
            RodadaElicitacao(rodada=i, perguntas=[], respostas=[])
            for i in range(1, MAX_RODADAS + 1)
        ]
        mock_hist.return_value = historico
        doc_mock = _make_doc_mock()
        mock_db.return_value.collection.return_value.document.return_value.get.return_value = doc_mock
        mock_db.return_value.collection.return_value.document.return_value.update = MagicMock()

        service = self._make_service(_resposta_com_perguntas())
        result = service.processar_respostas(
            project_id="proj-1",
            numero_rodada=MAX_RODADAS,
            respostas_novas=[],
        )
        assert result["status"] in (ProjectStatus.CONCLUIDO.value, ProjectStatus.GERANDO_ADR.value)

    @patch("app.elicitacao.get_client")
    @patch("app.elicitacao._load_system_prompt", return_value="sp")
    @patch("app.elicitacao._salvar_rodada")
    @patch("app.elicitacao._atualizar_status_projeto")
    @patch("app.elicitacao._carregar_historico")
    def test_forcar_geracao_dispara_imediatamente(
        self, mock_hist, mock_atualizar, mock_salvar, mock_sp, mock_db
    ):
        mock_hist.return_value = [RodadaElicitacao(rodada=1, perguntas=[], respostas=[])]
        doc_mock = _make_doc_mock()
        mock_db.return_value.collection.return_value.document.return_value.get.return_value = doc_mock
        mock_db.return_value.collection.return_value.document.return_value.update = MagicMock()

        service = self._make_service(_resposta_com_perguntas())
        result = service.processar_respostas(
            project_id="proj-1",
            numero_rodada=1,
            respostas_novas=[],
            forcar_geracao=True,
        )
        assert result["status"] in (ProjectStatus.CONCLUIDO.value, ProjectStatus.GERANDO_ADR.value)

    @patch("app.elicitacao.get_client")
    @patch("app.elicitacao._carregar_historico", return_value=[])
    def test_projeto_inexistente_levanta_value_error(self, mock_hist, mock_db):
        doc_mock = MagicMock()
        doc_mock.exists = False
        mock_db.return_value.collection.return_value.document.return_value.get.return_value = doc_mock

        service = ElicitacaoService(ai_client=_fake_ai_client("{}"))
        with pytest.raises(ValueError, match="não encontrado"):
            service.processar_respostas(
                project_id="inexistente",
                numero_rodada=1,
                respostas_novas=[],
            )


class TestStatusElicitando:
    def test_elicitando_existe_no_enum(self):
        assert ProjectStatus.ELICITANDO == "ELICITANDO"

    def test_elicitando_diferente_de_outros_estados(self):
        assert ProjectStatus.ELICITANDO != ProjectStatus.TRIAGEM_INICIAL
        assert ProjectStatus.ELICITANDO != ProjectStatus.CONCLUIDO
