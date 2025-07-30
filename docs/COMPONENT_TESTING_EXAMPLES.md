# Component Testing Examples

This document provides practical examples for testing components in the Turn-Based Games Platform. These examples demonstrate best practices and common patterns that future developers can follow.

## Table of Contents

1. [Basic Component Testing](#basic-component-testing)
2. [Testing Props and State](#testing-props-and-state)
3. [Testing User Interactions](#testing-user-interactions)
4. [Testing Conditional Rendering](#testing-conditional-rendering)
5. [Testing Error States](#testing-error-states)
6. [Testing Accessibility](#testing-accessibility)
7. [Testing Game Components](#testing-game-components)
8. [Advanced Testing Patterns](#advanced-testing-patterns)

## Basic Component Testing

### Testing a Simple UI Component

```typescript
// LoadingSpinner.test.tsx
import { render, screen } from '@testing-library/react'
import { LoadingSpinner } from '../ui/LoadingSpinner'

describe('LoadingSpinner', () => {
  it('should render with default props', () => {
    render(<LoadingSpinner />)
    
    // Test that the component renders
    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.getByLabelText('Loading')).toBeInTheDocument()
  })

  it('should apply correct size classes', () => {
    const { rerender } = render(<LoadingSpinner size="sm" />)
    
    // Test small size
    expect(screen.getByRole('status')).toHaveClass('w-4', 'h-4')
    
    // Test large size
    rerender(<LoadingSpinner size="lg" />)
    expect(screen.getByRole('status')).toHaveClass('w-8', 'h-8')
  })

  it('should display custom message', () => {
    const message = 'Loading game data...'
    render(<LoadingSpinner message={message} />)
    
    expect(screen.getByText(message)).toBeInTheDocument()
  })
})
```

### Testing Component with Multiple Props

```typescript
// ErrorDisplay.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { ErrorDisplay } from '../ui/ErrorDisplay'

describe('ErrorDisplay', () => {
  const defaultProps = {
    message: 'Something went wrong'
  }

  it('should render error message with correct styling', () => {
    render(<ErrorDisplay {...defaultProps} type="error" />)
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveClass('bg-red-100', 'text-red-700')
    expect(screen.getByText('❌')).toBeInTheDocument()
  })

  it('should render warning with different styling', () => {
    render(<ErrorDisplay {...defaultProps} type="warning" />)
    
    expect(screen.getByRole('alert')).toHaveClass('bg-yellow-100', 'text-yellow-700')
    expect(screen.getByText('⚠️')).toBeInTheDocument()
  })

  it('should handle dismiss functionality', () => {
    const mockOnDismiss = jest.fn()
    render(<ErrorDisplay {...defaultProps} onDismiss={mockOnDismiss} />)
    
    const dismissButton = screen.getByLabelText('Dismiss error')
    fireEvent.click(dismissButton)
    
    expect(mockOnDismiss).toHaveBeenCalledTimes(1)
  })
})
```

## Testing Props and State

### Testing Controlled Components

```typescript
// GameControls.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { GameControls } from '../ui/GameControls'

// Mock Next.js Link
jest.mock('next/link', () => {
  return function MockLink({ children, href }: any) {
    return <a href={href}>{children}</a>
  }
})

describe('GameControls', () => {
  it('should render new game button when callback provided', () => {
    const mockOnNewGame = jest.fn()
    render(<GameControls onNewGame={mockOnNewGame} />)
    
    const newGameButton = screen.getByText('New Game')
    expect(newGameButton).toBeInTheDocument()
    
    fireEvent.click(newGameButton)
    expect(mockOnNewGame).toHaveBeenCalledTimes(1)
  })

  it('should show loading state correctly', () => {
    const mockOnNewGame = jest.fn()
    render(<GameControls isLoading onNewGame={mockOnNewGame} />)
    
    // Button should show loading text and be disabled
    expect(screen.getByText('Starting...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /starting/i })).toBeDisabled()
  })

  it('should conditionally render reset button', () => {
    const mockOnReset = jest.fn()
    
    // Should not render reset button by default
    const { rerender } = render(<GameControls onReset={mockOnReset} />)
    expect(screen.queryByText('Reset Game')).not.toBeInTheDocument()
    
    // Should render when showReset is true
    rerender(<GameControls showReset onReset={mockOnReset} />)
    expect(screen.getByText('Reset Game')).toBeInTheDocument()
  })
})
```

## Testing User Interactions

### Testing Form Interactions

```typescript
// Example: Testing a hypothetical PlayerForm component
describe('PlayerForm', () => {
  it('should update input value on change', () => {
    const mockOnSubmit = jest.fn()
    render(<PlayerForm onSubmit={mockOnSubmit} />)
    
    const nameInput = screen.getByLabelText('Player Name')
    fireEvent.change(nameInput, { target: { value: 'Alice' } })
    
    expect(nameInput).toHaveValue('Alice')
  })

  it('should call onSubmit with form data', () => {
    const mockOnSubmit = jest.fn()
    render(<PlayerForm onSubmit={mockOnSubmit} />)
    
    const nameInput = screen.getByLabelText('Player Name')
    const submitButton = screen.getByRole('button', { name: /submit/i })
    
    fireEvent.change(nameInput, { target: { value: 'Alice' } })
    fireEvent.click(submitButton)
    
    expect(mockOnSubmit).toHaveBeenCalledWith({ name: 'Alice' })
  })

  it('should prevent submission with empty name', () => {
    const mockOnSubmit = jest.fn()
    render(<PlayerForm onSubmit={mockOnSubmit} />)
    
    const submitButton = screen.getByRole('button', { name: /submit/i })
    fireEvent.click(submitButton)
    
    expect(mockOnSubmit).not.toHaveBeenCalled()
    expect(screen.getByText('Name is required')).toBeInTheDocument()
  })
})
```

### Testing Game Board Interactions

```typescript
// TicTacToeBoard.test.tsx
describe('TicTacToeBoard', () => {
  const createMockGameState = (): TicTacToeGameState => ({
    id: 'test-game',
    players: [
      { id: 'player1', name: 'Player', isAI: false },
      { id: 'ai', name: 'AI', isAI: true }
    ],
    currentPlayerId: 'player1',
    status: 'playing',
    winner: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    board: [
      [null, null, null],
      [null, null, null],
      [null, null, null]
    ],
    playerSymbols: { player1: 'X', ai: 'O' }
  })

  it('should call onMove when clicking empty cell', () => {
    const mockOnMove = jest.fn()
    const gameState = createMockGameState()
    
    render(<TicTacToeBoard gameState={gameState} onMove={mockOnMove} />)
    
    // Click the first cell (top-left)
    const cells = screen.getAllByRole('button')
    fireEvent.click(cells[0])
    
    expect(mockOnMove).toHaveBeenCalledWith({ row: 0, col: 0 })
  })

  it('should not call onMove when clicking occupied cell', () => {
    const mockOnMove = jest.fn()
    const gameState = createMockGameState()
    gameState.board[0][0] = 'X' // Occupy first cell
    
    render(<TicTacToeBoard gameState={gameState} onMove={mockOnMove} />)
    
    const cells = screen.getAllByRole('button')
    fireEvent.click(cells[0])
    
    expect(mockOnMove).not.toHaveBeenCalled()
  })

  it('should disable board when disabled prop is true', () => {
    const mockOnMove = jest.fn()
    const gameState = createMockGameState()
    
    render(<TicTacToeBoard gameState={gameState} onMove={mockOnMove} disabled />)
    
    const cells = screen.getAllByRole('button')
    fireEvent.click(cells[0])
    
    expect(mockOnMove).not.toHaveBeenCalled()
  })
})
```

## Testing Conditional Rendering

### Testing Component Visibility

```typescript
// AITurnIndicator.test.tsx
describe('AITurnIndicator', () => {
  const createMockGameState = (overrides = {}): BaseGameState => ({
    id: 'test-game',
    players: [
      { id: 'player1', name: 'Player', isAI: false },
      { id: 'ai', name: 'AI', isAI: true }
    ],
    currentPlayerId: 'ai',
    status: 'playing',
    winner: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides
  })

  it('should render when AI turn and game is playing', () => {
    const gameState = createMockGameState()
    render(<AITurnIndicator gameState={gameState} />)
    
    expect(screen.getByText('🤖 AI Turn - MCP Integration')).toBeInTheDocument()
  })

  it('should not render when it is player turn', () => {
    const gameState = createMockGameState({ currentPlayerId: 'player1' })
    render(<AITurnIndicator gameState={gameState} />)
    
    expect(screen.queryByText('🤖 AI Turn - MCP Integration')).not.toBeInTheDocument()
  })

  it('should not render when game is finished', () => {
    const gameState = createMockGameState({ 
      status: 'finished',
      winner: 'player1'
    })
    render(<AITurnIndicator gameState={gameState} />)
    
    expect(screen.queryByText('🤖 AI Turn - MCP Integration')).not.toBeInTheDocument()
  })

  it('should render custom instructions when provided', () => {
    const gameState = createMockGameState()
    const customInstructions = {
      steps: ['Custom step 1', 'Custom step 2']
    }
    
    render(
      <AITurnIndicator 
        gameState={gameState} 
        gameInstructions={customInstructions} 
      />
    )
    
    expect(screen.getByText('Custom step 1')).toBeInTheDocument()
    expect(screen.getByText('Custom step 2')).toBeInTheDocument()
  })
})
```

## Testing Error States

### Testing Error Boundaries and Error Handling

```typescript
// GameContainer.test.tsx
describe('GameContainer', () => {
  const defaultProps = {
    title: 'Test Game',
    description: 'A test game',
    gameBoard: <div>Game Board</div>,
    sidebar: <div>Sidebar</div>
  }

  it('should render error when provided', () => {
    const errorMessage = 'Failed to load game'
    render(<GameContainer {...defaultProps} error={errorMessage} />)
    
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText(errorMessage)).toBeInTheDocument()
  })

  it('should not render error when error is null', () => {
    render(<GameContainer {...defaultProps} error={null} />)
    
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('should call onErrorDismiss when error is dismissed', () => {
    const mockOnErrorDismiss = jest.fn()
    const errorMessage = 'Something went wrong'
    
    render(
      <GameContainer 
        {...defaultProps} 
        error={errorMessage}
        onErrorDismiss={mockOnErrorDismiss}
      />
    )
    
    const dismissButton = screen.getByLabelText('Dismiss error')
    fireEvent.click(dismissButton)
    
    expect(mockOnErrorDismiss).toHaveBeenCalledTimes(1)
  })
})
```

## Testing Accessibility

### Testing ARIA Attributes and Keyboard Navigation

```typescript
// Accessibility testing examples
describe('Accessibility Tests', () => {
  it('should have proper ARIA attributes for loading spinner', () => {
    render(<LoadingSpinner />)
    
    const spinner = screen.getByRole('status')
    expect(spinner).toHaveAttribute('aria-label', 'Loading')
  })

  it('should have proper heading hierarchy', () => {
    render(
      <GameContainer 
        title="Tic-Tac-Toe"
        description="Test game"
        gameBoard={<div>Board</div>}
        sidebar={<div>Sidebar</div>}
      />
    )
    
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveTextContent('Tic-Tac-Toe')
  })

  it('should support keyboard navigation', () => {
    render(<GameControls onNewGame={jest.fn()} />)
    
    const button = screen.getByRole('button', { name: /new game/i })
    
    // Test focus
    button.focus()
    expect(button).toHaveFocus()
    
    // Test keyboard activation
    fireEvent.keyDown(button, { key: 'Enter' })
    // Additional assertions for keyboard behavior
  })

  it('should have proper contrast and visibility', () => {
    render(<ErrorDisplay message="Error" type="error" />)
    
    const alert = screen.getByRole('alert')
    
    // Test that error styling provides sufficient contrast
    expect(alert).toHaveClass('text-red-700') // Dark enough for contrast
    expect(alert).toHaveClass('bg-red-100')   // Light background
  })
})
```

## Testing Game Components

### Testing Game State Components

```typescript
// PlayerStatusIndicator.test.tsx
describe('PlayerStatusIndicator', () => {
  const createMockGameState = (overrides = {}) => ({
    id: 'test-game',
    players: [
      { id: 'player1', name: 'Alice', isAI: false },
      { id: 'ai', name: 'Bob AI', isAI: true }
    ],
    currentPlayerId: 'player1',
    status: 'playing',
    winner: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides
  })

  it('should render all players with correct information', () => {
    const gameState = createMockGameState()
    render(<PlayerStatusIndicator gameState={gameState} />)
    
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob AI')).toBeInTheDocument()
    expect(screen.getByText('🤖 AI')).toBeInTheDocument()
  })

  it('should highlight current player', () => {
    const gameState = createMockGameState({ currentPlayerId: 'player1' })
    const { container } = render(<PlayerStatusIndicator gameState={gameState} />)
    
    expect(screen.getByText('Current Turn')).toBeInTheDocument()
    
    const highlightedDiv = container.querySelector('.border-blue-500')
    expect(highlightedDiv).toBeInTheDocument()
  })

  it('should show winner when game is finished', () => {
    const gameState = createMockGameState({
      status: 'finished',
      winner: 'player1'
    })
    render(<PlayerStatusIndicator gameState={gameState} />)
    
    expect(screen.getByText('🏆 Winner')).toBeInTheDocument()
    expect(screen.queryByText('Current Turn')).not.toBeInTheDocument()
  })

  it('should show draw message', () => {
    const gameState = createMockGameState({
      status: 'finished',
      winner: 'draw'
    })
    render(<PlayerStatusIndicator gameState={gameState} />)
    
    expect(screen.getByText('🤝 Draw Game')).toBeInTheDocument()
  })
})
```

## Advanced Testing Patterns

### Testing with Context Providers

```typescript
// Example: Testing components that use React Context
const TestProvider = ({ children }: { children: React.ReactNode }) => (
  <GameContext.Provider value={mockGameContextValue}>
    {children}
  </GameContext.Provider>
)

describe('ComponentWithContext', () => {
  it('should render with context value', () => {
    render(
      <TestProvider>
        <ComponentWithContext />
      </TestProvider>
    )
    
    // Test component behavior with context
  })
})
```

### Testing Async Behavior

```typescript
// Testing components with async operations
import { waitFor } from '@testing-library/react'

describe('AsyncComponent', () => {
  it('should handle async data loading', async () => {
    const mockFetch = jest.fn().mockResolvedValue({ data: 'test data' })
    global.fetch = mockFetch
    
    render(<AsyncComponent />)
    
    // Initially shows loading
    expect(screen.getByText('Loading...')).toBeInTheDocument()
    
    // Wait for async operation to complete
    await waitFor(() => {
      expect(screen.getByText('test data')).toBeInTheDocument()
    })
    
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
  })

  it('should handle async errors', async () => {
    const mockFetch = jest.fn().mockRejectedValue(new Error('API Error'))
    global.fetch = mockFetch
    
    render(<AsyncComponent />)
    
    await waitFor(() => {
      expect(screen.getByText('Error: API Error')).toBeInTheDocument()
    })
  })
})
```

### Testing Custom Hooks

```typescript
// Testing custom hooks used in components
import { renderHook, act } from '@testing-library/react'

describe('useGameState', () => {
  it('should initialize with default state', () => {
    const { result } = renderHook(() => useGameState())
    
    expect(result.current.gameState).toBeNull()
    expect(result.current.isLoading).toBe(false)
  })

  it('should update loading state', () => {
    const { result } = renderHook(() => useGameState())
    
    act(() => {
      result.current.startGame()
    })
    
    expect(result.current.isLoading).toBe(true)
  })
})
```

## Testing Utilities and Helpers

### Reusable Test Utilities

```typescript
// test-utils.tsx - Custom render function with providers
import { render, RenderOptions } from '@testing-library/react'
import { ReactElement } from 'react'

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <GameProvider>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </GameProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }
```

### Mock Factories

```typescript
// mock-factories.ts - Centralized mock creation
export const createMockPlayer = (overrides = {}) => ({
  id: 'player1',
  name: 'Test Player',
  isAI: false,
  ...overrides
})

export const createMockGameState = (overrides = {}) => ({
  id: 'test-game-id',
  players: [createMockPlayer(), createMockPlayer({ id: 'ai', isAI: true })],
  currentPlayerId: 'player1',
  status: 'playing' as const,
  winner: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides
})
```

## Performance Testing

### Testing Component Performance

```typescript
// Performance testing with React's Profiler API
import { Profiler } from 'react'

describe('Performance Tests', () => {
  it('should render efficiently', () => {
    let renderTime = 0
    const onRenderCallback = (id: string, phase: string, duration: number) => {
      renderTime = duration
    }
    
    render(
      <Profiler id="test-component" onRender={onRenderCallback}>
        <ExpensiveComponent />
      </Profiler>
    )
    
    // Assert that render time is within acceptable bounds
    expect(renderTime).toBeLessThan(100) // 100ms threshold
  })
})
```

---

These examples provide a comprehensive foundation for testing components in the Turn-Based Games Platform. Use these patterns as starting points for writing tests for new components and features.