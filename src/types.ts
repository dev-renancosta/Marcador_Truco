export type Team = 'us' | 'them';

export interface TeamState {
  name: string;
  points: number;
  wins: number;
}

export interface GameState {
  us: TeamState;
  them: TeamState;
}

export interface MatchRecord {
  id: string;
  date: string;
  usName: string;
  themName: string;
  usWins: number;
  themWins: number;
}
