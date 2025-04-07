'use client';

import { useState } from 'react';
import { lobbyService, CreateLobbyRequest } from '../services/lobbyService';

interface CreateLobbyProps {
  onLobbyCreated: (lobbyId: string) => void;
  onCancel: () => void;
}

export const CreateLobby = ({ onLobbyCreated, onCancel }: CreateLobbyProps) => {
  const [lobbyName, setLobbyName] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Валидация
    if (!lobbyName.trim()) {
      setError('Введите название лобби');
      return;
    }
    
    if (isPrivate && !password.trim()) {
      setError('Для приватного лобби необходим пароль');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const request: CreateLobbyRequest = {
        lobbyName,
        isPrivate,
        password: isPrivate ? password : undefined,
      };
      
      const result = await lobbyService.createLobby(request);
      
      if ('message' in result) {
        setError(result.message);
      } else {
        onLobbyCreated(result.lobbyID);
      }
    } catch (error) {
      setError('Ошибка при создании лобби');
      console.error('Error creating lobby:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-900/60 rounded-2xl p-6 text-white w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Создание нового лобби</h2>
        <button 
          onClick={onCancel}
          className="text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-200">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-2 text-gray-300">Название лобби</label>
          <input
            type="text"
            value={lobbyName}
            onChange={(e) => setLobbyName(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2"
            placeholder="Введите название лобби"
          />
        </div>
        
        <div className="mb-4 flex items-center">
          <input
            type="checkbox"
            id="isPrivate"
            checked={isPrivate}
            onChange={(e) => setIsPrivate(e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="isPrivate" className="text-gray-300">Приватное лобби</label>
        </div>
        
        {isPrivate && (
          <div className="mb-4">
            <label className="block mb-2 text-gray-300">Пароль</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2"
              placeholder="Введите пароль для лобби"
            />
          </div>
        )}
        
        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-600 rounded-lg hover:bg-gray-700 transition"
            disabled={isLoading}
          >
            Отмена
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-green-500 rounded-lg hover:bg-green-600 transition flex items-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                Создание...
              </>
            ) : 'Создать лобби'}
          </button>
        </div>
      </form>
    </div>
  );
}; 