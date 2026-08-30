import React, { useEffect, useState, useCallback } from 'react';
import {
  PipelineStatusUpdate,
  subscribeToProjectStatus,
} from '../../services/pipeline/projectStatusListener';
import ElicitacaoRound from './ElicitacaoRound';
import { PerguntaElicitacao } from './ElicitacaoCard';
import { AGENT_ORCHESTRATOR_BASE_URL } from '../../config/api';
import styles from './PipelineStatusModal.module.css';

interface PipelineStatusModalProps {
  projectId: string;
  onClose: () => void;
}

const STATUS_LABELS: Record<string, string> = {
  TRIAGEM_INICIAL: 'Na fila',
  TRIAGEM_EM_ANDAMENTO: 'Processando',
  ELICITANDO: 'Aguardando suas respostas',
  GERANDO_ADR: 'Gerando documentação',
  CONCLUIDO: 'Concluído',
  AGUARDANDO_APROVACAO_ESCOPO: 'Aguardando aprovação',
  FALHA_PROCESSAMENTO: 'Falha no processamento',
  FALHA_DLQ: 'Falha no processamento',
};

const FAILED_STATUSES = new Set(['FALHA_PROCESSAMENTO', 'FALHA_DLQ']);

function toneFor(status: string | null): 'progress' | 'success' | 'error' {
  if (status === 'CONCLUIDO') return 'success';
  if (status && FAILED_STATUSES.has(status)) return 'error';
  return 'progress';
}

const PipelineStatusModal: React.FC<PipelineStatusModalProps> = ({ projectId, onClose }) => {
  const [update, setUpdate] = useState<PipelineStatusUpdate | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToProjectStatus(projectId, setUpdate);
    return unsubscribe;
  }, [projectId]);

  const status = update?.status ?? null;
  const tone = toneFor(status);
  const failed = status !== null && FAILED_STATUSES.has(status);

  const handleEnviado = useCallback((resultado: Record<string, unknown>) => {
    // onSnapshot atualiza automaticamente — nada a fazer aqui;
    // o resultado é tratado pelo Firestore em tempo real.
    console.debug('[PipelineStatusModal] respostas enviadas:', resultado);
  }, []);

  const handleDownload = useCallback(() => {
    window.open(`${AGENT_ORCHESTRATOR_BASE_URL}/projects/${projectId}/download`, '_blank');
  }, [projectId]);

  // Extrai perguntas_abertas e rodada_atual do update do Firestore
  const perguntasAbertas = (update as Record<string, unknown> | null)?.['perguntas_abertas'] as PerguntaElicitacao[] | undefined;
  const rodadaAtual = ((update as Record<string, unknown> | null)?.['rodada_atual'] as number | undefined) ?? 1;
  const prontoElicitacao = ((update as Record<string, unknown> | null)?.['pronto'] as boolean | undefined) ?? false;

  return (
    <div className={styles.modalOverlay}>
      <div
        className={styles.modalContent}
        role="dialog"
        aria-modal="true"
        aria-labelledby="pipeline-status-title"
      >
        <h2 id="pipeline-status-title">Geração automática do projeto</h2>
        <span className={styles.statusBadge} data-tone={tone}>
          {status ? STATUS_LABELS[status] ?? status : 'Aguardando...'}
        </span>

        {/* ── Estado: ELICITANDO ──────────────────────────────────────────── */}
        {status === 'ELICITANDO' && perguntasAbertas && perguntasAbertas.length > 0 && (
          <ElicitacaoRound
            perguntas={perguntasAbertas}
            rodada={rodadaAtual}
            projectId={projectId}
            pronto={prontoElicitacao}
            onEnviado={handleEnviado}
          />
        )}

        {/* ── Estado: CONCLUIDO ───────────────────────────────────────────── */}
        {status === 'CONCLUIDO' && (
          <div className={styles.concluido}>
            <p>
              Os artefatos do projeto foram gerados com sucesso! Baixe o ZIP e
              descompacte na raiz do seu repositório.
            </p>
            <button
              type="button"
              className={styles.downloadBtn}
              onClick={handleDownload}
            >
              ⬇ Baixar ZIP
            </button>
          </div>
        )}

        {/* ── Estado: FALHA ───────────────────────────────────────────────── */}
        {failed && (
          <p>
            Não foi possível concluir a geração automática dos artefatos. Você pode continuar
            usando o projeto normalmente; tente novamente mais tarde.
          </p>
        )}

        <button type="button" className={styles.closeButton} onClick={onClose}>
          Fechar
        </button>
      </div>
    </div>
  );
};

export default PipelineStatusModal;
