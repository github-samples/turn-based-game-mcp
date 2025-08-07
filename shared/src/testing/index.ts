/**
 * Testing utilities for the turn-based games platform
 * 
 * This module exports centralized testing utilities that can be used
 * across all packages in the monorepo for consistent test setup.
 */

export {
  setupTestDatabase,
  teardownTestDatabase,
  clearTestDatabase,
  getTestDatabase,
  isTestDatabaseReady
} from './test-database'

export {
  createGameMock,
  createMockPlayers,
  createMockTicTacToeGameState,
  createMockRPSGameState,
  createMockGameSession,
  createSharedGameMocks,
  createStorageMocks,
  TEST_MOVES
} from './api-test-utils'

export {
  setupStandardTestDatabase
} from './vitest-setup'
