'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Auth } from './components/Auth';
import { Register } from './components/Register';
import { DifficultySelect } from './components/DifficultySelect';
import { Rules } from './components/Rules';
import { SystemInfo } from './components/SystemInfo';
import { GameBoard } from './components/GameBoard';
import { Settings } from './components/Settings';

export default function Home() {
  const [activeScreen, setActiveScreen] = useState('about'); // about, singleplayer, createRoom, join, profile, rules, authors, system
  const [showSettings, setShowSettings] = useState(false);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Моковые данные для игры
  const mockPlayerBoard = Array(10).fill(0).map(() => Array(10).fill(0));
  const mockOpponentBoard = Array(10).fill(0).map(() => Array(10).fill(0));

  // Обработчики
  const handleLogin = (username: string, password: string) => {
    console.log('Login:', username, password);
  };

  const handleRegister = (username: string, password: string, avatar: number) => {
    console.log('Register:', username, password, avatar);
  };

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
                value="758n7984hd9f84jre"
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
                      className="w-12 h-12 rounded-lg bg-orange-400 hover:ring-2 hover:ring-blue-500"
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
                  className="w-full bg-white text-black py-2 px-4 rounded-lg"
                />
              </div>
              <div>
                <label className="block mb-2">Старый пароль:</label>
                <input
                  type="password"
                  className="w-full bg-white text-black py-2 px-4 rounded-lg mb-2"
                />
                <label className="block mb-2">Новый пароль:</label>
                <input
                  type="password"
                  className="w-full bg-white text-black py-2 px-4 rounded-lg mb-2"
                />
                <label className="block mb-2">Повторите пароль:</label>
                <input
                  type="password"
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

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-sky-300 to-sky-500">
      <div className="relative w-full max-w-4xl">
        {/* Заголовок игры */}
        <h1 className="text-6xl font-bold text-yellow-400 text-center mb-8 tracking-wider drop-shadow-lg">
          МОРСКОЙ БОЙ
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full flex justify-center">
            <div className="relative w-64 h-12">
              <Image
                src="/images/battleships.png"
                alt="Battleships"
                width={200}
                height={50}
                className="opacity-25"
              />
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
