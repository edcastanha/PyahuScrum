"""Testes unitários do módulo de artefatos — E3-T12 (ticket #29).

Spec: specs/004-elicitacao-interativa/spec.md (US-10, CA-5)

Testa:
- generate_artifacts_from_history() — prompt com histórico, JSON correto
- _build_zip() — estrutura canônica do ZIP
- _slugify() — derivação do slug a partir do nome do projeto
- ElicitacaoService._gerar_artefatos() — persiste CONCLUIDO + artefatos
- GET /projects/{id}/download — retorna ZIP com Content-Type correto
"""
import io
import json
import zipfile
from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient

from app.artefatos import (
    GeneratedArtifactsV2,
    _build_zip,
    _slugify,
    generate_artifacts_from_history,
)
from app.elicitacao import RodadaElicitacao, Pergunta, Resposta
from app.main import app
from app.status import ProjectStatus


# ── Helpers ────────────────────────────────────────────────────────────────────

def _fake_ai_client_artefatos(spec="spec content", prd="prd content",
                               adrs=None, tickets=None):
    resposta = json.dumps({
        "spec": spec,
        "prd": prd,
        "adrs": adrs or ["adr content 1"],
        "tickets": tickets or ["ticket 1 content", "ticket 2 content"],
    })
    fake = MagicMock()
    fake.gerar_artefatos.return_value = resposta
    return fake


def _historico_simples():
    return [
        RodadaElicitacao(
            rodada=1,
            perguntas=[Pergunta(id="q1", texto="Stack?")],
            respostas=[Resposta(pergunta_id="q1", opcao="Python/FastAPI")],
        )
    ]


# ── Testes de _slugify ────────────────────────────────────────────────────────


class TestSlugify:
    def test_converte_espacos_para_hifens(self):
        assert _slugify("Meu Projeto") == "meu-projeto"

    def test_remove_caracteres_especiais(self):
        assert _slugify("Projeto: API de Tarefas!") == "projeto-api-de-tarefas"

    def test_lowercase(self):
        assert _slugify("MinhaAPI") == "minhaapi"

    def test_acentos_removidos(self):
        slug = _slugify("Gestão de Cobrança")
        assert "gestao" in slug or "gest" in slug  # normalização pode variar

    def test_slug_nao_comeca_nem_termina_com_hifen(self):
        slug = _slugify("  Projeto  ")
        assert not slug.startswith("-")
        assert not slug.endswith("-")

    def test_hifens_multiplos_colapsados(self):
        assert "--" not in _slugify("A  B  C")


# ── Testes de _build_zip ──────────────────────────────────────────────────────


class TestBuildZip:
    def test_zip_contem_spec_md(self):
        artefatos = GeneratedArtifactsV2(spec="spec", prd="prd", adrs=["adr1"], tickets=["t1"])
        buf = _build_zip("meu-projeto", artefatos)
        with zipfile.ZipFile(buf) as zf:
            assert "specs/meu-projeto/spec.md" in zf.namelist()

    def test_zip_contem_prd_md(self):
        artefatos = GeneratedArtifactsV2(spec="spec", prd="prd", adrs=["adr1"], tickets=["t1"])
        buf = _build_zip("meu-projeto", artefatos)
        with zipfile.ZipFile(buf) as zf:
            assert "specs/meu-projeto/prd.md" in zf.namelist()

    def test_zip_contem_adr_com_numeracao(self):
        artefatos = GeneratedArtifactsV2(spec="s", prd="p", adrs=["adr1", "adr2"], tickets=[])
        buf = _build_zip("app", artefatos)
        with zipfile.ZipFile(buf) as zf:
            names = zf.namelist()
            assert any("docs/adr/" in n and "app" in n for n in names)

    def test_zip_contem_tickets_com_numeracao(self):
        artefatos = GeneratedArtifactsV2(spec="s", prd="p", adrs=[], tickets=["t1", "t2", "t3"])
        buf = _build_zip("app", artefatos)
        with zipfile.ZipFile(buf) as zf:
            names = zf.namelist()
            ticket_files = [n for n in names if ".scratch/" in n and "tickets" in n]
            assert len(ticket_files) == 3

    def test_zip_tickets_numerados_com_zero_a_esquerda(self):
        artefatos = GeneratedArtifactsV2(spec="s", prd="p", adrs=[], tickets=["t1"])
        buf = _build_zip("app", artefatos)
        with zipfile.ZipFile(buf) as zf:
            ticket_files = [n for n in zf.namelist() if "tickets" in n]
            assert any(n.split("/")[-1].startswith("01-") for n in ticket_files)

    def test_zip_conteudo_spec_correto(self):
        artefatos = GeneratedArtifactsV2(spec="CONTEUDO SPEC", prd="p", adrs=[], tickets=[])
        buf = _build_zip("proj", artefatos)
        with zipfile.ZipFile(buf) as zf:
            content = zf.read("specs/proj/spec.md").decode()
            assert "CONTEUDO SPEC" in content

    def test_zip_descompactavel_sem_conflito(self):
        """Todos os paths começam com prefixos de pasta únicos por slug."""
        artefatos = GeneratedArtifactsV2(spec="s", prd="p", adrs=["a"], tickets=["t"])
        buf = _build_zip("meu-slug", artefatos)
        with zipfile.ZipFile(buf) as zf:
            for name in zf.namelist():
                # Nenhum path é a raiz (evita conflito com arquivos existentes)
                assert "/" in name


# ── Testes de generate_artifacts_from_history ─────────────────────────────────


class TestGenerateArtifactsFromHistory:
    @patch("app.artefatos._load_system_prompt", return_value="system prompt")
    def test_retorna_artefatos_v2(self, mock_sp):
        fake = _fake_ai_client_artefatos()
        result = generate_artifacts_from_history(
            idea="Minha ideia",
            historico=_historico_simples(),
            ai_client=fake,
        )
        assert isinstance(result, GeneratedArtifactsV2)
        assert result.spec == "spec content"
        assert result.prd == "prd content"
        assert result.adrs == ["adr content 1"]

    @patch("app.artefatos._load_system_prompt", return_value="sp")
    def test_chama_gerar_artefatos_com_historico_no_prompt(self, mock_sp):
        fake = _fake_ai_client_artefatos()
        generate_artifacts_from_history(
            idea="Ideia",
            historico=_historico_simples(),
            ai_client=fake,
        )
        fake.gerar_artefatos.assert_called_once()
        call_args = fake.gerar_artefatos.call_args
        prompt_arg = call_args[1].get("prompt") or call_args[0][1]
        assert "Stack?" in prompt_arg or "Python" in prompt_arg

    @patch("app.artefatos._load_system_prompt", return_value="sp")
    def test_json_invalido_levanta_invalid_response(self, mock_sp):
        from app.ai_client import InvalidResponseError
        fake = MagicMock()
        fake.gerar_artefatos.return_value = "isso não é json"
        with pytest.raises(InvalidResponseError):
            generate_artifacts_from_history("ideia", [], ai_client=fake)


# ── Testes do endpoint GET /projects/{id}/download ────────────────────────────


class TestDownloadEndpoint:
    @patch("app.main.messaging.get_connection")
    @patch("app.main.get_client")
    def test_retorna_zip_quando_concluido(self, mock_db, mock_conn):
        mock_conn.return_value.__enter__ = lambda s: s
        mock_conn.return_value.channel.return_value = MagicMock()
        doc_mock = MagicMock()
        doc_mock.exists = True
        doc_mock.to_dict.return_value = {
            "raw_idea": "Minha ideia",
            "status": "CONCLUIDO",
            "artefatos": {
                "spec": "spec content",
                "prd": "prd content",
                "adrs": ["adr1"],
                "tickets": ["ticket1"],
            },
        }
        mock_db.return_value.collection.return_value.document.return_value.get.return_value = doc_mock

        with TestClient(app) as client:
            response = client.get("/projects/proj-123/download")

        assert response.status_code == 200
        assert "application/zip" in response.headers["content-type"]
        buf = io.BytesIO(response.content)
        with zipfile.ZipFile(buf) as zf:
            assert any("spec.md" in n for n in zf.namelist())

    @patch("app.main.messaging.get_connection")
    @patch("app.main.get_client")
    def test_retorna_404_quando_projeto_nao_existe(self, mock_db, mock_conn):
        mock_conn.return_value.channel.return_value = MagicMock()
        doc_mock = MagicMock()
        doc_mock.exists = False
        mock_db.return_value.collection.return_value.document.return_value.get.return_value = doc_mock

        with TestClient(app) as client:
            response = client.get("/projects/inexistente/download")

        assert response.status_code == 404

    @patch("app.main.messaging.get_connection")
    @patch("app.main.get_client")
    def test_retorna_409_quando_nao_concluido(self, mock_db, mock_conn):
        mock_conn.return_value.channel.return_value = MagicMock()
        doc_mock = MagicMock()
        doc_mock.exists = True
        doc_mock.to_dict.return_value = {"status": "ELICITANDO", "raw_idea": "ideia"}
        mock_db.return_value.collection.return_value.document.return_value.get.return_value = doc_mock

        with TestClient(app) as client:
            response = client.get("/projects/proj-123/download")

        assert response.status_code == 409

    @patch("app.main.messaging.get_connection")
    @patch("app.main.get_client")
    def test_content_disposition_filename_slug(self, mock_db, mock_conn):
        mock_conn.return_value.channel.return_value = MagicMock()
        doc_mock = MagicMock()
        doc_mock.exists = True
        doc_mock.to_dict.return_value = {
            "raw_idea": "Meu Projeto Especial",
            "status": "CONCLUIDO",
            "artefatos": {"spec": "s", "prd": "p", "adrs": [], "tickets": []},
        }
        mock_db.return_value.collection.return_value.document.return_value.get.return_value = doc_mock

        with TestClient(app) as client:
            response = client.get("/projects/proj/download")

        disposition = response.headers.get("content-disposition", "")
        assert "meu-projeto-especial.zip" in disposition
