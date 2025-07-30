// Core game types
export type PlayerId = 'player1' | 'player2' | 'ai';

export interface Player {
  id: PlayerId;
  name: string;
  isAI: boolean;
}

export type GameStatus = 'waiting' | 'playing' | 'finished';

export interface BaseGameState {
  id: string;
  players: Player[];
  currentPlayerId: PlayerId;
  status: GameStatus;
  winner?: PlayerId | 'draw';
  createdAt: Date;
  updatedAt: Date;
}

export interface GameMove<T = any> {
  playerId: PlayerId;
  move: T;
  timestamp: Date;
}

export interface GameResult {
  winner?: PlayerId | 'draw';
  reason: string;
}

// Game interface that all games must implement
export interface Game<TGameState extends BaseGameState, TMove> {
  validateMove(gameState: TGameState, move: TMove, playerId: PlayerId): boolean;
  applyMove(gameState: TGameState, move: TMove, playerId: PlayerId): TGameState;
  checkGameEnd(gameState: TGameState): GameResult | null;
  getValidMoves(gameState: TGameState, playerId: PlayerId): TMove[];
  getInitialState(players: Player[]): TGameState;
}

export type GameType = 'tic-tac-toe' | 'rock-paper-scissors';

export type Difficulty = 'easy' | 'medium' | 'hard';

// Generic game session for API communication
export interface GameSession<TGameState extends BaseGameState = BaseGameState> {
  gameState: TGameState;
  gameType: GameType;
  history: GameMove[];
  aiDifficulty?: Difficulty;
}
