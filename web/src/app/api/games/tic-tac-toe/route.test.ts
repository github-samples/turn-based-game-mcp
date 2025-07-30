import { NextRequest } from 'next/server';
import type { GameSession, TicTacToeGameState } from '@turn-based-mcp/shared';

// Mock dependencies BEFORE importing the route - use factory functions for proper setup
jest.mock('@turn-based-mcp/shared', () => {
  const mockGame = {
    getInitialState: jest.fn(),
    validateMove: jest.fn(),
    applyMove: jest.fn(),
    checkGameEnd: jest.fn(),
    getValidMoves: jest.fn()
  };
  
  return {
    ...jest.requireActual('@turn-based-mcp/shared'),
    TicTacToeGame: jest.fn(() => mockGame),
    __mockGameInstance: mockGame
  };
});

jest.mock('../../../../lib/game-storage');

// Import the mocked classes
import { TicTacToeGame } from '@turn-based-mcp/shared';
import * as gameStorage from '../../../../lib/game-storage';

// Now import the route AFTER the mocks are set up
import { GET, POST } from './route';

const mockGameStorage = gameStorage as jest.Mocked<typeof gameStorage>;

// Get access to the mock game instance from the mocked module
const mockGame = (TicTacToeGame as jest.MockedClass<typeof TicTacToeGame>).mock.results[0]?.value || {
  getInitialState: jest.fn(),
  validateMove: jest.fn(),
  applyMove: jest.fn(),
  checkGameEnd: jest.fn(),
  getValidMoves: jest.fn()
};

describe('/api/games/tic-tac-toe', () => {
  // Create the mock game state at module level
  const mockGameState: TicTacToeGameState = {
    id: 'test-game-1',
    players: [
      { id: 'player1' as const, name: 'Player', isAI: false },
      { id: 'ai' as const, name: 'AI', isAI: true }
    ],
    currentPlayerId: 'player1' as const,
    status: 'playing' as const,
    createdAt: new Date('2024-01-01T10:00:00Z'),
    updatedAt: new Date('2024-01-01T10:00:00Z'),
    board: [
      [null, null, null],
      [null, null, null],
      [null, null, null]
    ],
    playerSymbols: {
      player1: 'X' as const,
      ai: 'O' as const
    }
  };

  const mockGameSession: GameSession<TicTacToeGameState> = {
    gameState: mockGameState,
    gameType: 'tic-tac-toe' as const,
    history: []
  };

  beforeEach(() => {
    // Don't clear all mocks as it clears the return values
    // Instead, just reset the call history
    mockGame.getInitialState.mockClear();
    mockGame.validateMove.mockClear();
    mockGame.applyMove.mockClear();
    mockGame.checkGameEnd.mockClear();
    mockGame.getValidMoves.mockClear();
    
    // Reset mock implementations with defaults
    mockGame.getInitialState.mockReturnValue(mockGameState);
    mockGame.validateMove.mockReturnValue(true);
    mockGame.applyMove.mockReturnValue(mockGameState);
    mockGame.checkGameEnd.mockReturnValue(null);
    mockGame.getValidMoves.mockReturnValue([]);
  });

  describe('POST', () => {
    it('should create a new game with provided player name', async () => {
      mockGameStorage.setTicTacToeGame.mockResolvedValue();

      const request = new NextRequest('http://localhost:3000/api/games/tic-tac-toe', {
        method: 'POST',
        body: JSON.stringify({ playerName: 'TestPlayer' })
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(mockGame.getInitialState).toHaveBeenCalledWith([
        { id: 'player1', name: 'TestPlayer', isAI: false },
        { id: 'ai', name: 'AI', isAI: true }
      ]);
      expect(mockGameStorage.setTicTacToeGame).toHaveBeenCalledWith(
        mockGameState.id,
        expect.objectContaining({
          gameState: mockGameState,
          gameType: 'tic-tac-toe',
          history: []
        })
      );
      expect(responseData).toEqual(expect.objectContaining({
        gameState: mockGameState,
        gameType: 'tic-tac-toe',
        history: []
      }));
    });

    it('should create a new game with default player name when not provided', async () => {
      mockGameStorage.setTicTacToeGame.mockResolvedValue();

      const request = new NextRequest('http://localhost:3000/api/games/tic-tac-toe', {
        method: 'POST',
        body: JSON.stringify({})
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(mockGame.getInitialState).toHaveBeenCalledWith([
        { id: 'player1', name: 'Player', isAI: false },
        { id: 'ai', name: 'AI', isAI: true }
      ]);
    });

    it('should handle empty request body', async () => {
      mockGameStorage.setTicTacToeGame.mockResolvedValue();

      const request = new NextRequest('http://localhost:3000/api/games/tic-tac-toe', {
        method: 'POST',
        body: ''
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(mockGame.getInitialState).toHaveBeenCalledWith([
        { id: 'player1', name: 'Player', isAI: false },
        { id: 'ai', name: 'AI', isAI: true }
      ]);
    });

    it('should handle storage errors', async () => {
      const storageError = new Error('Storage failed');
      mockGameStorage.setTicTacToeGame.mockRejectedValue(storageError);
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const request = new NextRequest('http://localhost:3000/api/games/tic-tac-toe', {
        method: 'POST',
        body: JSON.stringify({ playerName: 'TestPlayer' })
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData).toEqual({ error: 'Failed to create game' });
      expect(consoleSpy).toHaveBeenCalledWith('Error creating game:', storageError);
      
      consoleSpy.mockRestore();
    });

    it('should handle JSON parsing errors', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const request = new NextRequest('http://localhost:3000/api/games/tic-tac-toe', {
        method: 'POST',
        body: 'invalid-json'
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData).toEqual({ error: 'Failed to create game' });
      expect(consoleSpy).toHaveBeenCalledWith('Error creating game:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });
  });

  describe('GET', () => {
    it('should return all tic-tac-toe games', async () => {
      const mockGames = [mockGameSession];
      mockGameStorage.getAllTicTacToeGames.mockResolvedValue(mockGames);

      const response = await GET();
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(mockGameStorage.getAllTicTacToeGames).toHaveBeenCalled();
      expect(responseData).toEqual(mockGames);
    });

    it('should return empty array when no games exist', async () => {
      mockGameStorage.getAllTicTacToeGames.mockResolvedValue([]);

      const response = await GET();
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData).toEqual([]);
    });

    it('should handle storage errors during GET', async () => {
      const storageError = new Error('Database connection failed');
      mockGameStorage.getAllTicTacToeGames.mockRejectedValue(storageError);

      // The current implementation doesn't handle errors, so it will throw
      await expect(GET()).rejects.toThrow('Database connection failed');
    });
  });
});
