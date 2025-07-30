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
