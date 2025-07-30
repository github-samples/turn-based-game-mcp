# Turn-Based Games Web App and MCP Server

This app is intended as a demo to showcase an example of MCP visually. It is not intended to be a production-ready application, but a learning tool for developers interested in building with the Model Context Protocol (MCP). 

It is a modern turn-based games platform featuring a Next.js 15 frontend (and API), as well as an MCP (Model Context Protocol) server that can interact with the API and act as an AI opponent.

## Features

- **Next.js Web Application**: Modern, responsive UI built with TailwindCSS 4
- **MCP Server**: AI opponent powered by Model Context Protocol
- **Shared Logic**: Common game logic and types across all packages
- **Multiple Games**: Tic-Tac-Toe and Rock Paper Scissors (extensible for more)
- **AI Difficulty Levels**: Easy, Medium, and Hard AI opponents
- **Real-time Gameplay**: Smooth, interactive game experience
- **Comprehensive Testing**: Hundreds of test cases across all workspaces with high coverage on core logic
- **Professional Documentation**: Full TSDoc documentation and testing guidelines
- **Component Architecture**: Reusable UI patterns and shared components

## Project Structure

```
turn-based-mcp/
├── shared/                       # Shared types, utilities, and game logic
├── web/                         # Next.js frontend application  
│   ├── src/components/
│   │   ├── games/              # Game-specific components
│   │   ├── ui/                 # Reusable UI components
│   │   └── shared/             # MCP and game-related shared components
│   └── src/app/
│       ├── api/games/          # API routes for game management
│       └── games/              # Game-specific pages
├── mcp-server/                  # MCP server for AI opponent
├── docs/                        # Documentation and guidelines  
├── package.json                 # Root package.json with workspaces
└── README.md
```

## Games

### Tic-Tac-Toe
- Classic 3x3 grid game
- AI difficulty levels: Easy (random), Medium (strategic), Hard (minimax)
- Real-time move validation and game state updates

### Rock Paper Scissors
- Best of 3 rounds format
- AI strategies: Random, Adaptive (learns from patterns), Pattern-based
- Score tracking and round history

## API Endpoints

### Tic-Tac-Toe
- `GET /api/games/tic-tac-toe` - List all games
- `POST /api/games/tic-tac-toe` - Create new game
- `POST /api/games/tic-tac-toe/[id]/move` - Make a move
- `GET /api/games/tic-tac-toe/mcp` - MCP integration endpoint (sanitized data)

### Rock Paper Scissors
- `GET /api/games/rock-paper-scissors` - List all games
- `POST /api/games/rock-paper-scissors` - Create new game  
- `POST /api/games/rock-paper-scissors/[id]/move` - Make a move
- `GET /api/games/rock-paper-scissors/mcp` - MCP integration endpoint (sanitized data)

## MCP Tools

### Available Tools
- `create_tic_tac_toe_game` - Create new Tic-Tac-Toe game
- `play_tic_tac_toe` - Make AI move in Tic-Tac-Toe
- `create_rock_paper_scissors_game` - Create new Rock Paper Scissors game
- `play_rock_paper_scissors` - Make AI choice in Rock Paper Scissors
- `wait_for_player_move` - Wait for human player to make their move
- `analyze_game` - Analyze current game state and provide insights

### MCP Configuration

The project includes VS Code MCP configuration in `.vscode/mcp.json`:

```json
{
  "servers": {
    "turn-based-games": {
      "command": "node",
      "args": ["dist/index.js"],
      "cwd": "./mcp-server"
    }
  }
}
```

To use the MCP server, ensure it's built first:
```bash
npm run build --workspace=mcp-server
```

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or pnpm

### Installation

1. Clone the repository and install dependencies:
```bash
npm install
```

2. Build the shared package (required first):
```bash
npm run build --workspace=shared
```

> **Important**: The shared package must be built before other packages can be developed or built, as both web and mcp-server depend on it.

3. Start the development servers:

**Frontend (Next.js):**
```bash
npm run dev --workspace=web
```

**MCP Server:**
```bash
npm run dev --workspace=mcp-server
```

### Development

- **Frontend**: Visit `http://localhost:3000` to access the web application
- **MCP Server**: The server runs on stdio and can be integrated with MCP-compatible clients

## Development Workflow

### Adding New Games
1. **Implement game logic** in `shared/src/games/`
2. **Create UI components** in `web/src/components/games/`
3. **Add game page** in `web/src/app/games/[game-type]/`
4. **Add API routes** in `web/src/app/api/games/[game-type]/`
5. **Implement AI** in `mcp-server/src/ai/`
6. **Add MCP tools** in `mcp-server/src/server.ts`
7. **Write comprehensive tests** for all components
8. **Update documentation** with new game details

### Code Quality Standards
- **TypeScript Strict Mode**: Full compliance across all workspaces
- **ESLint Rules**: Consistent code style and best practices
- **Test Coverage**: Target 90% for shared logic, 80% for web components
- **Documentation**: TSDoc comments for all public APIs

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes in the appropriate package
4. Ensure all packages build successfully and tests pass
5. Write tests for new functionality
6. Update documentation as needed
7. Submit a pull request

### Development Setup
```bash
# Install dependencies
npm install

# Build shared package first (required)
npm run build --workspace=shared

# Start development servers
npm run dev --workspace=web       # Web app on :3000
npm run dev --workspace=mcp-server # MCP server (stdio)
```

### Alternative Commands
```bash
# Root-level shortcuts
npm run dev        # Runs web dev server
npm run dev:mcp    # Runs MCP server
npm run build      # Builds all packages
npm run test       # Runs all tests
```

## License

MIT License. See [LICENSE](LICENSE) for details.
