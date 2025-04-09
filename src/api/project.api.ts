import { apiService } from './api';
import { Project, ProjectResponse, CreateProjectRequest } from '../types/api.types';

export const projectApi = {
  getAllProjects: async (): Promise<Project[]> => {
    return apiService.get<Project[]>('/projects');
  },

  getProjectById: async (id: number): Promise<ProjectResponse> => {
    return apiService.get<ProjectResponse>(`/projects/${id}`);
  },

  createProject: async (data: CreateProjectRequest): Promise<Project> => {
    return apiService.post<Project>('/projects', data);
  },

  updateProject: async (id: number, data: Partial<Project>): Promise<Project> => {
    return apiService.put<Project>(`/projects/${id}`, data);
  },

  deleteProject: async (id: number): Promise<void> => {
    return apiService.delete(`/projects/${id}`);
  },

  getProjectTasks: async (projectId: number): Promise<Task[]> => {
    return apiService.get<Task[]>(`/projects/${projectId}/tasks`);
  },
}; 