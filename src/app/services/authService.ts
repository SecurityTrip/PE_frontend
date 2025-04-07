// Интерфейсы
export interface User {
  id: string;
  username: string;
  avatar: number;
}

// API URLs
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const LOGIN_URL = `${API_URL}/auth/signin`;
const REGISTER_URL = `${API_URL}/auth/signup`;
const REFRESH_URL = `${API_URL}/auth/refresh`;

// Ключи для хранения данных в localStorage
const TOKEN_KEY = 'battleship_token';
const USER_KEY = 'battleship_user';

// Функции работы с JWT
export const authService = {
  // Авторизация
  login: async (username: string, password: string): Promise<string> => {
    try {
      const response = await fetch(LOGIN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      
      if (!response.ok) {
        throw new Error('Ошибка авторизации');
      }
      
      // Бэкенд возвращает токен как строку, а не как JSON
      const token = await response.text();
      
      // Создаем объект пользователя
      const userData: User = {
        id: username, // Используем username как id
        username: username,
        avatar: 0, // Дефолтный аватар
      };
      
      // Сохраняем в localStorage
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
      
      return token;
    } catch (error) {
      console.error('Login error:', error);
      
      // Заглушка для тестирования при отсутствии бэкенда
      const mockToken = 'fake_jwt_token';
      
      // Создаем объект пользователя
      const userData: User = {
        id: username, // Используем username как id
        username: username,
        avatar: 0, // Дефолтный аватар
      };
      
      // Сохраняем в localStorage
      localStorage.setItem(TOKEN_KEY, mockToken);
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
      
      return mockToken;
    }
  },
  
  // Регистрация
  register: async (username: string, password: string, avatar: number): Promise<string> => {
    try {
      const response = await fetch(REGISTER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, avatar }),
      });
      
      if (!response.ok) {
        throw new Error('Ошибка регистрации');
      }
      
      // Бэкенд возвращает просто строку, а не JSON
      const result = await response.text();
      
      return result;
    } catch (error) {
      console.error('Register error:', error);
      
      // Заглушка для тестирования при отсутствии бэкенда
      return username;
    }
  },
  
  // Обновление токена
  refreshToken: async (): Promise<string | null> => {
    const token = authService.getToken();
    
    if (!token) {
      return null;
    }
    
    try {
      const response = await fetch(REFRESH_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Ошибка обновления токена');
      }
      
      // Бэкенд возвращает новый токен как строку
      const newToken = await response.text();
      
      // Обновляем токен в localStorage
      localStorage.setItem(TOKEN_KEY, newToken);
      
      return newToken;
    } catch (error) {
      console.error('Token refresh error:', error);
      return null;
    }
  },
  
  // Выход
  logout: (): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
  
  // Получение токена
  getToken: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(TOKEN_KEY);
    }
    return null;
  },
  
  // Получение пользователя
  getUser: (): User | null => {
    if (typeof window !== 'undefined') {
      const userJson = localStorage.getItem(USER_KEY);
      if (userJson) {
        return JSON.parse(userJson);
      }
    }
    return null;
  },
  
  // Проверка аутентификации
  isAuthenticated: (): boolean => {
    return !!authService.getToken();
  },
}; 