import React, { useState, useEffect } from 'react';
import { ProjectListItem, subscribeToProjectsByStatus } from '../../services/pipeline/projectStatusListener';
import PipelineProjectCard from '../../components/projects/PipelineProjectCard';
import styles from './PipelinePage.module.css';

/**
 * Página: Em Progresso
 * Projetos com todas as rodadas respondidas, aguardando aprovação ou gerando artefatos.
 */
const ProgressoPage: React.FC = () => {
  const [projects, setProjects] = useState<ProjectListItem[]>([]);

  useEffect(() => {
    const unsub = subscribeToProjectsByStatus(
      ['AGUARDANDO_APROVACAO_ESCOPO', 'GERANDO_ADR'],
      setProjects,
    );
    return unsub;
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>⚙️ Em Progresso</h1>
        <p className={styles.subtitle}>
          Projetos com todas as rodadas respondidas — aguardando aprovação ou gerando documentação.
        </p>
      </div>

      {projects.length === 0 ? (
        <p className={styles.empty}>
          Nenhum projeto em progresso no momento.
        </p>
      ) : (
        <div className={styles.grid}>
          {projects.map(p => (
            <PipelineProjectCard
              key={p.id}
              projectId={p.id}
              rawIdea={p.raw_idea}
              status={p.status}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProgressoPage;
