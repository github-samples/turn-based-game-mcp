---
applyTo: "web/src/components/**/*.{tsx,ts}"
description: React component development patterns for the turn-based games platform
---

# React Components

## Purpose

Patterns for React components in the web package. Covers component structure, styling with TailwindCSS, accessibility, and animations.


## Component Structure

- Use TypeScript with proper interface definitions
- Include JSDoc comments for component purpose and complex props
- Use `'use client'` directive for interactive components
- Export interfaces separately from components

## Styling Patterns

- Use TailwindCSS utility classes consistently
- Follow the established design system:
  - Gradients: `from-blue-500 to-indigo-600` for primary actions
  - Glass morphism: `bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm`
  - Rounded corners: `rounded-xl` for cards, `rounded-lg` for smaller elements
  - Shadows: `shadow-lg hover:shadow-xl` for interactive elements
  - Transitions: `transition-all duration-200` for smooth interactions

## Component Categories

### UI Components (`web/src/components/ui/`)
- Reusable, generic components (LoadingSpinner, ErrorDisplay, GameControls)
- No game-specific logic
- Highly configurable through props
- Include size variants and theming support

### Game Components (`web/src/components/games/`)
- Game-specific components (TicTacToeBoard, GameInfoPanel)
- Handle game state and user interactions
- Use shared UI components where possible

### Shared Components (`web/src/components/shared/`)
- Components used across multiple games
- MCP integration components
- Cross-game utilities

## Props and State Management

- Use controlled components with callback props for state management
- Provide sensible defaults for optional props
- Include loading and disabled states
- Support className prop for style customization

## Accessibility Requirements

- Include proper ARIA attributes (`role`, `aria-label`, `aria-describedby`)
- Support keyboard navigation
- Maintain proper heading hierarchy
- Ensure sufficient color contrast
- Use semantic HTML elements

## Error Handling

- Handle loading and error states gracefully
- Provide user-friendly error messages
- Include retry mechanisms where appropriate
- Use ErrorBoundary components for critical errors

## Animation and Interactions

- Use CSS transforms for hover effects: `hover:scale-105`, `hover:-translate-y-1`
- Include icon animations: `group-hover:scale-110 transition-transform duration-200`
- Provide visual feedback for user actions
- Use consistent transition timing (200ms duration)

## Example Component Structure

```tsx
'use client'

import { ReactNode } from 'react'

interface ComponentProps {
  /** Primary content */
  children: ReactNode
  /** Loading state */
  isLoading?: boolean
  /** Additional CSS classes */
  className?: string
  /** Click handler */
  onClick?: () => void
}

/**
 * Component description
 * 
 * @param props - Component props
 * @returns JSX element
 */
export function Component({ 
  children, 
  isLoading = false, 
  className = '',
  onClick 
}: ComponentProps) {
  return (
    <div className={`bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl shadow-lg transition-all duration-200 ${className}`}>
      {/* Component content */}
    </div>
  )
}
```
