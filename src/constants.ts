import type { GameState } from './types';

export const INITIAL_STATE: GameState = {
  us: { name: 'NÓS', points: 0, wins: 0 },
  them: { name: 'ELES', points: 0, wins: 0 },
};

export const WIN_POINTS = 12;
export const DANGER_THRESHOLD = 10;
export const WIN_DISPLAY_DURATION_MS = 3000;
