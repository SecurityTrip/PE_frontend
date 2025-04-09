import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import styled from '@emotion/styled';
import MainMenu from './components/MainMenu';
import GamePage from './pages/GamePage';
import Auth from './components/Auth';
import { useGameStore } from './store/gameStore';

const AppContainer = styled.div`
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(180deg, #87CEEB 0%, #1E90FF 100%);
  background-size: cover;
`;

const Logo = styled.h1`
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  color: #FFD700;
  font-size: 48px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  margin: 0;
  font-weight: bold;
  letter-spacing: 2px;
`;

const App: React.FC = () => {
  const { user } = useGameStore();

  return (
    <Router>
      <AppContainer>
        <Logo>МОРСКОЙ БОЙ</Logo>
        <Routes>
          <Route
            path="/"
            element={user ? <MainMenu /> : <Navigate to="/login" />}
          />
          <Route
            path="/login"
            element={user ? <Navigate to="/" /> : <Auth mode="login" />}
          />
          <Route
            path="/register"
            element={user ? <Navigate to="/" /> : <Auth mode="register" />}
          />
          <Route
            path="/game"
            element={user ? <GamePage /> : <Navigate to="/login" />}
          />
          {/* Добавьте другие маршруты здесь */}
        </Routes>
      </AppContainer>
    </Router>
  );
};

export default App; 