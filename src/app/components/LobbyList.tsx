'use client';

import { useState, useEffect, useCallback } from 'react';
import { lobbyService, Lobby, LobbyError } from '../services/lobbyService';

interface LobbyListProps {
  onJoinLobby: (lobbyId: string) => void;
  onCreateLobby: () => void;
}

export const LobbyList = ({ onJoinLobby, onCreateLobby }: LobbyListProps) => {
  const [lobbies, setLobbies] = useState<Lobby[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'public' | 'my'>('public');
  const [joinLobbyId, setJoinLobbyId] = useState('');
  const [password, setPassword] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedLobby, setSelectedLobby] = useState<Lobby | null>(null);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  // Загрузка списка лобби
  const loadLobbies = useCallback(async () => {
    if (refreshing) return;
    
    setRefreshing(true);
    setError(null);
    
    try {
      const result = activeTab === 'public' 
        ? await lobbyService.getPublicLobbies()
        : await lobbyService.getMyLobbies();
      
      if ('message' in result) {
        setError(result.message);
      } else {
        setLobbies(result);
        setError(null);
      }
    } catch (error) {
      setError('Ошибка загрузки списка лобби');
      console.error('Error loading lobbies:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refreshing, activeTab]);

  // Загрузка данных при монтировании
  useEffect(() => {
    loadLobbies();
    
    const interval = setInterval(() => {
      loadLobbies();
    }, 3000);
    
    return () => clearInterval(interval);
  }, [loadLobbies]);

  // Обновить вручную
  const handleRefresh = () => {
    loadLobbies();
  };

  // Обработчик прямого присоединения к лобби
  const handleJoinLobby = async (lobby: Lobby) => {
    // Если лобби приватное, показываем модальное окно для ввода пароля
    if (lobby.isPrivate) {
      setSelectedLobby(lobby);
      setShowPasswordModal(true);
      return;
    }
    
    // Иначе присоединяемся напрямую
    try {
      setIsLoading(true);
      const result = await lobbyService.joinLobby({
        lobbyID: lobby.lobbyID,
      });
      
      if ('message' in result) {
        setError(result.message);
      } else {
        setError(null);
        onJoinLobby(lobby.lobbyID);
      }
    } catch (error) {
      setError('Ошибка при присоединении к лобби');
      console.error('Error joining lobby:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Обработчик присоединения к лобби по ID
  const handleJoinById = async () => {
    if (!joinLobbyId.trim()) {
      setError('Введите ID лобби');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Сначала получаем информацию о лобби
      const lobbyInfo = await lobbyService.getLobbyById(joinLobbyId);
      
      if ('message' in lobbyInfo) {
        setError(lobbyInfo.message);
        return;
      }
      
      // Если лобби приватное, показываем модальное окно для ввода пароля
      if (lobbyInfo.isPrivate) {
        setSelectedLobby(lobbyInfo);
        setShowPasswordModal(true);
        return;
      }
      
      // Иначе присоединяемся напрямую
      const result = await lobbyService.joinLobby({
        lobbyID: joinLobbyId,
      });
      
      if ('message' in result) {
        setError(result.message);
      } else {
        setError(null);
        onJoinLobby(joinLobbyId);
      }
    } catch (error) {
      setError('Ошибка при присоединении к лобби');
      console.error('Error joining lobby by ID:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Обработчик подтверждения пароля
  const handleConfirmPassword = async () => {
    if (!selectedLobby) return;
    
    try {
      setIsLoading(true);
      
      const result = await lobbyService.joinLobby({
        lobbyID: selectedLobby.lobbyID,
        password,
      });
      
      if ('message' in result) {
        setError(result.message);
      } else {
        setShowPasswordModal(false);
        setPassword('');
        setSelectedLobby(null);
        setError(null);
        onJoinLobby(selectedLobby.lobbyID);
      }
    } catch (error) {
      setError('Ошибка при присоединении к лобби');
      console.error('Error joining lobby with password:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Обработчик выхода из лобби
  const handleLeaveLobby = async (lobbyId: string) => {
    try {
      setIsLoading(true);
      
      const result = await lobbyService.leaveLobby(lobbyId);
      
      if (result === true) {
        // Обновляем список лобби после успешного выхода
        handleRefresh();
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

  // Обработчик запуска игры
  const handleStartGame = async (lobbyId: string) => {
    try {
      setIsLoading(true);
      
      const result = await lobbyService.startGame(lobbyId);
      
      if ('message' in result) {
        setError(result.message);
      } else {
        handleRefresh();
      }
    } catch (error) {
      setError('Ошибка при запуске игры');
      console.error('Error starting game:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-800/70 rounded-2xl p-6 text-white w-full">
      <div className="flex justify-between mb-6">
        <h2 className="text-2xl font-bold">Список лобби</h2>
        <div className="flex gap-2">
          <button 
            onClick={handleRefresh}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition flex items-center"
            disabled={refreshing}
          >
            {refreshing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                Обновление...
              </>
            ) : '🔄 Обновить'}
          </button>
          <button 
            onClick={onCreateLobby}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition"
          >
            Создать лобби
          </button>
        </div>
      </div>
      
      {/* Вкладки */}
      <div className="flex mb-4 border-b border-gray-700">
        <button 
          className={`px-4 py-2 ${activeTab === 'public' ? 'border-b-2 border-blue-500 text-blue-400' : 'text-gray-400'}`}
          onClick={() => setActiveTab('public')}
        >
          Публичные лобби
        </button>
        <button 
          className={`px-4 py-2 ${activeTab === 'my' ? 'border-b-2 border-blue-500 text-blue-400' : 'text-gray-400'}`}
          onClick={() => setActiveTab('my')}
        >
          Мои лобби
        </button>
      </div>
      
      {/* Ввод ID лобби */}
      <div className="mb-6 flex gap-2">
        <input
          type="text"
          placeholder="Введите ID лобби для присоединения"
          value={joinLobbyId}
          onChange={(e) => setJoinLobbyId(e.target.value)}
          className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
          disabled={isLoading}
        />
        <button
          onClick={handleJoinById}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition"
          disabled={isLoading || !joinLobbyId.trim()}
        >
          Присоединиться
        </button>
      </div>
      
      {/* Сообщение об ошибке */}
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
      
      {/* Список лобби */}
      {isLoading && lobbies.length === 0 ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : lobbies.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          {activeTab === 'public' ? 'Нет доступных публичных лобби' : 'Вы не участвуете ни в одном лобби'}
        </div>
      ) : (
        <div className="grid gap-4">
          {lobbies.map((lobby) => (
            <div key={lobby.lobbyID} className="bg-gray-700 rounded-lg p-4 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium">{lobby.lobbyName}</h3>
                <div className="text-sm text-gray-400 mt-1">
                  <span>Владелец: {lobby.ownerUsername}</span>
                  <span className="mx-2">•</span>
                  <span>Игроки: {lobby.currentPlayers}/{lobby.maxPlayers}</span>
                  <span className="mx-2">•</span>
                  <span>
                    Статус: 
                    <span className={lobby.status === 'WAITING' ? 
                      'text-yellow-400 ml-1' : 
                      'text-green-400 ml-1'
                    }>
                      {lobby.status === 'WAITING' ? 'Ожидание' : 'В игре'}
                    </span>
                  </span>
                  {lobby.isPrivate && (
                    <>
                      <span className="mx-2">•</span>
                      <span className="text-yellow-500">Приватное</span>
                    </>
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  ID: {lobby.lobbyID}
                </div>
              </div>
              <div className="flex gap-2">
                {activeTab === 'my' && lobby.status === 'WAITING' && lobby.ownerUsername === (typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('battleship_user') || '{}').username : '') && (
                  <button
                    onClick={() => handleStartGame(lobby.lobbyID)}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition"
                    disabled={isLoading || lobby.currentPlayers < 2}
                  >
                    Начать игру
                  </button>
                )}
                {activeTab === 'public' && (
                  <button
                    onClick={() => handleJoinLobby(lobby)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition"
                    disabled={isLoading}
                  >
                    Присоединиться
                  </button>
                )}
                {activeTab === 'my' && (
                  <button
                    onClick={() => handleLeaveLobby(lobby.lobbyID)}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
                    disabled={isLoading}
                  >
                    Выйти
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Модальное окно для ввода пароля */}
      {showPasswordModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Требуется пароль</h3>
            <p className="mb-4">Лобби "{selectedLobby?.lobbyName}" требует пароль для входа:</p>
            
            <input
              type="password"
              placeholder="Введите пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 mb-4"
              disabled={isLoading}
            />
            
            {error && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-200">
                {error}
              </div>
            )}
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPassword('');
                  setSelectedLobby(null);
                  setError(null);
                }}
                className="px-4 py-2 border border-gray-600 rounded-lg hover:bg-gray-700 transition"
                disabled={isLoading}
              >
                Отмена
              </button>
              <button
                onClick={handleConfirmPassword}
                className="px-4 py-2 bg-blue-500 rounded-lg hover:bg-blue-600 transition flex items-center"
                disabled={isLoading || !password.trim()}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Подключение...
                  </>
                ) : 'Подтвердить'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 