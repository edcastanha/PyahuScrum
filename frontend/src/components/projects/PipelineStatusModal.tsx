import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  PipelineStatusUpdate,
  subscribeToProjectStatus,
} from '../../services/pipeline/projectStatusListener';
import styles from './PipelineStatusModal.module.css';

interface PipelineStatusModalProps {
  projectId: string;
  onClose: () => void;
}

// Fonte de verdade do vocabulário: backend/app/status.py (ProjectStatus) e
// CONTEXT.md. Sem tipos compartilhados entre backend (Python) e frontend
// (TS) hoje -- um status novo cai no fallback `status` cru (linha abaixo),
// sem quebrar, mas sem tradução amigável até este mapa ser atualizado.
const STATUS_LABELS: Record<string, string> = {
  TRIAGEM_INICIAL: 'Na fila',
  TRIAGEM_EM_ANDAMENTO: 'Processando',
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

        {failed && (
          <p>
            Não foi possível concluir a geração automática dos artefatos. Você pode continuar
            usando o projeto normalmente; tente novamente mais tarde.
          </p>
        )}

        {status === 'CONCLUIDO' && (
          <>
            {update?.readme && (
              <div className={styles.artifactSection}>
                <h3>README</h3>
                <div className={styles.markdown}>
                  <ReactMarkdown>{update.readme}</ReactMarkdown>
                </div>
              </div>
            )}
            {update?.adrs && update.adrs.length > 0 && (
              <div className={styles.artifactSection}>
                <h3>ADRs</h3>
                {update.adrs.map((adr, index) => (
                  <div className={styles.markdown} key={index}>
                    <ReactMarkdown>{adr}</ReactMarkdown>
                  </div>
                ))}
              </div>
            )}
            {update?.tickets && update.tickets.length > 0 && (
              <div className={styles.artifactSection}>
                <h3>Tickets</h3>
                {update.tickets.map((ticket, index) => (
                  <div className={styles.markdown} key={index}>
                    <ReactMarkdown>{ticket}</ReactMarkdown>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        <button type="button" className={styles.closeButton} onClick={onClose}>
          Fechar
        </button>
      </div>
    </div>
  );
};

export default PipelineStatusModal;
