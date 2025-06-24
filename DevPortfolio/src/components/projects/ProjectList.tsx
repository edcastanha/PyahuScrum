import React from 'react';
import { Project } from '../../entities/Project';
import ProjectListItem from './ProjectListItem';
import styles from './ProjectList.module.css';

interface ProjectListProps {
  projects: Project[];
}

const ProjectList: React.FC<ProjectListProps> = ({ projects }) => {
  return (
    <div className={styles.listContainer}>
      {projects.map((project) => (
        <ProjectListItem key={project.id} project={project} />
      ))}
    </div>
  );
};

export default ProjectList;
