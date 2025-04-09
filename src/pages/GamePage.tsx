import React, { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { useNavigate } from 'react-router-dom';
import GameBoard from '../components/GameBoard';
import { useGameStore } from '../store/gameStore';
import { CellState } from '../types/game.types';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
  background: url('/background.jpg') no-repeat center center fixed;
  background-size: cover;
`;

const GameContainer = styled.div`
  display: flex;
  gap: 40px;
  margin-top: 20px;
`;

const BoardContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
`;

const PlayerName = styled.div`
  color: white;
  font-size: 18px;
  margin-bottom: 10px;
`;

const Button = styled.button`
  padding: 10px 20px;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  margin: 10px;

  &:hover {
    background: #45a049;
  }
`;

const GamePage: React.FC = () => {
  const navigate = useNavigate();
  const { gameState, user, makeMove, leaveRoom } = useGameStore();
  const [selectedCell, setSelectedCell] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!gameState || !user) {
      navigate('/');
    }
  }, [gameState, user, navigate]);

  const handleCellClick = async (x: number, y: number) => {
    if (gameState?.isPlayerTurn) {
      try {
        await makeMove(x, y);
      } catch (error) {
        console.error('Ошибка хода:', error);
      }
    }
  };

  const handleExit = () => {
    leaveRoom();
    navigate('/');
  };

  if (!gameState || !user) {
    return null;
  }

  return (
    <PageContainer>
      <GameContainer>
        <BoardContainer>
          <PlayerName>{user.username}</PlayerName>
          <GameBoard
            cells={gameState.playerBoard.cells}
            disabled={true}
          />
        </BoardContainer>
        <BoardContainer>
          <PlayerName>Противник</PlayerName>
          <GameBoard
            cells={gameState.enemyBoard.cells}
            isEnemy={true}
            onCellClick={handleCellClick}
            disabled={!gameState.isPlayerTurn}
          />
        </BoardContainer>
      </GameContainer>
      <Button onClick={handleExit}>Выход</Button>
    </PageContainer>
  );
};

export default GamePage; 