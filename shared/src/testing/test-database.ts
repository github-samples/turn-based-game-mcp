import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

/**
 * Centralized test database utilities for the turn-based games platform
 * 
 * This module provides consistent test database setup and teardown across
 * all packages (shared, web, mcp-server) to ensure tests run in isolation
 * with clean database state.
 */

let testDb: Database.Database | null = null
let originalDbPath: string | undefined

/**
 * Sets up a test database with clean state
 * 
 * @param useMemory - Whether to use in-memory database (faster) or file-based
 * @param testName - Optional test name for unique file-based databases
 * @returns Promise that resolves when database is ready
 */
export async function setupTestDatabase(
  useMemory: boolean = true, 
  testName?: string
): Promise<Database.Database> {
  // Store original DB path to restore later
  originalDbPath = process.env.GAMES_DB_PATH

  if (useMemory) {
    // Use in-memory database for fast tests
    process.env.GAMES_DB_PATH = ':memory:'
  } else {
    // Use file-based test database
    const testDbName = testName ? `test-${testName}.db` : 'test.db'
    const testDbPath = path.join(process.cwd(), testDbName)
    process.env.GAMES_DB_PATH = testDbPath
    
    // Remove existing test database if it exists
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath)
    }
  }

  const dbPath = process.env.GAMES_DB_PATH!
  testDb = new Database(dbPath)

  testDb.exec(`
    CREATE TABLE IF NOT EXISTS tic_tac_toe_games (
      id TEXT PRIMARY KEY,
      game_session TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  testDb.exec(`
    CREATE TABLE IF NOT EXISTS rps_games (
      id TEXT PRIMARY KEY,
      game_session TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  return testDb
}

/**
 * Cleans up the test database and restores original configuration
 * 
 * @returns Promise that resolves when cleanup is complete
 */
export async function teardownTestDatabase(): Promise<void> {
  if (testDb) {
    try {
      testDb.close()
    } catch {
      // Ignore close errors during teardown
    }

    // Clean up file-based test database
    const currentDbPath = process.env.GAMES_DB_PATH
    if (currentDbPath && currentDbPath !== ':memory:' && fs.existsSync(currentDbPath)) {
      try {
        fs.unlinkSync(currentDbPath)
      } catch (cleanupErr) {
        console.warn('Failed to cleanup test database file:', cleanupErr)
      }
    }

    testDb = null
  }

  // Restore original DB path
  if (originalDbPath !== undefined) {
    process.env.GAMES_DB_PATH = originalDbPath
  } else {
    delete process.env.GAMES_DB_PATH
  }
  originalDbPath = undefined
}

/**
 * Clears all data from test database tables while keeping the schema
 * Useful for resetting state between tests within the same test suite
 * 
 * @returns Promise that resolves when tables are cleared
 */
export async function clearTestDatabase(): Promise<void> {
  if (!testDb) {
    throw new Error('Test database not initialized. Call setupTestDatabase first.')
  }

  testDb.exec('DELETE FROM tic_tac_toe_games')
  testDb.exec('DELETE FROM rps_games')
}

/**
 * Gets the current test database instance
 * 
 * @returns The current SQLite database instance or null if not initialized
 */
export function getTestDatabase(): Database.Database | null {
  return testDb
}

/**
 * Utility function for tests that need to check if database is ready
 * 
 * @returns True if test database is initialized and ready
 */
export function isTestDatabaseReady(): boolean {
  return testDb !== null
}
