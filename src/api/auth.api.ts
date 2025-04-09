import { apiService } from './api';
import { AuthResponse, LoginRequest, RegisterRequest } from '../types/api.types';

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    return apiService.post<AuthResponse>('/auth/login', data);
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    return apiService.post<AuthResponse>('/auth/register', data);
  },

  logout: async (): Promise<void> => {
    return apiService.post('/auth/logout', {});
  },

  getCurrentUser: async (): Promise<AuthResponse> => {
    return apiService.get<AuthResponse>('/auth/me');
  },
}; 