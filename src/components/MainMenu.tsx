import React, { useState } from 'react';
import styled from '@emotion/styled';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import Lobby from './Lobby';

const MenuContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 10px;
  padding: 20px;
  min-width: 300px;
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

const MainMenu: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useGameStore();
  const [activeMenu, setActiveMenu] = useState<string>('single');
  const [showLobby, setShowLobby] = useState(false);

  const handleMenuClick = (menu: string) => {
    setActiveMenu(menu);
    if (menu === 'single' || menu === 'multi') {
      setShowLobby(true);
    }
  };

  const handleLogout = () => {
    // TODO: Реализовать выход
    navigate('/login');
  };

  if (showLobby) {
    return <Lobby />;
  }

  return (
    <MenuContainer>
      <MenuButton
        isActive={activeMenu === 'single'}
        onClick={() => handleMenuClick('single')}
      >
        Одиночная игра
      </MenuButton>
      <MenuButton
        isActive={activeMenu === 'multi'}
        onClick={() => handleMenuClick('multi')}
      >
        Многопользовательская игра
      </MenuButton>
      <MenuButton
        isActive={activeMenu === 'profile'}
        onClick={() => handleMenuClick('profile')}
      >
        Настроить профиль
      </MenuButton>
      <MenuButton
        isActive={activeMenu === 'rules'}
        onClick={() => handleMenuClick('rules')}
      >
        Правила игры
      </MenuButton>
      <MenuButton
        isActive={activeMenu === 'about'}
        onClick={() => handleMenuClick('about')}
      >
        Об авторах
      </MenuButton>
      <MenuButton
        isActive={activeMenu === 'system'}
        onClick={() => handleMenuClick('system')}
      >
        О системе
      </MenuButton>
      <ExitButton onClick={handleLogout}>Выйти</ExitButton>
    </MenuContainer>
  );
};

export default MainMenu; 