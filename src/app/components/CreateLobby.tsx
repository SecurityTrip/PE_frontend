'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import { lobbyService, CreateLobbyRequest } from '../services/lobbyService';

interface CreateLobbyProps {
  onLobbyCreated: (lobbyId: string) => void;
  onCancel: () => void;
}

export const CreateLobby = ({ onLobbyCreated, onCancel }: CreateLobbyProps) => {
  const [lobbyName, setLobbyName] = useState('');
  const [maxPlayers] = useState<number>(2);
  const [isPrivate, setIsPrivate] = useState(false);
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLobbyNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setLobbyName(e.target.value);
  };

  const handleMaxPlayersChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setMaxPlayers(parseInt(e.target.value, 10));
  };

  const handlePrivateChange = (e: ChangeEvent<HTMLInputElement>) => {
    setIsPrivate(e.target.checked);
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleCreateLobby = async (e: FormEvent) => {
    e.preventDefault();
    
    if (lobbyName.trim() === '') {
      setError('Пожалуйста, введите название лобби');
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
        lobbyName: lobbyName.trim(),
        isPrivate,
        password: isPrivate ? password : undefined,
        maxPlayers
      };
      
      const result = await lobbyService.createLobby(request);
      
      if ('message' in result) {
        setError(result.message);
      } else {
        onLobbyCreated(result.lobbyID);
      }
    } catch (err) {
      setError('Ошибка при создании лобби. Пожалуйста, попробуйте еще раз.');
      console.error('Error creating lobby:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 text-white">
      <h2 className="text-2xl font-bold mb-6">Создать новое лобби</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-200 flex justify-between items-center">
          <span>{error}</span>
          <button 
            onClick={() => setError(null)} 
            className="text-red-300 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}
      
      <form onSubmit={handleCreateLobby} className="space-y-4">
        <div>
          <label htmlFor="lobbyName" className="block mb-2 text-sm font-medium">
            Название лобби
          </label>
          <input
            type="text"
            id="lobbyName"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            placeholder="Введите название лобби"
            value={lobbyName}
            onChange={handleLobbyNameChange}
            maxLength={30}
            disabled={isLoading}
          />
          <p className="mt-1 text-xs text-gray-400">
            {lobbyName.length}/30 символов
          </p>
        </div>
        
        <div>
          <label htmlFor="maxPlayers" className="block mb-2 text-sm font-medium">
            Максимальное количество игроков
          </label>
          <div className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg">
            2 игрока
          </div>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isPrivate"
            className="w-4 h-4 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
            checked={isPrivate}
            onChange={handlePrivateChange}
            disabled={isLoading}
          />
          <label htmlFor="isPrivate" className="ml-2 text-sm font-medium">
            Приватное лобби
          </label>
          <div className="ml-2 text-xs text-gray-400">
            (Лобби не будет отображаться в общем списке)
          </div>
        </div>
        
        {isPrivate && (
          <div>
            <label htmlFor="password" className="block mb-2 text-sm font-medium">
              Пароль
            </label>
            <input
              type="password"
              id="password"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="Введите пароль для лобби"
              value={password}
              onChange={handlePasswordChange}
              disabled={isLoading}
            />
          </div>
        )}
        
        <div className="flex justify-end gap-3 pt-4">
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
            className="px-4 py-2 bg-blue-500 rounded-lg hover:bg-blue-600 transition flex items-center"
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