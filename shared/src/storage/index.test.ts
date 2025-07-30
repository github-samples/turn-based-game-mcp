import * as storageIndex from './index';
import * as gameStorage from './game-storage';
import * as mcpApiClient from './mcp-api-client';

describe('Storage Index', () => {
  it('should export all game storage functions', () => {
    // Test TicTacToe functions
    expect(storageIndex.getTicTacToeGame).toBe(gameStorage.getTicTacToeGame);
    expect(storageIndex.setTicTacToeGame).toBe(gameStorage.setTicTacToeGame);
    expect(storageIndex.getAllTicTacToeGames).toBe(gameStorage.getAllTicTacToeGames);
    expect(storageIndex.deleteTicTacToeGame).toBe(gameStorage.deleteTicTacToeGame);

    // Test RPS functions
    expect(storageIndex.getRPSGame).toBe(gameStorage.getRPSGame);
    expect(storageIndex.setRPSGame).toBe(gameStorage.setRPSGame);
    expect(storageIndex.getAllRPSGames).toBe(gameStorage.getAllRPSGames);
    expect(storageIndex.deleteRPSGame).toBe(gameStorage.deleteRPSGame);
  });

  it('should export all MCP API client functions', () => {
    expect(storageIndex.getTicTacToeGameForMCP).toBe(mcpApiClient.getTicTacToeGameForMCP);
    expect(storageIndex.createTicTacToeGameForMCP).toBe(mcpApiClient.createTicTacToeGameForMCP);
    expect(storageIndex.makeTicTacToeMove).toBe(mcpApiClient.makeTicTacToeMove);
    expect(storageIndex.getRPSGameForMCP).toBe(mcpApiClient.getRPSGameForMCP);
    expect(storageIndex.makeRPSMove).toBe(mcpApiClient.makeRPSMove);
  });

  it('should have all expected exports', () => {
    const exports = Object.keys(storageIndex);
    
    // Should include game storage functions
    expect(exports).toContain('getTicTacToeGame');
    expect(exports).toContain('setTicTacToeGame');
    expect(exports).toContain('getAllTicTacToeGames');
    expect(exports).toContain('deleteTicTacToeGame');
    expect(exports).toContain('getRPSGame');
    expect(exports).toContain('setRPSGame');
    expect(exports).toContain('getAllRPSGames');
    expect(exports).toContain('deleteRPSGame');

    // Should include MCP API client functions
    expect(exports).toContain('getTicTacToeGameForMCP');
    expect(exports).toContain('createTicTacToeGameForMCP');
    expect(exports).toContain('makeTicTacToeMove');
    expect(exports).toContain('getRPSGameForMCP');
    expect(exports).toContain('makeRPSMove');
  });
});
