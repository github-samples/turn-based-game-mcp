---
applyTo: "**/*.test.{ts,tsx,js,jsx}"
description: Testing guidelines and patterns for the turn-based games platform
---

# Testing Instructions

Follow these testing patterns for the turn-based games platform:

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
