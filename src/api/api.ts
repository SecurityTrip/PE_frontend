import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

// Базовый интерфейс для ответа API
interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

// Создаем экземпляр axios с базовым URL
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Функция для обработки ошибок
const handleError = (error: any) => {
  if (error.response) {
    console.error('Ошибка ответа:', error.response.data);
    console.error('Статус:', error.response.status);
    console.error('Заголовки:', error.response.headers);
  } else if (error.request) {
    console.error('Ошибка запроса:', error.request);
  } else {
    console.error('Ошибка:', error.message);
  }
  throw error;
};

// Базовые методы для работы с API
export const apiService = {
  get: async <T>(endpoint: string): Promise<ApiResponse<T>> => {
    try {
      const response = await api.get<T>(endpoint);
      return {
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  post: async <T>(endpoint: string, data: any): Promise<ApiResponse<T>> => {
    try {
      const response = await api.post<T>(endpoint, data);
      return {
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  put: async <T>(endpoint: string, data: any): Promise<ApiResponse<T>> => {
    try {
      const response = await api.put<T>(endpoint, data);
      return {
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  delete: async <T>(endpoint: string): Promise<ApiResponse<T>> => {
    try {
      const response = await api.delete<T>(endpoint);
      return {
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      handleError(error);
      throw error;
    }
  },
}; 