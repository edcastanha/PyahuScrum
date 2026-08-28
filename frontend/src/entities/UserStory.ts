export interface UserStory {
  id: number;
  projectId: string; // ID do projeto ao qual a história pertence
  title: string;
  description: string;
  status: 'todo' | 'inprogress' | 'done';
  priority: 'low' | 'medium' | 'high';
  acceptanceCriteria: string[];
  createdDate: string;
  updatedDate: string;
}
