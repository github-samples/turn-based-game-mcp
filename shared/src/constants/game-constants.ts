/**
 * Shared game constants
 * Single source of truth for game types, difficulties, player IDs, and default values
 */

/**
 * Supported game types
 */
export const GAME_TYPES = ['tic-tac-toe', 'rock-paper-scissors'] as const

/**
 * Available AI difficulty levels
 */
export const DIFFICULTIES = ['easy', 'medium', 'hard'] as const

/**
 * Standard player IDs used across the system
 */
export const PLAYER_IDS = {
  HUMAN: 'player1',
  PLAYER2: 'player2', 
  AI: 'ai'
} as const

/**
 * Game status values
 */
export const GAME_STATUSES = ['waiting', 'playing', 'finished'] as const

/**
 * Derive types from constants
 */
export type GameType = typeof GAME_TYPES[number]
export type Difficulty = typeof DIFFICULTIES[number]
export type PlayerId = typeof PLAYER_IDS[keyof typeof PLAYER_IDS]
export type GameStatus = typeof GAME_STATUSES[number]

/**
 * Default player configurations
 */
export const DEFAULT_PLAYER_NAME = 'Player'
export const DEFAULT_AI_DIFFICULTY: Difficulty = 'medium'

/**
 * Difficulty display configuration
 */
export const DIFFICULTY_DISPLAY = {
  easy: { emoji: '😌', label: 'Easy' },
  medium: { emoji: '🎯', label: 'Medium' },
  hard: { emoji: '🔥', label: 'Hard' }
} as const

/**
 * Type guard to check if a string is a supported game type
 */
export function isSupportedGameType(gameType: string): gameType is GameType {
  return GAME_TYPES.includes(gameType as GameType)
}

/**
 * Type guard to check if a string is a valid difficulty level
 */
export function isValidDifficulty(difficulty: string): difficulty is Difficulty {
  return DIFFICULTIES.includes(difficulty as Difficulty)
}

/**
 * Type guard to check if a string is a valid player ID
 */
export function isValidPlayerId(playerId: string): playerId is PlayerId {
  return Object.values(PLAYER_IDS).includes(playerId as PlayerId)
}

/**
 * Type guard to check if a string is a valid game status
 */
export function isValidGameStatus(status: string): status is GameStatus {
  return GAME_STATUSES.includes(status as GameStatus)
}

/**
 * Get difficulty display configuration
 */
export function getDifficultyDisplay(difficulty: Difficulty): { emoji: string; label: string } {
  return DIFFICULTY_DISPLAY[difficulty]
}