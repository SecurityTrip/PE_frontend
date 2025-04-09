import { create } from 'zustand';
import { GameState, GameSettings, User, Room, Difficulty } from '../types/game.types';

interface Player extends User {
  isReady: boolean;
}

interface LobbyState {
  code: string;
  players: Player[];
  isHost: boolean;
  gameMode: 'single' | 'multi';
}

interface GameStore {
  // Состояние пользователя
  user: User | null;
  setUser: (user: User | null) => void;

  // Настройки игры
  settings: GameSettings;
  updateSettings: (settings: Partial<GameSettings>) => void;

  // Состояние лобби
  lobby: LobbyState | null;
  setLobby: (lobby: LobbyState | null) => void;
  
  // Состояние комнаты
  currentRoom: Room | null;
  setCurrentRoom: (room: Room | null) => void;

  // Состояние игры
  gameState: GameState | null;
  setGameState: (state: GameState | null) => void;

  // Методы для лобби
  createLobby: (mode: 'single' | 'multi') => void;
  joinLobby: (code: string) => Promise<void>;
  leaveLobby: () => void;
  setReady: (isReady: boolean) => void;
  startGame: () => void;

  // Методы для игры
  makeMove: (x: number, y: number) => Promise<void>;
  placeShip: (x: number, y: number, size: number, isVertical: boolean) => void;
  setDifficulty: (difficulty: Difficulty) => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  user: null,
  setUser: (user) => set({ user }),

  settings: {
    difficulty: 'medium',
    soundEnabled: true,
    musicEnabled: true,
  },
  updateSettings: (newSettings) =>
    set((state) => ({
      settings: { ...state.settings, ...newSettings },
    })),

  lobby: null,
  setLobby: (lobby) => set({ lobby }),

  currentRoom: null,
  setCurrentRoom: (room) => set({ currentRoom: room }),

  gameState: null,
  setGameState: (state) => set({ gameState: state }),

  createLobby: (mode) => {
    const code = Math.random().toString(36).substring(2, 10);
    const { user } = get();
    if (user) {
      set({
        lobby: {
          code,
          players: [{ ...user, isReady: false }],
          isHost: true,
          gameMode: mode,
        },
      });
    }
  },

  joinLobby: async (code) => {
    const { user } = get();
    if (user) {
      // TODO: Реализовать подключение к лобби через API
      set((state) => ({
        lobby: state.lobby
          ? {
              ...state.lobby,
              players: [...state.lobby.players, { ...user, isReady: false }],
            }
          : null,
      }));
    }
  },

  leaveLobby: () => {
    set({ lobby: null });
  },

  setReady: (isReady) => {
    const { user, lobby } = get();
    if (user && lobby) {
      set({
        lobby: {
          ...lobby,
          players: lobby.players.map((player) =>
            player.id === user.id ? { ...player, isReady } : player
          ),
        },
      });
    }
  },

  startGame: () => {
    const { lobby } = get();
    if (lobby && lobby.players.every((player) => player.isReady)) {
      // TODO: Реализовать начало игры
      set({ gameState: { /* начальное состояние игры */ } as GameState });
    }
  },

  makeMove: async (x, y) => {
    // TODO: Реализовать ход через API
  },

  placeShip: (x, y, size, isVertical) => {
    // TODO: Реализовать размещение корабля
  },

  setDifficulty: (difficulty) =>
    set((state) => ({
      settings: { ...state.settings, difficulty },
    })),
})); 