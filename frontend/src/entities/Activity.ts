export interface Activity {
  id: number;
  type: 'project_created' | 'project_updated' | 'story_added' | 'story_completed' | 'adr_added';
  entityId: number;
  entityName: string;
  message: string;
  timestamp: string;
}
