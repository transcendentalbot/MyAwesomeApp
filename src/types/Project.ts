export interface Project {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'completed' | 'on-hold';
  thumbnail?: string;
  createdAt: string;
  updatedAt: string;
  scenes?: {
    id: string;
    title: string;
    thumbnail?: string;
  }[];
}