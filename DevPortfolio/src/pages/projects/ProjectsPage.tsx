import React, { useState } from 'react';
import ProjectList from '../../components/projects/ProjectList';
import { mockProjects } from '../../services/mock/projectMock';
import styles from './ProjectsPage.module.css';
import ProjectForm from '../../components/projects/ProjectForm';
import { Project } from '../../entities/Project';

const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState(mockProjects);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const handleAddProject = () => {
    setSelectedProject(null);
    setIsFormOpen(true);
  };

  const handleEditProject = (project: Project) => {
    setSelectedProject(project);
    setIsFormOpen(true);
  };

  const handleSaveProject = (project: Project) => {
    if (selectedProject) {
      setProjects(projects.map(p => p.id === project.id ? project : p));
    } else {
      setProjects([...projects, project]);
    }
    setIsFormOpen(false);
  };

  const handleCancel = () => {
    setIsFormOpen(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Meus Projetos</h1>
        <button onClick={handleAddProject} className={styles.addButton}>Adicionar Projeto</button>
      </div>
      <ProjectList projects={projects} onEdit={handleEditProject} />
      {isFormOpen && (
        <ProjectForm 
          project={selectedProject}
          onSave={handleSaveProject} 
          onCancel={handleCancel} 
        />
      )}
    </div>
  );
};

export default ProjectsPage;
