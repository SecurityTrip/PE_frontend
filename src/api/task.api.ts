import { apiService } from './api';
import { Task, TaskResponse, CreateTaskRequest } from '../types/api.types';

export const taskApi = {
  getAllTasks: async (): Promise<Task[]> => {
    return apiService.get<Task[]>('/tasks');
  },

  getTaskById: async (id: number): Promise<TaskResponse> => {
    return apiService.get<TaskResponse>(`/tasks/${id}`);
  },

  createTask: async (data: CreateTaskRequest): Promise<Task> => {
    return apiService.post<Task>('/tasks', data);
  },

  updateTask: async (id: number, data: Partial<Task>): Promise<Task> => {
    return apiService.put<Task>(`/tasks/${id}`, data);
  },

  deleteTask: async (id: number): Promise<void> => {
    return apiService.delete(`/tasks/${id}`);
  },

  updateTaskStatus: async (id: number, status: string): Promise<Task> => {
    return apiService.put<Task>(`/tasks/${id}/status`, { status });
  },

  assignTask: async (taskId: number, userId: number): Promise<Task> => {
    return apiService.put<Task>(`/tasks/${taskId}/assign`, { userId });
  },
}; 