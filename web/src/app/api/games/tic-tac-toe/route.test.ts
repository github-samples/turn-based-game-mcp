import { vi } from 'vitest'
import { NextRequest } from 'next/server';
import type { GameSession, TicTacToeGameState } from '@turn-based-mcp/shared';
import { createTicTacToeTestState } from '../../../../test-utils/common-test-data';

// Use vi.hoisted() to ensure the mock object is available during hoisting
const mockGame = vi.hoisted(() => ({
  getInitialState: vi.fn(),
  validateMove: vi.fn(),
  applyMove: vi.fn(),
  checkGameEnd: vi.fn(),
  getValidMoves: vi.fn()
}));

// Mock dependencies BEFORE importing the route
vi.mock('@turn-based-mcp/shared', () => ({
  ...vi.importActual('@turn-based-mcp/shared'),
  TicTacToeGame: vi.fn().mockImplementation(() => mockGame)
}));

vi.mock('../../../../lib/game-storage', () => ({
  getTicTacToeGame: vi.fn(),
  setTicTacToeGame: vi.fn(),
  getAllTicTacToeGames: vi.fn()
}));

// Import the mocked classes
import { TicTacToeGame } from '@turn-based-mcp/shared';
import * as gameStorage from '../../../../lib/game-storage';

// Now import the route AFTER the mocks are set up
import { GET, POST } from './route';

const mockGameStorage = vi.mocked(gameStorage);

describe('/api/games/tic-tac-toe', () => {
  // Use shared test data factory to reduce duplication
  const mockGameState = createTicTacToeTestState();

  const mockGameSession: GameSession<TicTacToeGameState> = {
    gameState: mockGameState,
    gameType: 'tic-tac-toe' as const,
    history: []
  };

  beforeEach(() => {
    // Reset mock implementations and call history
    mockGame.getInitialState.mockClear();
    mockGame.validateMove.mockClear();
    mockGame.applyMove.mockClear();
    mockGame.checkGameEnd.mockClear();
    mockGame.getValidMoves.mockClear();
    
    // Reset storage mocks
    mockGameStorage.getTicTacToeGame.mockClear();
    mockGameStorage.setTicTacToeGame.mockClear();
    mockGameStorage.getAllTicTacToeGames.mockClear();
    
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
      ], { firstPlayerId: 'player1' });
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
      ], { firstPlayerId: 'player1' });
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
      ], { firstPlayerId: 'player1' });
    });

    it('should handle storage errors', async () => {
      const storageError = new Error('Storage failed');
      mockGameStorage.setTicTacToeGame.mockRejectedValue(storageError);

      const request = new NextRequest('http://localhost:3000/api/games/tic-tac-toe', {
        method: 'POST',
        body: JSON.stringify({ playerName: 'TestPlayer' })
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData).toEqual({ error: 'Failed to create game' });
    });

    it('should handle JSON parsing errors', async () => {
      const request = new NextRequest('http://localhost:3000/api/games/tic-tac-toe', {
        method: 'POST',
        body: 'invalid-json'
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData).toEqual({ error: 'Failed to create game' });
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
