/**
 * HTTP client utilities for communicating with the web API
 * 
 * This module provides higher-level API functions for the MCP server
 * while using shared HTTP utilities to eliminate code duplication.
 */

import { httpGet, httpPost, WEB_API_BASE } from '@turn-based-mcp/shared'

/**
 * Generic game state fetcher for resources
 */
export async function getGameViaAPI(gameType: string, gameId: string) {
  try {
    const games = await httpGet(`${WEB_API_BASE}/api/games/${gameType}/mcp`)
    return games.find((game: any) => game.gameState?.id === gameId)
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
  aiDifficulty?: string,
  gameSpecificOptions?: Record<string, any>
) {
  try {
    const data: any = { playerName }
    if (gameId) {
      data.gameId = gameId
    }
    if (aiDifficulty) {
      data.aiDifficulty = aiDifficulty
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
  move: any,
  playerId: string
) {
  return await httpPost(`${WEB_API_BASE}/api/games/${gameType}/${gameId}/move`, {
    move,
    playerId
  })
}

/**
 * Get all games of a specific type
 */
export async function getGamesByType(gameType: string) {
  return await httpGet(`${WEB_API_BASE}/api/games/${gameType}/mcp`)
}

export { WEB_API_BASE }
