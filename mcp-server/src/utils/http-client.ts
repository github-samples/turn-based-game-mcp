/**
 * HTTP client utilities for communicating with the web API
 * 
 * This module provides higher-level API functions for the MCP server
 * while using shared HTTP utilities to eliminate code duplication.
 */

import { httpGet, httpPost, WEB_API_BASE } from '@turn-based-mcp/shared'

interface GenericGameStateWrapper {
  gameState?: { id?: string; status?: string; currentPlayerId?: string; winner?: string | null; createdAt?: string; updatedAt?: string; [k: string]: unknown }
  difficulty?: string
  [k: string]: unknown
}
interface CreateGameOptions { [k: string]: unknown }
interface MovePayload { choice?: string; row?: number; col?: number; [k: string]: unknown }

/**
 * Generic game state fetcher for resources
 */
export async function getGameViaAPI(gameType: string, gameId: string): Promise<GenericGameStateWrapper | undefined> {
  try {
    const games = await httpGet(`${WEB_API_BASE}/api/games/${gameType}/mcp`)
  return (games as GenericGameStateWrapper[]).find((game) => game.gameState?.id === gameId)
  } catch (error) {
    console.error(`Error fetching ${gameType} game via API:`, error)
    return undefined
  }
}

/**
 * Generic game creation function
 */
export async function createGameViaAPI(
  gameType: string, 
  playerName: string, 
  gameId?: string, 
  difficulty?: string,
  gameSpecificOptions?: CreateGameOptions
): Promise<GenericGameStateWrapper> {
  try {
  const data: Record<string, unknown> = { playerName }
    if (gameId) {
      data.gameId = gameId
    }
    if (difficulty) {
      data.difficulty = difficulty
    }
    // Merge any game-specific options
    if (gameSpecificOptions) {
      Object.assign(data, gameSpecificOptions)
    }
    return await httpPost(`${WEB_API_BASE}/api/games/${gameType}`, data)
  } catch (error) {
    console.error(`Error creating ${gameType} game via API:`, error)
    throw error
  }
}

/**
 * Submit a move to the API
 */
export async function submitMoveViaAPI(
  gameType: string,
  gameId: string,
  move: MovePayload,
  playerId: string
): Promise<GenericGameStateWrapper> {
  return await httpPost(`${WEB_API_BASE}/api/games/${gameType}/${gameId}/move`, {
    move,
    playerId
  })
}

/**
 * Get all games of a specific type
 */
export async function getGamesByType(gameType: string): Promise<GenericGameStateWrapper[]> {
  return await httpGet(`${WEB_API_BASE}/api/games/${gameType}/mcp`)
}

export { WEB_API_BASE }
