import { api } from './api';

export const gameService = {
  // Установка готовности игрока
  async setReady(gameId: string): Promise<any> {
    try {
      console.log('Отправка запроса на готовность, gameId:', gameId);
      
      const numericGameId = parseInt(gameId, 10);
      const id = isNaN(numericGameId) ? gameId : numericGameId;
      
      const response = await api.post(`/game/${id}/ready`);
      console.log('Ответ сервера на установку готовности:', response.data);
      
      // Возвращаем данные игры
      return response.data;
    } catch (error) {
      console.error('Error setting ready:', error);
      throw error;
    }
  },

  // Получение состояния игры
  async getGameState(gameId: string): Promise<any> {
    try {
      console.log('Получение состояния игры, gameId:', gameId);
      
      const numericGameId = parseInt(gameId, 10);
      const id = isNaN(numericGameId) ? gameId : numericGameId;
      
      try {
        // Пробуем получить данные с сервера
        const response = await api.get(`/game/${id}`);
        return response.data;
      } catch (apiError) {
        console.warn('API для получения состояния игры еще не реализован, используем временную заглушку:', apiError);
        
        // Временная заглушка, пока метод не будет реализован на бэкенде
        return {
          id: parseInt(gameId),
          status: "WAITING",
          currentPlayer: null,
          turnNumber: 0,
          boards: []
        };
      }
    } catch (error) {
      console.error('Error getting game state:', error);
      throw error;
    }
  },

  // Размещение кораблей
  async placeShips(gameId: string, ships: Array<{x: number, y: number, size: number, isHorizontal: boolean}>): Promise<any> {
    try {
      console.log('Размещение кораблей, gameId:', gameId, 'количество кораблей:', ships.length);
      
      const numericGameId = parseInt(gameId, 10);
      const id = isNaN(numericGameId) ? gameId : numericGameId;
      
      // Отправляем каждый корабль по отдельности
      for (const ship of ships) {
        console.log('Отправка корабля:', ship);
        
        // Преобразуем к формату, ожидаемому бэкендом
        const shipRequest = {
          x: ship.x,
          y: ship.y,
          size: ship.size,
          horizontal: ship.isHorizontal // горизонтальная ориентация
        };
        
        await api.post(`/game/${id}/ships`, shipRequest);
      }
      
      // Возвращаем актуальное состояние игры
      return this.getGameState(gameId);
    } catch (error) {
      console.error('Error placing ships:', error);
      throw error;
    }
  },

  // Совершение хода
  async makeMove(gameId: string, row: number, col: number): Promise<any> {
    try {
      console.log('Совершение хода, gameId:', gameId, 'row:', row, 'col:', col);
      
      const numericGameId = parseInt(gameId, 10);
      const id = isNaN(numericGameId) ? gameId : numericGameId;
      const response = await api.post(`/game/${id}/shot`, { x: col, y: row });
      return response.data;
    } catch (error) {
      console.error('Error making move:', error);
      throw error;
    }
  }
}; 