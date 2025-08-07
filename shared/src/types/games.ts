import { BaseGameState } from './game';

// Tic-tac-toe specific types
export type CellValue = 'X' | 'O' | null;
export type Board = CellValue[][];

export interface TicTacToeMove {
  row: number;
  col: number;
}

export interface TicTacToeGameState extends BaseGameState {
  board: Board;
  playerSymbols: Record<string, 'X' | 'O'>;
}

// Rock Paper Scissors specific types
export type RPSChoice = 'rock' | 'paper' | 'scissors';

export interface RPSMove {
  choice: RPSChoice;
}

export interface RPSGameState extends BaseGameState {
  rounds: Array<{
    player1Choice?: RPSChoice;
    player2Choice?: RPSChoice;
    winner?: string | 'draw';
  }>;
  currentRound: number;
  maxRounds: number;
  scores: Record<string, number>;
}
