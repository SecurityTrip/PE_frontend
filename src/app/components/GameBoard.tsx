import React from 'react';

interface GameBoardProps {
  playerName: string;
  opponentName: string;
  onCellClick: (x: number, y: number, isPlayerBoard: boolean) => void;
  playerBoard: Array<Array<number>>;
  opponentBoard: Array<Array<number>>;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  playerName,
  opponentName,
  onCellClick,
  playerBoard,
  opponentBoard,
}) => {
  const renderBoard = (board: Array<Array<number>>, isPlayerBoard: boolean) => {
    return (
      <div className="grid grid-cols-10 gap-1 bg-gray-800/80 p-4 rounded-xl">
        {board.map((row, y) =>
          row.map((cell, x) => (
            <button
              key={`${x}-${y}`}
              onClick={() => onCellClick(x, y, isPlayerBoard)}
              className={`w-8 h-8 rounded-lg transition ${
                cell === 1
                  ? 'bg-yellow-400'
                  : cell === 2
                  ? 'bg-red-500'
                  : cell === -1
                  ? 'bg-gray-400'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            />
          ))
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex justify-between w-full max-w-6xl gap-8">
        <div className="flex-1">
          <h3 className="text-white text-xl mb-4">{playerName}</h3>
          {renderBoard(playerBoard, true)}
        </div>
        <div className="w-px bg-gray-600" />
        <div className="flex-1">
          <h3 className="text-white text-xl mb-4">{opponentName}</h3>
          {renderBoard(opponentBoard, false)}
        </div>
      </div>
      <div className="mt-8 flex gap-4">
        <button className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition">
          Выход
        </button>
        <button className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
          Настройки
        </button>
      </div>
    </div>
  );
}; 