import * as sharedIndex from './index';
import * as gamesModule from './games/index';
import * as utilsModule from './utils/index';
import * as storageModule from './storage/index';

describe('Shared Package Index', () => {
  it('should export all game classes', () => {
    expect(sharedIndex.TicTacToeGame).toBe(gamesModule.TicTacToeGame);
    expect(sharedIndex.RockPaperScissorsGame).toBe(gamesModule.RockPaperScissorsGame);
  });

  it('should export all utility functions', () => {
    expect(sharedIndex.generateGameId).toBe(utilsModule.generateGameId);
    expect(sharedIndex.formatDate).toBe(utilsModule.formatDate);
    expect(sharedIndex.getGameDisplayName).toBe(utilsModule.getGameDisplayName);
  });

  it('should export all storage functions', () => {
    // Game storage functions
    expect(sharedIndex.getTicTacToeGame).toBe(storageModule.getTicTacToeGame);
    expect(sharedIndex.setTicTacToeGame).toBe(storageModule.setTicTacToeGame);
    expect(sharedIndex.getAllTicTacToeGames).toBe(storageModule.getAllTicTacToeGames);
    expect(sharedIndex.deleteTicTacToeGame).toBe(storageModule.deleteTicTacToeGame);
    expect(sharedIndex.getRPSGame).toBe(storageModule.getRPSGame);
    expect(sharedIndex.setRPSGame).toBe(storageModule.setRPSGame);
    expect(sharedIndex.getAllRPSGames).toBe(storageModule.getAllRPSGames);
    expect(sharedIndex.deleteRPSGame).toBe(storageModule.deleteRPSGame);

    // MCP API client functions
    expect(sharedIndex.getTicTacToeGameForMCP).toBe(storageModule.getTicTacToeGameForMCP);
    expect(sharedIndex.createTicTacToeGameForMCP).toBe(storageModule.createTicTacToeGameForMCP);
    expect(sharedIndex.makeTicTacToeMove).toBe(storageModule.makeTicTacToeMove);
    expect(sharedIndex.getRPSGameForMCP).toBe(storageModule.getRPSGameForMCP);
    expect(sharedIndex.makeRPSMove).toBe(storageModule.makeRPSMove);
  });

  it('should have all expected exports available', () => {
    const exports = Object.keys(sharedIndex);
    
    // Game classes
    expect(exports).toContain('TicTacToeGame');
    expect(exports).toContain('RockPaperScissorsGame');
    
    // Utility functions
    expect(exports).toContain('generateGameId');
    expect(exports).toContain('formatDate');
    expect(exports).toContain('getGameDisplayName');
    
    // Storage functions
    expect(exports).toContain('getTicTacToeGame');
    expect(exports).toContain('setTicTacToeGame');
    expect(exports).toContain('getAllTicTacToeGames');
    expect(exports).toContain('deleteTicTacToeGame');
    expect(exports).toContain('getRPSGame');
    expect(exports).toContain('setRPSGame');
    expect(exports).toContain('getAllRPSGames');
    expect(exports).toContain('deleteRPSGame');
    expect(exports).toContain('getTicTacToeGameForMCP');
    expect(exports).toContain('createTicTacToeGameForMCP');
    expect(exports).toContain('makeTicTacToeMove');
    expect(exports).toContain('getRPSGameForMCP');
    expect(exports).toContain('makeRPSMove');
  });
});
