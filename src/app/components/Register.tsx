import React, { useState } from 'react';

interface RegisterProps {
  onRegister: (username: string, password: string, avatar: number) => Promise<boolean>;
  onLoginClick: () => void;
  error?: string | null;
}

export const Register: React.FC<RegisterProps> = ({ onRegister, onLoginClick, error }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(0);
  const [localError, setLocalError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const avatars = Array.from({ length: 10 }, (_, i) => i);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username) {
      setLocalError('Введите логин');
      return;
    }
    
    if (!password) {
      setLocalError('Введите пароль');
      return;
    }
    
    if (password !== confirmPassword) {
      setLocalError('Пароли не совпадают');
      return;
    }
    
    setLocalError('');
    setIsLoading(true);
    
    try {
      await onRegister(username, password, selectedAvatar);
    } finally {
      setIsLoading(false);
    }
  };

  // Отображаем глобальную ошибку (от родительского компонента) или локальную ошибку
  const displayError = error || localError;

  return (
    <div className="flex flex-col items-center">
      <div className="text-6xl font-bold text-yellow-400 text-center mb-8 tracking-wider drop-shadow-lg">
        МОРСКОЙ БОЙ
      </div>
      
      <div className="bg-[#FFBFA5] rounded-3xl p-8 shadow-lg">
        <h2 className="text-2xl font-semibold text-center mb-6 text-[#5E4B3E]">Регистрация</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-full overflow-hidden border-2 border-[#5E4B3E]">
            <input
              type="text"
              placeholder="Логин"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-white text-[#5E4B3E] focus:outline-none"
              disabled={isLoading}
            />
          </div>
          
          <div className="rounded-full overflow-hidden border-2 border-[#5E4B3E]">
            <input
              type="password"
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white text-[#5E4B3E] focus:outline-none"
              disabled={isLoading}
            />
          </div>
          
          <div className="rounded-full overflow-hidden border-2 border-[#5E4B3E]">
            <input
              type="password"
              placeholder="Повторите пароль"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white text-[#5E4B3E] focus:outline-none"
              disabled={isLoading}
            />
          </div>
          
          <div>
            <label className="block text-[#5E4B3E] font-medium mb-2">
              Аватар:
            </label>
            <div className="grid grid-cols-5 gap-2">
              {avatars.map((avatar) => (
                <button
                  type="button"
                  key={avatar}
                  onClick={() => setSelectedAvatar(avatar)}
                  className={`w-12 h-12 rounded-lg bg-orange-400 flex items-center justify-center transition ${
                    selectedAvatar === avatar
                      ? 'ring-2 ring-blue-500'
                      : 'hover:ring-2 hover:ring-blue-300'
                  }`}
                  disabled={isLoading}
                >
                  <span className="text-xl">😊</span>
                </button>
              ))}
            </div>
          </div>
          
          {displayError && (
            <p className="text-red-500 text-center">{displayError}</p>
          )}
          
          <button 
            type="submit"
            className={`w-full ${isLoading ? 'bg-gray-400' : 'bg-green-500 hover:bg-green-600'} text-white py-3 rounded-full transition`}
            disabled={isLoading}
          >
            {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>
        </form>
        
        <div className="text-center mt-4">
          <button
            onClick={onLoginClick}
            className="text-blue-600 hover:underline text-center"
            disabled={isLoading}
          >
            У меня уже есть аккаунт, войти
          </button>
        </div>
      </div>
    </div>
  );
}; 