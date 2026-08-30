import React, { useState, useEffect } from 'react';
import { ProjectListItem, subscribeToProjectsByStatus } from '../../services/pipeline/projectStatusListener';
import PipelineProjectCard from '../../components/projects/PipelineProjectCard';
import styles from './PipelinePage.module.css';

/**
 * Página: Em Elicitação
 * Mostra projetos em TRIAGEM_INICIAL ou ELICITANDO com histórico de rodadas ativas.
 */
const ElicitacaoPage: React.FC = () => {
  const [projects, setProjects] = useState<ProjectListItem[]>([]);

  useEffect(() => {
    const unsub = subscribeToProjectsByStatus(['TRIAGEM_INICIAL', 'ELICITANDO'], setProjects);
    return unsub;
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>💬 Em Elicitação</h1>
        <p className={styles.subtitle}>
          Projetos aguardando ou respondendo às rodadas de perguntas do Gemini.
        </p>
      </div>

      {projects.length === 0 ? (
        <p className={styles.empty}>
          Nenhum projeto em elicitação no momento.{' '}
          <a href="/projects">Crie um projeto</a> para iniciar o pipeline.
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

export default ElicitacaoPage;
