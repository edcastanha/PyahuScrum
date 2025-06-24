import React from 'react';
import { Project } from '../../entities/Project';
import styles from './ProjectListItem.module.css';

interface ProjectListItemProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete?: (id: number) => void;
}

const ProjectListItem: React.FC<ProjectListItemProps> = ({ project, onEdit, onDelete }) => {
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'active':
        return styles.active;
      case 'completed':
        return styles.completed;
      case 'inactive':
        return styles.inactive;
      default:
        return '';
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h3>{project.name}</h3>
        <div className={styles.headerActions}>
          <span className={`${styles.status} ${getStatusClass(project.status)}`}>
            {project.status}
          </span>
          <div className={styles.buttonGroup}>
            <button onClick={() => onEdit(project)} className={styles.editButton}>Editar</button>
            {onDelete && (
              <button onClick={() => onDelete(project.id)} className={styles.deleteButton}>
                Excluir
              </button>
            )}
          </div>
        </div>
      </div>
      <p>{project.description}</p>
      <div className={styles.progressBarContainer}>
        <div
          className={styles.progressBar}
          style={{ width: `${project.progress}%` }}
        ></div>
      </div>
      <span>{project.progress}%</span>
    </div>
  );
};

export default ProjectListItem;
