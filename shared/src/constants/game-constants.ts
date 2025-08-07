/**
 * Shared game constants
 * Single source of truth for game types, difficulties, and default values
 */

import type { GameType, Difficulty } from '../types/game'

/**
 * Supported game types
 */
export const GAME_TYPES: readonly GameType[] = ['tic-tac-toe', 'rock-paper-scissors'] as const

/**
 * Available AI difficulty levels
 */
export const DIFFICULTIES: readonly Difficulty[] = ['easy', 'medium', 'hard'] as const

/**
 * Default player configurations
 */
export const DEFAULT_PLAYER_NAME = 'Player'
export const DEFAULT_AI_DIFFICULTY: Difficulty = 'medium'

/**
 * Standard player IDs used across the system
 */
export const PLAYER_IDS = {
  HUMAN: 'player1',
  AI: 'ai'
} as const

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
 * Get difficulty display configuration
 */
export function getDifficultyDisplay(difficulty: Difficulty) {
  return DIFFICULTY_DISPLAY[difficulty]
}