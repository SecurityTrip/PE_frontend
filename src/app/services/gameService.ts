import { api } from './api';

export const gameService = {
  // Установка готовности игрока
  async setReady(gameId: string): Promise<boolean> {
    try {
      const response = await api.post(`/game/${gameId}/ready`);
      return response.data;
    } catch (error) {
      console.error('Error setting ready:', error);
      throw error;
    }
  },

  // Получение состояния игры
  async getGameState(gameId: string): Promise<any> {
    try {
      const response = await api.get(`/game/${gameId}/state`);
      return response.data;
    } catch (error) {
      console.error('Error getting game state:', error);
      throw error;
    }
  },

  // Совершение хода
  async makeMove(gameId: string, row: number, col: number): Promise<any> {
    try {
      const response = await api.post(`/game/${gameId}/move`, { row, col });
      return response.data;
    } catch (error) {
      console.error('Error making move:', error);
      throw error;
    }
  }
}; 