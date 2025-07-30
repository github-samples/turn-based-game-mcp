import * as mcpApiClient from './mcp-api-client';
import type { GameSession, Player } from '../types/game';
import type { TicTacToeGameState, RPSGameState } from '../types/games';

// Mock fetch globally
const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>;
global.fetch = mockFetch;

describe('MCP API Client', () => {
  const originalEnv = process.env;
  const mockResponse = (data: any, ok = true, status = 200) => ({
    ok,
    status,
    statusText: ok ? 'OK' : 'Error',
    json: jest.fn().mockResolvedValue(data)
  } as any);

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset environment variables
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('getTicTacToeGameForMCP', () => {
    const mockTicTacToeGame: GameSession<TicTacToeGameState> = {
      gameState: {
        id: 'test-game-1',
        players: [
          { id: 'player1', name: 'Player', isAI: false },
          { id: 'ai', name: 'AI', isAI: true }
        ],
        currentPlayerId: 'player1',
        status: 'playing',
        createdAt: new Date('2024-01-01T10:00:00Z'),
        updatedAt: new Date('2024-01-01T10:05:00Z'),
        board: [
          [null, null, null],
          [null, null, null],
          [null, null, null]
        ],
        playerSymbols: {
          player1: 'X',
          ai: 'O'
        }
      },
      gameType: 'tic-tac-toe',
      history: []
    };

    it('should fetch game successfully with default base URL', async () => {
      const mockGames = [mockTicTacToeGame];
      mockFetch.mockResolvedValue(mockResponse(mockGames));

      const result = await mcpApiClient.getTicTacToeGameForMCP('test-game-1');

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3000/api/games/tic-tac-toe');
      expect(result).toEqual(mockTicTacToeGame);
    });

    it('should use custom base URL from environment', async () => {
      // Need to delete the module from cache since environment variable is read at module load time
      jest.resetModules();
      
      process.env.WEB_API_BASE = 'http://custom-host:8080';
      
      // Re-import the module with the new environment variable
      const mcpApiClientWithCustomBase = await import('./mcp-api-client');
      
      const mockGames = [mockTicTacToeGame];
      mockFetch.mockResolvedValue(mockResponse(mockGames));

      await mcpApiClientWithCustomBase.getTicTacToeGameForMCP('test-game-1');

      expect(mockFetch).toHaveBeenCalledWith('http://custom-host:8080/api/games/tic-tac-toe');
    });

    it('should return undefined when game not found', async () => {
      const mockGames = [mockTicTacToeGame];
      mockFetch.mockResolvedValue(mockResponse(mockGames));

      const result = await mcpApiClient.getTicTacToeGameForMCP('non-existent');

      expect(result).toBeUndefined();
    });

    it('should handle fetch errors gracefully', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = await mcpApiClient.getTicTacToeGameForMCP('test-game-1');

      expect(result).toBeUndefined();
      expect(consoleSpy).toHaveBeenCalledWith('Error fetching tic-tac-toe game via API:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });

    it('should handle HTTP errors gracefully', async () => {
      mockFetch.mockResolvedValue(mockResponse({}, false, 404));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = await mcpApiClient.getTicTacToeGameForMCP('test-game-1');

      expect(result).toBeUndefined();
      expect(consoleSpy).toHaveBeenCalledWith('Error fetching tic-tac-toe game via API:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });
  });

  describe('createTicTacToeGameForMCP', () => {
    const mockPlayers: Player[] = [
      { id: 'player1', name: 'TestPlayer', isAI: false },
      { id: 'ai', name: 'AI', isAI: true }
    ];

    const mockCreatedGame: GameSession<TicTacToeGameState> = {
      gameState: {
        id: 'new-game-1',
        players: mockPlayers,
        currentPlayerId: 'player1',
        status: 'playing',
        createdAt: new Date('2024-01-01T10:00:00Z'),
        updatedAt: new Date('2024-01-01T10:00:00Z'),
        board: [
          [null, null, null],
          [null, null, null],
          [null, null, null]
        ],
        playerSymbols: {
          player1: 'X',
          ai: 'O'
        }
      },
      gameType: 'tic-tac-toe',
      history: []
    };

    it('should create game successfully with player name', async () => {
      mockFetch.mockResolvedValue(mockResponse(mockCreatedGame));

      const result = await mcpApiClient.createTicTacToeGameForMCP(mockPlayers);

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3000/api/games/tic-tac-toe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerName: 'TestPlayer' })
      });
      expect(result).toEqual(mockCreatedGame);
    });

    it('should use default player name when no human player found', async () => {
      const aiOnlyPlayers = [{ id: 'ai1', name: 'AI 1', isAI: true }];
      mockFetch.mockResolvedValue(mockResponse(mockCreatedGame));

      await mcpApiClient.createTicTacToeGameForMCP(aiOnlyPlayers);

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3000/api/games/tic-tac-toe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerName: 'Player' })
      });
    });

    it('should handle HTTP errors and throw', async () => {
      mockFetch.mockResolvedValue(mockResponse({}, false, 500));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await expect(mcpApiClient.createTicTacToeGameForMCP(mockPlayers)).rejects.toThrow();
      expect(consoleSpy).toHaveBeenCalledWith('Error creating tic-tac-toe game via API:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });

    it('should handle network errors and throw', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await expect(mcpApiClient.createTicTacToeGameForMCP(mockPlayers)).rejects.toThrow();
      expect(consoleSpy).toHaveBeenCalledWith('Error creating tic-tac-toe game via API:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });
  });

  describe('makeTicTacToeMove', () => {
    const mockMove = { row: 0, col: 0 };
    const mockUpdatedGame: GameSession<TicTacToeGameState> = {
      gameState: {
        id: 'test-game-1',
        players: [
          { id: 'player1', name: 'Player', isAI: false },
          { id: 'ai', name: 'AI', isAI: true }
        ],
        currentPlayerId: 'ai',
        status: 'playing',
        createdAt: new Date('2024-01-01T10:00:00Z'),
        updatedAt: new Date('2024-01-01T10:05:00Z'),
        board: [
          ['X', null, null],
          [null, null, null],
          [null, null, null]
        ],
        playerSymbols: {
          player1: 'X',
          ai: 'O'
        }
      },
      gameType: 'tic-tac-toe',
      history: [{ playerId: 'player1', move: mockMove, timestamp: new Date() }]
    };

    it('should make move successfully', async () => {
      mockFetch.mockResolvedValue(mockResponse(mockUpdatedGame));

      const result = await mcpApiClient.makeTicTacToeMove('test-game-1', mockMove, 'player1');

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3000/api/games/tic-tac-toe/test-game-1/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ move: mockMove, playerId: 'player1' })
      });
      expect(result).toEqual(mockUpdatedGame);
    });

    it('should handle HTTP errors and throw', async () => {
      mockFetch.mockResolvedValue(mockResponse({}, false, 400));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await expect(mcpApiClient.makeTicTacToeMove('test-game-1', mockMove, 'player1')).rejects.toThrow();
      expect(consoleSpy).toHaveBeenCalledWith('Error making tic-tac-toe move via API:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });
  });

  describe('getRPSGameForMCP', () => {
    const mockRPSGame: GameSession<RPSGameState> = {
      gameState: {
        id: 'test-rps-1',
        players: [
          { id: 'player1', name: 'Player', isAI: false },
          { id: 'ai', name: 'AI', isAI: true }
        ],
        currentPlayerId: 'player1',
        status: 'playing',
        createdAt: new Date('2024-01-01T10:00:00Z'),
        updatedAt: new Date('2024-01-01T10:05:00Z'),
        rounds: [],
        currentRound: 0,
        scores: { player1: 0, ai: 0 },
        maxRounds: 3
      },
      gameType: 'rock-paper-scissors',
      history: []
    };

    it('should fetch RPS game successfully', async () => {
      const mockGames = [mockRPSGame];
      mockFetch.mockResolvedValue(mockResponse(mockGames));

      const result = await mcpApiClient.getRPSGameForMCP('test-rps-1');

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3000/api/games/rock-paper-scissors/mcp');
      expect(result).toEqual(mockRPSGame);
    });

    it('should return undefined when RPS game not found', async () => {
      mockFetch.mockResolvedValue(mockResponse([]));

      const result = await mcpApiClient.getRPSGameForMCP('non-existent');

      expect(result).toBeUndefined();
    });

    it('should handle errors gracefully', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = await mcpApiClient.getRPSGameForMCP('test-rps-1');

      expect(result).toBeUndefined();
      expect(consoleSpy).toHaveBeenCalledWith('Error fetching RPS game via API:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });
  });

  describe('makeRPSMove', () => {
    const mockMove = 'rock';
    const mockUpdatedRPSGame: GameSession<RPSGameState> = {
      gameState: {
        id: 'test-rps-1',
        players: [
          { id: 'player1', name: 'Player', isAI: false },
          { id: 'ai', name: 'AI', isAI: true }
        ],
        currentPlayerId: 'ai',
        status: 'playing',
        createdAt: new Date('2024-01-01T10:00:00Z'),
        updatedAt: new Date('2024-01-01T10:05:00Z'),
        rounds: [{ player1Choice: 'rock', player2Choice: undefined }],
        currentRound: 0,
        scores: { player1: 0, ai: 0 },
        maxRounds: 3
      },
      gameType: 'rock-paper-scissors',
      history: [{ playerId: 'player1', move: mockMove, timestamp: new Date() }]
    };

    it('should make RPS move successfully', async () => {
      mockFetch.mockResolvedValue(mockResponse(mockUpdatedRPSGame));

      const result = await mcpApiClient.makeRPSMove('test-rps-1', mockMove, 'player1');

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3000/api/games/rock-paper-scissors/test-rps-1/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ move: mockMove, playerId: 'player1' })
      });
      expect(result).toEqual(mockUpdatedRPSGame);
    });

    it('should handle move errors and throw', async () => {
      mockFetch.mockResolvedValue(mockResponse({}, false, 400));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await expect(mcpApiClient.makeRPSMove('test-rps-1', mockMove, 'player1')).rejects.toThrow();
      expect(consoleSpy).toHaveBeenCalledWith('Error making RPS move via API:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });
  });
});
