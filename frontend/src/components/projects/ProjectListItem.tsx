import React from 'react';
import { Project } from '../../entities/Project';
import styles from './ProjectListItem.module.css';

interface ProjectListItemProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete?: (id: string) => void;
}

const ProjectListItem: React.FC<ProjectListItemProps> = ({ project, onEdit, onDelete }) => {
  /** Projeto ainda não enviado ao pipeline — edição liberada */
  const noPipeline = !project.pipelineId;

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div>
          <h3>{project.name}</h3>
          {!noPipeline && (
            <span className={styles.pipelineTag}>🚀 No pipeline</span>
          )}
        </div>
        <div className={styles.buttonGroup}>
          {noPipeline && (
            <button onClick={() => onEdit(project)} className={styles.editButton}>
              Editar
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(project.id)}
              className={styles.deleteButton}
            >
              Excluir
            </button>
          )}
        </div>
      </div>
      <p className={styles.description}>{project.description}</p>
    </div>
  );
};

export default ProjectListItem;
