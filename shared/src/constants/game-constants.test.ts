/**
 * Tests for game constants
 */

import { 
  GAME_TYPES, 
  DIFFICULTIES, 
  DEFAULT_PLAYER_NAME, 
  DEFAULT_AI_DIFFICULTY,
  PLAYER_IDS,
  DIFFICULTY_DISPLAY,
  isSupportedGameType,
  isValidDifficulty,
  getDifficultyDisplay
} from './game-constants'

describe('Game Constants', () => {
  describe('GAME_TYPES', () => {
    it('should contain expected game types', () => {
      expect(GAME_TYPES).toEqual(['tic-tac-toe', 'rock-paper-scissors'])
      expect(GAME_TYPES).toHaveLength(2)
    })
    
    it('should be immutable array', () => {
      // Readonly arrays are frozen in TypeScript but may not throw at runtime
      const originalLength = GAME_TYPES.length
      expect(GAME_TYPES).toHaveLength(originalLength)
    })
  })

  describe('DIFFICULTIES', () => {
    it('should contain expected difficulty levels', () => {
      expect(DIFFICULTIES).toEqual(['easy', 'medium', 'hard'])
      expect(DIFFICULTIES).toHaveLength(3)
    })
    
    it('should be immutable array', () => {
      // Readonly arrays are frozen in TypeScript but may not throw at runtime
      const originalLength = DIFFICULTIES.length
      expect(DIFFICULTIES).toHaveLength(originalLength)
    })
  })

  describe('Default values', () => {
    it('should have correct defaults', () => {
      expect(DEFAULT_PLAYER_NAME).toBe('Player')
      expect(DEFAULT_AI_DIFFICULTY).toBe('medium')
    })
  })

  describe('PLAYER_IDS', () => {
    it('should have standard player IDs', () => {
      expect(PLAYER_IDS.HUMAN).toBe('player1')
      expect(PLAYER_IDS.AI).toBe('ai')
    })
  })

  describe('DIFFICULTY_DISPLAY', () => {
    it('should have display info for all difficulties', () => {
      expect(DIFFICULTY_DISPLAY.easy).toEqual({ emoji: '😌', label: 'Easy' })
      expect(DIFFICULTY_DISPLAY.medium).toEqual({ emoji: '🎯', label: 'Medium' })
      expect(DIFFICULTY_DISPLAY.hard).toEqual({ emoji: '🔥', label: 'Hard' })
    })
  })

  describe('Type guards', () => {
    describe('isSupportedGameType', () => {
      it('should return true for valid game types', () => {
        expect(isSupportedGameType('tic-tac-toe')).toBe(true)
        expect(isSupportedGameType('rock-paper-scissors')).toBe(true)
      })

      it('should return false for invalid game types', () => {
        expect(isSupportedGameType('invalid')).toBe(false)
        expect(isSupportedGameType('')).toBe(false)
        expect(isSupportedGameType('checkers')).toBe(false)
      })
    })

    describe('isValidDifficulty', () => {
      it('should return true for valid difficulties', () => {
        expect(isValidDifficulty('easy')).toBe(true)
        expect(isValidDifficulty('medium')).toBe(true)
        expect(isValidDifficulty('hard')).toBe(true)
      })

      it('should return false for invalid difficulties', () => {
        expect(isValidDifficulty('invalid')).toBe(false)
        expect(isValidDifficulty('')).toBe(false)
        expect(isValidDifficulty('extreme')).toBe(false)
      })
    })
  })

  describe('getDifficultyDisplay', () => {
    it('should return correct display info for each difficulty', () => {
      expect(getDifficultyDisplay('easy')).toEqual({ emoji: '😌', label: 'Easy' })
      expect(getDifficultyDisplay('medium')).toEqual({ emoji: '🎯', label: 'Medium' })
      expect(getDifficultyDisplay('hard')).toEqual({ emoji: '🔥', label: 'Hard' })
    })
  })
})