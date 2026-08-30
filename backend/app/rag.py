"""Módulo RAG (Recuperação de Histórico) — ticket #20.

Gera embeddings das ideias dos projetos e realiza busca por similaridade de
cosseno em Python — o Firestore emulado não suporta índice vetorial nativo
(ADR-005). Quando migrar para Firestore real, o índice vetorial nativo pode
substituir o cálculo local sem mudar a interface pública deste módulo.

Spec: docs/adr/004-arquitetura-orientada-a-eventos-google-cloud.md (RAG)
      docs/adr/005-stack-local-mvp-3-dias.md (fallback cosseno em Python)
"""
import logging
import math
import os
from typing import Any

from .firestore_client import get_client

logger = logging.getLogger(__name__)

RAG_TOP_K = int(os.environ.get("RAG_TOP_K", "3"))


# ── Utilitários matemáticos ───────────────────────────────────────────────────


def _cosine_similarity(a: list[float], b: list[float]) -> float:
    """Similaridade de cosseno entre dois vetores de mesma dimensão.

    Retorna valor em [-1, 1]. Vetores nulos retornam 0.0 (sem similaridade).
    """
    if len(a) != len(b):
        raise ValueError(f"Vetores com dimensões diferentes: {len(a)} vs {len(b)}")
    dot = sum(x * y for x, y in zip(a, b))
    norm_a = math.sqrt(sum(x * x for x in a))
    norm_b = math.sqrt(sum(x * x for x in b))
    if norm_a == 0.0 or norm_b == 0.0:
        return 0.0
    return dot / (norm_a * norm_b)


# ── Cliente de embeddings padrão ──────────────────────────────────────────────


class GeminiEmbedClient:
    """Gera embeddings usando a Gemini Embeddings API.

    O mesmo `GEMINI_API_KEY` / `GOOGLE_API_KEY` usado para geração de texto.
    Modelo: text-embedding-004 (768 dimensões, multilíngue).
    """

    MODEL = "models/text-embedding-004"

    def embed(self, text: str) -> list[float]:
        from google import genai  # lazy import — não exige credencial em import-time

        client = genai.Client()
        response = client.models.embed_content(model=self.MODEL, contents=text)
        values = response.embeddings[0].values if response.embeddings else []
        return list(values) if values else []


# ── RagService ────────────────────────────────────────────────────────────────


class RagService:
    """Serviço de recuperação de histórico por similaridade.

    O `embed_client` é injetado para permitir fake em testes.
    Se não fornecido, usa `GeminiEmbedClient` real.
    """

    def __init__(self, embed_client=None):
        self._embed = embed_client or GeminiEmbedClient()

    def save_embedding(self, project_id: str, idea: str) -> None:
        """Gera e persiste o embedding da ideia no documento do projeto.

        Falha silenciosa: se o embedding falhar, o fluxo principal não quebra.
        """
        try:
            vector = self._embed.embed(idea)
            get_client().collection("projects").document(project_id).update(
                {"embedding": vector}
            )
            logger.info("Embedding salvo para projeto %s (%d dims)", project_id, len(vector))
        except Exception as exc:
            logger.warning("Falha ao salvar embedding do projeto %s: %s", project_id, exc)

    def retrieve_similar(
        self,
        idea: str,
        top_k: int = RAG_TOP_K,
        exclude_id: str = "",
    ) -> list[dict[str, Any]]:
        """Recupera os top-K projetos mais similares à ideia.

        - Gera embedding da ideia atual
        - Lê todos os documentos do Firestore (que já possuem embedding)
        - Calcula similaridade de cosseno em Python
        - Retorna os top-K mais similares, excluindo o projeto atual
        """
        try:
            query_vec = self._embed.embed(idea)
        except Exception as exc:
            logger.warning("Falha ao gerar embedding da query: %s", exc)
            return []

        docs = get_client().collection("projects").stream()
        scored: list[tuple[float, dict]] = []

        for doc in docs:
            if doc.id == exclude_id:
                continue
            data = doc.to_dict() or {}
            embedding = data.get("embedding")
            if not embedding or not isinstance(embedding, list):
                continue
            try:
                score = _cosine_similarity(query_vec, embedding)
                scored.append((score, {"id": doc.id, **data}))
            except ValueError:
                continue  # dimensões incompatíveis — ignorar

        scored.sort(key=lambda x: x[0], reverse=True)
        return [item for _, item in scored[:top_k]]

    def build_rag_context(self, similar: list[dict[str, Any]]) -> str:
        """Formata os projetos similares como contexto para o prompt do Gemini."""
        if not similar:
            return ""
        parts = ["\n## Projetos similares no histórico (RAG)\n"]
        for i, proj in enumerate(similar, 1):
            idea = proj.get("raw_idea", "(sem ideia registrada)")
            spec = proj.get("artefatos", {}).get("spec", "") if proj.get("artefatos") else ""
            parts.append(f"### Projeto {i}: {idea[:100]}")
            if spec:
                # Injeta só as primeiras 500 chars do spec para não inflar o prompt
                parts.append(f"Spec (trecho):\n{spec[:500]}...")
            parts.append("")
        return "\n".join(parts)
