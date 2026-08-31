"""Testes unitários do módulo RAG — ticket #20.

Spec: specs/004-elicitacao-interativa/spec.md (US-9 — RAG)
ADR:  docs/adr/004-arquitetura-orientada-a-eventos-google-cloud.md (RAG)
      docs/adr/005-stack-local-mvp-3-dias.md (fallback cosseno em Python)

Testa:
- _cosine_similarity(): cálculo correto de similaridade
- _embed(): chama o cliente de embeddings e retorna vetor
- save_embedding(): grava vetor no Firestore após conclusão
- retrieve_similar(): lê todos os docs e retorna top-K por similaridade
- RagService end-to-end com fakes
"""
import json
import math
from unittest.mock import MagicMock, patch

import pytest

from app.rag import (
    RagService,
    _cosine_similarity,
)


# ── Testes de _cosine_similarity ──────────────────────────────────────────────

class TestCosineSimilarity:
    def test_vetores_identicos_retornam_1(self):
        v = [1.0, 0.0, 0.0]
        assert _cosine_similarity(v, v) == pytest.approx(1.0)

    def test_vetores_ortogonais_retornam_0(self):
        assert _cosine_similarity([1.0, 0.0], [0.0, 1.0]) == pytest.approx(0.0)

    def test_vetores_opostos_retornam_menos_1(self):
        assert _cosine_similarity([1.0, 0.0], [-1.0, 0.0]) == pytest.approx(-1.0)

    def test_vetor_nulo_retorna_0(self):
        assert _cosine_similarity([0.0, 0.0], [1.0, 2.0]) == pytest.approx(0.0)

    def test_calculo_correto_para_valores_conhecidos(self):
        # [1,1] · [1,0] = 1; |[1,1]| = sqrt(2); |[1,0]| = 1 → cos = 1/sqrt(2)
        result = _cosine_similarity([1.0, 1.0], [1.0, 0.0])
        assert result == pytest.approx(1.0 / math.sqrt(2), abs=1e-6)

    def test_listas_de_tamanhos_diferentes_levanta_value_error(self):
        with pytest.raises(ValueError):
            _cosine_similarity([1.0, 2.0], [1.0])


# ── Testes do RagService ──────────────────────────────────────────────────────

def _fake_embed_client(vector: list[float] | None = None):
    """Fake do cliente de embeddings."""
    vec = vector or [0.1, 0.2, 0.3]
    fake = MagicMock()
    fake.embed.return_value = vec
    return fake


class TestRagServiceSaveEmbedding:
    @patch("app.rag.get_client")
    def test_salva_embedding_no_firestore(self, mock_db):
        doc_ref = MagicMock()
        mock_db.return_value.collection.return_value.document.return_value = doc_ref

        service = RagService(embed_client=_fake_embed_client([0.1, 0.2, 0.3]))
        service.save_embedding(project_id="proj-1", idea="Minha ideia")

        doc_ref.update.assert_called_once()
        call_args = doc_ref.update.call_args[0][0]
        assert "embedding" in call_args
        assert call_args["embedding"] == [0.1, 0.2, 0.3]

    @patch("app.rag.get_client")
    def test_chama_embed_com_a_ideia(self, mock_db):
        mock_db.return_value.collection.return_value.document.return_value = MagicMock()
        fake_embed = _fake_embed_client()

        service = RagService(embed_client=fake_embed)
        service.save_embedding(project_id="proj-1", idea="Minha ideia específica")

        fake_embed.embed.assert_called_once_with("Minha ideia específica")

    @patch("app.rag.get_client")
    def test_falha_silenciosa_se_embed_lancar(self, mock_db):
        """Falha no embedding nunca deve quebrar o fluxo principal."""
        mock_db.return_value.collection.return_value.document.return_value = MagicMock()
        fake_embed = MagicMock()
        fake_embed.embed.side_effect = RuntimeError("embedding falhou")

        service = RagService(embed_client=fake_embed)
        # Não deve levantar exceção
        service.save_embedding(project_id="proj-1", idea="ideia")


class TestRagServiceRetrieveSimilar:
    def _make_db_with_docs(self, docs: list[dict]):
        """Monta fake do Firestore com lista de documentos."""
        mock_docs = []
        for d in docs:
            doc = MagicMock()
            doc.id = d["id"]
            doc.to_dict.return_value = d
            mock_docs.append(doc)

        mock_db = MagicMock()
        mock_db.collection.return_value.stream.return_value = iter(mock_docs)
        return mock_db

    def test_retorna_top_k_por_similaridade(self):
        docs = [
            {"id": "p1", "raw_idea": "ideia A", "embedding": [1.0, 0.0]},
            {"id": "p2", "raw_idea": "ideia B", "embedding": [0.0, 1.0]},
            {"id": "p3", "raw_idea": "ideia C", "embedding": [0.9, 0.1]},
        ]
        mock_db = self._make_db_with_docs(docs)
        # Query vector similar a p1 e p3
        query_vec = [1.0, 0.0]
        fake_embed = _fake_embed_client(query_vec)

        with patch("app.rag.get_client", return_value=mock_db):
            service = RagService(embed_client=fake_embed)
            result = service.retrieve_similar(idea="qualquer", top_k=2, exclude_id="")

        assert len(result) == 2
        # p1 deve ser o mais similar (cosseno = 1.0)
        assert result[0]["id"] == "p1"

    def test_exclui_projeto_atual(self):
        docs = [
            {"id": "atual", "raw_idea": "ideia", "embedding": [1.0, 0.0]},
            {"id": "outro", "raw_idea": "outro", "embedding": [0.8, 0.2]},
        ]
        mock_db = self._make_db_with_docs(docs)
        fake_embed = _fake_embed_client([1.0, 0.0])

        with patch("app.rag.get_client", return_value=mock_db):
            service = RagService(embed_client=fake_embed)
            result = service.retrieve_similar(idea="x", top_k=5, exclude_id="atual")

        ids = [r["id"] for r in result]
        assert "atual" not in ids

    def test_ignora_docs_sem_embedding(self):
        docs = [
            {"id": "p1", "raw_idea": "com embedding", "embedding": [1.0, 0.0]},
            {"id": "p2", "raw_idea": "sem embedding"},
        ]
        mock_db = self._make_db_with_docs(docs)
        fake_embed = _fake_embed_client([1.0, 0.0])

        with patch("app.rag.get_client", return_value=mock_db):
            service = RagService(embed_client=fake_embed)
            result = service.retrieve_similar(idea="x", top_k=5, exclude_id="")

        ids = [r["id"] for r in result]
        assert "p2" not in ids

    def test_retorna_lista_vazia_se_nenhum_doc(self):
        mock_db = MagicMock()
        mock_db.collection.return_value.stream.return_value = iter([])
        fake_embed = _fake_embed_client()

        with patch("app.rag.get_client", return_value=mock_db):
            service = RagService(embed_client=fake_embed)
            result = service.retrieve_similar(idea="x", top_k=3, exclude_id="")

        assert result == []

    def test_top_k_limita_resultados(self):
        docs = [
            {"id": f"p{i}", "raw_idea": f"ideia {i}", "embedding": [float(i), 0.0]}
            for i in range(1, 6)
        ]
        mock_db = self._make_db_with_docs(docs)
        fake_embed = _fake_embed_client([1.0, 0.0])

        with patch("app.rag.get_client", return_value=mock_db):
            service = RagService(embed_client=fake_embed)
            result = service.retrieve_similar(idea="x", top_k=2, exclude_id="")

        assert len(result) == 2
