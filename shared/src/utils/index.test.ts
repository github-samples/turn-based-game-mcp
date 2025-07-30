import { generateGameId, formatDate, getGameDisplayName } from './index';
import type { GameType } from '../types/game';

describe('Utility Functions', () => {
  describe('generateGameId', () => {
    it('should generate a valid UUID', () => {
      const id = generateGameId();
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      expect(id).toMatch(uuidRegex);
    });

    it('should generate unique IDs', () => {
      const id1 = generateGameId();
      const id2 = generateGameId();
      expect(id1).not.toBe(id2);
    });

    it('should always return a string', () => {
      const id = generateGameId();
      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(0);
    });
  });

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2024-01-15T14:30:00.000Z');
      const formatted = formatDate(date);
      expect(formatted).toContain('Jan');
      expect(formatted).toContain('15');
      expect(formatted).toContain('2024');
    });

    it('should handle current date', () => {
      const now = new Date();
      const formatted = formatDate(now);
      expect(typeof formatted).toBe('string');
      expect(formatted.length).toBeGreaterThan(0);
    });

    it('should include time information', () => {
      const date = new Date('2024-12-25T15:45:30.000Z');
      const formatted = formatDate(date);
      // Should contain time (will vary based on timezone)
      expect(formatted).toMatch(/\d{1,2}:\d{2}/); // HH:MM format
    });

    it('should handle edge cases', () => {
      const dates = [
        new Date('2000-01-01T00:00:00.000Z'),
        new Date('2099-12-31T23:59:59.999Z'),
        new Date('2024-02-29T12:00:00.000Z') // Leap year
      ];

      dates.forEach(date => {
        const formatted = formatDate(date);
        expect(typeof formatted).toBe('string');
        expect(formatted.length).toBeGreaterThan(0);
      });
    });
  });

  describe('getGameDisplayName', () => {
    it('should return correct display name for tic-tac-toe', () => {
      expect(getGameDisplayName('tic-tac-toe')).toBe('Tic-Tac-Toe');
    });

    it('should return correct display name for rock-paper-scissors', () => {
      expect(getGameDisplayName('rock-paper-scissors')).toBe('Rock Paper Scissors');
    });

    it('should return default for unknown game type', () => {
      const unknownType = 'unknown-game' as GameType;
      expect(getGameDisplayName(unknownType)).toBe('Unknown Game');
    });

    it('should handle all valid game types', () => {
      const validTypes: GameType[] = ['tic-tac-toe', 'rock-paper-scissors'];
      
      validTypes.forEach(type => {
        const displayName = getGameDisplayName(type);
        expect(typeof displayName).toBe('string');
        expect(displayName.length).toBeGreaterThan(0);
        expect(displayName).not.toBe('Unknown Game');
      });
    });
  });

  describe('Integration tests', () => {
    it('should work together in realistic scenario', () => {
      // Generate a game ID
      const gameId = generateGameId();
      expect(gameId).toBeDefined();
      
      // Get display name
      const displayName = getGameDisplayName('tic-tac-toe');
      expect(displayName).toBe('Tic-Tac-Toe');
      
      // Format current date
      const now = new Date();
      const formattedDate = formatDate(now);
      expect(formattedDate).toBeDefined();
    });

    it('should handle multiple games creation simulation', () => {
      const gameTypes: GameType[] = ['tic-tac-toe', 'rock-paper-scissors'];
      const games = [];
      
      for (let i = 0; i < 5; i++) {
        const gameType = gameTypes[i % gameTypes.length];
        const game = {
          id: generateGameId(),
          type: gameType,
          displayName: getGameDisplayName(gameType),
          createdAt: formatDate(new Date())
        };
        games.push(game);
      }
      
      expect(games).toHaveLength(5);
      
      // All IDs should be unique
      const ids = games.map(g => g.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(5);
      
      // Should have both game types
      const types = games.map(g => g.type);
      expect(types).toContain('tic-tac-toe');
      expect(types).toContain('rock-paper-scissors');
    });
  });
});