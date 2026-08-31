import { Project } from '../../entities/Project';
import { storageService } from '../storage/storageService';
import { mockProjects } from '../mock/projectMock';

const PROJECTS_KEY = 'devportfolio_projects';

function generateUUID(): string {
  // crypto.randomUUID() disponível em browsers modernos e Node 14.17+
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback para ambientes sem crypto.randomUUID (ex.: jsdom em testes antigos)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export class ProjectService {
  getProjects(): Project[] {
    const projects = storageService.getItem<Project[]>(PROJECTS_KEY);
    return projects || this.initializeProjects();
  }

  getProjectById(id: string): Project | undefined {
    return this.getProjects().find(p => p.id === id);
  }

  saveProject(project: Project): Project {
    const projects = this.getProjects();
    const index = projects.findIndex(p => p.id === project.id);

    if (index >= 0) {
      // Atualiza projeto existente
      projects[index] = project;
      storageService.setItem(PROJECTS_KEY, projects);
      return project;
    } else {
      // Novo projeto: gera UUID
      const newProject: Project = { ...project, id: generateUUID() };
      projects.push(newProject);
      storageService.setItem(PROJECTS_KEY, projects);
      return newProject;
    }
  }

  deleteProject(id: string): void {
    const projects = this.getProjects().filter(p => p.id !== id);
    storageService.setItem(PROJECTS_KEY, projects);
  }

  getProjectStats() {
    const projects = this.getProjects();
    return {
      total: projects.length,
      completed: 0,   // derivado do Firestore (E3-T11+)
    };
  }

  getPipelineStats() {
    /**
     * Contagens de status do pipeline por projeto.
     * Lido de `pipeline_statuses` no localStorage — atualizado pela
     * `subscribeToProjectStatus` em tempo real (via onSnapshot do Firestore).
     * Enquanto o backend não estiver deployado, retorna zeros.
     */
    const raw = storageService.getItem<Record<string, string>>('pipeline_statuses') ?? {};
    const values = Object.values(raw);
    return {
      total: this.getProjects().length,
      elicitando:  values.filter(s => s === 'ELICITANDO').length,
      gerandoAdr:  values.filter(s => s === 'GERANDO_ADR' || s === 'TRIAGEM_EM_ANDAMENTO').length,
      concluido:   values.filter(s => s === 'CONCLUIDO').length,
      falha:       values.filter(s => s === 'FALHA_PROCESSAMENTO' || s === 'FALHA_DLQ').length,
    };
  }

  /** Atualiza o status do pipeline para um projeto no cache local. */
  updatePipelineStatus(projectId: string, status: string) {
    const statuses = storageService.getItem<Record<string, string>>('pipeline_statuses') ?? {};
    statuses[projectId] = status;
    storageService.setItem('pipeline_statuses', statuses);
  }

  private initializeProjects(): Project[] {
    storageService.setItem(PROJECTS_KEY, mockProjects);
    return mockProjects;
  }
}

export const projectService = new ProjectService();
