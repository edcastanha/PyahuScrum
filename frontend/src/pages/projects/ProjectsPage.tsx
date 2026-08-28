import React, { useState, useEffect } from 'react';
import ProjectList from '../../components/projects/ProjectList';
import styles from './ProjectsPage.module.css';
import ProjectForm from '../../components/projects/ProjectForm';
import { Project } from '../../entities/Project';
import { projectService } from '../../services/project/projectService';
import { activityService } from '../../services/activity/activityService';
import { useToast } from '../../context/ToastContext';

const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const { showToast } = useToast();

  // Carregar projetos do serviço
  useEffect(() => {
    setProjects(projectService.getProjects());
  }, []);

  const handleAddProject = () => {
    setSelectedProject(null);
    setIsFormOpen(true);
  };

  const handleEditProject = (project: Project) => {
    setSelectedProject(project);
    setIsFormOpen(true);
  };

  const handleSaveProject = (project: Project) => {
    try {
      // Salva o projeto usando o serviço
      const savedProject = projectService.saveProject(project);
      
      // Atualiza a lista local de projetos
      let updatedProjects = [];
      const isNewProject = !selectedProject;
      
      if (selectedProject) {
        updatedProjects = projects.map((p: Project) => p.id === savedProject.id ? savedProject : p);
        setProjects(updatedProjects);
        
        // Registra atividade de atualização
        activityService.addActivity({
          type: 'project_updated',
          entityId: savedProject.id,
          entityName: savedProject.name,
          message: `Progresso atualizado para ${savedProject.progress}%`
        });
        
        // Mostra toast de sucesso
        showToast('success', `Projeto "${savedProject.name}" atualizado com sucesso!`);
      } else {
        updatedProjects = [...projects, savedProject];
        setProjects(updatedProjects);
        
        // Registra atividade de criação
        activityService.addActivity({
          type: 'project_created',
          entityId: savedProject.id,
          entityName: savedProject.name,
          message: 'Novo projeto criado'
        });
        
        // Mostra toast de sucesso
        showToast('success', `Projeto "${savedProject.name}" criado com sucesso!`);
      }
      
      // Emite um evento customizado para notificar outros componentes
      const event = new CustomEvent('projectsUpdated', {
        detail: { projects: updatedProjects }
      });
      window.dispatchEvent(event);
      
      setIsFormOpen(false);
    } catch (error) {
      console.error('Erro ao salvar projeto:', error);
      showToast('error', 'Erro ao salvar projeto. Tente novamente.');
    }
  };

  const handleCancel = () => {
    setIsFormOpen(false);
  };
  
  const handleDeleteProject = (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este projeto?')) {
      const projectToDelete = projects.find((p: Project) => p.id === id);
      
      if (projectToDelete) {
        try {
          // Exclui o projeto
          projectService.deleteProject(id);
          
          // Atualiza a lista local
          const updatedProjects = projects.filter((p: Project) => p.id !== id);
          setProjects(updatedProjects);
          
          // Registra a atividade
          activityService.addActivity({
            type: 'project_updated',
            entityId: id,
            entityName: projectToDelete.name,
            message: 'Projeto excluído'
          });
          
          // Emite um evento customizado para notificar outros componentes
          const event = new CustomEvent('projectsUpdated', {
            detail: { projects: updatedProjects }
          });
          window.dispatchEvent(event);
          
          // Mostra toast de sucesso
          showToast('success', `Projeto "${projectToDelete.name}" excluído com sucesso!`);
        } catch (error) {
          console.error('Erro ao excluir projeto:', error);
          showToast('error', 'Erro ao excluir projeto. Tente novamente.');
        }
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Meus Projetos</h1>
        <button onClick={handleAddProject} className={styles.addButton}>Adicionar Projeto</button>
      </div>
      <ProjectList 
        projects={projects} 
        onEdit={handleEditProject} 
        onDelete={handleDeleteProject}
      />
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
