/**
 * Shared Vitest Setup Functions
 * 
 * Provides standardized test setup and teardown functions to reduce
 * duplication across package vitest setup files.
 */

import { beforeAll, afterAll } from 'vitest'
import { setupTestDatabase, teardownTestDatabase } from './test-database'

/**
 * Standard database setup for all packages
 * Call this in vitest.setup.ts files to ensure consistent database setup
 */
export function setupStandardTestDatabase() {
  // Setup test database before all tests
  beforeAll(async () => {
    try {
      await setupTestDatabase(true) // Use in-memory database for speed
    } catch (error) {
      console.error('Failed to setup test database:', error)
      throw error
    }
  })

  // Cleanup test database after all tests
  afterAll(async () => {
    try {
      await teardownTestDatabase()
    } catch (error) {
      console.error('Failed to teardown test database:', error)
      // Don't throw here to avoid masking other test failures
    }
  })
}