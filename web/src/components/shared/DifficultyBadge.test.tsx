/**
 * Tests for DifficultyBadge component
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { DifficultyBadge } from './DifficultyBadge'

// Mock the shared library constants
jest.mock('@turn-based-mcp/shared/dist/constants/game-constants', () => ({
  getDifficultyDisplay: jest.fn((difficulty) => {
    const displays = {
      easy: { emoji: '😌', label: 'Easy' },
      medium: { emoji: '🎯', label: 'Medium' },
      hard: { emoji: '🔥', label: 'Hard' }
    }
    return displays[difficulty]
  })
}))

describe('DifficultyBadge', () => {
  describe('Rendering', () => {
    it('should render easy difficulty correctly', () => {
      render(<DifficultyBadge difficulty="easy" />)
      
      expect(screen.getByText('😌 Easy')).toBeInTheDocument()
      expect(screen.getByTitle('AI Difficulty: Easy')).toBeInTheDocument()
    })

    it('should render medium difficulty correctly', () => {
      render(<DifficultyBadge difficulty="medium" />)
      
      expect(screen.getByText('🎯 Medium')).toBeInTheDocument()
      expect(screen.getByTitle('AI Difficulty: Medium')).toBeInTheDocument()
    })

    it('should render hard difficulty correctly', () => {
      render(<DifficultyBadge difficulty="hard" />)
      
      expect(screen.getByText('🔥 Hard')).toBeInTheDocument()
      expect(screen.getByTitle('AI Difficulty: Hard')).toBeInTheDocument()
    })
  })

  describe('Styling variants', () => {
    it('should apply default variant classes', () => {
      render(<DifficultyBadge difficulty="medium" />)
      
      const badge = screen.getByText('🎯 Medium')
      expect(badge).toHaveClass('px-3', 'py-1')
    })

    it('should apply compact variant classes', () => {
      render(<DifficultyBadge difficulty="medium" variant="compact" />)
      
      const badge = screen.getByText('🎯 Medium')
      expect(badge).toHaveClass('px-2', 'py-0.5')
    })

    it('should apply custom className', () => {
      render(<DifficultyBadge difficulty="easy" className="custom-class" />)
      
      const badge = screen.getByText('😌 Easy')
      expect(badge).toHaveClass('custom-class')
    })
  })

  describe('Difficulty-specific styling', () => {
    it('should apply easy difficulty colors', () => {
      render(<DifficultyBadge difficulty="easy" />)
      
      const badge = screen.getByText('😌 Easy')
      expect(badge).toHaveClass('bg-green-100', 'text-green-700')
    })

    it('should apply medium difficulty colors', () => {
      render(<DifficultyBadge difficulty="medium" />)
      
      const badge = screen.getByText('🎯 Medium')
      expect(badge).toHaveClass('bg-yellow-100', 'text-yellow-700')
    })

    it('should apply hard difficulty colors', () => {
      render(<DifficultyBadge difficulty="hard" />)
      
      const badge = screen.getByText('🔥 Hard')
      expect(badge).toHaveClass('bg-red-100', 'text-red-700')
    })
  })

  describe('Base classes', () => {
    it('should always include base classes', () => {
      render(<DifficultyBadge difficulty="medium" />)
      
      const badge = screen.getByText('🎯 Medium')
      expect(badge).toHaveClass(
        'inline-flex',
        'items-center', 
        'rounded-full',
        'text-xs',
        'font-semibold'
      )
    })
  })
})