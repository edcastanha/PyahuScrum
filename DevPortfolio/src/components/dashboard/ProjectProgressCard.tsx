import React from 'react';
import { Project } from '../../entities/Project';
import styles from './ProjectProgressCard.module.css';

interface ProjectProgressCardProps {
  project: Project;
}

const ProjectProgressCard: React.FC<ProjectProgressCardProps> = ({ project }) => {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <span>{project.name}</span>
        <span className={`${styles.status} ${styles[project.status]}`}>
          {project.status}
        </span>
      </div>
      <p className={styles.description}>{project.description}</p>
      <div className={styles.progressBarContainer}>
        <div
          className={styles.progressBar}
          style={{ width: `${project.progress}%` }}
        ></div>
      </div>
      <div className={styles.progressText}>{project.progress}% Concluído</div>
    </div>
  );
};

export default ProjectProgressCard;
