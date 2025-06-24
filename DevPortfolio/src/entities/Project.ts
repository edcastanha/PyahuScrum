export interface Project {
  id: number;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'completed';
  progress: number; // 0 to 100
}
