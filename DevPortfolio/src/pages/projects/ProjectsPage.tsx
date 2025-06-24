import React, { useState } from 'react';
import ProjectList from '../../components/projects/ProjectList';
import { mockProjects } from '../../services/mock/projectMock';
import styles from './ProjectsPage.module.css';

const ProjectsPage: React.FC = () => {
  const [projects] = useState(mockProjects);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Meus Projetos</h1>
        <button className={styles.addButton}>Adicionar Projeto</button>
      </div>
      <ProjectList projects={projects} />
    </div>
  );
};

export default ProjectsPage;
