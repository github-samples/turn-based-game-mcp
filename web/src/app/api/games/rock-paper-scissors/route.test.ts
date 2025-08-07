import { vi } from 'vitest'
import { NextRequest } from 'next/server';
import type { GameSession, RPSGameState } from '@turn-based-mcp/shared';
import { createRPSTestState } from '../../../../test-utils/common-test-data';

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
  RockPaperScissorsGame: vi.fn().mockImplementation(() => mockGame)
}));

vi.mock('../../../../lib/game-storage', () => ({
  getRPSGame: vi.fn(),
  setRPSGame: vi.fn(),
  getAllRPSGames: vi.fn()
}));

// Import the mocked classes
import { RockPaperScissorsGame } from '@turn-based-mcp/shared';
import * as gameStorage from '../../../../lib/game-storage';

// Now import the route AFTER the mocks are set up
import { GET, POST } from './route';

const mockGameStorage = vi.mocked(gameStorage);

describe('/api/games/rock-paper-scissors', () => {
  // Use shared test data factory to reduce duplication
  let mockGameState: RPSGameState;
  let mockGameSession: GameSession<RPSGameState>;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Create fresh test data for each test using shared factory
    mockGameState = createRPSTestState();
    mockGameSession = {
      gameState: mockGameState,
      gameType: 'rock-paper-scissors' as const,
      history: []
    };
    
    // Set up the mock to return the fresh state
    mockGame.getInitialState.mockReturnValue(mockGameState);
  });

  describe('POST', () => {
    it('should create a new RPS game with provided player name', async () => {
      mockGameStorage.setRPSGame.mockResolvedValue();

      const request = new NextRequest('http://localhost:3000/api/games/rock-paper-scissors', {
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
      expect(mockGameStorage.setRPSGame).toHaveBeenCalledWith(
        mockGameState.id,
        expect.objectContaining({
          gameState: mockGameState,
          gameType: 'rock-paper-scissors',
          history: []
        })
      );
      expect(responseData).toEqual(expect.objectContaining({
        gameState: mockGameState,
        gameType: 'rock-paper-scissors',
        history: []
      }));
    });

    it('should create a new RPS game with default player name when not provided', async () => {
      mockGameStorage.setRPSGame.mockResolvedValue();

      const request = new NextRequest('http://localhost:3000/api/games/rock-paper-scissors', {
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
      mockGameStorage.setRPSGame.mockResolvedValue();

      const request = new NextRequest('http://localhost:3000/api/games/rock-paper-scissors', {
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
      mockGameStorage.setRPSGame.mockRejectedValue(storageError);
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const request = new NextRequest('http://localhost:3000/api/games/rock-paper-scissors', {
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
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const request = new NextRequest('http://localhost:3000/api/games/rock-paper-scissors', {
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
    it('should return all RPS games', async () => {
      const mockGames = [mockGameSession];
      mockGameStorage.getAllRPSGames.mockResolvedValue(mockGames);

      const response = await GET();
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(mockGameStorage.getAllRPSGames).toHaveBeenCalled();
      expect(responseData).toEqual(mockGames);
    });

    it('should return empty array when no games exist', async () => {
      mockGameStorage.getAllRPSGames.mockResolvedValue([]);

      const response = await GET();
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData).toEqual([]);
    });

    it('should handle storage errors during GET', async () => {
      const storageError = new Error('Database connection failed');
      mockGameStorage.getAllRPSGames.mockRejectedValue(storageError);

      // The current implementation doesn't handle errors, so it will throw
      await expect(GET()).rejects.toThrow('Database connection failed');
    });
  });
});
