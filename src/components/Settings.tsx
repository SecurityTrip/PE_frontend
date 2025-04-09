import React from 'react';
import styled from '@emotion/styled';
import { useGameStore } from '../store/gameStore';

const SettingsContainer = styled.div`
  background: rgba(0, 0, 0, 0.8);
  padding: 20px;
  border-radius: 10px;
  color: white;
  width: 300px;
`;

const Title = styled.h2`
  text-align: center;
  margin-bottom: 20px;
  color: white;
`;

const SettingRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 10px 0;
`;

const Switch = styled.label`
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;

  input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  span {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    transition: .4s;
    border-radius: 34px;

    &:before {
      position: absolute;
      content: "";
      height: 26px;
      width: 26px;
      left: 4px;
      bottom: 4px;
      background-color: white;
      transition: .4s;
      border-radius: 50%;
    }
  }

  input:checked + span {
    background-color: #4CAF50;
  }

  input:checked + span:before {
    transform: translateX(26px);
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: #ff4444;
  color: white;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;

  &:hover {
    background: #ff0000;
  }
`;

interface SettingsProps {
  onClose: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onClose }) => {
  const { settings, updateSettings } = useGameStore();

  const handleMusicToggle = () => {
    updateSettings({ musicEnabled: !settings.musicEnabled });
  };

  const handleSoundToggle = () => {
    updateSettings({ soundEnabled: !settings.soundEnabled });
  };

  return (
    <SettingsContainer>
      <Title>Настройки</Title>
      <CloseButton onClick={onClose}>×</CloseButton>
      
      <SettingRow>
        <span>Музыка</span>
        <Switch>
          <input
            type="checkbox"
            checked={settings.musicEnabled}
            onChange={handleMusicToggle}
          />
          <span />
        </Switch>
      </SettingRow>

      <SettingRow>
        <span>Звук</span>
        <Switch>
          <input
            type="checkbox"
            checked={settings.soundEnabled}
            onChange={handleSoundToggle}
          />
          <span />
        </Switch>
      </SettingRow>
    </SettingsContainer>
  );
};

export default Settings; 