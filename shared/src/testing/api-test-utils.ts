/**
 * Shared API Test Utilities
 * 
 * Provides reusable mock factories and test utilities for API route testing
 * to eliminate duplication across test files.
 */

import { vi } from 'vitest'
import type { GameSession, Player, BaseGameState, GameType } from '../types/game'
import type { TicTacToeGameState, RPSGameState, TicTacToeMove, RPSMove } from '../types/games'

/**
 * Generic game mock factory
 * Creates a mock game instance with all required methods
 */
export function createGameMock() {
  return {
    getInitialState: vi.fn(),
    validateMove: vi.fn(),
    applyMove: vi.fn(),
    checkGameEnd: vi.fn(),
    getValidMoves: vi.fn()
  }
}

/**
 * Create mock players for testing
 */
export function createMockPlayers(): Player[] {
  return [
    { id: 'player1', name: 'Player', isAI: false },
    { id: 'ai', name: 'AI', isAI: true }
  ]
}

/**
 * Create a mock TicTacToe game state
 */
export function createMockTicTacToeGameState(overrides: Partial<TicTacToeGameState> = {}): TicTacToeGameState {
  return {
    id: 'test-game-1',
    players: createMockPlayers(),
    currentPlayerId: 'player1',
    status: 'playing',
    createdAt: new Date('2024-01-01T10:00:00Z'),
    updatedAt: new Date('2024-01-01T10:00:00Z'),
    board: [
      [null, null, null],
      [null, null, null],
      [null, null, null]
    ],
    playerSymbols: {
      player1: 'X',
      ai: 'O'
    },
    ...overrides
  }
}

/**
 * Create a mock Rock Paper Scissors game state
 */
export function createMockRPSGameState(overrides: Partial<RPSGameState> = {}): RPSGameState {
  return {
    id: 'test-rps-1',
    players: createMockPlayers(),
    currentPlayerId: 'player1',
    status: 'playing',
    createdAt: new Date('2024-01-01T10:00:00Z'),
    updatedAt: new Date('2024-01-01T10:00:00Z'),
    rounds: [],
    currentRound: 0,
    maxRounds: 3,
    scores: {
      player1: 0,
      ai: 0
    },
    ...overrides
  }
}

/**
 * Create a mock game session
 */
export function createMockGameSession<T extends BaseGameState>(gameState: T, gameType: GameType): GameSession<T> {
  return {
    gameState,
    gameType,
    history: [],
    difficulty: 'medium'
  }
}

/**
 * Vitest mock configuration for shared package games
 * Use this to create consistent mocks across API route tests
 */
export function createSharedGameMocks(gameClass: string) {
  const mockGame = createGameMock()
  
  return {
    mockImplementation: {
      ...vi.importActual('@turn-based-mcp/shared'),
      [gameClass]: vi.fn().mockImplementation(() => mockGame)
    },
    mockGame
  }
}

/**
 * Create storage function mocks for a specific game type
 */
export function createStorageMocks(gameType: GameType) {
  if (gameType === 'tic-tac-toe') {
    return {
      getTicTacToeGame: vi.fn(),
      setTicTacToeGame: vi.fn(),
      getAllTicTacToeGames: vi.fn()
    }
  } else {
    return {
      getRPSGame: vi.fn(),
      setRPSGame: vi.fn(),
      getAllRPSGames: vi.fn()
    }
  }
}

/**
 * Standard test moves for different games
 */
export const TEST_MOVES = {
  ticTacToe: { row: 0, col: 0 } as TicTacToeMove,
  rockPaperScissors: { choice: 'rock' } as RPSMove
}