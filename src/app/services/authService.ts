// Интерфейсы
export interface User {
  id: string;
  username: string;
  avatar: number;
}

export interface AuthError {
  message: string;
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
  login: async (username: string, password: string): Promise<string | AuthError> => {
    try {
      const response = await fetch(LOGIN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      
      if (!response.ok) {
        // Обрабатываем ошибку из бэкенда
        const errorText = await response.text();
        return { message: errorText || 'Ошибка авторизации' };
      }
      
      // Получаем данные из ответа
      const data = await response.json();
      const { token, id } = data;
      
      // Если token пустой или некорректный, возвращаем ошибку
      if (!token || token.trim() === '') {
        return { message: 'Получен пустой токен' };
      }
      
      // Создаем объект пользователя с правильным id
      const userData: User = {
        id: id.toString(), // Преобразуем id в строку
        username: username,
        avatar: 0, // Дефолтный аватар
      };
      
      // Сохраняем в localStorage и куки
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
      
      // Сохраняем токен в куки для SSE
      authService.saveTokenInCookie(token);
      
      return token;
    } catch (error) {
      console.error('Login error:', error);
      return { message: error instanceof Error ? error.message : 'Ошибка авторизации' };
    }
  },
  
  // Регистрация
  register: async (username: string, password: string, avatar: number): Promise<string | AuthError> => {
    try {
      const response = await fetch(REGISTER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, avatar }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        return { message: errorText || 'Ошибка регистрации' };
      }
      
      // Получаем данные из ответа
      const data = await response.json();
      const { token, id } = data;
      
      // Если token пустой или некорректный, возвращаем ошибку
      if (!token || token.trim() === '') {
        return { message: 'Получен пустой токен' };
      }
      
      // Создаем объект пользователя с правильным id
      const userData: User = {
        id: id.toString(), // Преобразуем id в строку
        username: username,
        avatar: avatar,
      };
      
      // Сохраняем в localStorage и куки
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
      
      // Сохраняем токен в куки для SSE
      authService.saveTokenInCookie(token);
      
      return token;
    } catch (error) {
      console.error('Registration error:', error);
      return { message: error instanceof Error ? error.message : 'Ошибка регистрации' };
    }
  },
  
  // Сохранение токена в куки
  saveTokenInCookie: (token: string): void => {
    const secureFlag = window.location.protocol === 'https:' ? '; secure' : '';
    const cookieValue = `auth_token=${token}; path=/; max-age=3600${secureFlag}; SameSite=Strict`;
    document.cookie = cookieValue;
    console.log('Токен сохранен в куки для SSE соединений');
  },
  
  // Обновление токена
  refreshToken: async (): Promise<string | AuthError | null> => {
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
        const errorText = await response.text();
        return { message: errorText || 'Ошибка обновления токена' };
      }
      
      // Получаем данные из ответа
      const data = await response.json();
      const newToken = data.token;
      
      // Обновляем токен в localStorage и куки
      localStorage.setItem(TOKEN_KEY, newToken);
      authService.saveTokenInCookie(newToken);
      
      return newToken;
    } catch (error) {
      console.error('Token refresh error:', error);
      return { message: error instanceof Error ? error.message : 'Ошибка обновления токена' };
    }
  },
  
  // Выход
  logout: (): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    
    // Удаляем куки
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
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