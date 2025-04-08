'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { lobbyService, Lobby, LobbyError } from '../services/lobbyService';
import { authService } from '../services/authService';
import { ShipPlacement } from './ShipPlacement';
import { sseService } from '../services/sseService';

interface LobbyViewProps {
  lobbyId: string;
  onStartGame: () => void;
  onLeaveLobby: () => void;
}

export const LobbyView = ({ lobbyId, onStartGame, onLeaveLobby }: LobbyViewProps) => {
  const [lobby, setLobby] = useState<Lobby | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameId, setGameId] = useState<string | null>(null);
  const currentUser = authService.getUser();
  const isOwner = currentUser && lobby?.ownerUsername === currentUser.username;
  const router = useRouter();

  // Загрузка информации о лобби
  const loadLobby = useCallback(async () => {
    if (refreshing) return;
    
    setRefreshing(true);
    setError(null);
    
    try {
      const result = await lobbyService.getLobbyById(lobbyId);
      
      if (typeof result === 'object' && 'message' in result) {
        setError(result.message);
      } else {
        console.log('Получено обновление лобби:', result);
        console.log('Текущее состояние:', {
          gameStarted,
          gameId,
          status: result.status,
          resultGameId: result.gameId
        });
        setLobby(result);
        setError(null);
        
        // Если игра началась, переходим к расстановке кораблей
        if (result.status === 'IN_GAME' && !gameStarted && result.gameId) {
          console.log('Игра началась, переходим к расстановке кораблей');
          setGameStarted(true);
          setGameId(result.gameId);
        }
      }
    } catch (error) {
      setError('Ошибка загрузки информации о лобби');
      console.error('Error loading lobby:', error);
    } finally {
      setRefreshing(false);
    }
  }, [lobbyId, refreshing, gameStarted, gameId]);

  // Загрузка данных лобби при монтировании и при изменении ID
  useEffect(() => {
    // Загрузка данных при первом рендере компонента
    if (lobbyId) {
      loadLobby();
      
      // Использование SSE для обновления статуса лобби в реальном времени
      const closeConnection = sseService.connectToLobbyDetails(
        lobbyId,
        // Обработчик обновления данных лобби
        (updatedLobby) => {
          // Проверяем, что данные не являются ошибкой
          if ('message' in updatedLobby) {
            // Если бэкенд вернул ошибку
            setError(updatedLobby.message);
            setIsLoading(false);
            return;
          }
          
          setLobby(updatedLobby);
          setError(null);
          setIsLoading(false);
          
          // Проверка на переход в игру
          if (updatedLobby.gameStarted && updatedLobby.gameId) {
            router.push(`/game/${updatedLobby.gameId}/placement`);
          }
        },
        // Обработчик ошибок
        (error) => {
          console.error('Ошибка SSE для лобби:', error);
          // В случае ошибки SSE, пробуем загрузить данные обычным способом
          loadLobby();
        }
      );
      
      // Закрываем SSE соединение при размонтировании компонента
      return () => {
        closeConnection();
      };
    }
  }, [lobbyId, loadLobby, router]);

  // Автоматический переход в игру, когда статус меняется на IN_GAME
  useEffect(() => {
    console.log('Проверка перехода к игре:', {
      lobbyStatus: lobby?.status,
      gameStarted,
      gameId,
      lobbyGameId: lobby?.gameId
    });
    
    if (lobby && lobby.status === 'IN_GAME' && !gameStarted && lobby.gameId) {
      console.log('Статус лобби изменился на IN_GAME, переходим к расстановке кораблей');
      setGameStarted(true);
      setGameId(lobby.gameId);
      
      // Используем router.push вместо navigate
      if (lobby.gameId) {
        router.push(`/game/${lobby.gameId}/placement`);
      }
    }
  }, [lobby, gameStarted, router]);

  // Обновить вручную
  const handleRefresh = () => {
    if (!refreshing) {
      loadLobby();
    }
  };

  // Обработка выхода из лобби
  const handleLeaveLobby = async () => {
    try {
      setIsLoading(true);
      const result = await lobbyService.leaveLobby(lobbyId);
      
      if (result === true) {
        onLeaveLobby();
      } else if (typeof result === 'object' && 'message' in result) {
        setError(result.message);
      }
    } catch (error) {
      setError('Ошибка при выходе из лобби');
      console.error('Error leaving lobby:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Обработка запуска игры
  const handleStartGame = async () => {
    try {
      setIsLoading(true);
      const result = await lobbyService.startGame(lobbyId);
      
      if (typeof result === 'object' && 'message' in result) {
        setError(result.message);
      } else if (result.gameId) {
        console.log('Игра успешно начата:', result);
        setGameStarted(true);
        setGameId(result.gameId);
        
        // Переходим на страницу расстановки кораблей
        router.push(`/game/${result.gameId}/placement`);
      }
    } catch (error) {
      setError('Ошибка при запуске игры');
      console.error('Error starting game:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Копирование ID лобби в буфер обмена
  const copyLobbyId = () => {
    navigator.clipboard.writeText(lobbyId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading && !lobby) {
    return (
      <div className="bg-gray-800/70 rounded-2xl p-6 text-white w-full flex justify-center items-center" style={{ minHeight: '400px' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error && !lobby) {
    return (
      <div className="bg-gray-800/70 rounded-2xl p-6 text-white w-full" style={{ minHeight: '400px' }}>
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
      <div className="bg-gray-800/70 rounded-2xl p-6 text-white w-full" style={{ minHeight: '400px' }}>
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

  // Если игра началась, показываем компонент расстановки кораблей
  if (gameStarted && gameId) {
    return (
      <ShipPlacement
        gameId={gameId}
        onReady={() => {
          // Переход к игровому полю
          console.log('Игрок готов, переходим к игре');
          onStartGame();
        }}
      />
    );
  }

  const canStartGame = isOwner && lobby.currentPlayers === 2 && (lobby.status === 'WAITING' || lobby.status === 'FULL' || lobby.status === 'IN_GAME');

  return (
    <div className="bg-gray-800/70 rounded-2xl p-6 text-white w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{lobby.lobbyName}</h2>
        <div className="flex gap-2">
          <button 
            onClick={handleRefresh}
            className={`px-3 py-1 rounded-lg transition flex items-center text-sm ${
              refreshing 
                ? 'bg-blue-600 text-opacity-80 cursor-wait' 
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
            disabled={refreshing}
            aria-label="Обновить информацию о лобби"
          >
            <div className={`mr-1.5 flex items-center justify-center ${refreshing ? 'animate-spin' : ''}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
              </svg>
            </div>
            {refreshing ? 'Обновление...' : 'Обновить'}
          </button>
          <div className="text-sm text-gray-400">
            {lobby.isPrivate ? 'Приватное лобби' : 'Публичное лобби'} • 
            <span className={
              lobby.status === 'WAITING' ? 'text-yellow-400 ml-1' :
              lobby.status === 'FULL' ? 'text-blue-400 ml-1' :
              lobby.status === 'IN_GAME' ? 'text-green-400 ml-1' :
              'text-gray-400 ml-1'
            }>
              {lobby.status === 'WAITING' ? 'Ожидание' :
               lobby.status === 'FULL' ? 'Лобби заполнено' :
               lobby.status === 'IN_GAME' ? 'В игре' :
               'Неизвестный статус'}
            </span>
          </div>
        </div>
      </div>

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
      
      <div className="mb-6 bg-gray-700 p-4 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-300">ID лобби:</span>
          <div className="flex gap-2">
            <span className="bg-gray-600 px-3 py-1 rounded font-mono">{lobbyId}</span>
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
        <div className="bg-gray-700 rounded-lg divide-y divide-gray-600">
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
          disabled={isLoading}
        >
          {isLoading ? 'Выход...' : 'Покинуть лобби'}
        </button>
        {isOwner && (
          <button
            onClick={handleStartGame}
            className={`px-4 py-2 rounded-lg transition flex items-center ${
              canStartGame 
                ? 'bg-green-500 hover:bg-green-600' 
                : 'bg-green-500/50 cursor-not-allowed'
            }`}
            disabled={!canStartGame || isLoading}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                Запуск...
              </>
            ) : 'Начать игру'}
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