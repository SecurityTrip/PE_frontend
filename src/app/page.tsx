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
import { authService, User, AuthError } from './services/authService';

export default function Home() {
  // Состояние аутентификации
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authScreen, setAuthScreen] = useState<'login' | 'register'>('login');
  const [user, setUser] = useState<User | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  
  // Состояние UI
  const [activeScreen, setActiveScreen] = useState('about'); // about, singleplayer, createRoom, join, profile, rules, authors, system
  const [showSettings, setShowSettings] = useState(false);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  // Состояния для инпутов
  const [roomCode, setRoomCode] = useState('758n7984hd9f84jre');
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
  };

  // Обработчики UI
  const handleCellClick = (x: number, y: number, isPlayerBoard: boolean) => {
    console.log('Cell clicked:', x, y, isPlayerBoard);
  };

  const handleDifficultySelect = (difficulty: 'easy' | 'medium' | 'hard') => {
    console.log('Difficulty selected:', difficulty);
  };

  // Рендер правой части в зависимости от выбранного пункта меню
  const renderRightSection = () => {
    switch (activeScreen) {
      case 'singleplayer':
        return <DifficultySelect onSelect={handleDifficultySelect} />;
      case 'createRoom':
        return (
          <div className="bg-gray-900/60 rounded-2xl p-6 text-white">
            <h2 className="text-2xl mb-4">Сгенерированный код:</h2>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                readOnly
                className="flex-1 bg-white text-black py-2 px-4 rounded-lg"
              />
              <button className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition">
                Скопировать
              </button>
            </div>
          </div>
        );
      case 'join':
        return (
          <div className="bg-gray-900/60 rounded-2xl p-6 text-white">
            <h2 className="text-2xl mb-4">Введите код комнаты:</h2>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={joinRoomCode}
                onChange={(e) => setJoinRoomCode(e.target.value)}
                placeholder="Код комнаты"
                className="flex-1 bg-white text-black py-2 px-4 rounded-lg"
              />
              <button className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition">
                Войти
              </button>
            </div>
          </div>
        );
      case 'profile':
        return (
          <div className="bg-gray-900/60 rounded-2xl p-6 text-white">
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
                <label className="block mb-2">Повторите пароль:</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-white text-black py-2 px-4 rounded-lg"
                />
              </div>
              <button className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition">
                Сохранить изменения
              </button>
            </div>
          </div>
        );
      case 'rules':
        return <Rules />;
      case 'authors':
        return (
          <div className="bg-gray-900/60 rounded-2xl p-6 text-white">
            <h2 className="text-2xl mb-4">Об авторах</h2>
            <div className="space-y-4">
              <h3 className="text-xl">Фронтенд: Паршин Никита</h3>
              <h3 className="text-xl">Бэкэнд: Лысов Илья</h3>
              <h3 className="text-xl">Документация: Лебедев Евгений</h3>
            </div>
          </div>
        );
      case 'system':
        return <SystemInfo />;
      default:
        return (
          <div className="bg-gray-900/60 rounded-2xl p-6 text-white">
            <h2 className="text-2xl mb-4">Фронтенд: Паршин Никита</h2>
            <h2 className="text-2xl mb-4">Бэкэнд: Лысов Илья</h2>
            <h2 className="text-2xl">Документация: Лебедев Евгений</h2>
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
                onClick={() => setActiveScreen('singleplayer')}
                className={`w-full text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition ${activeScreen === 'singleplayer' ? 'bg-gray-700' : ''}`}>
                Одиночная игра
              </button>
              <button 
                onClick={() => setActiveScreen('createRoom')}
                className={`w-full text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition ${activeScreen === 'createRoom' ? 'bg-gray-700' : ''}`}>
                Создать комнату
              </button>
              <button 
                onClick={() => setActiveScreen('join')}
                className={`w-full text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition ${activeScreen === 'join' ? 'bg-gray-700' : ''}`}>
                Подключиться
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