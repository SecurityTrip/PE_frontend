'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Auth } from './components/Auth';
import { Register } from './components/Register';
import { DifficultySelect } from './components/DifficultySelect';
import { Rules } from './components/Rules';
import { SystemInfo } from './components/SystemInfo';
import { GameBoard } from './components/GameBoard';
import { Settings } from './components/Settings';
import { LobbyList } from './components/LobbyList';
import { CreateLobby } from './components/CreateLobby';
import { LobbyView } from './components/LobbyView';
import { authService, User, AuthError } from './services/authService';

export default function Home() {
  // Состояние аутентификации
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authScreen, setAuthScreen] = useState<'login' | 'register'>('login');
  const [user, setUser] = useState<User | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  
  // Состояние UI
  const [activeScreen, setActiveScreen] = useState('about'); // about, singleplayer, multiPlayer, profile, rules, authors, system
  const [showSettings, setShowSettings] = useState(false);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  // Состояние лобби
  const [lobbyView, setLobbyView] = useState<'list' | 'create' | 'view'>('list');
  const [activeLobbyId, setActiveLobbyId] = useState<string | null>(null);
  const [inGame, setInGame] = useState(false);
  
  // Состояния для инпутов
  const [roomCode, setRoomCode] = useState('');
  const [joinRoomCode, setJoinRoomCode] = useState('');
  const [username, setUsername] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(0);

  // Проверить аутентификацию при загрузке
  useEffect(() => {
    const checkAuth = () => {
      const isAuth = authService.isAuthenticated();
      setIsAuthenticated(isAuth);
      
      if (isAuth) {
        setUser(authService.getUser());
      }
      
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);

  // Моковые данные для игры
  const mockPlayerBoard = Array(10).fill(0).map(() => Array(10).fill(0));
  const mockOpponentBoard = Array(10).fill(0).map(() => Array(10).fill(0));

  // Обработчики аутентификации
  const handleLogin = async (username: string, password: string) => {
    setAuthError(null); // Сбрасываем предыдущую ошибку
    try {
      const result = await authService.login(username, password);
      
      // Проверяем, является ли результат ошибкой
      if (typeof result === 'object' && 'message' in result) {
        setAuthError(result.message);
        return false;
      }
      
      // Если авторизация успешна
      const userData = authService.getUser();
      setUser(userData);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      setAuthError('Произошла неизвестная ошибка при входе');
      return false;
    }
  };

  const handleRegister = async (username: string, password: string, avatar: number) => {
    setAuthError(null); // Сбрасываем предыдущую ошибку
    try {
      const result = await authService.register(username, password, avatar);
      
      // Проверяем, является ли результат ошибкой
      if (typeof result === 'object' && 'message' in result) {
        setAuthError(result.message);
        return false;
      }
      
      // Если регистрация успешна, выполняем вход
      const loginSuccess = await handleLogin(username, password);
      return loginSuccess;
    } catch (error) {
      console.error('Registration failed:', error);
      setAuthError('Произошла неизвестная ошибка при регистрации');
      return false;
    }
  };

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setUser(null);
    setActiveScreen('about');
    setLobbyView('list');
    setActiveLobbyId(null);
    setInGame(false);
  };

  // Обработчики UI
  const handleCellClick = (x: number, y: number, isPlayerBoard: boolean) => {
    console.log('Cell clicked:', x, y, isPlayerBoard);
  };

  const handleDifficultySelect = (difficulty: 'easy' | 'medium' | 'hard') => {
    console.log('Difficulty selected:', difficulty);
  };

  // Обработчики лобби
  const handleCreateLobby = () => {
    setActiveScreen('multiPlayer');
    setLobbyView('create');
  };

  const handleLobbyCreated = (lobbyId: string) => {
    setActiveLobbyId(lobbyId);
    setLobbyView('view');
  };

  const handleJoinLobby = (lobbyId: string) => {
    setActiveLobbyId(lobbyId);
    setLobbyView('view');
  };

  const handleLeaveLobby = () => {
    setActiveLobbyId(null);
    setLobbyView('list');
    setInGame(false);
  };

  const handleStartGame = () => {
    setInGame(true);
  };

  // Рендер правой части в зависимости от выбранного пункта меню
  const renderRightSection = () => {
    switch (activeScreen) {
      case 'singleplayer':
        return <DifficultySelect onSelect={handleDifficultySelect} />;
      
      case 'multiPlayer':
        if (inGame) {
          return (
            <div className="bg-gray-800/70 rounded-2xl p-6 text-white">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Игра</h2>
                <button
                  onClick={handleLeaveLobby}
                  className="px-4 py-2 bg-red-500 rounded-lg hover:bg-red-600 transition"
                >
                  Покинуть игру
                </button>
              </div>
              <GameBoard
                playerName={user?.username || "Вы"}
                opponentName="Противник"
                playerBoard={mockPlayerBoard}
                opponentBoard={mockOpponentBoard}
                onCellClick={handleCellClick}
              />
            </div>
          );
        } else {
          if (lobbyView === 'list') {
            return (
              <LobbyList 
                onJoinLobby={handleJoinLobby} 
                onCreateLobby={handleCreateLobby} 
              />
            );
          } else if (lobbyView === 'create') {
            return (
              <CreateLobby 
                onLobbyCreated={handleLobbyCreated} 
                onCancel={() => setLobbyView('list')} 
              />
            );
          } else if (lobbyView === 'view' && activeLobbyId) {
            return (
              <LobbyView 
                lobbyId={activeLobbyId} 
                onStartGame={handleStartGame} 
                onLeaveLobby={handleLeaveLobby} 
              />
            );
          }
        }
        return null;
        
      case 'profile':
        return (
          <div className="bg-gray-800/70 rounded-2xl p-6 text-white">
            <h2 className="text-2xl mb-4">Настройки профиля</h2>
            <div className="space-y-4">
              <div>
                <p className="mb-2">Аватар:</p>
                <div className="grid grid-cols-5 gap-2">
                  {Array.from({ length: 10 }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedAvatar(i)}
                      className={`w-12 h-12 rounded-lg bg-orange-400 hover:ring-2 hover:ring-blue-500 ${
                        selectedAvatar === i ? 'ring-2 ring-blue-500' : ''
                      }`}
                    >
                      <span className="text-xl">😊</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block mb-2">Сменить логин:</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-white text-black py-2 px-4 rounded-lg"
                />
              </div>
              <div>
                <label className="block mb-2">Старый пароль:</label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full bg-white text-black py-2 px-4 rounded-lg mb-2"
                />
                <label className="block mb-2">Новый пароль:</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-white text-black py-2 px-4 rounded-lg mb-2"
                />
                <label className="block mb-2">Подтвердите пароль:</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-white text-black py-2 px-4 rounded-lg"
                />
              </div>
              <div>
                <button className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition">
                  Сохранить изменения
                </button>
              </div>
            </div>
          </div>
        );
      case 'rules':
        return <Rules />;
      case 'authors':
        return (
          <div className="bg-gray-800/70 rounded-2xl p-6 text-white">
            <h2 className="text-2xl mb-4">Об авторах</h2>
            <div className="space-y-4">
              <ul className="list-disc pl-5 space-y-2">
                <li><a href="https://github.com/SecurityTrip" className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">SecurityTrip</a></li>
                <li><a href="https://github.com/F4NTOM41K" className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">F4NTOM41K</a></li>
                <li><a href="https://github.com/Withotic" className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">Withotic</a></li>
              </ul>
            </div>
          </div>
        );
      case 'system':
        return <SystemInfo />;
      default:
        return (
          <div className="bg-gray-800/70 rounded-2xl p-6 text-white">
            <h2 className="text-2xl mb-4">Добро пожаловать в игру "Морской Бой"</h2>
            <p className="mb-4">
              Классическая игра "Морской Бой" в современном исполнении. Играйте против компьютера или сразитесь с другими игроками онлайн.
            </p>
            <p className="mb-4">
              Управляйте флотом, стратегически размещайте корабли и уничтожайте вражеские суда. Победит тот, кто первым потопит весь флот противника!
            </p>
            <div className="grid grid-cols-2 gap-4 mt-6">
              <button
                onClick={() => setActiveScreen('singleplayer')}
                className="p-4 bg-blue-500 rounded-lg hover:bg-blue-600 transition"
              >
                Одиночная игра
              </button>
              <button
                onClick={() => {
                  setActiveScreen('multiPlayer');
                  setLobbyView('list');
                }}
                className="p-4 bg-green-500 rounded-lg hover:bg-green-600 transition"
              >
                Многопользовательская игра
              </button>
            </div>
          </div>
        );
    }
  };

  // Показ экранов аутентификации
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-sky-300 to-sky-500">
        {authScreen === 'login' ? (
          <Auth 
            onLogin={handleLogin} 
            onRegisterClick={() => setAuthScreen('register')} 
            error={authError}
          />
        ) : (
          <Register 
            onRegister={handleRegister} 
            onLoginClick={() => setAuthScreen('login')} 
            error={authError}
          />
        )}
      </main>
    );
  }

  // Показ основного интерфейса
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-sky-300 to-sky-500">
      <div className="relative w-full max-w-4xl">
        {/* Заголовок игры */}
        <h1 className="text-6xl font-bold text-yellow-400 text-center mb-8 tracking-wider drop-shadow-lg">
          МОРСКОЙ БОЙ
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full flex justify-center">
            <div className="relative w-64 h-12">
              {/* Временно отключим изображение корабля */}
              {/* <Image
                src="/images/battleships.png"
                alt="Battleships"
                width={200}
                height={50}
                className="opacity-25"
              /> */}
            </div>
          </div>
        </h1>

        {/* Основной контейнер */}
        <div className="bg-gray-800/70 rounded-3xl p-8 backdrop-blur-sm shadow-xl">
          {/* Меню слева и контент справа */}
          <div className="flex gap-8">
            {/* Меню слева */}
            <div className="bg-gray-900/80 rounded-2xl p-4 space-y-2 w-64 flex-shrink-0">
              <button 
                onClick={() => {
                  setActiveScreen('singleplayer');
                }}
                className={`w-full text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition ${activeScreen === 'singleplayer' ? 'bg-gray-700' : ''}`}>
                Одиночная игра
              </button>
              <button 
                onClick={() => {
                  setActiveScreen('multiPlayer');
                  setLobbyView('list');
                  setInGame(false);
                }}
                className={`w-full text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition ${activeScreen === 'multiPlayer' ? 'bg-gray-700' : ''}`}>
                Многопользовательская игра
              </button>
              <button 
                onClick={() => setActiveScreen('profile')}
                className={`w-full text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition ${activeScreen === 'profile' ? 'bg-gray-700' : ''}`}>
                Настроить профиль
              </button>
              <button 
                onClick={() => setActiveScreen('rules')}
                className={`w-full text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition ${activeScreen === 'rules' ? 'bg-gray-700' : ''}`}>
                Правила игры
              </button>
              <button 
                onClick={() => setActiveScreen('authors')}
                className={`w-full text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition ${activeScreen === 'authors' ? 'bg-gray-700' : ''}`}>
                Об авторах
              </button>
              <button 
                onClick={() => setActiveScreen('system')}
                className={`w-full text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition ${activeScreen === 'system' ? 'bg-gray-700' : ''}`}>
                О системе
              </button>
              <button 
                onClick={handleLogout}
                className="w-full text-white py-2 px-4 rounded-lg bg-red-600 hover:bg-red-700 transition mt-4">
                Выйти
              </button>
            </div>

            {/* Основная область контента - статический размер */}
            <div className="flex-1 min-h-[400px] min-w-[500px]">
              {renderRightSection()}
            </div>
          </div>
        </div>
      </div>
      
      {/* Модальное окно настроек */}
      {showSettings && (
        <Settings
          onClose={() => setShowSettings(false)}
          musicEnabled={musicEnabled}
          soundEnabled={soundEnabled}
          onMusicToggle={() => setMusicEnabled(!musicEnabled)}
          onSoundToggle={() => setSoundEnabled(!soundEnabled)}
        />
      )}
    </main>
  );
}