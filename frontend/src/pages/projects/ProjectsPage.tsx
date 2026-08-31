import React, { useState, useEffect } from 'react';
import ProjectList from '../../components/projects/ProjectList';
import styles from './ProjectsPage.module.css';
import ProjectForm from '../../components/projects/ProjectForm';
import PipelineStatusModal from '../../components/projects/PipelineStatusModal';
import { Project } from '../../entities/Project';
import { projectService } from '../../services/project/projectService';
import { activityService } from '../../services/activity/activityService';
import { createPipelineRequest, deriveIdeaFromProject, deleteProjectFromPipeline } from '../../services/pipeline/pipelineService';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [pipelineProjectId, setPipelineProjectId] = useState<string | null>(null);
  const { showToast } = useToast();
  const { githubLogin } = useAuth();

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

  const handleSaveProject = async (project: Project) => {
    try {
      const savedProject = projectService.saveProject(project);
      const isNewProject = !selectedProject;

      if (selectedProject) {
        const updated = projects.map(p => p.id === savedProject.id ? savedProject : p);
        setProjects(updated);
        activityService.addActivity({
          type: 'project_updated',
          entityId: savedProject.id,
          entityName: savedProject.name,
          message: 'Projeto atualizado',
        });
        showToast('success', `Projeto "${savedProject.name}" atualizado com sucesso!`);
        window.dispatchEvent(new CustomEvent('projectsUpdated', { detail: { projects: updated } }));
      } else {
        const updated = [...projects, savedProject];
        setProjects(updated);
        activityService.addActivity({
          type: 'project_created',
          entityId: savedProject.id,
          entityName: savedProject.name,
          message: 'Novo projeto criado',
        });
        showToast('success', `Projeto "${savedProject.name}" criado! Gerando documentação...`);
        window.dispatchEvent(new CustomEvent('projectsUpdated', { detail: { projects: updated } }));

        // Novo projeto: disparar pipeline assíncrono e abrir modal imediatamente
        if (!selectedProject) {
          try {
            const pipelineRequest = await createPipelineRequest(deriveIdeaFromProject(savedProject), githubLogin);
            // O modal abre com TRIAGEM_INICIAL e evolui via onSnapshot
            setPipelineProjectId(pipelineRequest.id);
          } catch (pipelineError) {
            console.error('Erro ao acionar o Agent Orchestrator:', pipelineError);
            showToast('error', 'Projeto salvo, mas não foi possível acionar a geração automática de artefatos.');
          }
        }
      }

      setIsFormOpen(false);
    } catch (error) {
      console.error('Erro ao salvar projeto:', error);
      showToast('error', 'Erro ao salvar projeto. Tente novamente.');
    }
  };

  const handleCancel = () => setIsFormOpen(false);

  const handleDeleteProject = (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este projeto? Todos os artefatos gerados serão removidos.')) return;
    const projectToDelete = projects.find(p => p.id === id);
    if (!projectToDelete) return;
    try {
      // Delete cascade no backend (Firestore + subcoleções)
      deleteProjectFromPipeline(id).catch(err =>
        console.warn('Falha ao remover projeto no backend (cascade):', err),
      );
      // Delete local
      projectService.deleteProject(id);
      const updated = projects.filter(p => p.id !== id);
      setProjects(updated);
      activityService.addActivity({
        type: 'project_updated',
        entityId: id,
        entityName: projectToDelete.name,
        message: 'Projeto excluído',
      });
      window.dispatchEvent(new CustomEvent('projectsUpdated', { detail: { projects: updated } }));
      showToast('success', `Projeto "${projectToDelete.name}" excluído com sucesso!`);
    } catch (error) {
      console.error('Erro ao excluir projeto:', error);
      showToast('error', 'Erro ao excluir projeto. Tente novamente.');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Meus Projetos</h1>
        <button onClick={handleAddProject} className={styles.addButton}>
          Novo Projeto
        </button>
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
      {pipelineProjectId && (
        <PipelineStatusModal
          projectId={pipelineProjectId}
          onClose={() => setPipelineProjectId(null)}
        />
      )}
    </div>
  );
};

export default ProjectsPage;
