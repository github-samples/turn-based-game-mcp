import Database from 'better-sqlite3'
import path from 'path'
import type { GameSession } from '../types/game'
import type { TicTacToeGameState, RPSGameState } from '../types/games'

// SQLite database instance
let db: Database.Database | null = null

// Database file path - store in project root so both web app and MCP server can access
// Use environment variable if set, otherwise use a path in the current working directory
// During tests, use an in-memory database for speed and isolation
const DB_PATH = process.env.NODE_ENV === 'test' || process.env.VITEST !== undefined
  ? ':memory:' 
  : process.env.GAMES_DB_PATH || path.join(process.cwd(), 'games.db')

// Initialize database and create tables if they don't exist
function initializeDatabase(): Database.Database {
  if (db) {
    return db
  }

  if (process.env.NODE_ENV !== 'test') {
    console.log('Initializing database at:', DB_PATH)
  }

  db = new Database(DB_PATH)

  if (process.env.NODE_ENV !== 'test') {
    console.log('Database opened successfully')
  }

  db.exec(`
    CREATE TABLE IF NOT EXISTS tic_tac_toe_games (
      id TEXT PRIMARY KEY,
      game_session TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  if (process.env.NODE_ENV !== 'test') {
    console.log('tic_tac_toe_games table created/verified')
  }

  db.exec(`
    CREATE TABLE IF NOT EXISTS rps_games (
      id TEXT PRIMARY KEY,
      game_session TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  if (process.env.NODE_ENV !== 'test') {
    console.log('rps_games table created/verified')
    console.log('Database initialized successfully')
  }

  return db
}

// Helper function to run database queries
function runQuery(sql: string, params: unknown[] = []): { lastID: number | null; changes: number } {
  try {
    const database = initializeDatabase()
    const result = database.prepare(sql).run(...params)
    return { lastID: result.lastInsertRowid as number | null, changes: result.changes }
  } catch (error) {
    if (process.env.NODE_ENV === 'test' && error instanceof Error && error.message.includes('no such table')) {
      return { lastID: null, changes: 0 }
    }
    throw error
  }
}

// Helper function to get single row
function getRow(sql: string, params: unknown[] = []): Record<string, unknown> | undefined {
  try {
    const database = initializeDatabase()
    const row = database.prepare(sql).get(...params)
    return row as Record<string, unknown> | undefined
  } catch (error) {
    if (process.env.NODE_ENV === 'test' && error instanceof Error && error.message.includes('no such table')) {
      return undefined
    }
    throw error
  }
}

// Helper function to get all rows
function getAllRows(sql: string, params: unknown[] = []): Record<string, unknown>[] {
  try {
    const database = initializeDatabase()
    const rows = database.prepare(sql).all(...params)
    return (rows || []) as Record<string, unknown>[]
  } catch (error) {
    if (process.env.NODE_ENV === 'test' && error instanceof Error && error.message.includes('no such table')) {
      return []
    }
    throw error
  }
}

// Tic-tac-toe game operations
export async function getTicTacToeGame(gameId: string): Promise<GameSession<TicTacToeGameState> | undefined> {
  try {
    const row = getRow('SELECT game_session FROM tic_tac_toe_games WHERE id = ?', [gameId])
    if (row) {
      return JSON.parse(row.game_session as string)
    }
    return undefined
  } catch (error) {
    if (process.env.NODE_ENV !== 'test') {
      console.error('Error getting tic-tac-toe game:', error)
    }
    return undefined
  }
}

export async function setTicTacToeGame(gameId: string, gameSession: GameSession<TicTacToeGameState>): Promise<void> {
  try {
    const gameSessionJson = JSON.stringify(gameSession)
    runQuery(`
      INSERT OR REPLACE INTO tic_tac_toe_games (id, game_session, updated_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
    `, [gameId, gameSessionJson])
  } catch (error) {
    if (process.env.NODE_ENV !== 'test') {
      console.error('Error setting tic-tac-toe game:', error)
    }
    throw error
  }
}

export async function getAllTicTacToeGames(): Promise<GameSession<TicTacToeGameState>[]> {
  try {
    const rows = getAllRows('SELECT game_session FROM tic_tac_toe_games ORDER BY updated_at DESC')
    return rows.map(row => JSON.parse(row.game_session as string))
  } catch (error) {
    if (process.env.NODE_ENV !== 'test') {
      console.error('Error getting all tic-tac-toe games:', error)
    }
    return []
  }
}

export async function deleteTicTacToeGame(gameId: string): Promise<boolean> {
  try {
    const result = runQuery('DELETE FROM tic_tac_toe_games WHERE id = ?', [gameId])
    return result.changes > 0
  } catch (error) {
    if (process.env.NODE_ENV !== 'test') {
      console.error('Error deleting tic-tac-toe game:', error)
    }
    return false
  }
}

// Rock-paper-scissors game operations
export async function getRPSGame(gameId: string): Promise<GameSession<RPSGameState> | undefined> {
  try {
    const row = getRow('SELECT game_session FROM rps_games WHERE id = ?', [gameId])
    if (row) {
      return JSON.parse(row.game_session as string)
    }
    return undefined
  } catch (error) {
    if (process.env.NODE_ENV !== 'test') {
      console.error('Error getting RPS game:', error)
    }
    return undefined
  }
}

export async function setRPSGame(gameId: string, gameSession: GameSession<RPSGameState>): Promise<void> {
  try {
    const gameSessionJson = JSON.stringify(gameSession)
    runQuery(`
      INSERT OR REPLACE INTO rps_games (id, game_session, updated_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
    `, [gameId, gameSessionJson])
  } catch (error) {
    if (process.env.NODE_ENV !== 'test') {
      console.error('Error setting RPS game:', error)
    }
    throw error
  }
}

export async function getAllRPSGames(): Promise<GameSession<RPSGameState>[]> {
  try {
    const rows = getAllRows('SELECT game_session FROM rps_games ORDER BY updated_at DESC')
    return rows.map(row => JSON.parse(row.game_session as string))
  } catch (error) {
    if (process.env.NODE_ENV !== 'test') {
      console.error('Error getting all RPS games:', error)
    }
    return []
  }
}

export async function deleteRPSGame(gameId: string): Promise<boolean> {
  try {
    const result = runQuery('DELETE FROM rps_games WHERE id = ?', [gameId])
    return result.changes > 0
  } catch (error) {
    if (process.env.NODE_ENV !== 'test') {
      console.error('Error deleting RPS game:', error)
    }
    return false
  }
}

/**
 * Reset database instance - primarily for testing
 * Forces re-initialization on next database operation
 */
export async function resetDatabaseInstance(): Promise<void> {
  if (db) {
    try {
      db.close()
    } catch (error) {
      if (process.env.NODE_ENV !== 'test') {
        console.error('Error closing database during reset:', error)
      }
    }
    db = null
  }
}


