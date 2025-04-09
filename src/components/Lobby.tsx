import React from 'react';
import styled from '@emotion/styled';
import { useGameStore } from '../store/gameStore';

const LobbyContainer = styled.div`
  display: flex;
  gap: 20px;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 10px;
  padding: 20px;
  min-width: 800px;
`;

const MenuSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 250px;
`;

const GameSection = styled.div`
  flex: 1;
  color: white;
`;

const MenuButton = styled.button<{ isActive?: boolean }>`
  padding: 12px 20px;
  background: ${({ isActive }) => (isActive ? 'rgba(255, 255, 255, 0.2)' : 'transparent')};
  border: none;
  border-radius: 5px;
  color: white;
  text-align: left;
  font-size: 16px;
  transition: background 0.3s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const ExitButton = styled(MenuButton)`
  background: #dc3545;
  margin-top: auto;
  text-align: center;

  &:hover {
    background: #c82333;
  }
`;

const RoomInfo = styled.div`
  background: rgba(0, 0, 0, 0.5);
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
`;

const RoomCode = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

const RoomId = styled.span`
  font-size: 18px;
  font-weight: bold;
`;

const CopyButton = styled.button`
  padding: 5px 15px;
  background: #4CAF50;
  border: none;
  border-radius: 5px;
  color: white;
  cursor: pointer;

  &:hover {
    background: #45a049;
  }
`;

const PlayersList = styled.div`
  margin-top: 20px;
`;

const PlayerItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 5px;
  margin-bottom: 10px;
`;

const PlayerAvatar = styled.div`
  width: 32px;
  height: 32px;
  background: #4CAF50;
  border-radius: 50%;
`;

const PlayerName = styled.span`
  flex: 1;
`;

const ReadyStatus = styled.span<{ isReady?: boolean }>`
  color: ${({ isReady }) => (isReady ? '#4CAF50' : '#ffc107')};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 20px;
`;

const ActionButton = styled.button<{ variant?: 'primary' | 'secondary' }>`
  flex: 1;
  padding: 12px;
  background: ${({ variant }) => (variant === 'primary' ? '#4CAF50' : '#6c757d')};
  border: none;
  border-radius: 5px;
  color: white;
  font-size: 16px;
  cursor: pointer;

  &:hover {
    background: ${({ variant }) => (variant === 'primary' ? '#45a049' : '#5a6268')};
  }
`;

const Lobby: React.FC = () => {
  const { currentRoom, leaveRoom } = useGameStore();

  const handleCopyCode = () => {
    if (currentRoom?.code) {
      navigator.clipboard.writeText(currentRoom.code);
    }
  };

  const handleLeaveRoom = () => {
    leaveRoom();
  };

  return (
    <LobbyContainer>
      <MenuSection>
        <MenuButton isActive>Одиночная игра</MenuButton>
        <MenuButton>Многопользовательская игра</MenuButton>
        <MenuButton>Настроить профиль</MenuButton>
        <MenuButton>Правила игры</MenuButton>
        <MenuButton>Об авторах</MenuButton>
        <MenuButton>О системе</MenuButton>
        <ExitButton onClick={handleLeaveRoom}>Выйти</ExitButton>
      </MenuSection>
      <GameSection>
        <RoomInfo>
          <RoomCode>
            <RoomId>ID лобби: {currentRoom?.code || '123'}</RoomId>
            <CopyButton onClick={handleCopyCode}>Копировать</CopyButton>
          </RoomCode>
          <div>Подключитесь этим ID с другими игроками, чтобы они могли присоединиться к вашему лобби.</div>
        </RoomInfo>
        <PlayersList>
          <PlayerItem>
            <PlayerAvatar />
            <PlayerName>string</PlayerName>
            <ReadyStatus isReady>Готов</ReadyStatus>
          </PlayerItem>
          <PlayerItem>
            <PlayerAvatar />
            <PlayerName>stringgg</PlayerName>
            <ReadyStatus>Не готов</ReadyStatus>
          </PlayerItem>
        </PlayersList>
        <ActionButtons>
          <ActionButton>Покинуть лобби</ActionButton>
          <ActionButton variant="primary">Начать игру</ActionButton>
        </ActionButtons>
      </GameSection>
    </LobbyContainer>
  );
};

export default Lobby; 