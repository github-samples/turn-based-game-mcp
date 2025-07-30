/**
 * Jest setup for shared package tests
 * 
 * Sets up test database before all tests and cleans up after
 */

const { setupTestDatabase, teardownTestDatabase } = require('./dist/testing/test-database')

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
