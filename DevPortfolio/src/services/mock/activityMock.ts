import { Activity } from '../../entities/Activity';

export const mockActivities: Activity[] = [
  {
    id: 1,
    type: 'project_created',
    entityId: 1,
    entityName: 'Desenvolvimento do Portfólio Interativo',
    message: 'Novo projeto criado',
    timestamp: '2025-06-23T10:30:00Z',
  },
  {
    id: 2,
    type: 'story_added',
    entityId: 5,
    entityName: 'Configurar CI/CD Pipeline',
    message: 'Nova história de usuário adicionada ao projeto API de Gerenciamento de Tarefas',
    timestamp: '2025-06-22T16:45:00Z',
  },
  {
    id: 3,
    type: 'project_updated',
    entityId: 2,
    entityName: 'API de Gerenciamento de Tarefas',
    message: 'Progresso atualizado para 75%',
    timestamp: '2025-06-21T09:15:00Z',
  }
];
