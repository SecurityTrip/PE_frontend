import React, { useState } from 'react';

interface AuthProps {
  onLogin: (username: string, password: string) => void;
  onRegisterClick: () => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin, onRegisterClick }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Введите логин и пароль');
      return;
    }
    setError('');
    onLogin(username, password);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="text-6xl font-bold text-yellow-400 text-center mb-8 tracking-wider drop-shadow-lg">
        МОРСКОЙ БОЙ
      </div>
      
      <div className="bg-[#FFBFA5] rounded-3xl p-8 shadow-lg">
        <h2 className="text-2xl font-semibold text-center mb-6 text-[#5E4B3E]">Авторизация</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-full overflow-hidden border-2 border-[#5E4B3E]">
            <input
              type="text"
              placeholder="Логин"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-white text-[#5E4B3E] focus:outline-none"
            />
          </div>
          
          <div className="rounded-full overflow-hidden border-2 border-[#5E4B3E]">
            <input
              type="password"
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white text-[#5E4B3E] focus:outline-none"
            />
          </div>
          
          {error && <p className="text-red-500 text-center">{error}</p>}
          
          <button 
            type="submit"
            className="w-full bg-green-500 text-white py-3 rounded-full hover:bg-green-600 transition"
          >
            Войти
          </button>
        </form>
        
        <div className="text-center mt-4">
          <button
            onClick={onRegisterClick}
            className="text-blue-600 hover:underline text-center"
          >
            Зарегистрироваться
          </button>
        </div>
      </div>
    </div>
  );
}; 