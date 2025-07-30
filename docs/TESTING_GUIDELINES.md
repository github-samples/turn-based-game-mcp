# Testing Guidelines for Turn-Based Games Platform

## Overview

This document provides comprehensive testing guidelines for maintaining and extending the Turn-Based Games Platform. Our testing strategy ensures high code quality, prevents regressions, and serves as living documentation for the codebase.

## Testing Architecture

### Test Categories

1. **Unit Tests** - Test individual functions and classes
2. **Component Tests** - Test React components in isolation
3. **Integration Tests** - Test interactions between components
4. **Game Logic Tests** - Test game rules and AI algorithms

### Test Structure

```
web/src/
├── components/
│   ├── games/           # Game-specific components
│   │   ├── GameStatus.tsx
│   │   └── GameStatus.test.tsx
│   ├── ui/              # Reusable UI components
│   │   ├── LoadingSpinner.tsx
│   │   └── LoadingSpinner.test.tsx
│   └── shared/          # Game-related shared components
│       ├── AITurnIndicator.tsx
│       └── AITurnIndicator.test.tsx
```

## Component Testing Patterns

### 1. Basic Component Testing

```typescript
import { render, screen } from '@testing-library/react'
import { LoadingSpinner } from '../LoadingSpinner'

describe('LoadingSpinner', () => {
  it('should render with default props', () => {
    render(<LoadingSpinner />)
    
    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.getByLabelText('Loading')).toBeInTheDocument()
  })
})
```

### 2. Testing Component Props

```typescript
it('should render with custom message', () => {
  const message = 'Loading game data...'
  render(<LoadingSpinner message={message} />)
  
  expect(screen.getByText(message)).toBeInTheDocument()
})
```

### 3. Testing User Interactions

```typescript
import { fireEvent } from '@testing-library/react'

it('should call onMove when clicking empty cell', () => {
  const mockOnMove = jest.fn()
  render(<TicTacToeBoard gameState={gameState} onMove={mockOnMove} />)
  
  fireEvent.click(screen.getAllByRole('button')[0])
  expect(mockOnMove).toHaveBeenCalledWith({ row: 0, col: 0 })
})
```

### 4. Testing Conditional Rendering

```typescript
it('should not render when condition is false', () => {
  const gameState = createMockGameState({ currentPlayerId: 'player1' })
  render(<AITurnIndicator gameState={gameState} />)
  
  expect(screen.queryByText('🤖 AI Turn')).not.toBeInTheDocument()
})
```

### 5. Testing Accessibility

```typescript
it('should have proper accessibility attributes', () => {
  render(<LoadingSpinner />)
  
  const spinner = screen.getByRole('status')
  expect(spinner).toHaveAttribute('aria-label', 'Loading')
})
```

## Mock Factory Patterns

### Game State Factory

```typescript
const createMockGameState = (overrides: Partial<BaseGameState> = {}): BaseGameState => ({
  id: 'test-game',
  players: [
    { id: 'player1', name: 'Player 1', isAI: false },
    { id: 'ai', name: 'AI Player', isAI: true }
  ],
  currentPlayerId: 'player1',
  status: 'playing',
  winner: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides
})
```

### Component Props Factory

```typescript
const createDefaultProps = (overrides: Partial<GameControlsProps> = {}): GameControlsProps => ({
  isLoading: false,
  onNewGame: jest.fn(),
  ...overrides
})
```

## Testing New Components

### Step-by-Step Guide

1. **Create the component file** (e.g., `MyComponent.tsx`)
2. **Create the test file** (e.g., `MyComponent.test.tsx`)
3. **Write basic rendering tests**
4. **Test all props and variants**
5. **Test user interactions**
6. **Test edge cases and error states**
7. **Verify accessibility compliance**

### Example: Testing a New Component

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { ScoreDisplay } from './ScoreDisplay'

describe('ScoreDisplay', () => {
  const defaultProps = {
    players: [
      { id: 'player1', name: 'Alice', score: 5 },
      { id: 'player2', name: 'Bob', score: 3 }
    ]
  }

  it('should render all player scores', () => {
    render(<ScoreDisplay {...defaultProps} />)
    
    expect(screen.getByText('Alice: 5')).toBeInTheDocument()
    expect(screen.getByText('Bob: 3')).toBeInTheDocument()
  })

  it('should highlight the leader', () => {
    render(<ScoreDisplay {...defaultProps} showLeader />)
    
    const aliceScore = screen.getByText('Alice: 5')
    expect(aliceScore).toHaveClass('leader-highlight')
  })

  it('should handle empty players array', () => {
    render(<ScoreDisplay players={[]} />)
    
    expect(screen.getByText('No players')).toBeInTheDocument()
  })
})
```

## Game Logic Testing

### Testing Game Classes

```typescript
describe('TicTacToeGame', () => {
  let game: TicTacToeGame
  let gameState: TicTacToeGameState

  beforeEach(() => {
    game = new TicTacToeGame()
    gameState = game.getInitialState(['player1', 'ai'])
  })

  it('should validate moves correctly', () => {
    expect(game.validateMove(gameState, { row: 0, col: 0 }, 'player1')).toBe(true)
    expect(game.validateMove(gameState, { row: 3, col: 0 }, 'player1')).toBe(false)
  })

  it('should detect win conditions', () => {
    // Set up winning board state
    gameState.board = [
      ['X', 'X', 'X'],
      [null, null, null],
      [null, null, null]
    ]
    
    const result = game.checkGameEnd(gameState)
    expect(result.isFinished).toBe(true)
    expect(result.winner).toBe('player1')
  })
})
```

### Testing AI Algorithms

```typescript
describe('TicTacToeAI', () => {
  it('should choose winning move when available', () => {
    const gameState = createWinningGameState()
    const move = TicTacToeAI.getOptimalMove(gameState, 'hard')
    
    expect(move).toEqual({ row: 2, col: 2 }) // Winning position
  })

  it('should block opponent winning move', () => {
    const gameState = createBlockingGameState()
    const move = TicTacToeAI.getOptimalMove(gameState, 'medium')
    
    expect(move).toEqual({ row: 1, col: 1 }) // Blocking position
  })
})
```

## Coverage Requirements

### Component Coverage Targets
- **UI Components**: 100% coverage (critical reusable components)
- **Game Components**: 95% coverage (some UI edge cases acceptable)
- **Game Logic**: 100% coverage (business critical)
- **AI Algorithms**: 95% coverage (some randomness acceptable)

### Coverage Commands

```bash
# Run coverage for all tests
npm run test:coverage

# Run coverage for specific workspace
npm run test:coverage --workspace=web

# Run coverage with detailed report
npm run test:coverage -- --verbose
```

## Continuous Integration

### Pre-commit Checks
- All tests must pass
- Coverage thresholds must be met
- TypeScript compilation must succeed
- ESLint rules must pass

### Test Scripts

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --coverage --watchAll=false"
  }
}
```

## Best Practices

### 1. Test Naming
- Use descriptive test names that explain the behavior
- Follow the pattern: "should [expected behavior] when [condition]"

### 2. Test Organization
- Group related tests using `describe` blocks
- Use `beforeEach` for common setup
- Keep tests focused on single behaviors

### 3. Mock Usage
- Mock external dependencies (APIs, timers, etc.)
- Don't mock the component being tested
- Create reusable mock factories

### 4. Assertions
- Use specific assertions (`toHaveClass` vs `toMatchSnapshot`)
- Test user-facing behavior, not implementation details
- Verify both positive and negative cases

### 5. Accessibility Testing
- Always test ARIA attributes
- Verify keyboard navigation
- Check screen reader compatibility

## Debugging Tests

### Common Issues

1. **Component not rendering**: Check for missing providers or invalid props
2. **Events not firing**: Verify event handlers are properly mocked
3. **Async issues**: Use `waitFor` for async operations
4. **CSS classes not found**: Ensure class names are correct and styles are applied

### Debug Commands

```bash
# Run single test file
npm test -- GameStatus.test.tsx

# Run tests in watch mode
npm run test:watch

# Debug with verbose output
npm test -- --verbose
```

## Adding New Games

### Testing Checklist for New Games

- [ ] Game class unit tests (rules, validation, win conditions)
- [ ] AI algorithm tests (all difficulty levels)
- [ ] Game board component tests (rendering, interactions)
- [ ] Game page integration tests
- [ ] Accessibility compliance tests
- [ ] Error handling tests
- [ ] Edge case coverage

### Template for New Game Tests

```typescript
// GameName.test.ts
describe('GameNameGame', () => {
  describe('game initialization', () => {
    // Test initial state setup
  })

  describe('move validation', () => {
    // Test valid/invalid moves
  })

  describe('game state transitions', () => {
    // Test state changes after moves
  })

  describe('win conditions', () => {
    // Test all win scenarios
  })
})

// GameNameBoard.test.tsx
describe('GameNameBoard', () => {
  describe('rendering', () => {
    // Test component rendering
  })

  describe('user interactions', () => {
    // Test clicks, form submissions
  })

  describe('game states', () => {
    // Test different game states
  })
})
```

## Resources

- [React Testing Library Documentation](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest Matchers](https://jestjs.io/docs/using-matchers)
- [Accessibility Testing Guide](https://testing-library.com/docs/guide-which-query#priority)
- [TypeScript Testing Best Practices](https://typescript-eslint.io/docs/linting/troubleshooting/)

---

This testing infrastructure ensures maintainable, reliable code that can evolve confidently with comprehensive test coverage and clear development patterns.