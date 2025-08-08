/**
 * Common Test Data and Patterns
 * 
 * Provides standardized test data factories to reduce duplication
 * across API route tests while maintaining compatibility with
 * existing mocking patterns.
 */

import type { TicTacToeGameState, RPSGameState, Player } from '@turn-based-mcp/shared'

/**
 * Standard test players used across all game tests
 */
export const TEST_PLAYERS: Player[] = [
  { id: 'player1', name: 'Player', isAI: false },
  { id: 'ai', name: 'AI', isAI: true }
]

/**
 * Standard test dates for consistent timestamps
 */
export const TEST_DATE = new Date('2024-01-01T10:00:00Z')

/**
 * Factory for creating TicTacToe game states with consistent defaults
 */
export function createTicTacToeTestState(overrides: Partial<TicTacToeGameState> = {}): TicTacToeGameState {
  return {
    id: 'test-game-1',
    players: TEST_PLAYERS,
    currentPlayerId: 'player1',
    status: 'playing',
    createdAt: TEST_DATE,
    updatedAt: TEST_DATE,
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
 * Factory for creating RPS game states with consistent defaults
 */
export function createRPSTestState(overrides: Partial<RPSGameState> = {}): RPSGameState {
  return {
    id: 'test-rps-1',
    players: TEST_PLAYERS,
    currentPlayerId: 'player1',
    status: 'playing',
    createdAt: TEST_DATE,
    updatedAt: TEST_DATE,
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
 * Standard test moves for different games
 */
export const TEST_MOVES = {
  ticTacToe: { row: 0, col: 0 },
  rps: { choice: 'rock' as const }
} as const