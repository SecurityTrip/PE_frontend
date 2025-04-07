import { authService } from './authService';

// Интерфейсы
export interface Lobby {
  id?: number;
  lobbyID: string;
  lobbyName: string;
  ownerUsername: string;
  isPrivate: boolean;
  status: string;
  currentPlayers: number;
  maxPlayers: number;
  players: string[];
  createdAt: string;
}

export interface CreateLobbyRequest {
  lobbyName: string;
  isPrivate: boolean;
  password?: string;
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

export const lobbyService = {
  // Создание лобби
  createLobby: async (request: CreateLobbyRequest): Promise<Lobby | LobbyError> => {
    const token = authService.getToken();
    
    if (!token) {
      return { message: 'Пользователь не авторизован' };
    }
    
    try {
      const response = await fetch(`${LOBBY_URL}/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(request),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        return { message: errorText || 'Ошибка создания лобби' };
      }
      
      const lobby = await response.json() as Lobby;
      return lobby;
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
      const response = await fetch(`${LOBBY_URL}/public`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        return { message: errorText || 'Ошибка получения списка лобби' };
      }
      
      const lobbies = await response.json() as Lobby[];
      return lobbies;
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
      const response = await fetch(`${LOBBY_URL}/${lobbyId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        return { message: errorText || 'Лобби не найдено' };
      }
      
      const lobby = await response.json() as Lobby;
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
      const response = await fetch(`${LOBBY_URL}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(request),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        return { message: errorText || 'Ошибка присоединения к лобби' };
      }
      
      const lobby = await response.json() as Lobby;
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
      const response = await fetch(`${LOBBY_URL}/${lobbyId}/leave`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        return { message: errorText || 'Ошибка выхода из лобби' };
      }
      
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
      const response = await fetch(`${LOBBY_URL}/${lobbyId}/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        return { message: errorText || 'Ошибка запуска игры' };
      }
      
      const lobby = await response.json() as Lobby;
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
      const response = await fetch(`${LOBBY_URL}/my`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        return { message: errorText || 'Ошибка получения списка ваших лобби' };
      }
      
      const lobbies = await response.json() as Lobby[];
      return lobbies;
    } catch (error) {
      console.error('Get my lobbies error:', error);
      return { message: error instanceof Error ? error.message : 'Ошибка получения списка ваших лобби' };
    }
  },
}; 