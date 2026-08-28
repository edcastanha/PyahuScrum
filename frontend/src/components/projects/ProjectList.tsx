import React from 'react';
import { Project } from '../../entities/Project';
import ProjectListItem from './ProjectListItem';
import styles from './ProjectList.module.css';

interface ProjectListProps {
  projects: Project[];
  onEdit: (project: Project) => void;
  onDelete?: (id: number) => void;
}

const ProjectList: React.FC<ProjectListProps> = ({ projects, onEdit, onDelete }) => {
  return (
    <div className={styles.listContainer}>
      {projects.map((project) => (
        <ProjectListItem 
          key={project.id} 
          project={project} 
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default ProjectList;
