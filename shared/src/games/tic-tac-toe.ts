import { Game, Player, PlayerId, GameResult } from '../types/game';
import { TicTacToeGameState, TicTacToeMove, Board, CellValue } from '../types/games';

/**
 * Implementation of the classic Tic-Tac-Toe game
 * 
 * Supports a 3x3 grid where players take turns placing X and O marks.
 * The first player to get three marks in a row, column, or diagonal wins.
 * If all 9 cells are filled without a winner, the game is a draw.
 * 
 * @example
 * ```typescript
 * const game = new TicTacToeGame();
 * const players = [
 *   { id: 'player1', name: 'Alice', isAI: false },
 *   { id: 'ai', name: 'Computer', isAI: true }
 * ];
 * const initialState = game.getInitialState(players);
 * ```
 */
export class TicTacToeGame implements Game<TicTacToeGameState, TicTacToeMove> {
  /**
   * Validates whether a move is legal in the current game state
   * 
   * @param gameState - The current state of the tic-tac-toe game
   * @param move - The move to validate (row and column coordinates)
   * @param playerId - The ID of the player attempting the move
   * @returns true if the move is valid, false otherwise
   * 
   * @description
   * A move is valid if:
   * - It's the player's turn (gameState.currentPlayerId matches playerId)
   * - The target cell is within the 3x3 grid bounds (0-2 for both row and col)
   * - The target cell is empty (contains null)
   */
  validateMove(gameState: TicTacToeGameState, move: TicTacToeMove, playerId: PlayerId): boolean {
    const { row, col } = move;
    
    // Check if it's the player's turn
    if (gameState.currentPlayerId !== playerId) {
      return false;
    }
    
    // Check that row and col are numbers, integers, and not special property names
    if (
      typeof row !== 'number' ||
      typeof col !== 'number' ||
      !Number.isInteger(row) ||
      !Number.isInteger(col) ||
      row < 0 || row >= 3 ||
      col < 0 || col >= 3
    ) {
      return false;
    }
    
    // Check if the cell is empty
    return gameState.board[row][col] === null;
  }

  /**
   * Applies a validated move to the game state and returns the new state
   * 
   * @param gameState - The current state of the tic-tac-toe game
   * @param move - The move to apply (must be valid)
   * @param playerId - The ID of the player making the move
   * @returns A new game state with the move applied and turn switched
   * @throws Error if the move is invalid
   * 
   * @description
   * This method:
   * 1. Validates the move (throws error if invalid)
   * 2. Creates a new board with the player's symbol in the specified cell
   * 3. Switches to the other player's turn
   * 4. Updates the timestamp
   */
  applyMove(gameState: TicTacToeGameState, move: TicTacToeMove, playerId: PlayerId): TicTacToeGameState {
    if (!this.validateMove(gameState, move, playerId)) {
      throw new Error('Invalid move');
    }

    const row = Number(move.row);
    const col = Number(move.col);

    const newBoard = gameState.board.map(row => [...row]);
    newBoard[row][col] = gameState.playerSymbols[playerId];

    // Switch to next player
    const nextPlayerId = gameState.players.find(p => p.id !== playerId)?.id || 'player1';

    return {
      ...gameState,
      board: newBoard,
      currentPlayerId: nextPlayerId,
      updatedAt: new Date(),
    };
  }

  /**
   * Checks if the game has ended and determines the winner
   * 
   * @param gameState - The current state of the tic-tac-toe game
   * @returns GameResult with winner and reason if game ended, null if game continues
   * 
   * @description
   * Checks for winning conditions in this order:
   * 1. Three in a row (any of the 3 rows)
   * 2. Three in a column (any of the 3 columns)
   * 3. Three in main diagonal (top-left to bottom-right)
   * 4. Three in anti-diagonal (top-right to bottom-left)
   * 5. Board full (draw condition)
   * 
   * @example
   * ```typescript
   * const result = game.checkGameEnd(gameState);
   * if (result) {
   *   console.log(`Game over: ${result.winner} - ${result.reason}`);
   * }
   * ```
   */
  checkGameEnd(gameState: TicTacToeGameState): GameResult | null {
    const board = gameState.board;
    
    // Check rows
    for (let row = 0; row < 3; row++) {
      if (board[row][0] && board[row][0] === board[row][1] && board[row][1] === board[row][2]) {
        const winnerId = this.getPlayerIdBySymbol(gameState, board[row][0]);
        return { winner: winnerId, reason: `Three in a row (row ${row + 1})` };
      }
    }
    
    // Check columns
    for (let col = 0; col < 3; col++) {
      if (board[0][col] && board[0][col] === board[1][col] && board[1][col] === board[2][col]) {
        const winnerId = this.getPlayerIdBySymbol(gameState, board[0][col]);
        return { winner: winnerId, reason: `Three in a column (column ${col + 1})` };
      }
    }
    
    // Check diagonals
    if (board[0][0] && board[0][0] === board[1][1] && board[1][1] === board[2][2]) {
      const winnerId = this.getPlayerIdBySymbol(gameState, board[0][0]);
      return { winner: winnerId, reason: 'Three in a diagonal' };
    }
    
    if (board[0][2] && board[0][2] === board[1][1] && board[1][1] === board[2][0]) {
      const winnerId = this.getPlayerIdBySymbol(gameState, board[0][2]);
      return { winner: winnerId, reason: 'Three in a diagonal' };
    }
    
    // Check for draw (board full)
    const isBoardFull = board.every(row => row.every(cell => cell !== null));
    if (isBoardFull) {
      return { winner: 'draw', reason: 'Board is full' };
    }
    
    return null; // Game continues
  }

  /**
   * Gets all valid moves for a player in the current game state
   * 
   * @param gameState - The current state of the tic-tac-toe game
   * @param playerId - The ID of the player to get moves for
   * @returns Array of valid TicTacToeMove objects (empty if not player's turn)
   * 
   * @description
   * Returns all empty cells on the board if it's the player's turn.
   * Returns empty array if it's not the player's turn.
   * Each move contains row and column coordinates (0-2 for both).
   */
  getValidMoves(gameState: TicTacToeGameState, playerId: PlayerId): TicTacToeMove[] {
    if (gameState.currentPlayerId !== playerId) {
      return [];
    }

    const validMoves: TicTacToeMove[] = [];
    
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        if (gameState.board[row][col] === null) {
          validMoves.push({ row, col });
        }
      }
    }
    
    return validMoves;
  }

  /**
   * Creates the initial game state for a new tic-tac-toe game
   * 
   * @param players - Array of exactly 2 players (first player gets X, second gets O)
   * @returns Initial TicTacToeGameState with empty board and first player's turn
   * 
   * @description
   * Sets up a new game with:
   * - Empty 3x3 board (all cells null)
   * - Player 1 assigned 'X' symbol and goes first
   * - Player 2 assigned 'O' symbol
   * - Game status set to 'playing'
   * - Timestamps initialized to current time
   */
  getInitialState(players: Player[]): TicTacToeGameState {
    const board: Board = [
      [null, null, null],
      [null, null, null],
      [null, null, null]
    ];

    const playerSymbols: Record<string, 'X' | 'O'> = {};
    playerSymbols[players[0].id] = 'X';
    playerSymbols[players[1].id] = 'O';

    return {
      id: crypto.randomUUID(),
      players,
      currentPlayerId: players[0].id,
      status: 'playing',
      createdAt: new Date(),
      updatedAt: new Date(),
      board,
      playerSymbols,
    };
  }

  /**
   * Helper method to find the player ID associated with a game symbol
   * 
   * @param gameState - The current game state
   * @param symbol - The symbol ('X' or 'O') to find the player for
   * @returns The PlayerId that owns the symbol, or 'player1' as fallback
   * 
   * @private
   * @description
   * Used internally when determining the winner from a winning symbol.
   * Searches through the playerSymbols mapping to find which player has the given symbol.
   */
  private getPlayerIdBySymbol(gameState: TicTacToeGameState, symbol: CellValue): PlayerId {
    for (const [playerId, playerSymbol] of Object.entries(gameState.playerSymbols)) {
      if (playerSymbol === symbol) {
        return playerId as PlayerId;
      }
    }
    return 'player1'; // fallback
  }
}
