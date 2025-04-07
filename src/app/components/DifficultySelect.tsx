import React from 'react';

interface DifficultySelectProps {
  onSelect: (difficulty: 'easy' | 'medium' | 'hard') => void;
}

export const DifficultySelect: React.FC<DifficultySelectProps> = ({ onSelect }) => {
  return (
    <div className="bg-gray-900/60 rounded-2xl p-6">
      <h2 className="text-white text-xl mb-6">Сложность ИИ:</h2>
      <div className="flex gap-4">
        <button
          onClick={() => onSelect('easy')}
          className="flex-1 bg-gray-700 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition"
        >
          Легкий
        </button>
        <button
          onClick={() => onSelect('medium')}
          className="flex-1 bg-gray-700 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition"
        >
          Средний
        </button>
        <button
          onClick={() => onSelect('hard')}
          className="flex-1 bg-gray-700 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition"
        >
          Сложный
        </button>
      </div>
    </div>
  );
}; 