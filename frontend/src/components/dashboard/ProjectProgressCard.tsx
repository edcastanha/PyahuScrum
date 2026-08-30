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
      </div>
      <p className={styles.description}>{project.description}</p>
    </div>
  );
};

export default React.memo(ProjectProgressCard);
