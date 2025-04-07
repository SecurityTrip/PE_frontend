'use client';

import { useState, useEffect } from 'react';
import { lobbyService, Lobby } from '../services/lobbyService';
import { authService } from '../services/authService';

interface LobbyViewProps {
  lobbyId: string;
  onStartGame: () => void;
  onLeaveLobby: () => void;
}

export const LobbyView = ({ lobbyId, onStartGame, onLeaveLobby }: LobbyViewProps) => {
  const [lobby, setLobby] = useState<Lobby | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const currentUser = authService.getUser();

  // Загрузка информации о лобби
  const loadLobby = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await lobbyService.getLobbyById(lobbyId);
      
      if ('message' in result) {
        setError(result.message);
      } else {
        setLobby(result);
      }
    } catch (error) {
      setError('Ошибка загрузки информации о лобби');
      console.error('Error loading lobby:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Загрузка данных при монтировании
  useEffect(() => {
    loadLobby();
    
    // Периодическое обновление информации о лобби
    const interval = setInterval(() => {
      loadLobby();
    }, 3000);
    
    return () => clearInterval(interval);
  }, [lobbyId]);

  // Обработка выхода из лобби
  const handleLeaveLobby = async () => {
    try {
      const result = await lobbyService.leaveLobby(lobbyId);
      
      if (result === true) {
        onLeaveLobby();
      } else if (typeof result === 'object' && 'message' in result) {
        setError(result.message);
      }
    } catch (error) {
      setError('Ошибка при выходе из лобби');
      console.error('Error leaving lobby:', error);
    }
  };

  // Обработка запуска игры
  const handleStartGame = async () => {
    try {
      const result = await lobbyService.startGame(lobbyId);
      
      if (!('message' in result)) {
        onStartGame();
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('Ошибка при запуске игры');
      console.error('Error starting game:', error);
    }
  };

  // Копирование ID лобби в буфер обмена
  const copyLobbyId = () => {
    navigator.clipboard.writeText(lobbyId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="bg-gray-900/60 rounded-2xl p-6 text-white w-full flex justify-center items-center" style={{ minHeight: '400px' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-900/60 rounded-2xl p-6 text-white w-full" style={{ minHeight: '400px' }}>
        <h2 className="text-2xl font-bold mb-4 text-red-400">Ошибка</h2>
        <p className="mb-4">{error}</p>
        <button
          onClick={onLeaveLobby}
          className="px-4 py-2 bg-blue-500 rounded-lg hover:bg-blue-600 transition"
        >
          Вернуться к списку лобби
        </button>
      </div>
    );
  }

  if (!lobby) {
    return (
      <div className="bg-gray-900/60 rounded-2xl p-6 text-white w-full" style={{ minHeight: '400px' }}>
        <h2 className="text-2xl font-bold mb-4">Лобби не найдено</h2>
        <button
          onClick={onLeaveLobby}
          className="px-4 py-2 bg-blue-500 rounded-lg hover:bg-blue-600 transition"
        >
          Вернуться к списку лобби
        </button>
      </div>
    );
  }

  const isOwner = currentUser && lobby.ownerUsername === currentUser.username;
  const canStartGame = isOwner && lobby.currentPlayers >= 2 && lobby.status === 'WAITING';

  return (
    <div className="bg-gray-900/60 rounded-2xl p-6 text-white w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{lobby.lobbyName}</h2>
        <div className="text-sm text-gray-400">
          {lobby.isPrivate ? 'Приватное лобби' : 'Публичное лобби'} • {lobby.status === 'WAITING' ? 'Ожидание' : 'В игре'}
        </div>
      </div>
      
      <div className="mb-6 bg-gray-800 p-4 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-300">ID лобби:</span>
          <div className="flex gap-2">
            <span className="bg-gray-700 px-3 py-1 rounded font-mono">{lobbyId}</span>
            <button
              onClick={copyLobbyId}
              className="bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded transition text-sm"
            >
              {copied ? 'Скопировано!' : 'Копировать'}
            </button>
          </div>
        </div>
        <div className="text-sm text-gray-400">
          Поделитесь этим ID с другими игроками, чтобы они могли присоединиться к вашему лобби.
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Игроки ({lobby.currentPlayers}/{lobby.maxPlayers})</h3>
        <div className="bg-gray-800 rounded-lg divide-y divide-gray-700">
          {lobby.players.map((player, index) => (
            <div 
              key={player} 
              className="p-3 flex justify-between items-center"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-lg">
                  {index + 1}
                </div>
                <span>{player}</span>
                {player === lobby.ownerUsername && (
                  <span className="text-yellow-500 text-xs bg-yellow-500/20 px-2 py-1 rounded">Владелец</span>
                )}
                {player === currentUser?.username && (
                  <span className="text-green-500 text-xs bg-green-500/20 px-2 py-1 rounded">Вы</span>
                )}
              </div>
              {player === lobby.ownerUsername && (
                <div className="text-sm text-gray-400">
                  Может запустить игру
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex justify-end gap-3">
        <button
          onClick={handleLeaveLobby}
          className="px-4 py-2 border border-gray-600 rounded-lg hover:bg-gray-700 transition"
        >
          Покинуть лобби
        </button>
        {isOwner && (
          <button
            onClick={handleStartGame}
            className={`px-4 py-2 rounded-lg transition ${
              canStartGame 
                ? 'bg-green-500 hover:bg-green-600' 
                : 'bg-green-500/50 cursor-not-allowed'
            }`}
            disabled={!canStartGame}
          >
            Начать игру
          </button>
        )}
      </div>
      
      {!canStartGame && isOwner && lobby.currentPlayers < 2 && (
        <div className="mt-4 p-3 bg-yellow-500/20 border border-yellow-500 rounded-lg text-yellow-200">
          Для начала игры необходимо минимум 2 игрока
        </div>
      )}
    </div>
  );
}; 