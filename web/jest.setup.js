// Optional: configure or set up a testing framework before each test.
// If you delete this file, remove `setupFilesAfterEnv` from `jest.config.js`

// Used for __tests__/testing-library.js
// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Set up test database for all tests
import { setupTestDatabase, teardownTestDatabase } from '@turn-based-mcp/shared';

// Setup test database before all tests
beforeAll(async () => {
  try {
    await setupTestDatabase(true); // Use in-memory database for speed
  } catch (error) {
    console.error('Failed to setup test database:', error);
    throw error;
  }
});

// Cleanup test database after all tests
afterAll(async () => {
  try {
    await teardownTestDatabase();
  } catch (error) {
    console.error('Failed to teardown test database:', error);
    // Don't throw here to avoid masking other test failures
  }
});