import { Activity } from '../../entities/Activity';

export const mockActivities: Activity[] = [
  {
    id: 1,
    type: 'project_created',
    entityId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    entityName: 'Desenvolvimento do Portfólio Interativo',
    message: 'Novo projeto criado',
    timestamp: '2025-06-23T07:30:00Z',
  },
  {
    id: 2,
    type: 'story_added',
    entityId: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    entityName: 'API de Gerenciamento de Tarefas',
    message: 'Nova história de usuário adicionada ao projeto API de Gerenciamento de Tarefas',
    timestamp: '2025-06-22T13:45:00Z',
  },
  {
    id: 3,
    type: 'project_updated',
    entityId: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    entityName: 'API de Gerenciamento de Tarefas',
    message: 'Projeto atualizado',
    timestamp: '2025-06-21T06:15:00Z',
  },
];
