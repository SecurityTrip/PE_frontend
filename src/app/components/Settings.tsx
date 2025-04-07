import React from 'react';

interface SettingsProps {
  onClose: () => void;
  musicEnabled: boolean;
  soundEnabled: boolean;
  onMusicToggle: () => void;
  onSoundToggle: () => void;
}

export const Settings: React.FC<SettingsProps> = ({
  onClose,
  musicEnabled,
  soundEnabled,
  onMusicToggle,
  onSoundToggle,
}) => {
  return (
    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-gray-900 rounded-2xl p-6 w-80">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-white text-xl">Настройки</h2>
          <button
            onClick={onClose}
            className="text-red-500 hover:text-red-400 transition"
          >
            ✕
          </button>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-white">Музыка</span>
            <button
              onClick={onMusicToggle}
              className={`w-12 h-6 rounded-full transition-colors ${
                musicEnabled ? 'bg-green-500' : 'bg-gray-600'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transform transition-transform ${
                  musicEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white">Звук</span>
            <button
              onClick={onSoundToggle}
              className={`w-12 h-6 rounded-full transition-colors ${
                soundEnabled ? 'bg-green-500' : 'bg-gray-600'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transform transition-transform ${
                  soundEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 