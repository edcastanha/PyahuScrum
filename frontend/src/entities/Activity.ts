export interface Activity {
  id: number;
  type: 'project_created' | 'project_updated' | 'story_added' | 'story_completed' | 'adr_added';
  entityId: string;   // string para compatibilidade com Project.id (UUID)
  entityName: string;
  message: string;
  timestamp: string;
}
