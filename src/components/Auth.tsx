import React, { useState } from 'react';
import styled from '@emotion/styled';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';

const AuthContainer = styled.div`
  background: rgba(255, 192, 203, 0.2);
  padding: 30px;
  border-radius: 15px;
  width: 300px;
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const Title = styled.h2`
  color: white;
  text-align: center;
  margin: 0;
  margin-bottom: 20px;
`;

const Input = styled.input`
  padding: 12px;
  border: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.9);
  font-size: 16px;
  width: 100%;
  box-sizing: border-box;

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px #4CAF50;
  }
`;

const Button = styled.button`
  padding: 12px;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  width: 100%;
  transition: background 0.3s;

  &:hover {
    background: #45a049;
  }

  &:disabled {
    background: #cccccc;
    cursor: not-allowed;
  }
`;

const Link = styled.a`
  color: #4CAF50;
  text-align: center;
  text-decoration: none;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

const AvatarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
  margin: 10px 0;
`;

const Avatar = styled.img<{ selected: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid ${({ selected }) => (selected ? '#4CAF50' : 'transparent')};
  transition: border-color 0.3s;

  &:hover {
    border-color: #45a049;
  }
`;

const ErrorMessage = styled.div`
  color: #ff4444;
  text-align: center;
  font-size: 14px;
`;

interface AuthProps {
  mode: 'login' | 'register';
}

const Auth: React.FC<AuthProps> = ({ mode }) => {
  const navigate = useNavigate();
  const { setUser } = useGameStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(0);
  const [error, setError] = useState('');

  const avatars = Array.from({ length: 10 }, (_, i) => i);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'register' && password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    try {
      // TODO: Реализовать интеграцию с API
      const user = {
        id: '1',
        username,
        avatar: selectedAvatar,
      };
      setUser(user);
      navigate('/');
    } catch (error) {
      setError('Ошибка авторизации');
    }
  };

  return (
    <AuthContainer>
      <Title>{mode === 'login' ? 'Авторизация' : 'Регистрация'}</Title>
      <form onSubmit={handleSubmit}>
        <Input
          type="text"
          placeholder="Логин"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {mode === 'register' && (
          <>
            <Input
              type="password"
              placeholder="Повторите пароль"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <AvatarGrid>
              {avatars.map((avatar) => (
                <Avatar
                  key={avatar}
                  src={`/avatars/${avatar}.png`}
                  alt={`Avatar ${avatar}`}
                  selected={selectedAvatar === avatar}
                  onClick={() => setSelectedAvatar(avatar)}
                />
              ))}
            </AvatarGrid>
          </>
        )}
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <Button type="submit">
          {mode === 'login' ? 'Войти' : 'Зарегистрироваться'}
        </Button>
      </form>
      <Link onClick={() => navigate(mode === 'login' ? '/register' : '/login')}>
        {mode === 'login'
          ? 'Нет аккаунта? Зарегистрироваться'
          : 'Уже есть аккаунт? Войти'}
      </Link>
    </AuthContainer>
  );
};

export default Auth; 