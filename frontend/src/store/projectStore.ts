import { create } from 'zustand';
import { apiClient } from '../api/client';

export interface Project {
  id: string;
  name: string;
  description: string;
  owner_id: string;
  created_at: string;
}

interface ProjectState {
  projects: Project[];
  isLoading: boolean;
  fetchProjects: () => Promise<void>;
  createProject: (name: string, description: string) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
}

export const useProjectStore = create<ProjectState>((set) => ({
  projects: [],
  isLoading: false,
  fetchProjects: async () => {
    set({ isLoading: true });
    try {
      const response = await apiClient.get('/projects/');
      set({ projects: response.data });
    } catch (error) {
      console.error('Failed to fetch projects', error);
    } finally {
      set({ isLoading: false });
    }
  },
  createProject: async (name, description) => {
    try {
      const response = await apiClient.post('/projects/', { name, description });
      set((state) => ({ projects: [...state.projects, response.data] }));
    } catch (error) {
      console.error('Failed to create project', error);
      throw error;
    }
  },
  deleteProject: async (id) => {
    try {
      await apiClient.delete(`/projects/${id}`);
      set((state) => ({ projects: state.projects.filter((p) => p.id !== id) }));
    } catch (error) {
      console.error('Failed to delete project', error);
    }
  },
}));
