import React from 'react';
import { Project } from '../../entities/Project';
import styles from './ProjectListItem.module.css';

interface ProjectListItemProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete?: (id: string) => void;
}

const ProjectListItem: React.FC<ProjectListItemProps> = ({ project, onEdit, onDelete }) => {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h3>{project.name}</h3>
        <div className={styles.buttonGroup}>
          <button onClick={() => onEdit(project)} className={styles.editButton}>
            Editar
          </button>
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
