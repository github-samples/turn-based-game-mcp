---
applyTo: "**/*.{ts,tsx}"
description: TypeScript development patterns and best practices for the turn-based games platform
---

# TypeScript Development

## Purpose

TypeScript patterns for type-safe code. Covers type definitions, generics, error handling, and module organization.


## Type Definitions

### Import/Export Patterns
- Import types with `import type` for type-only imports
- Export types separately from implementations
- Use barrel exports (`index.ts`) for clean imports
- Re-export shared types from `@turn-based-mcp/shared`

### Shared Types and Constants
**Always import types derived from shared constants - don't duplicate union types:**

```typescript
// ✅ Import types derived from constants
import type { Difficulty, GameType, PlayerId } from '@turn-based-mcp/shared'
import { DIFFICULTIES, DEFAULT_AI_DIFFICULTY, GAME_TYPES, PLAYER_IDS } from '@turn-based-mcp/shared'

// ✅ Use the imported types
const [aiDifficulty, setAiDifficulty] = useState<Difficulty>('medium')
const playerIds: PlayerId[] = Object.values(PLAYER_IDS)

// ❌ Don't define duplicate union types
type Difficulty = 'easy' | 'medium' | 'hard'  // This duplicates shared constants!
type PlayerId = 'player1' | 'player2' | 'ai'  // Use the derived type instead!
```

**Key principle: Types are derived from constants using `as const` assertions:**
```typescript
// In shared/src/constants/game-constants.ts
export const DIFFICULTIES = ['easy', 'medium', 'hard'] as const
export type Difficulty = typeof DIFFICULTIES[number]  // 'easy' | 'medium' | 'hard'
```

**Common types available from shared package:**
- `Difficulty` - AI difficulty levels (derived from `DIFFICULTIES`) 
- `GameType` - Supported game types (derived from `GAME_TYPES`)
- `PlayerId` - Player identifiers (derived from `PLAYER_IDS`)
- `GameStatus` - Game state values (derived from `GAME_STATUSES`)
- Game-specific interfaces: `TicTacToeGameState`, `RPSGameState`, etc.

### Interface Design
- Use interfaces for object shapes and component props
- Include JSDoc comments for complex properties
- Make optional properties explicit with `?`
- Use union types for enums and variants

```typescript
interface GameControlsProps {
  /** Loading state indicator */
  isLoading?: boolean
  /** Game reset callback */
  onReset?: () => void
  /** Control visibility flags */
  showReset?: boolean
  /** Additional CSS classes */
  className?: string
}
```

## Generic Patterns

### Game State Generics
Use consistent generic patterns for game states:

```typescript
interface GameSession<TGameState extends BaseGameState> {
  gameState: TGameState
  gameType: GameType
  history: GameMove<any>[]
  aiDifficulty?: AIDifficulty
}
```

### Component Generics
Use generics for reusable components:

```typescript
interface SelectProps<T> {
  options: T[]
  value: T
  onChange: (value: T) => void
  getLabel: (option: T) => string
}
```

## Utility Types

### Common Patterns
- Use `Partial<T>` for optional overrides in factory functions
- Use `Pick<T, K>` and `Omit<T, K>` for type transformations
- Use `keyof T` for property key constraints
- Use `typeof` for inferring types from implementations

### Function Types
```typescript
// Event handlers
type EventHandler<T = Event> = (event: T) => void

// Async operations
type AsyncOperation<T> = () => Promise<T>

// Factory functions
type MockFactory<T> = (overrides?: Partial<T>) => T
```

## Error Handling

### Error Types
Define specific error types for better error handling:

```typescript
interface GameError {
  type: 'validation' | 'storage' | 'network'
  message: string
  gameId?: string
}

type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E }
```

### Async Error Patterns
```typescript
async function makeMove(gameId: string, move: Move): Promise<Result<GameState>> {
  try {
    const result = await apiCall()
    return { success: true, data: result }
  } catch (error) {
    return { success: false, error: error as Error }
  }
}
```

## Type Guards and Validation

### Runtime Type Checking
```typescript
function isGameState(obj: unknown): obj is GameState {
  return typeof obj === 'object' && 
         obj !== null && 
         'id' in obj && 
         'status' in obj
}

function assertGameType(type: string): asserts type is GameType {
  if (!['tic-tac-toe', 'rock-paper-scissors'].includes(type)) {
    throw new Error(`Invalid game type: ${type}`)
  }
}
```

## Module Organization

### File Structure
```typescript
// types.ts - Type definitions only
export interface GameState { ... }
export type GameType = 'tic-tac-toe' | 'rock-paper-scissors'

// implementation.ts - Implementation with types
import type { GameState, GameType } from './types'
export class Game { ... }

// index.ts - Barrel exports
export type * from './types'
export * from './implementation'
```

### Dependency Patterns
- Keep type dependencies minimal
- Use `import type` to avoid circular dependencies
- Structure modules to minimize coupling
- Use dependency injection for testability

## Strict TypeScript Configuration

### Required Compiler Options
- `strict: true` - Enable all strict checks
- `noUncheckedIndexedAccess: true` - Prevent undefined array access
- `exactOptionalPropertyTypes: true` - Strict optional properties
- `noImplicitReturns: true` - Require explicit returns

### Code Quality
- Use `const assertions` for immutable data: `as const`
- Avoid `any` type - use `unknown` for dynamic content
- Use branded types for IDs: `type GameId = string & { __brand: 'GameId' }`
- Prefer readonly arrays and objects when appropriate

## Testing Types

### Mock Types
```typescript
// Create mock types that extend real interfaces
interface MockGameState extends GameState {
  _isMock: true
}

// Use utility types for test data
type TestGameProps = Required<Pick<GameProps, 'gameState' | 'onMove'>>
```

### Type-Safe Mocks
```typescript
const createMockFunction = <T extends (...args: any[]) => any>(): jest.MockedFunction<T> => 
  jest.fn() as jest.MockedFunction<T>
```

## Performance Considerations

- Use `React.memo` with proper type annotations
- Type component props for optimal re-rendering
- Use `useMemo` and `useCallback` with proper dependencies
- Avoid creating types in render functions
