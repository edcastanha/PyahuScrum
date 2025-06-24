import { Project } from '../../entities/Project';
import { storageService } from '../storage/storageService';
import { mockProjects } from '../mock/projectMock';

const PROJECTS_KEY = 'devportfolio_projects';

export class ProjectService {
  getProjects(): Project[] {
    const projects = storageService.getItem<Project[]>(PROJECTS_KEY);
    return projects || this.initializeProjects();
  }

  getActiveProjects(): Project[] {
    return this.getProjects().filter(p => p.status === 'active');
  }

  getProjectById(id: number): Project | undefined {
    return this.getProjects().find(p => p.id === id);
  }

  saveProject(project: Project): Project {
    const projects = this.getProjects();
    const index = projects.findIndex(p => p.id === project.id);
    
    if (index >= 0) {
      // Update existing project
      projects[index] = project;
    } else {
      // Add new project with generated ID
      const newProject = { ...project, id: Date.now() };
      projects.push(newProject);
      project = newProject;
    }
    
    storageService.setItem(PROJECTS_KEY, projects);
    return project;
  }

  deleteProject(id: number): void {
    const projects = this.getProjects();
    const filteredProjects = projects.filter(p => p.id !== id);
    storageService.setItem(PROJECTS_KEY, filteredProjects);
  }

  getProjectStats() {
    const projects = this.getProjects();
    const total = projects.length;
    const completed = projects.filter(p => p.status === 'completed').length;
    
    return {
      total,
      completed,
    };
  }

  private initializeProjects(): Project[] {
    storageService.setItem(PROJECTS_KEY, mockProjects);
    return mockProjects;
  }
}

export const projectService = new ProjectService();
