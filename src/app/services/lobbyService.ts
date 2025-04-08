import { authService } from './authService';

// Интерфейсы
export interface Lobby {
  id?: number;
  lobbyID: string;
  lobbyName: string;
  ownerUsername: string;
  isPrivate: boolean;
  status: 'WAITING' | 'FULL' | 'IN_GAME';
  currentPlayers: number;
  maxPlayers: number;
  players: string[];
  gameId?: string;
  createdAt: string;
}

export interface CreateLobbyRequest {
  lobbyName: string;
  isPrivate: boolean;
  password?: string;
  maxPlayers: number;
}

export interface JoinLobbyRequest {
  lobbyID: string;
  password?: string;
}

export interface LobbyError {
  message: string;
}

// API URLs
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const LOBBY_URL = `${API_URL}/lobby`;

// Максимальное количество попыток для повторного запроса
const MAX_RETRY_ATTEMPTS = 3;
// Задержка между попытками (в мс)
const RETRY_DELAY = 1000;

// Функция задержки
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Функция для выполнения запроса с повторными попытками
async function fetchWithRetry<T>(
  url: string, 
  options: RequestInit, 
  retryAttempt = 0
): Promise<T> {
  try {
    const response = await fetch(url, options);
    
    // Если ответ не успешный и это не 401/403, пробуем еще раз
    if (!response.ok) {
      // Для 401/403 не делаем повторных попыток - это проблема аутентификации
      if (response.status === 401 || response.status === 403) {
        const errorText = await response.text();
        throw new Error(errorText || 'Ошибка аутентификации');
      }
      
      // Для других ошибок проверяем возможность повторной попытки
      if (retryAttempt < MAX_RETRY_ATTEMPTS) {
        console.log(`Попытка ${retryAttempt + 1}/${MAX_RETRY_ATTEMPTS} не удалась, повторяем через ${RETRY_DELAY}мс...`);
        await delay(RETRY_DELAY);
        return fetchWithRetry<T>(url, options, retryAttempt + 1);
      }
      
      // Если исчерпаны все попытки
      const errorText = await response.text();
      throw new Error(errorText || `Ошибка HTTP: ${response.status}`);
    }
    
    // Проверка на пустой ответ
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json() as T;
    } else {
      const text = await response.text();
      try {
        // Пытаемся распарсить как JSON, если возможно
        if (text && text.trim()) {
          return JSON.parse(text) as T;
        }
      } catch (e) {
        // Если не можем распарсить как JSON, возвращаем текст
        console.warn('Ответ не является JSON:', text);
      }
      return text as unknown as T;
    }
  } catch (error) {
    if (error instanceof Error) {
      // Если ошибка связи и есть еще попытки
      if (error.message.includes('Failed to fetch') && retryAttempt < MAX_RETRY_ATTEMPTS) {
        console.log(`Ошибка сети. Попытка ${retryAttempt + 1}/${MAX_RETRY_ATTEMPTS}, повторяем через ${RETRY_DELAY}мс...`);
        await delay(RETRY_DELAY);
        return fetchWithRetry<T>(url, options, retryAttempt + 1);
      }
      throw error;
    }
    throw new Error('Неизвестная ошибка при запросе');
  }
}

export const lobbyService = {
  // Создание лобби
  createLobby: async (request: CreateLobbyRequest): Promise<Lobby | LobbyError> => {
    const token = authService.getToken();
    
    if (!token) {
      return { message: 'Пользователь не авторизован' };
    }
    
    try {
      const result = await fetchWithRetry<Lobby>(`${LOBBY_URL}/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(request),
      });
      
      return result;
    } catch (error) {
      console.error('Create lobby error:', error);
      return { message: error instanceof Error ? error.message : 'Ошибка создания лобби' };
    }
  },
  
  // Получение списка публичных лобби
  getPublicLobbies: async (): Promise<Lobby[] | LobbyError> => {
    const token = authService.getToken();
    
    if (!token) {
      return { message: 'Пользователь не авторизован' };
    }
    
    try {
      const lobbies = await fetchWithRetry<Lobby[]>(`${LOBBY_URL}/public`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });
      
      // Проверка структуры данных
      if (Array.isArray(lobbies)) {
        return lobbies;
      } else if (typeof lobbies === 'object' && lobbies !== null) {
        return [lobbies as Lobby];
      }
      
      return { message: 'Неверный формат данных от сервера' };
    } catch (error) {
      console.error('Get public lobbies error:', error);
      return { message: error instanceof Error ? error.message : 'Ошибка получения списка лобби' };
    }
  },
  
  // Получение лобби по ID
  getLobbyById: async (lobbyId: string): Promise<Lobby | LobbyError> => {
    const token = authService.getToken();
    
    if (!token) {
      return { message: 'Пользователь не авторизован' };
    }
    
    try {
      const lobby = await fetchWithRetry<Lobby>(`${LOBBY_URL}/${lobbyId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });
      
      return lobby;
    } catch (error) {
      console.error('Get lobby error:', error);
      return { message: error instanceof Error ? error.message : 'Ошибка получения информации о лобби' };
    }
  },
  
  // Присоединение к лобби
  joinLobby: async (request: JoinLobbyRequest): Promise<Lobby | LobbyError> => {
    const token = authService.getToken();
    
    if (!token) {
      return { message: 'Пользователь не авторизован' };
    }
    
    try {
      const lobby = await fetchWithRetry<Lobby>(`${LOBBY_URL}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(request),
      });
      
      return lobby;
    } catch (error) {
      console.error('Join lobby error:', error);
      return { message: error instanceof Error ? error.message : 'Ошибка присоединения к лобби' };
    }
  },
  
  // Выход из лобби
  leaveLobby: async (lobbyId: string): Promise<boolean | LobbyError> => {
    const token = authService.getToken();
    
    if (!token) {
      return { message: 'Пользователь не авторизован' };
    }
    
    try {
      await fetchWithRetry<string>(`${LOBBY_URL}/${lobbyId}/leave`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });
      
      return true;
    } catch (error) {
      console.error('Leave lobby error:', error);
      return { message: error instanceof Error ? error.message : 'Ошибка выхода из лобби' };
    }
  },
  
  // Запуск игры
  startGame: async (lobbyId: string): Promise<Lobby | LobbyError> => {
    const token = authService.getToken();
    
    if (!token) {
      return { message: 'Пользователь не авторизован' };
    }
    
    try {
      const lobby = await fetchWithRetry<Lobby>(`${LOBBY_URL}/${lobbyId}/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });
      
      return lobby;
    } catch (error) {
      console.error('Start game error:', error);
      return { message: error instanceof Error ? error.message : 'Ошибка запуска игры' };
    }
  },
  
  // Получение списка лобби текущего пользователя
  getMyLobbies: async (): Promise<Lobby[] | LobbyError> => {
    const token = authService.getToken();
    
    if (!token) {
      return { message: 'Пользователь не авторизован' };
    }
    
    try {
      const lobbies = await fetchWithRetry<Lobby[]>(`${LOBBY_URL}/my`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });
      
      // Проверка структуры данных
      if (Array.isArray(lobbies)) {
        return lobbies;
      } else if (typeof lobbies === 'object' && lobbies !== null) {
        return [lobbies as Lobby];
      }
      
      return { message: 'Неверный формат данных от сервера' };
    } catch (error) {
      console.error('Get my lobbies error:', error);
      return { message: error instanceof Error ? error.message : 'Ошибка получения списка ваших лобби' };
    }
  },
}; 