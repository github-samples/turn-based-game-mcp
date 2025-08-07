/**
 * Vitest setup for mcp-server package tests
 * 
 * Sets up test database before all tests and cleans up after
 */

import { setupTestDatabase, teardownTestDatabase } from '@turn-based-mcp/shared'
import { beforeAll, afterAll } from 'vitest'

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
