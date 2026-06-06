import { create } from 'zustand';
import { apiClient } from '../api/client';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  project_id: string;
  assignee_id?: string;
  created_at: string;
}

interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  fetchTasks: (projectId: string) => Promise<void>;
  createTask: (task: Partial<Task>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
}

export const useTaskStore = create<TaskState>((set) => ({
  tasks: [],
  isLoading: false,
  fetchTasks: async (projectId) => {
    set({ isLoading: true });
    try {
      const response = await apiClient.get(`/tasks/project/${projectId}`);
      set({ tasks: response.data });
    } catch (error) {
      console.error('Failed to fetch tasks', error);
    } finally {
      set({ isLoading: false });
    }
  },
  createTask: async (task) => {
    try {
      const response = await apiClient.post('/tasks/', task);
      set((state) => ({ tasks: [...state.tasks, response.data] }));
    } catch (error) {
      console.error('Failed to create task', error);
      throw error;
    }
  },
  updateTask: async (id, updates) => {
    try {
      const response = await apiClient.patch(`/tasks/${id}`, updates);
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? response.data : t)),
      }));
    } catch (error) {
      console.error('Failed to update task', error);
    }
  },
}));
