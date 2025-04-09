export interface User {
  id: string;
  username: string;
  avatar?: string;
}

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface GameSettings {
  difficulty: Difficulty;
  soundEnabled: boolean;
  musicEnabled: boolean;
}

export interface Room {
  id: string;
  code: string;
  players: User[];
  status: 'waiting' | 'playing' | 'finished';
}

export type CellState = 'empty' | 'ship' | 'hit' | 'miss';

export interface Board {
  cells: CellState[][];
  ships: Ship[];
}

export interface Ship {
  x: number;
  y: number;
  size: number;
  isVertical: boolean;
  hits: number;
}

export interface GameState {
  playerBoard: Board;
  opponentBoard: Board;
  currentTurn: string; // ID игрока, чей ход
  winner?: string; // ID победителя
  status: 'placing' | 'playing' | 'finished';
} 