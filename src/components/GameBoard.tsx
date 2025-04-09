import React from 'react';
import styled from '@emotion/styled';
import { CellState } from '../types/game.types';

interface GameBoardProps {
  cells: CellState[][];
  isEnemy?: boolean;
  onCellClick?: (x: number, y: number) => void;
  disabled?: boolean;
}

const BoardContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  background: rgba(0, 0, 0, 0.7);
  padding: 10px;
  border-radius: 10px;
`;

const Row = styled.div`
  display: flex;
  gap: 2px;
`;

const Cell = styled.div<{ state: CellState; isEnemy: boolean }>`
  width: 40px;
  height: 40px;
  background: ${({ state, isEnemy }) => {
    switch (state) {
      case 'empty':
        return 'rgba(255, 255, 255, 0.1)';
      case 'ship':
        return isEnemy ? 'rgba(255, 255, 255, 0.1)' : '#ffd700';
      case 'hit':
        return '#ff4444';
      case 'miss':
        return '#ffffff';
      default:
        return 'rgba(255, 255, 255, 0.1)';
    }
  }};
  border-radius: 5px;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  transition: background 0.3s;

  &:hover {
    background: ${({ disabled }) => (!disabled ? 'rgba(255, 255, 255, 0.3)' : undefined)};
  }
`;

const GameBoard: React.FC<GameBoardProps> = ({
  cells,
  isEnemy = false,
  onCellClick,
  disabled = false,
}) => {
  const handleClick = (x: number, y: number) => {
    if (!disabled && onCellClick) {
      onCellClick(x, y);
    }
  };

  return (
    <BoardContainer>
      {cells.map((row, y) => (
        <Row key={y}>
          {row.map((cell, x) => (
            <Cell
              key={`${x}-${y}`}
              state={cell}
              isEnemy={isEnemy}
              disabled={disabled}
              onClick={() => handleClick(x, y)}
            />
          ))}
        </Row>
      ))}
    </BoardContainer>
  );
};

export default GameBoard; 