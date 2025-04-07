import React from 'react';

export const SystemInfo: React.FC = () => {
  return (
    <div className="bg-gray-900/60 rounded-2xl p-6 text-white">
      <h2 className="text-2xl mb-4">О системе</h2>
      <div className="space-y-4">
        <p>Минимальные системные требования:</p>
        <ul className="list-disc list-inside space-y-2">
          <li>тип ЭВМ – IBM PC совместимый;</li>
          <li>монитор с разрешающей способностью не ниже 800 x 600;</li>
          <li>манипулятор – мышь</li>
        </ul>
      </div>
    </div>
  );
}; 