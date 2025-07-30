import sqlite3 from 'sqlite3'
import path from 'path'
import fs from 'fs'

/**
 * Centralized test database utilities for the turn-based games platform
 * 
 * This module provides consistent test database setup and teardown across
 * all packages (shared, web, mcp-server) to ensure tests run in isolation
 * with clean database state.
 */

let testDb: sqlite3.Database | null = null
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
): Promise<sqlite3.Database> {
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

  return new Promise((resolve, reject) => {
    const dbPath = process.env.GAMES_DB_PATH!
    testDb = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        reject(err)
        return
      }

      // Create tables synchronously to ensure they exist before tests run
      const createTables = async () => {
        try {
          await createTicTacToeTable()
          await createRPSTable()
          resolve(testDb!)
        } catch (error) {
          reject(error)
        }
      }

      createTables()
    })
  })
}

/**
 * Creates the tic_tac_toe_games table
 */
function createTicTacToeTable(): Promise<void> {
  return new Promise((resolve, reject) => {
    testDb!.run(`
      CREATE TABLE IF NOT EXISTS tic_tac_toe_games (
        id TEXT PRIMARY KEY,
        game_session TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

/**
 * Creates the rps_games table
 */
function createRPSTable(): Promise<void> {
  return new Promise((resolve, reject) => {
    testDb!.run(`
      CREATE TABLE IF NOT EXISTS rps_games (
        id TEXT PRIMARY KEY,
        game_session TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

/**
 * Cleans up the test database and restores original configuration
 * 
 * @returns Promise that resolves when cleanup is complete
 */
export async function teardownTestDatabase(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (testDb) {
      testDb.close((err) => {
        if (err) {
          reject(err)
          return
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

        // Restore original DB path
        if (originalDbPath !== undefined) {
          process.env.GAMES_DB_PATH = originalDbPath
        } else {
          delete process.env.GAMES_DB_PATH
        }

        testDb = null
        originalDbPath = undefined
        resolve()
      })
    } else {
      // Restore original DB path even if no test database was created
      if (originalDbPath !== undefined) {
        process.env.GAMES_DB_PATH = originalDbPath
      } else {
        delete process.env.GAMES_DB_PATH
      }
      originalDbPath = undefined
      resolve()
    }
  })
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

  return new Promise((resolve, reject) => {
    testDb!.serialize(() => {
      testDb!.run('DELETE FROM tic_tac_toe_games', (err) => {
        if (err) {
          reject(err)
          return
        }
      })
      
      testDb!.run('DELETE FROM rps_games', (err) => {
        if (err) {
          reject(err)
          return
        }
        resolve()
      })
    })
  })
}

/**
 * Gets the current test database instance
 * 
 * @returns The current SQLite database instance or null if not initialized
 */
export function getTestDatabase(): sqlite3.Database | null {
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
