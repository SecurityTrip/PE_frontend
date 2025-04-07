import React from 'react';

interface AuthProps {
  onLogin: (username: string, password: string) => void;
  onRegister: () => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin, onRegister }) => {
  return (
    <div className="bg-[#FFF1E6]/90 rounded-3xl p-8 shadow-lg w-96">
      <h2 className="text-2xl font-semibold text-center mb-6">Авторизация</h2>
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Логин"
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="password"
          placeholder="Пароль"
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition">
          Зарегистрироваться
        </button>
        <div className="text-center">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onRegister();
            }}
            className="text-blue-600 hover:underline"
          >
            Зарегистрироваться
          </a>
        </div>
      </div>
    </div>
  );
}; 