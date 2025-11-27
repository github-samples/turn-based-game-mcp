---
applyTo: "**/{*.test.{ts,tsx,js,jsx},__tests__/**/*.{ts,tsx,js,jsx}}"
description: Testing guidelines and patterns for the turn-based games platform
---

# Testing Guidelines

## Purpose

Testing patterns and requirements for all packages. Covers test structure, mocking, shared utilities, and coverage requirements.


## Test Structure and Organization

- Use descriptive test names following the pattern: "should [expected behavior] when [condition]"
- Group related tests using `describe` blocks
- Use `beforeEach` for common setup and `afterEach` for cleanup
- Keep tests focused on single behaviors

## Mock Patterns

- Mock external dependencies (APIs, timers, storage) but not the component being tested
- Use factory functions for creating mock data:
  ```typescript
  const createMockGameState = (overrides = {}) => ({
    id: 'test-game',
    players: [
      { id: 'player1', name: 'Player 1', isAI: false },
      { id: 'ai', name: 'AI Player', isAI: true }
    ],
    currentPlayerId: 'player1',
    status: 'playing',
    ...overrides
  })
  ```

## Shared Testing Utilities

**Use centralized mock data and test utilities from the shared package:**

```typescript
// ✅ Import shared testing utilities
import { 
  mockTicTacToeGameState, 
  mockRPSGameState,
  createMockGameSession,
  setupTestDatabase,
  clearTestDatabase 
} from '@turn-based-mcp/shared/testing'

// ✅ Use shared constants in tests
import { DIFFICULTIES, GAME_TYPES } from '@turn-based-mcp/shared'

// ❌ Don't recreate mock data locally
const localMockGameState = { /* duplicated data */ }  // Use shared mocks instead!
```

**Available shared testing utilities:**
- Mock game states: `mockTicTacToeGameState`, `mockRPSGameState`
- Factory functions: `createMockGameSession`, `createMockPlayer`
- Database utilities: `setupTestDatabase`, `clearTestDatabase`, `teardownTestDatabase`
- Type assertions and validation helpers

## Component Testing

- Always render components with realistic props
- Test user-facing behavior, not implementation details
- Use specific assertions (`toHaveClass`, `toHaveAttribute`) over snapshots
- Test both positive and negative cases
- Always test accessibility attributes (ARIA labels, roles, keyboard navigation)

## API Route Testing

- Mock Next.js Request/Response objects using the established patterns
- Test all HTTP methods (GET, POST, PUT, DELETE)
- Test error handling and edge cases (missing data, invalid JSON, storage errors)
- Verify correct status codes and response shapes
- Test request validation and sanitization

## Database Testing

- Use the shared test database utilities from `@turn-based-mcp/shared`
- Clean up test data between tests using `clearTestDatabase()`
- Test both success and failure scenarios

## Coverage Requirements

- UI Components: 95%+ coverage
- Game Logic: 100% coverage  
- API Routes: 95%+ coverage
- Utility Functions: 95%+ coverage

## Best Practices

- Use `waitFor` for async operations in components
- Mock console methods when testing error logging
- Test loading states and error boundaries
- Include integration tests for complex workflows
- Verify all game states (playing, finished, error)

## General Principles

- New features require unit tests
- Tests should cover edge cases and error conditions
- Test names should clearly describe what they test
- Use table-driven tests when testing multiple similar scenarios
