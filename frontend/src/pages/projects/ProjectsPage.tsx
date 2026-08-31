import React, { useState, useEffect, useCallback } from 'react';
import styles from './ProjectsPage.module.css';
import ProjectForm from '../../components/projects/ProjectForm';
import PipelineStatusModal from '../../components/projects/PipelineStatusModal';
import { Project } from '../../entities/Project';
import { ProjectListItem, subscribeToAllProjectsByOwner } from '../../services/pipeline/projectStatusListener';
import { createPipelineRequest, deleteProjectFromPipeline } from '../../services/pipeline/pipelineService';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

const STATUS_LABEL: Record<string, string> = {
  TRIAGEM_INICIAL: '⏳ Na fila',
  ELICITANDO: '💬 Em elicitação',
  AGUARDANDO_APROVACAO_ESCOPO: '🔍 Aguardando aprovação',
  GERANDO_ADR: '⚙️ Gerando documentação',
  CONCLUIDO: '✅ Concluído',
  FALHA_PROCESSAMENTO: '❌ Falha',
  FALHA_DLQ: '🚨 Falha crítica',
};

/**
 * ProjectsPage — Firestore é a única fonte de verdade.
 * Nenhum dado de projeto é gravado no localStorage.
 * O delete cascade usa o ID do Firestore diretamente.
 */
const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [pipelineProjectId, setPipelineProjectId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { showToast } = useToast();
  const { githubLogin } = useAuth();

  // ── Fonte de verdade: Firestore via onSnapshot ──────────────────────────────
  useEffect(() => {
    if (!githubLogin) return;
    const unsub = subscribeToAllProjectsByOwner(githubLogin, setProjects);
    return unsub;
  }, [githubLogin]);

  // ── Criar novo projeto — direto no pipeline, sem localStorage ───────────────
  const handleSaveProject = useCallback(async (project: Project) => {
    const idea = `${project.name}: ${project.description}`;
    try {
      const pipelineRequest = await createPipelineRequest(idea, githubLogin);
      setPipelineProjectId(pipelineRequest.id);
      setIsFormOpen(false);
      showToast('success', 'Projeto enviado ao pipeline! Acompanhe o progresso abaixo.');
    } catch (err) {
      console.error('Erro ao criar projeto:', err);
      showToast('error', 'Não foi possível criar o projeto. Tente novamente.');
    }
  }, [githubLogin, showToast]);

  // ── Excluir projeto — cascade no Firestore via ID direto ────────────────────
  const handleDelete = useCallback(async (projectId: string, rawIdea: string) => {
    if (!window.confirm(
      `Excluir este projeto?\n\n"${rawIdea.substring(0, 80)}"\n\nTodos os artefatos e rodadas de elicitação serão removidos permanentemente.`
    )) return;

    setDeletingId(projectId);
    try {
      await deleteProjectFromPipeline(projectId);
      // onSnapshot remove o card automaticamente quando o doc sumir do Firestore
      showToast('success', 'Projeto excluído com sucesso!');
    } catch (err) {
      console.error('Erro ao excluir projeto:', err);
      showToast('error', 'Erro ao excluir projeto. Tente novamente.');
      setDeletingId(null);
    }
  }, [showToast]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Meus Projetos</h1>
        <button onClick={() => setIsFormOpen(true)} className={styles.addButton}>
          + Novo Projeto
        </button>
      </div>

      {projects.length === 0 && (
        <p className={styles.empty}>
          Nenhum projeto ainda.{' '}
          <button className={styles.linkBtn} onClick={() => setIsFormOpen(true)}>
            Criar o primeiro projeto
          </button>
        </p>
      )}

      <div className={styles.list}>
        {projects.map(p => (
          <div
            key={p.id}
            className={`${styles.card} ${deletingId === p.id ? styles.cardDeletando : ''}`}
          >
            <div className={styles.cardHeader}>
              <div>
                <p className={styles.cardIdea}>{p.raw_idea}</p>
                <span className={styles.statusBadge}>{STATUS_LABEL[p.status] ?? p.status}</span>
              </div>
              <button
                className={styles.deleteBtn}
                onClick={() => handleDelete(p.id, p.raw_idea)}
                disabled={deletingId === p.id}
                title="Excluir projeto e todos os artefatos"
              >
                {deletingId === p.id ? '⏳' : '🗑'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {isFormOpen && (
        <ProjectForm
          project={null}
          onSave={handleSaveProject}
          onCancel={() => setIsFormOpen(false)}
        />
      )}

      {pipelineProjectId && (
        <PipelineStatusModal
          projectId={pipelineProjectId}
          onClose={() => setPipelineProjectId(null)}
        />
      )}
    </div>
  );
};

export default ProjectsPage;
