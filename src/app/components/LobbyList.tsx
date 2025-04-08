'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Lobby, LobbyError } from '../services/lobbyService';
import { lobbyService } from '../services/lobbyService';
import { sseService } from '../services/sseService';
import { authService } from '../services/authService';

interface LobbyListProps {
  onJoinLobby: (lobbyId: string) => void;
  onCreateLobby: () => void;
}

interface LobbyPlayer {
  username: string;
  isHost: boolean;
}

export const LobbyList: React.FC<LobbyListProps> = ({ onJoinLobby, onCreateLobby }) => {
  const [activeTab, setActiveTab] = useState<'public' | 'my'>('public');
  const [lobbies, setLobbies] = useState<Lobby[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [joinLobbyId, setJoinLobbyId] = useState('');
  const [lobbyPassword, setLobbyPassword] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedLobbyId, setSelectedLobbyId] = useState<string | null>(null);
  const [lastUpdateTime, setLastUpdateTime] = useState<number | null>(null);
  const [usingSse, setUsingSse] = useState(true);
  const [sseConnectionAttempts, setSseConnectionAttempts] = useState(0);
  const [sseActive, setSseActive] = useState(true);
  const [currentUser] = useState(authService.getUser());

  const loadLobbies = useCallback(async () => {
    if (refreshing) return;

    if (!sseActive) {
      setIsLoading(true);
    }

    try {
      let result;
      
      if (activeTab === 'public') {
        result = await lobbyService.getPublicLobbies();
      } else {
        result = await lobbyService.getMyLobbies();
      }

      if ('message' in result) {
        // Обрабатываем ошибку от сервера
        setError(result.message);
        return;
      }

      // Фильтруем лобби в зависимости от активной вкладки
      setLobbies(result);
      setError(null);
    } catch (error) {
      console.error('Error loading lobbies:', error);
      setError('Ошибка загрузки данных. Попробуйте позднее.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [activeTab, refreshing, sseActive]);

  // Проверяем, является ли текущий пользователь владельцем лобби
  const isPlayerHost = useCallback((player: any): boolean => {
    const currentUser = authService.getUser();
    if (!currentUser) return false;
    return player.username === currentUser.username;
  }, []);

  // Обработка обновлений лобби через SSE
  const handleLobbyUpdate = useCallback((data: Lobby[]) => {
    // Успешное обновление через SSE, сбрасываем счетчик попыток
    setSseConnectionAttempts(0);
    setUsingSse(true);
    
    // Фильтрация лобби в зависимости от активной вкладки
    const filteredLobbies = activeTab === 'public'
      ? data.filter(lobby => !lobby.isPrivate)
      : data.filter(lobby => isPlayerHost(lobby));
    
    setLobbies(filteredLobbies);
    setLastUpdateTime(Date.now());
    setError(null);
  }, [activeTab, isPlayerHost]);

  // Обработчик ошибок SSE
  const handleSseError = useCallback((error: any) => {
    console.error('Ошибка SSE:', error);
    
    // Увеличиваем счетчик попыток подключения
    setSseConnectionAttempts(prev => {
      const newValue = prev + 1;
      
      // После 2 неудачных попыток переключаемся на обычные запросы
      // (быстрее переходим на надежный способ)
      if (newValue >= 2 && usingSse) {
        setUsingSse(false);
        setError('Проблемы с обновлением данных в реальном времени. Используются обычные запросы.');
        
        // Запускаем немедленную загрузку данных обычным способом
        loadLobbies();
        
        // Скрываем ошибку через 5 секунд
        setTimeout(() => {
          setError(null);
        }, 5000);
      }
      
      return newValue;
    });
    
    // Если получено сообщение о принудительном переключении в ручной режим от сервиса
    if (error && error.message && 
       (error.message.includes('Превышен лимит') || 
        error.message.includes('Слишком много попыток') || 
        error.message.includes('Автоматическое переподключение отключено'))) {
      // Принудительно переключаемся в режим обычных запросов
      setUsingSse(false);
      setError(error.message);
      
      // Запускаем немедленную загрузку данных обычным способом
      loadLobbies();
      
      // Скрываем ошибку через 5 секунд
      setTimeout(() => {
        setError(null);
      }, 5000);
      
      return;
    }
    
    // Не показываем ошибку для таймаутов и переподключений, 
    // только для действительно критичных проблем
    if (error && error.message && 
        !error.message.includes('используется ручное обновление') &&
        !error.message.includes('переподкл') &&
        !error.message.includes('таймаут')) {
      
      // Отображаем ошибку только если мы еще используем SSE
      if (usingSse) {
        setError('Проблема с подключением. Пробуем переподключиться...');
      }
    }
    
    // Запускаем ручное обновление только если прошло некоторое время 
    // с момента последнего обновления данных и мы не используем SSE
    const now = Date.now();
    if (!refreshing && !usingSse && (!lastUpdateTime || now - lastUpdateTime > 5000)) {
      loadLobbies();
    }
  }, [loadLobbies, refreshing, lastUpdateTime, usingSse]);

  // Сброс состояния SSE сервиса с защитой от undefined
  const resetSseService = useCallback(() => {
    try {
      if (sseService.resetService) {
        sseService.resetService();
      } else if (sseService.resetManualMode) {
        // Для обратной совместимости, если новая функция еще не доступна
        sseService.resetManualMode();
        sseService.closeAllConnections();
      }
    } catch (e) {
      console.error('Ошибка при сбросе SSE сервиса:', e);
    }
  }, []);

  // Попытка переключиться обратно на SSE
  const tryReconnectSse = useCallback(() => {
    if (!usingSse) {
      // Не пытаемся восстанавливать SSE соединение, если было слишком много попыток
      if (sseConnectionAttempts >= 5) {
        console.log('Слишком много попыток SSE соединения. Остаемся в ручном режиме.');
        return () => {};
      }
      
      console.log('Попытка восстановить SSE соединение');
      setSseConnectionAttempts(0);
      setUsingSse(true);
      
      // Полный сброс состояния SSE сервиса перед попыткой переподключения
      resetSseService();
      
      // Закрываем и открываем соединение заново
      const closeConnection = sseService.connectToLobbyUpdates(
        handleLobbyUpdate,
        handleSseError
      );
      
      return closeConnection;
    }
    return () => {};
  }, [usingSse, handleLobbyUpdate, handleSseError, sseConnectionAttempts, resetSseService]);

  // Инициализация SSE соединения
  useEffect(() => {
    let closeConnection = () => {};
    let refreshIntervalId: NodeJS.Timeout | null = null;
    
    if (usingSse) {
      try {
        // При первой инициализации или при повторном входе сбрасываем состояние сервиса
        if (sseConnectionAttempts === 0) {
          resetSseService();
        }
        
        // Устанавливаем SSE соединение
        closeConnection = sseService.connectToLobbyUpdates(
          handleLobbyUpdate,
          handleSseError
        );
      } catch (e) {
        console.error('Критическая ошибка при подключении SSE:', e);
        setUsingSse(false);
        
        // Полный сброс сервиса в случае ошибки
        resetSseService();
        
        // Запускаем немедленную загрузку данных обычным способом
        loadLobbies();
      }
    } else {
      // Если SSE не используется, загружаем данные обычным способом
      loadLobbies();
    }
    
    // Настраиваем интервал обновления для всех режимов
    refreshIntervalId = setInterval(() => {
      const now = Date.now();
      
      if (!usingSse && !refreshing && (!lastUpdateTime || now - lastUpdateTime > 5000)) {
        // В обычном режиме обновляем данные каждые 5 секунд
        loadLobbies();
      } else if (!usingSse && now % 120000 < 1000 && sseConnectionAttempts < 5) {
        // Каждые 2 минуты пробуем восстановить SSE соединение
        // и только если счетчик попыток не слишком большой
        try {
          closeConnection = tryReconnectSse();
        } catch (e) {
          console.error('Ошибка при попытке восстановить SSE:', e);
          
          // Если возникла ошибка при попытке восстановления, сбрасываем сервис
          resetSseService();
        }
      }
    }, 1000); // Проверяем каждую секунду
    
    // Очистка при размонтировании
    return () => {
      try {
        closeConnection();
        // Полностью закрываем все соединения при размонтировании
        if (sseService.closeAllConnections) {
          sseService.closeAllConnections();
        }
      } catch (e) {
        console.warn('Ошибка при закрытии SSE соединения:', e);
        // В случае ошибки делаем полный сброс сервиса
        resetSseService();
      }
      
      if (refreshIntervalId !== null) {
        clearInterval(refreshIntervalId);
      }
    };
  }, [handleLobbyUpdate, handleSseError, loadLobbies, refreshing, lastUpdateTime, usingSse, tryReconnectSse, sseConnectionAttempts, resetSseService]);

  // Загружаем данные при изменении вкладки
  useEffect(() => {
    // При смене вкладки загружаем данные обычным запросом в любом случае
    loadLobbies();
  }, [activeTab, loadLobbies]);

  // Обработчик смены вкладки
  const handleTabChange = (tab: 'public' | 'my') => {
    setActiveTab(tab);
    setIsLoading(true);
  };

  // Ручное обновление данных
  const handleRefresh = () => {
    // При ручном обновлении используем обычный запрос независимо от режима
    loadLobbies();
    
    // Пробуем восстановить SSE соединение только если не было слишком много попыток
    if (!usingSse && sseConnectionAttempts < 5) {
      tryReconnectSse();
    }
  };

  // Обработчик нажатия кнопки для присоединения к лобби
  const handleJoinClick = (lobbyId: string, isPrivate: boolean) => {
    if (isPrivate) {
      setSelectedLobbyId(lobbyId);
      setShowPasswordModal(true);
    } else {
      handleJoinLobby(lobbyId);
    }
  };

  // Функция присоединения к лобби
  const handleJoinLobby = async (lobbyId: string, password: string = '') => {
    try {
      await lobbyService.joinLobby({
        lobbyID: lobbyId,
        password: password
      });
      onJoinLobby(lobbyId);
    } catch (error) {
      console.error('Ошибка при присоединении к лобби:', error);
      setError('Не удалось присоединиться к лобби');
    }
  };

  // Обработчик присоединения к лобби по ID
  const handleJoinById = async () => {
    if (!joinLobbyId) {
      setError('Введите ID лобби');
      return;
    }

    setError(null);
    
    try {
      const lobbyResult = await lobbyService.getLobbyById(joinLobbyId);
      
      // Проверяем, является ли результат ошибкой
      if ('message' in lobbyResult) {
        setError(lobbyResult.message);
        return;
      }
      
      if (lobbyResult.isPrivate) {
        setSelectedLobbyId(joinLobbyId);
        setShowPasswordModal(true);
      } else {
        await lobbyService.joinLobby({
          lobbyID: joinLobbyId
        });
        onJoinLobby(joinLobbyId);
      }
    } catch (error) {
      console.error('Ошибка при присоединении к лобби по ID:', error);
      setError('Не удалось найти лобби с указанным ID');
    }
  };

  // Обработчик отправки формы с паролем
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedLobbyId) return;
    
    try {
      await lobbyService.joinLobby({
        lobbyID: selectedLobbyId,
        password: lobbyPassword
      });
      setShowPasswordModal(false);
      setLobbyPassword('');
      onJoinLobby(selectedLobbyId);
    } catch (error) {
      console.error('Ошибка при присоединении к приватному лобби:', error);
      setError('Неверный пароль или ошибка при присоединении');
    }
  };

  return (
    <div className="bg-gray-800/70 rounded-2xl p-6 text-white w-full">
      <div className="flex justify-between mb-6">
        <h2 className="text-2xl font-bold">Список лобби</h2>
        <div className="flex gap-2">
          <button 
            onClick={handleRefresh}
            className={`px-4 py-2 rounded-lg transition flex items-center ${
              refreshing 
                ? 'bg-blue-600 text-opacity-80 cursor-wait' 
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
            disabled={refreshing}
            aria-label="Обновить список лобби"
          >
            <div className={`mr-2 flex items-center justify-center ${refreshing ? 'animate-spin' : ''}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
              </svg>
            </div>
            {refreshing ? 'Обновление...' : 'Обновить'}
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
          onClick={() => handleTabChange('public')}
        >
          Публичные лобби
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'my' ? 'border-b-2 border-blue-500 text-blue-400' : 'text-gray-400'}`}
          onClick={() => handleTabChange('my')}
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
        <div className="mb-4 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-200 flex items-start gap-3">
          <div className="text-red-400 flex-shrink-0 mt-0.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <div className="flex-grow">
            <p className="font-medium">Произошла ошибка</p>
            <p>{error}</p>
          </div>
          <button 
            onClick={() => setError(null)} 
            className="text-red-300 hover:text-white flex-shrink-0"
            aria-label="Закрыть сообщение об ошибке"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      )}
      
      {/* Список лобби */}
      {isLoading && lobbies.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 bg-gray-700/50 rounded-xl">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-300">Загрузка списка лобби...</p>
        </div>
      ) : lobbies.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 bg-gray-700/50 rounded-xl">
          <div className="mb-4 text-gray-300">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
          </div>
          <p className="text-xl text-gray-300 mb-2">
            {activeTab === 'public' ? 'Нет доступных публичных лобби' : 'Вы не участвуете ни в одном лобби'}
          </p>
          <p className="text-gray-400 text-sm">
            {activeTab === 'public' 
              ? 'Создайте новое лобби или присоединитесь по ID' 
              : 'Создайте новое лобби или присоединитесь к существующему'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {lobbies.map((lobby) => (
            <div key={lobby.lobbyID} className="bg-gray-700 rounded-lg p-4 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium">{lobby.lobbyName}</h3>
                <div className="text-sm text-gray-400 mt-1">
                  <span>Игроки: {lobby.players.length}/{lobby.maxPlayers}</span>
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
                <button
                  onClick={() => handleJoinClick(lobby.lobbyID, lobby.isPrivate)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition"
                  disabled={isLoading || lobby.players.length >= lobby.maxPlayers}
                >
                  {lobby.players.length >= lobby.maxPlayers ? 'Полное' : 'Присоединиться'}
                </button>
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
            <p className="mb-4">Лобби требует пароль для входа:</p>
            
            <input
              type="password"
              placeholder="Введите пароль"
              value={lobbyPassword}
              onChange={(e) => setLobbyPassword(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 mb-4"
              disabled={isLoading}
              autoFocus
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
                  setLobbyPassword('');
                }}
                className="px-4 py-2 border border-gray-600 rounded-lg hover:bg-gray-700 transition"
                disabled={isLoading}
              >
                Отмена
              </button>
              <button
                onClick={handlePasswordSubmit}
                className="px-4 py-2 bg-blue-500 rounded-lg hover:bg-blue-600 transition flex items-center"
                disabled={isLoading || !lobbyPassword.trim()}
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