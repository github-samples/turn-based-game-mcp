# Turn-Based Games Platform - AI Developer Guide

## Architecture Overview

This is a **monorepo workspace** with three packages that work together to create a turn-based games platform:

- **`shared/`** - Core game logic, types, and SQLite storage (TypeScript library)
- **`web/`** - Next.js 15 frontend with API routes (React + TailwindCSS)  
- **`mcp-server/`** - Model Context Protocol server providing AI opponents (Node.js service)

**Key Integration Pattern**: The MCP server communicates with the web app via HTTP calls to `/api/games/*` endpoints, not direct database access. This maintains clear service boundaries.

## Development Workflow

**Essential build order** (shared must be built first):
```bash
npm run build --workspace=shared  # Always run first
npm run dev --workspace=web       # Starts Next.js dev server (port 3000)
npm run dev --workspace=mcp-server # Starts MCP server (stdio)
```

**Database location**: SQLite file is at `web/games.db` by default, controlled by `GAMES_DB_PATH` env var.

## Core Architecture Patterns

### Game Implementation Pattern
All games follow the `Game<TGameState, TMove>` interface in `shared/src/types/game.ts`:
- `validateMove()` - Check if move is legal
- `applyMove()` - Apply move and return new state  
- `checkGameEnd()` - Determine win/draw/continue
- `getValidMoves()` - Get available moves
- `getInitialState()` - Create starting game state

### Storage Pattern
Games use a dual-storage approach:
- **Web app**: Direct SQLite access via `shared/src/storage/sqlite-storage.ts`
- **MCP server**: HTTP calls to web API endpoints (no direct DB access)

### AI Integration Pattern
The MCP server exposes tools like `play_tic_tac_toe` and `create_tic_tac_toe_game`. It calls the web API to:
1. Fetch current game state
2. Calculate AI move using algorithms in `mcp-server/src/ai/`
3. Submit move back via API POST

## File Organization Conventions

### API Routes Structure
- `web/src/app/api/games/[game-type]/route.ts` - Create/list games
- `web/src/app/api/games/[game-type]/[id]/move/route.ts` - Make moves

### Game-Specific Types
Game states extend `BaseGameState` and are defined in `shared/src/types/games.ts`:
- `TicTacToeGameState` includes `board: Board` and `playerSymbols`
- `RPSGameState` includes `rounds` and `scores`

### Component Organization
- `web/src/components/games/` - Game-specific UI components
- `web/src/app/games/[game-type]/` - Game-specific pages

## Development Guidelines

### Adding New Games
1. Define types in `shared/src/types/games.ts`
2. Implement game class in `shared/src/games/`
3. Add API routes in `web/src/app/api/games/[new-game]/`
4. Create AI implementation in `mcp-server/src/ai/`
5. Add MCP tools in `mcp-server/src/server.ts`
6. Build UI components in `web/src/components/games/`

### Environment Variables
- `WEB_API_BASE` - MCP server's web app URL (default: `http://localhost:3000`)
- `GAMES_DB_PATH` - SQLite database location (default: `./games.db`)

### Key Dependencies
- `@modelcontextprotocol/sdk` - MCP server framework
- `sqlite3` - Database (shared between web/mcp-server)
- `@turn-based-mcp/shared` - Internal workspace dependency
