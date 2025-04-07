import React, { useState } from 'react';

interface RegisterProps {
  onRegister: (username: string, password: string, avatar: number) => void;
  onBack: () => void;
}

const avatars = Array.from({ length: 10 }, (_, i) => i + 1);

export const Register: React.FC<RegisterProps> = ({ onRegister, onBack }) => {
  const [selectedAvatar, setSelectedAvatar] = useState(1);

  return (
    <div className="bg-[#FFF1E6]/90 rounded-3xl p-8 shadow-lg w-96">
      <h2 className="text-2xl font-semibold text-center mb-6">Регистрация</h2>
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
        <input
          type="password"
          placeholder="Повторите пароль"
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Аватар:
          </label>
          <div className="grid grid-cols-5 gap-2">
            {avatars.map((avatar) => (
              <button
                key={avatar}
                onClick={() => setSelectedAvatar(avatar)}
                className={`w-12 h-12 rounded-lg border-2 transition ${
                  selectedAvatar === avatar
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <img
                  src={`/avatars/${avatar}.png`}
                  alt={`Avatar ${avatar}`}
                  className="w-full h-full object-cover rounded"
                />
              </button>
            ))}
          </div>
        </div>

        <button className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition">
          Зарегистрироваться
        </button>
        <div className="text-center">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onBack();
            }}
            className="text-blue-600 hover:underline"
          >
            У меня уже есть аккаунт, войти
          </a>
        </div>
      </div>
    </div>
  );
}; 