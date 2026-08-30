"""Testes do pipeline assíncrono — wt/async-pipeline.

Testa:
- messaging: duas filas declaradas, publish para cada fila
- consumer: handle_nova_elicitacao e handle_resposta com fakes
- projects: create_project (sem fila) e delete_project (cascade)
- main: POST /projects retorna 201 + publica; POST /respostas retorna 202;
        DELETE /projects/{id} retorna 204; delete de inexistente retorna 404
"""
import json
from unittest.mock import MagicMock, call, patch

import pytest
from fastapi.testclient import TestClient

from app.consumer import handle_nova_elicitacao, handle_resposta, _project_exists
from app.messaging import (
    QUEUE_ELICITACAO,
    QUEUE_PIPELINE,
    ROUTING_ELICITACAO,
    ROUTING_PIPELINE,
)
from app.projects import create_project, delete_project
from app.status import ProjectStatus


# ── Helpers ────────────────────────────────────────────────────────────────────

def _make_doc(exists=True, data=None):
    doc = MagicMock()
    doc.exists = exists
    doc.to_dict.return_value = data or {"raw_idea": "ideia", "status": "TRIAGEM_INICIAL"}
    return doc


def _fake_ai_with_perguntas():
    """Fake que simula Gemini retornando perguntas de elicitação."""
    import json as _json
    fake = MagicMock()
    fake.gerar_elicitacao.return_value = _json.dumps({
        "pronto": False,
        "perguntas": [{"id": "q1", "texto": "Qual a stack?", "opcoes": ["Python"], "permite_texto": True}],
    })
    fake.gerar_artefatos.return_value = _json.dumps(
        {"spec": "s", "prd": "p", "adrs": [], "tickets": []}
    )
    return fake


# ── messaging ─────────────────────────────────────────────────────────────────

class TestMessagingTopology:
    def test_constantes_de_filas_definidas(self):
        assert QUEUE_PIPELINE == "pyahu.pipeline"
        assert QUEUE_ELICITACAO == "pyahu.elicitacao"
        assert ROUTING_PIPELINE == "pipeline"
        assert ROUTING_ELICITACAO == "elicitacao"

    @patch("app.messaging.get_connection")
    def test_publish_pipeline_usa_routing_correto(self, mock_conn):
        ch = MagicMock()
        mock_conn.return_value.channel.return_value = ch
        from app.messaging import publish_to_pipeline
        publish_to_pipeline({"project_id": "p1", "idea": "ideia"})
        ch.basic_publish.assert_called_once()
        kwargs = ch.basic_publish.call_args[1]
        assert kwargs["routing_key"] == ROUTING_PIPELINE

    @patch("app.messaging.get_connection")
    def test_publish_elicitacao_usa_routing_correto(self, mock_conn):
        ch = MagicMock()
        mock_conn.return_value.channel.return_value = ch
        from app.messaging import publish_to_elicitacao
        publish_to_elicitacao({"project_id": "p1", "rodada": 1, "respostas": []})
        ch.basic_publish.assert_called_once()
        kwargs = ch.basic_publish.call_args[1]
        assert kwargs["routing_key"] == ROUTING_ELICITACAO


# ── consumer ─────────────────────────────────────────────────────────────────

class TestConsumerGuard:
    @patch("app.consumer.firestore_client.get_client")
    def test_project_exists_retorna_true_se_doc_existe(self, mock_db):
        mock_db.return_value.collection.return_value.document.return_value.get.return_value = _make_doc(exists=True)
        assert _project_exists("proj-1") is True

    @patch("app.consumer.firestore_client.get_client")
    def test_project_exists_retorna_false_se_doc_nao_existe(self, mock_db):
        mock_db.return_value.collection.return_value.document.return_value.get.return_value = _make_doc(exists=False)
        assert _project_exists("proj-1") is False


class TestHandleNovaElicitacao:
    @patch("app.consumer._project_exists", return_value=False)
    def test_descarta_ack_se_projeto_nao_existe(self, _):
        result = handle_nova_elicitacao(project_id="proj-1", idea="ideia")
        assert result is True  # ack — descartado

    @patch("app.consumer._project_exists", return_value=True)
    @patch("app.elicitacao._load_system_prompt", return_value="sp")
    @patch("app.elicitacao._carregar_historico", return_value=[])
    @patch("app.elicitacao._salvar_rodada")
    @patch("app.elicitacao._atualizar_status_projeto")
    @patch("app.elicitacao.get_client")
    def test_ack_em_sucesso(self, mock_db, *_):
        result = handle_nova_elicitacao(
            project_id="proj-1",
            idea="ideia",
            ai_client=_fake_ai_with_perguntas(),
        )
        assert result is True

    @patch("app.elicitacao.get_client")
    @patch("app.elicitacao._atualizar_status_projeto")
    @patch("app.elicitacao._salvar_rodada")
    @patch("app.elicitacao._carregar_historico", return_value=[])
    @patch("app.elicitacao._load_system_prompt", return_value="sp")
    @patch("app.consumer._record_failure")
    @patch("app.consumer._project_exists", return_value=True)
    def test_nack_apos_max_tentativas(self, _exists, mock_record, *_rest):
        from app.ai_client import TransientServiceError
        fake = MagicMock()
        fake.gerar_elicitacao.side_effect = TransientServiceError("timeout")
        result = handle_nova_elicitacao(project_id="proj-1", idea="ideia", ai_client=fake)
        assert result is False
        mock_record.assert_called_once()


class TestHandleResposta:
    @patch("app.consumer._project_exists", return_value=False)
    def test_descarta_ack_se_projeto_nao_existe(self, _):
        result = handle_resposta(project_id="proj-1", numero_rodada=1, respostas=[])
        assert result is True

    @patch("app.consumer._project_exists", return_value=True)
    @patch("app.elicitacao._load_system_prompt", return_value="sp")
    @patch("app.elicitacao._salvar_rodada")
    @patch("app.elicitacao._atualizar_status_projeto")
    @patch("app.elicitacao._carregar_historico")
    @patch("app.elicitacao.get_client")
    def test_ack_em_sucesso(self, mock_db, mock_hist, *_):
        doc_mock = _make_doc()
        mock_db.return_value.collection.return_value.document.return_value.get.return_value = doc_mock
        mock_hist.return_value = []
        result = handle_resposta(
            project_id="proj-1",
            numero_rodada=1,
            respostas=[],
            ai_client=_fake_ai_with_perguntas(),
        )
        assert result is True


# ── projects CRUD ──────────────────────────────────────────────────────────────

class TestCreateProject:
    @patch("app.projects.get_client")
    def test_cria_com_status_triagem_inicial(self, mock_db):
        doc_ref = MagicMock()
        doc_ref.id = "novo-id"
        mock_db.return_value.collection.return_value.document.return_value = doc_ref
        result = create_project("Minha ideia")
        assert result["id"] == "novo-id"
        assert result["status"] == ProjectStatus.TRIAGEM_INICIAL.value

    @patch("app.projects.get_client")
    def test_nao_publica_na_fila(self, mock_db):
        """create_project só salva — quem publica é o endpoint."""
        doc_ref = MagicMock()
        doc_ref.id = "x"
        mock_db.return_value.collection.return_value.document.return_value = doc_ref
        with patch("app.messaging.publish_to_pipeline") as mock_pub:
            create_project("ideia")
            mock_pub.assert_not_called()


class TestDeleteProject:
    @patch("app.projects.get_client")
    def test_retorna_false_se_nao_existe(self, mock_db):
        mock_db.return_value.collection.return_value.document.return_value.get.return_value = _make_doc(exists=False)
        assert delete_project("inexistente") is False

    @patch("app.projects.get_client")
    def test_retorna_true_e_deleta_doc(self, mock_db):
        doc_ref = MagicMock()
        doc_ref.get.return_value = _make_doc(exists=True)
        # subcoleção retorna vazia (sem docs para deletar em lote)
        mock_db.return_value.collection.return_value.document.return_value = doc_ref
        mock_db.return_value.collection.return_value.limit.return_value.stream.return_value = iter([])
        result = delete_project("proj-1")
        assert result is True
        doc_ref.delete.assert_called_once()

    @patch("app.projects.get_client")
    def test_apaga_subcollection_elicitacao(self, mock_db):
        doc_ref = MagicMock()
        doc_ref.get.return_value = _make_doc(exists=True)
        # Simular 1 doc na subcoleção
        subdoc = MagicMock()
        mock_db.return_value.collection.return_value.document.return_value = doc_ref
        # Primeiro call retorna 1 doc, segundo retorna vazio (fim do loop)
        mock_db.return_value.collection.return_value.limit.return_value.stream.side_effect = [
            iter([subdoc]),
            iter([]),
        ]
        batch = MagicMock()
        mock_db.return_value.batch.return_value = batch
        delete_project("proj-1")
        batch.commit.assert_called()


# ── Endpoints HTTP ─────────────────────────────────────────────────────────────

class TestEndpoints:
    @patch("app.main.messaging.get_connection")
    @patch("app.main.projects.create_project", return_value={"id": "abc", "status": "TRIAGEM_INICIAL"})
    @patch("app.main.messaging.publish_to_pipeline")
    def test_post_projects_retorna_201_e_publica(self, mock_pub, mock_create, mock_conn):
        mock_conn.return_value.channel.return_value = MagicMock()
        from app.main import app
        with TestClient(app) as client:
            resp = client.post("/projects", json={"idea": "minha ideia"})
        assert resp.status_code == 201
        assert resp.json()["status"] == "TRIAGEM_INICIAL"
        mock_pub.assert_called_once()

    @patch("app.main.messaging.get_connection")
    @patch("app.main.get_client")
    @patch("app.main.messaging.publish_to_elicitacao")
    def test_post_respostas_retorna_202(self, mock_pub, mock_db, mock_conn):
        mock_conn.return_value.channel.return_value = MagicMock()
        mock_db.return_value.collection.return_value.document.return_value.get.return_value = _make_doc()
        from app.main import app
        with TestClient(app) as client:
            resp = client.post("/projects/proj-1/respostas", json={
                "rodada": 1, "respostas": [], "forcar_geracao": False,
            })
        assert resp.status_code == 202
        mock_pub.assert_called_once()

    @patch("app.main.messaging.get_connection")
    @patch("app.main.projects.delete_project", return_value=True)
    def test_delete_project_retorna_204(self, mock_del, mock_conn):
        mock_conn.return_value.channel.return_value = MagicMock()
        from app.main import app
        with TestClient(app) as client:
            resp = client.delete("/projects/proj-1")
        assert resp.status_code == 204

    @patch("app.main.messaging.get_connection")
    @patch("app.main.projects.delete_project", return_value=False)
    def test_delete_inexistente_retorna_404(self, mock_del, mock_conn):
        mock_conn.return_value.channel.return_value = MagicMock()
        from app.main import app
        with TestClient(app) as client:
            resp = client.delete("/projects/inexistente")
        assert resp.status_code == 404

    @patch("app.main.messaging.get_connection")
    @patch("app.main.get_client")
    def test_post_respostas_404_se_projeto_nao_existe(self, mock_db, mock_conn):
        mock_conn.return_value.channel.return_value = MagicMock()
        mock_db.return_value.collection.return_value.document.return_value.get.return_value = _make_doc(exists=False)
        from app.main import app
        with TestClient(app) as client:
            resp = client.post("/projects/inexistente/respostas", json={
                "rodada": 1, "respostas": [], "forcar_geracao": False,
            })
        assert resp.status_code == 404
