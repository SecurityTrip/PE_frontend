import { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { gameService } from '../services/gameService';

interface ShipPlacementProps {
  gameId: string;
  onReady: () => void;
}

interface Ship {
  size: number;
  count: number;
  placed: number;
}

export const ShipPlacement = ({ gameId, onReady }: ShipPlacementProps) => {
  const [ships, setShips] = useState<Ship[]>([
    { size: 4, count: 1, placed: 0 },
    { size: 3, count: 2, placed: 0 },
    { size: 2, count: 3, placed: 0 },
    { size: 1, count: 4, placed: 0 }
  ]);
  const [board, setBoard] = useState<number[][]>(Array(10).fill(0).map(() => Array(10).fill(0)));
  const [selectedShip, setSelectedShip] = useState<number | null>(null);
  const [isVertical, setIsVertical] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Обработка клика по клетке
  const handleCellClick = (row: number, col: number) => {
    if (!selectedShip || isReady) return;

    const ship = ships.find(s => s.size === selectedShip);
    if (!ship || ship.placed >= ship.count) return;

    // Проверка возможности размещения корабля
    if (canPlaceShip(row, col, selectedShip, isVertical)) {
      const newBoard = [...board];
      const newShips = [...ships];
      
      // Размещаем корабль
      for (let i = 0; i < selectedShip; i++) {
        const r = isVertical ? row + i : row;
        const c = isVertical ? col : col + i;
        if (r < 10 && c < 10) {
          newBoard[r][c] = 1;
        }
      }

      // Обновляем счетчик размещенных кораблей
      const shipIndex = newShips.findIndex(s => s.size === selectedShip);
      newShips[shipIndex].placed++;

      setBoard(newBoard);
      setShips(newShips);
    }
  };

  // Проверка возможности размещения корабля
  const canPlaceShip = (row: number, col: number, size: number, vertical: boolean): boolean => {
    for (let i = 0; i < size; i++) {
      const r = vertical ? row + i : row;
      const c = vertical ? col : col + i;
      
      // Проверка границ
      if (r >= 10 || c >= 10) return false;
      
      // Проверка соседних клеток
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < 10 && nc >= 0 && nc < 10 && board[nr][nc] === 1) {
            return false;
          }
        }
      }
    }
    return true;
  };

  // Обработка нажатия кнопки "Готов"
  const handleReady = async () => {
    try {
      const allShipsPlaced = ships.every(ship => ship.placed === ship.count);
      if (!allShipsPlaced) {
        setError('Разместите все корабли');
        return;
      }

      // Сначала отправляем размещение кораблей
      const shipList = [];
      
      for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 10; j++) {
          if (board[i][j] === 1) {
            // Найти корабль, который содержит эту клетку
            const shipSize = findShipSize(i, j);
            const orientation = findShipOrientation(i, j, shipSize);
            
            // Проверяем, что это начало корабля
            const isShipStart = 
              (orientation === 'horizontal' && (j === 0 || board[i][j-1] !== 1)) ||
              (orientation === 'vertical' && (i === 0 || board[i-1][j] !== 1));
            
            if (isShipStart) {
              shipList.push({
                x: j,
                y: i,
                size: shipSize,
                isHorizontal: orientation === 'horizontal'
              });
            }
          }
        }
      }
      
      // Отправляем корабли на сервер
      console.log('Отправка кораблей на сервер...');
      await gameService.placeShips(gameId, shipList);
      
      // Устанавливаем готовность
      setIsReady(true);
      console.log('Отправка готовности...');
      const gameData = await gameService.setReady(gameId);
      console.log('Получен ответ от сервера:', gameData);
      
      // Проверяем, готовы ли все игроки
      const allPlayersReady = gameData.boards?.every((board: any) => board.ready) || false;
      console.log('Все игроки готовы:', allPlayersReady);
      
      // Если все готовы, переходим к игре
      if (allPlayersReady && gameData.status === 'IN_PROGRESS') {
        console.log('Переход к игре...');
        onReady();
      } else {
        console.log('Ожидание готовности других игроков...');
      }
    } catch (error) {
      setError('Ошибка при отправке готовности');
      console.error('Error setting ready:', error);
    }
  };
  
  // Найти размер корабля, содержащего клетку
  const findShipSize = (row: number, col: number): number => {
    let size = 1;
    
    // Проверяем горизонтально
    let j = col + 1;
    while (j < 10 && board[row][j] === 1) {
      size++;
      j++;
    }
    
    // Если горизонтально размер 1, проверяем вертикально
    if (size === 1) {
      let i = row + 1;
      while (i < 10 && board[i][col] === 1) {
        size++;
        i++;
      }
    }
    
    return size;
  };
  
  // Определить ориентацию корабля
  const findShipOrientation = (row: number, col: number, size: number): 'horizontal' | 'vertical' => {
    if (size === 1) return 'horizontal'; // Для одиночных кораблей ориентация не важна
    
    // Проверяем горизонтально
    if (col + 1 < 10 && board[row][col + 1] === 1) {
      return 'horizontal';
    }
    
    return 'vertical';
  };

  // Очистка доски
  const handleClear = () => {
    setBoard(Array(10).fill(0).map(() => Array(10).fill(0)));
    setShips(ships.map(ship => ({ ...ship, placed: 0 })));
    setError(null);
  };

  return (
    <div className="bg-gray-800/70 rounded-2xl p-6 text-white w-full">
      <h2 className="text-2xl font-bold mb-4">Расстановка кораблей</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-200">
          {error}
        </div>
      )}

      <div className="flex gap-8">
        {/* Доска */}
        <div className="grid grid-cols-10 gap-1">
          {board.map((row, i) => (
            row.map((cell, j) => (
              <div
                key={`${i}-${j}`}
                className={`w-8 h-8 border border-gray-600 cursor-pointer ${
                  cell === 1 ? 'bg-blue-500' : 'bg-gray-700 hover:bg-gray-600'
                }`}
                onClick={() => handleCellClick(i, j)}
              />
            ))
          ))}
        </div>

        {/* Панель управления */}
        <div className="flex-1">
          <div className="mb-4">
            <h3 className="text-lg font-medium mb-2">Корабли</h3>
            <div className="space-y-2">
              {ships.map(ship => (
                <div
                  key={ship.size}
                  className={`p-2 rounded cursor-pointer ${
                    selectedShip === ship.size
                      ? 'bg-blue-500'
                      : ship.placed < ship.count
                      ? 'bg-gray-700 hover:bg-gray-600'
                      : 'bg-gray-800'
                  }`}
                  onClick={() => ship.placed < ship.count && setSelectedShip(ship.size)}
                >
                  {ship.size}-палубный: {ship.placed}/{ship.count}
                </div>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <button
              className="w-full p-2 bg-gray-700 rounded hover:bg-gray-600 mb-2"
              onClick={() => setIsVertical(!isVertical)}
            >
              {isVertical ? 'Вертикально' : 'Горизонтально'}
            </button>
            <button
              className="w-full p-2 bg-red-500 rounded hover:bg-red-600 mb-2"
              onClick={handleClear}
            >
              Очистить
            </button>
            <button
              className={`w-full p-2 rounded ${
                isReady
                  ? 'bg-green-500 cursor-not-allowed'
                  : 'bg-green-500 hover:bg-green-600'
              }`}
              onClick={handleReady}
              disabled={isReady}
            >
              {isReady ? 'Ожидание соперника...' : 'Готов'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 