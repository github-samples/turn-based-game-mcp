/**
 * API Route Testing Utilities for Web Package
 * 
 * Provides web-specific mock patterns and utilities for testing
 * Next.js API routes consistently across all game types.
 */

import { vi } from 'vitest'
import { 
  createSharedGameMocks, 
  createStorageMocks,
  createMockTicTacToeGameState,
  createMockRPSGameState,
  createMockGameSession
} from '@turn-based-mcp/shared'

/**
 * Setup standard API route mocks for a specific game type
 * This consolidates the common mock setup pattern used across API route tests
 */
export function setupAPIRouteMocks(gameType: 'tic-tac-toe' | 'rock-paper-scissors') {
  const gameClass = gameType === 'tic-tac-toe' ? 'TicTacToeGame' : 'RockPaperScissorsGame'
  
  // Create shared game mocks
  const { mockImplementation, mockGame } = createSharedGameMocks(gameClass)
  
  // Create storage mocks
  const storageMocks = createStorageMocks(gameType)
  
  // Setup vi.mock calls
  vi.mock('@turn-based-mcp/shared', () => mockImplementation)
  vi.mock('../../../../lib/game-storage', () => storageMocks)
  
  return {
    mockGame,
    storageMocks
  }
}

/**
 * Setup mocks for move route testing
 * Handles the slightly different mock setup needed for move routes
 */
export function setupMoveRouteMocks(gameType: 'tic-tac-toe' | 'rock-paper-scissors') {
  const gameClass = gameType === 'tic-tac-toe' ? 'TicTacToeGame' : 'RockPaperScissorsGame'
  
  // Create game mock
  const mockGame = {
    getInitialState: vi.fn(),
    validateMove: vi.fn(),
    applyMove: vi.fn(),
    checkGameEnd: vi.fn(),
    getValidMoves: vi.fn()
  }
  
  // Setup shared mock
  vi.mock('@turn-based-mcp/shared', () => ({
    ...vi.importActual('@turn-based-mcp/shared'),
    [gameClass]: vi.fn(() => mockGame),
    __mockGameInstance: mockGame
  }))
  
  // Storage mocks - different path depth for move routes
  if (gameType === 'tic-tac-toe') {
    vi.mock('../../../../../../lib/game-storage', () => ({
      getTicTacToeGame: vi.fn(),
      setTicTacToeGame: vi.fn()
    }))
  } else {
    vi.mock('../../../../../../lib/game-storage', () => ({
      getRPSGame: vi.fn(),
      setRPSGame: vi.fn()
    }))
  }
  
  return mockGame
}

/**
 * Create standard mock game sessions for testing
 */
export function createTestGameSessions() {
  return {
    ticTacToe: createMockGameSession(
      createMockTicTacToeGameState(),
      'tic-tac-toe'
    ),
    rockPaperScissors: createMockGameSession(
      createMockRPSGameState(),
      'rock-paper-scissors'  
    )
  }
}

/**
 * Helper to create NextRequest mock for testing
 */
export function createMockNextRequest(url: string, init?: { method?: string; body?: any }) {
  const mockRequest = {
    url,
    method: init?.method || 'GET',
    json: vi.fn().mockResolvedValue(init?.body || {})
  }
  
  return mockRequest as any
}