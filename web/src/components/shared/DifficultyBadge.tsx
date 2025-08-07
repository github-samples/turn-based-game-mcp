'use client'

import { getDifficultyDisplay } from '@turn-based-mcp/shared/dist/constants/game-constants'
import type { Difficulty } from '@turn-based-mcp/shared/dist/types/game'

/**
 * Props for the DifficultyBadge component
 */
interface DifficultyBadgeProps {
  /** AI difficulty level to display */
  difficulty: Difficulty
  /** Additional CSS classes for customization */
  className?: string
  /** Variant for different styling contexts */
  variant?: 'default' | 'compact'
}

/**
 * Unified difficulty badge component
 * 
 * Displays AI difficulty with consistent styling and emoji across the application.
 * Consolidates duplicate difficulty display logic from GameInfoPanel and GameStatus.
 * 
 * @param props - Component props
 * @returns JSX element representing the difficulty badge
 */
export function DifficultyBadge({ 
  difficulty, 
  className = '',
  variant = 'default'
}: DifficultyBadgeProps) {
  const display = getDifficultyDisplay(difficulty)
  
  // Base classes for all variants
  const baseClasses = 'inline-flex items-center rounded-full text-xs font-semibold'
  
  // Variant-specific classes
  const variantClasses = {
    default: 'px-3 py-1',
    compact: 'px-2 py-0.5'
  }
  
  // Difficulty-specific colors
  const difficultyClasses = {
    easy: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
    hard: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
  }
  
  const finalClasses = [
    baseClasses,
    variantClasses[variant],
    difficultyClasses[difficulty],
    className
  ].filter(Boolean).join(' ')
  
  return (
    <span className={finalClasses} title={`AI Difficulty: ${display.label}`}>
      {display.emoji} {display.label}
    </span>
  )
}