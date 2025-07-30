import type { GameSession } from '../types/game'
import type { TicTacToeGameState, RPSGameState } from '../types/games'
import * as sqliteStorage from './sqlite-storage'

// Simple async wrapper around SQLite storage for web app use
// MCP server should use the mcp-api-client.ts instead

export async function getTicTacToeGame(gameId: string): Promise<GameSession<TicTacToeGameState> | undefined> {
  return sqliteStorage.getTicTacToeGame(gameId)
}

export async function setTicTacToeGame(gameId: string, gameSession: GameSession<TicTacToeGameState>): Promise<void> {
  return sqliteStorage.setTicTacToeGame(gameId, gameSession)
}

export async function getAllTicTacToeGames(): Promise<GameSession<TicTacToeGameState>[]> {
  return sqliteStorage.getAllTicTacToeGames()
}

export async function deleteTicTacToeGame(gameId: string): Promise<boolean> {
  return sqliteStorage.deleteTicTacToeGame(gameId)
}

export async function getRPSGame(gameId: string): Promise<GameSession<RPSGameState> | undefined> {
  return sqliteStorage.getRPSGame(gameId)
}

export async function setRPSGame(gameId: string, gameSession: GameSession<RPSGameState>): Promise<void> {
  return sqliteStorage.setRPSGame(gameId, gameSession)
}

export async function getAllRPSGames(): Promise<GameSession<RPSGameState>[]> {
  return sqliteStorage.getAllRPSGames()
}

export async function deleteRPSGame(gameId: string): Promise<boolean> {
  return sqliteStorage.deleteRPSGame(gameId)
}
