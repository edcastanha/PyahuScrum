import React, { useState, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { ProjectListItem, subscribeToProjectsByStatus, subscribeToProjectStatus } from '../../services/pipeline/projectStatusListener';
import { deleteProjectFromPipeline } from '../../services/pipeline/pipelineService';
import { AGENT_ORCHESTRATOR_BASE_URL } from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import styles from './ProgressoPage.module.css';

// ── Serviços ────────────────────────────────────────────────────────────────────

async function aprovarEscopo(projectId: string): Promise<void> {
  const resp = await fetch(`${AGENT_ORCHESTRATOR_BASE_URL}/projects/${projectId}/aprovar`, {
    method: 'POST',
  });
  if (!resp.ok && resp.status !== 202) throw new Error(`HTTP ${resp.status}`);
}

async function enviarRevisao(projectId: string, feedback: string): Promise<void> {
  const resp = await fetch(`${AGENT_ORCHESTRATOR_BASE_URL}/projects/${projectId}/revisao`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ feedback }),
  });
  if (!resp.ok && resp.status !== 202) throw new Error(`HTTP ${resp.status}`);
}

// ── Modal de Revisão ────────────────────────────────────────────────────────────

interface RevisaoModalProps {
  projectId: string;
  onClose: () => void;
}

const RevisaoModal: React.FC<RevisaoModalProps> = ({ projectId, onClose }) => {
  const [feedback, setFeedback] = useState('');
  const [enviando, setEnviando] = useState(false);

  const handleEnviar = async () => {
    if (!feedback.trim()) return;
    setEnviando(true);
    try {
      await enviarRevisao(projectId, feedback);
      onClose();
    } catch (err) {
      console.error('Erro ao enviar revisão:', err);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <h3 className={styles.modalTitle}>📝 Revisão de Escopo</h3>
        <p className={styles.modalSubtitle}>
          Descreva o que precisa ser ajustado, esclarecido ou adicionado ao escopo.
          O Gemini analisará e poderá fazer novas perguntas ou atualizar o resumo.
        </p>
        <textarea
          className={styles.modalTextarea}
          value={feedback}
          onChange={e => setFeedback(e.target.value)}
          placeholder="Ex: Quero focar em usuários mobile. Não mencionei que o sistema precisa de suporte a múltiplos idiomas..."
          rows={6}
          autoFocus
        />
        <div className={styles.modalActions}>
          <button className={styles.btnSecondary} onClick={onClose} disabled={enviando}>
            Cancelar
          </button>
          <button
            className={styles.btnPrimary}
            onClick={handleEnviar}
            disabled={!feedback.trim() || enviando}
          >
            {enviando ? 'Enviando…' : '🔄 Enviar para análise'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Card de Aprovação ────────────────────────────────────────────────────────────

interface AprovacaoCardProps {
  project: ProjectListItem;
}

const STATUS_LABEL: Record<string, string> = {
  AGUARDANDO_APROVACAO_ESCOPO: '🔍 Aguardando aprovação',
  GERANDO_ADR: '⚙️ Gerando documentação…',
};

const AprovacaoCard: React.FC<AprovacaoCardProps> = ({ project }) => {
  const [resumo, setResumo] = useState<string>('');
  const [status, setStatus] = useState(project.status);
  const [expandido, setExpandido] = useState(true);
  const [aprovando, setAprovando] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);
  const [deletando, setDeletando] = useState(false);

  // onSnapshot do documento para pegar resumo_escopo e status em tempo real
  useEffect(() => {
    const unsub = subscribeToProjectStatus(project.id, update => {
      setStatus(update.status);
      if (update.resumo_escopo) setResumo(update.resumo_escopo as string);
    });
    return unsub;
  }, [project.id]);

  const handleAprovar = useCallback(async () => {
    setAprovando(true);
    try {
      await aprovarEscopo(project.id);
    } catch (err) {
      console.error('Erro ao aprovar:', err);
      setAprovando(false);
    }
    // status será atualizado via onSnapshot
  }, [project.id]);

  const handleDelete = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Excluir este projeto? Todos os artefatos e histórico serão removidos permanentemente.')) return;
    setDeletando(true);
    try { await deleteProjectFromPipeline(project.id); }
    catch (err) { console.error('Erro ao excluir:', err); setDeletando(false); }
  }, [project.id]);

  const estaGerandoAdr = status === 'GERANDO_ADR';

  return (
    <>
      <div className={styles.card}>
        <div className={styles.cardHeader} onClick={() => setExpandido(e => !e)}>
          <div>
            <p className={styles.cardIdeia}>{project.raw_idea}</p>
            <span className={styles.statusBadge}>{STATUS_LABEL[status] ?? status}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className={styles.toggle}>{expandido ? '▾' : '▸'}</span>
            <button
              onClick={handleDelete}
              disabled={deletando || estaGerandoAdr}
              title="Excluir projeto"
              style={{
                background: 'transparent',
                border: '1px solid rgba(248,113,113,0.3)',
                color: '#f87171',
                borderRadius: '6px',
                padding: '4px 9px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                opacity: deletando ? 0.5 : 1,
              }}
            >
              {deletando ? '⏳' : '🗑'}
            </button>
          </div>
        </div>

        {expandido && (
          <div className={styles.cardBody}>
            {estaGerandoAdr ? (
              <div className={styles.gerando}>
                <div className={styles.spinner} />
                <p>Gerando spec, PRD, ADRs e tickets…</p>
              </div>
            ) : (
              <>
                {resumo ? (
                  <div className={styles.resumoMarkdown}>
                    <ReactMarkdown>{resumo}</ReactMarkdown>
                  </div>
                ) : (
                  <p className={styles.empty}>Carregando resumo de escopo…</p>
                )}

                <div className={styles.acoes}>
                  <button
                    className={styles.btnRevisao}
                    onClick={() => setModalAberto(true)}
                    disabled={aprovando}
                  >
                    📝 Solicitar revisão
                  </button>
                  <button
                    className={styles.btnAprovar}
                    onClick={handleAprovar}
                    disabled={aprovando || !resumo}
                  >
                    {aprovando ? 'Processando…' : '✅ Aprovar e gerar artefatos'}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {modalAberto && (
        <RevisaoModal projectId={project.id} onClose={() => setModalAberto(false)} />
      )}
    </>
  );
};

// ── Página ────────────────────────────────────────────────────────────────────────

const ProgressoPage: React.FC = () => {
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const { githubLogin } = useAuth();

  useEffect(() => {
    const unsub = subscribeToProjectsByStatus(
      ['AGUARDANDO_APROVACAO_ESCOPO', 'GERANDO_ADR'],
      setProjects,
      githubLogin,
    );
    return unsub;
  }, [githubLogin]);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>⚙️ Em Progresso</h1>
        <p className={styles.subtitle}>
          Projetos com elicitação concluída — revise o escopo gerado pelo Gemini e aprove para gerar os artefatos.
        </p>
      </div>

      {projects.length === 0 ? (
        <p className={styles.empty}>
          Nenhum projeto aguardando aprovação no momento.
        </p>
      ) : (
        <div className={styles.grid}>
          {projects.map(p => (
            <AprovacaoCard key={p.id} project={p} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProgressoPage;
