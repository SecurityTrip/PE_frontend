'use client';

import { useState, useEffect } from 'react';
import { lobbyService, Lobby, LobbyError } from '../services/lobbyService';

interface LobbyListProps {
  onJoinLobby: (lobbyId: string) => void;
  onCreateLobby: () => void;
}

export const LobbyList = ({ onJoinLobby, onCreateLobby }: LobbyListProps) => {
  const [lobbies, setLobbies] = useState<Lobby[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'public' | 'my'>('public');
  const [joinLobbyId, setJoinLobbyId] = useState('');
  const [password, setPassword] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedLobby, setSelectedLobby] = useState<Lobby | null>(null);

  // Загрузка списка лобби
  const loadLobbies = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = activeTab === 'public' 
        ? await lobbyService.getPublicLobbies()
        : await lobbyService.getMyLobbies();

      if ('message' in result) {
        setError(result.message);
        setLobbies([]);
      } else {
        setLobbies(result);
      }
    } catch (error) {
      setError('Ошибка загрузки списка лобби');
      console.error('Error loading lobbies:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Загрузка при монтировании и изменении таба
  useEffect(() => {
    loadLobbies();
    
    // Периодическое обновление списка лобби каждые 5 секунд
    const interval = setInterval(() => {
      loadLobbies();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [activeTab]);

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
      const result = await lobbyService.joinLobby({
        lobbyID: lobby.lobbyID,
      });
      
      if ('message' in result) {
        setError(result.message);
      } else {
        onJoinLobby(lobby.lobbyID);
      }
    } catch (error) {
      setError('Ошибка при присоединении к лобби');
      console.error('Error joining lobby:', error);
    }
  };

  // Обработчик присоединения к лобби по ID
  const handleJoinById = async () => {
    if (!joinLobbyId.trim()) {
      setError('Введите ID лобби');
      return;
    }
    
    try {
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
        onJoinLobby(joinLobbyId);
      }
    } catch (error) {
      setError('Ошибка при присоединении к лобби');
      console.error('Error joining lobby by ID:', error);
    }
  };

  // Обработчик подтверждения пароля
  const handleConfirmPassword = async () => {
    if (!selectedLobby) return;
    
    try {
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
        onJoinLobby(selectedLobby.lobbyID);
      }
    } catch (error) {
      setError('Ошибка при присоединении к лобби');
      console.error('Error joining lobby with password:', error);
    }
  };

  return (
    <div className="bg-gray-900/60 rounded-2xl p-6 text-white w-full">
      <div className="flex justify-between mb-6">
        <h2 className="text-2xl font-bold">Список лобби</h2>
        <button 
          onClick={onCreateLobby}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition"
        >
          Создать лобби
        </button>
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
          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2"
        />
        <button
          onClick={handleJoinById}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition"
        >
          Присоединиться
        </button>
      </div>
      
      {/* Сообщение об ошибке */}
      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-200">
          {error}
        </div>
      )}
      
      {/* Список лобби */}
      {isLoading ? (
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
            <div key={lobby.lobbyID} className="bg-gray-800 rounded-lg p-4 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium">{lobby.lobbyName}</h3>
                <div className="text-sm text-gray-400 mt-1">
                  <span>Владелец: {lobby.ownerUsername}</span>
                  <span className="mx-2">•</span>
                  <span>Игроки: {lobby.currentPlayers}/{lobby.maxPlayers}</span>
                  <span className="mx-2">•</span>
                  <span>Статус: {lobby.status}</span>
                  {lobby.isPrivate && (
                    <>
                      <span className="mx-2">•</span>
                      <span className="text-yellow-500">Приватное</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                {activeTab === 'my' && lobby.status === 'WAITING' && lobby.ownerUsername === (typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('battleship_user') || '{}').username : '') && (
                  <button
                    onClick={async () => {
                      const result = await lobbyService.startGame(lobby.lobbyID);
                      if (!('message' in result)) {
                        loadLobbies();
                      }
                    }}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition"
                  >
                    Начать игру
                  </button>
                )}
                {activeTab === 'public' && (
                  <button
                    onClick={() => handleJoinLobby(lobby)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition"
                  >
                    Присоединиться
                  </button>
                )}
                {activeTab === 'my' && (
                  <button
                    onClick={async () => {
                      await lobbyService.leaveLobby(lobby.lobbyID);
                      loadLobbies();
                    }}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
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
            />
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPassword('');
                  setSelectedLobby(null);
                }}
                className="px-4 py-2 border border-gray-600 rounded-lg hover:bg-gray-700 transition"
              >
                Отмена
              </button>
              <button
                onClick={handleConfirmPassword}
                className="px-4 py-2 bg-blue-500 rounded-lg hover:bg-blue-600 transition"
              >
                Подтвердить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 