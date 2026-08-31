import React, { useState, useEffect } from 'react';
import { ProjectListItem, subscribeToProjectsByStatus } from '../../services/pipeline/projectStatusListener';
import PipelineProjectCard from '../../components/projects/PipelineProjectCard';
import { useAuth } from '../../context/AuthContext';
import styles from './PipelinePage.module.css';

/**
 * Página: Concluídos
 * Projetos com artefatos gerados — exibe botão de download do ZIP.
 */
const ConcluidoPage: React.FC = () => {
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const { githubLogin } = useAuth();

  useEffect(() => {
    const unsub = subscribeToProjectsByStatus(['CONCLUIDO'], setProjects, githubLogin);
    return unsub;
  }, [githubLogin]);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>✅ Concluídos</h1>
        <p className={styles.subtitle}>
          Projetos com spec, PRD, ADRs e tickets gerados — prontos para baixar.
        </p>
      </div>

      {projects.length === 0 ? (
        <p className={styles.empty}>
          Nenhum projeto concluído ainda. Responda às rodadas de elicitação para gerar os artefatos.
        </p>
      ) : (
        <div className={styles.grid}>
          {projects.map(p => (
            <PipelineProjectCard
              key={p.id}
              projectId={p.id}
              rawIdea={p.raw_idea}
              status={p.status}
              showDownload
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ConcluidoPage;
