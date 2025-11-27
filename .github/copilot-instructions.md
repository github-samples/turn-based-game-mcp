# Turn-Based Games Platform

## Purpose

These instructions guide Copilot across all files in this monorepo. Language-specific and framework-specific rules are in separate instruction files under `.github/instructions/`.

## Repository Structure

- `shared/` - Core game logic, types, and SQLite storage (TypeScript library)
- `web/` - Next.js 15 frontend with API routes (React + TailwindCSS)
- `mcp-server/` - Model Context Protocol server providing AI opponents (Node.js service)

## Code Standards

### Required Before Each Commit

- Run `npm run lint` to check for linting issues
- Run `npm run test` to ensure all tests pass
- Build shared package first when making cross-package changes

### Development Flow

- Build shared: `npm run build --workspace=shared` (always run first)
- Dev web: `npm run dev --workspace=web` (starts Next.js on port 3000)
- Dev MCP: `npm run dev --workspace=mcp-server` (starts MCP server via stdio)
- Full test: `npm run test` (runs all workspace tests)
- Full lint: `npm run lint` (runs all workspace linting)

### Database

- SQLite file location: `web/games.db` (default)
- Controlled by `GAMES_DB_PATH` environment variable

## Architecture Guidelines

### Service Boundaries

- MCP server communicates with web app via HTTP calls to `/api/games/*` endpoints
- MCP server never accesses the database directly
- Web app uses direct SQLite access via `shared/src/storage/sqlite-storage.ts`

### Game Interface

All games implement `Game<TGameState, TMove>` interface in `shared/src/types/game.ts`:

```typescript
// Required methods for all game implementations
validateMove(state, move)   // Check if move is legal
applyMove(state, move)      // Apply move and return new state
checkGameEnd(state)         // Determine win/draw/continue
getValidMoves(state)        // Get available moves
getInitialState(config)     // Create starting game state
```

### API Routes Pattern

- Create/list games: `web/src/app/api/games/[game-type]/route.ts`
- Make moves: `web/src/app/api/games/[game-type]/[id]/move/route.ts`

## Adding New Games

1. Define types in `shared/src/types/games.ts`
2. Implement game class in `shared/src/games/`
3. Add API routes in `web/src/app/api/games/[new-game]/`
4. Create AI implementation in `mcp-server/src/ai/`
5. Add MCP tools in `mcp-server/src/server.ts`
6. Build UI components in `web/src/components/games/`

## Environment Variables

- `WEB_API_BASE` - MCP server's web app URL (default: `http://localhost:3000`)
- `GAMES_DB_PATH` - SQLite database location (default: `./games.db`)

## Security Considerations

- Never hardcode credentials or API keys
- Validate all user inputs in API routes
- Sanitize game IDs and player names before database operations
