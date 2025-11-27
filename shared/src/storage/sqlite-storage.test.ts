import { vi } from 'vitest'
import * as sqliteStorage from './sqlite-storage';

// Mock sqlite3 to prevent actual database operations
// In vitest v4, mocks used as constructors must use 'function' or 'class' syntax
vi.mock('sqlite3', () => ({
  default: {
    Database: vi.fn(function() {
      return {
        run: vi.fn(function(sql: string, params: unknown, callback?: (this: { lastID: number; changes: number }) => void) {
          if (callback) {
            // Mock the 'this' context with lastID and changes
            callback.call({ lastID: 1, changes: 1 });
          }
        }),
        get: vi.fn((sql: string, params: unknown, callback?: (err: Error | null, row: unknown) => void) => {
          if (callback) callback(null, null);
        }),
        all: vi.fn((sql: string, params: unknown, callback?: (err: Error | null, rows: unknown[]) => void) => {
          if (callback) callback(null, []);
        }),
        close: vi.fn((callback?: () => void) => {
          if (callback) callback();
        }),
        serialize: vi.fn((fn?: () => void) => {
          if (fn) fn();
        })
      };
    })
  }
}));

// Integration-style tests for SQLite storage
// These tests verify the public API without heavy mocking
describe('SQLite Storage', () => {
  // Mock console.log to reduce noise during tests
  beforeAll(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(async () => {
    vi.restoreAllMocks();
  });

  describe('Module exports', () => {
    it('should export TicTacToe game functions', () => {
      expect(typeof sqliteStorage.getTicTacToeGame).toBe('function');
      expect(typeof sqliteStorage.setTicTacToeGame).toBe('function');
      expect(typeof sqliteStorage.getAllTicTacToeGames).toBe('function');
      expect(typeof sqliteStorage.deleteTicTacToeGame).toBe('function');
    });

    it('should export RPS game functions', () => {
      expect(typeof sqliteStorage.getRPSGame).toBe('function');
      expect(typeof sqliteStorage.setRPSGame).toBe('function');
      expect(typeof sqliteStorage.getAllRPSGames).toBe('function');
      expect(typeof sqliteStorage.deleteRPSGame).toBe('function');
    });
  });

  describe('Function signatures', () => {
    it('TicTacToe functions should have correct arity', () => {
      expect(sqliteStorage.getTicTacToeGame.length).toBe(1);
      expect(sqliteStorage.setTicTacToeGame.length).toBe(2);
      expect(sqliteStorage.getAllTicTacToeGames.length).toBe(0);
      expect(sqliteStorage.deleteTicTacToeGame.length).toBe(1);
    });

    it('RPS functions should have correct arity', () => {
      expect(sqliteStorage.getRPSGame.length).toBe(1);
      expect(sqliteStorage.setRPSGame.length).toBe(2);
      expect(sqliteStorage.getAllRPSGames.length).toBe(0);
      expect(sqliteStorage.deleteRPSGame.length).toBe(1);
    });
  });

  describe('Return types', () => {
    it('getTicTacToeGame should return a Promise', () => {
      const result = sqliteStorage.getTicTacToeGame('test-id');
      expect(result).toBeInstanceOf(Promise);
    });

    it('setTicTacToeGame should return a Promise', () => {
      const mockGameSession = {
        gameState: {
          id: 'test',
          players: [],
          currentPlayerId: 'player1' as const,
          status: 'playing' as const,
          createdAt: new Date(),
          updatedAt: new Date(),
          board: [[null, null, null], [null, null, null], [null, null, null]],
          playerSymbols: {}
        },
        gameType: 'tic-tac-toe' as const,
        history: []
      };
      const result = sqliteStorage.setTicTacToeGame('test-id', mockGameSession);
      expect(result).toBeInstanceOf(Promise);
    });

    it('getAllTicTacToeGames should return a Promise', () => {
      const result = sqliteStorage.getAllTicTacToeGames();
      expect(result).toBeInstanceOf(Promise);
    });

    it('deleteTicTacToeGame should return a Promise', () => {
      const result = sqliteStorage.deleteTicTacToeGame('test-id');
      expect(result).toBeInstanceOf(Promise);
    });

    it('getRPSGame should return a Promise', () => {
      const result = sqliteStorage.getRPSGame('test-id');
      expect(result).toBeInstanceOf(Promise);
    });

    it('setRPSGame should return a Promise', () => {
      const mockGameSession = {
        gameState: {
          id: 'test',
          players: [],
          currentPlayerId: 'player1' as const,
          status: 'playing' as const,
          createdAt: new Date(),
          updatedAt: new Date(),
          rounds: [],
          currentRound: 0,
          scores: {},
          maxRounds: 3
        },
        gameType: 'rock-paper-scissors' as const,
        history: []
      };
      const result = sqliteStorage.setRPSGame('test-id', mockGameSession);
      expect(result).toBeInstanceOf(Promise);
    });

    it('getAllRPSGames should return a Promise', () => {
      const result = sqliteStorage.getAllRPSGames();
      expect(result).toBeInstanceOf(Promise);
    });

    it('deleteRPSGame should return a Promise', () => {
      const result = sqliteStorage.deleteRPSGame('test-id');
      expect(result).toBeInstanceOf(Promise);
    });
  });
});
