import type { TicTacToeGameState, TicTacToeMove } from '@turn-based-mcp/shared'
import { TicTacToeGame } from '@turn-based-mcp/shared'

export type Difficulty = 'easy' | 'medium' | 'hard'

/**
 * AI opponent for Tic-Tac-Toe with configurable difficulty levels
 * 
 * Provides three difficulty levels:
 * - Easy: Random move selection
 * - Medium: Strategic play with basic tactics (win/block/center/corners)
 * - Hard: Optimal play using minimax algorithm (never loses)
 * 
 * @example
 * ```typescript
 * const ai = new TicTacToeAI();
 * const move = await ai.makeMove(gameState, 'hard');
 * const analysis = ai.analyzeGameState(gameState);
 * ```
 */
export class TicTacToeAI {
  private game = new TicTacToeGame()

  /**
   * Makes an AI move based on the specified difficulty level
   * 
   * @param gameState - Current game state
   * @param difficulty - AI difficulty level ('easy' | 'medium' | 'hard')
   * @returns Promise resolving to the chosen move
   * @throws Error if no valid moves are available
   * 
   * @description
   * - Easy: Selects a random valid move
   * - Medium: Uses strategic heuristics (win > block > center > corners > random)
   * - Hard: Uses minimax algorithm for optimal play
   */
  async makeMove(gameState: TicTacToeGameState, difficulty: Difficulty = 'medium'): Promise<TicTacToeMove> {
    const validMoves = this.game.getValidMoves(gameState, 'ai')
    
    if (validMoves.length === 0) {
      throw new Error('No valid moves available')
    }

    switch (difficulty) {
      case 'easy':
        return this.makeRandomMove(validMoves)
      case 'medium':
        return this.makeMediumMove(gameState, validMoves)
      case 'hard':
        return this.makeOptimalMove(gameState, validMoves)
      default:
        return this.makeRandomMove(validMoves)
    }
  }

  /**
   * Selects a random move from available valid moves
   * 
   * @param validMoves - Array of valid moves to choose from
   * @returns A randomly selected move
   * @private
   */
  private makeRandomMove(validMoves: TicTacToeMove[]): TicTacToeMove {
    return validMoves[Math.floor(Math.random() * validMoves.length)]
  }

  /**
   * Makes strategic moves using basic tic-tac-toe heuristics
   * 
   * @param gameState - Current game state
   * @param validMoves - Array of valid moves
   * @returns Strategically chosen move
   * @private
   * 
   * @description
   * Priority order:
   * 1. Win immediately if possible
   * 2. Block opponent from winning
   * 3. Take center (1,1) if available
   * 4. Take a corner if available
   * 5. Take any remaining move
   */
  private makeMediumMove(gameState: TicTacToeGameState, validMoves: TicTacToeMove[]): TicTacToeMove {
    // Medium AI: Try to win, block opponent, or play center/corners
    
    // 1. Try to win
    const winMove = this.findWinningMove(gameState, 'ai')
    if (winMove) return winMove

    // 2. Block opponent from winning
    const blockMove = this.findWinningMove(gameState, 'player1')
    if (blockMove) return blockMove

    // 3. Play center if available
    const centerMove = validMoves.find(move => move.row === 1 && move.col === 1)
    if (centerMove) return centerMove

    // 4. Play corners
    const corners = validMoves.filter(move => 
      (move.row === 0 || move.row === 2) && (move.col === 0 || move.col === 2)
    )
    if (corners.length > 0) {
      return corners[Math.floor(Math.random() * corners.length)]
    }

    // 5. Play any available move
    return this.makeRandomMove(validMoves)
  }

  /**
   * Makes optimal moves using the minimax algorithm
   * 
   * @param gameState - Current game state
   * @param validMoves - Array of valid moves
   * @returns The optimal move (never loses with perfect play)
   * @private
   * 
   * @description
   * Uses minimax algorithm to evaluate all possible game outcomes.
   * Guarantees optimal play - will never lose if a draw or win is possible.
   */
  private makeOptimalMove(gameState: TicTacToeGameState, validMoves: TicTacToeMove[]): TicTacToeMove {
    // Hard AI: Use minimax algorithm
    let bestMove = validMoves[0]
    let bestScore = -Infinity

    for (const move of validMoves) {
      const tempGameState = this.game.applyMove(gameState, move, 'ai')
      const score = this.minimax(tempGameState, 0, false)
      
      if (score > bestScore) {
        bestScore = score
        bestMove = move
      }
    }

    return bestMove
  }

  /**
   * Minimax algorithm implementation for optimal tic-tac-toe play
   * 
   * @param gameState - Game state to evaluate
   * @param depth - Current depth in the game tree
   * @param isMaximizing - True if maximizing (AI turn), false if minimizing (opponent turn)
   * @returns Numeric score: positive favors AI, negative favors opponent, 0 is draw
   * @private
   * 
   * @description
   * Recursively evaluates all possible game outcomes:
   * - AI win: +10 - depth (prefer faster wins)
   * - Opponent win: depth - 10 (prefer slower losses)
   * - Draw: 0
   */
  private minimax(gameState: TicTacToeGameState, depth: number, isMaximizing: boolean): number {
    const result = this.game.checkGameEnd(gameState)
    
    if (result) {
      if (result.winner === 'ai') return 10 - depth
      if (result.winner === 'player1') return depth - 10
      return 0 // draw
    }

    const currentPlayer = isMaximizing ? 'ai' : 'player1'
    const validMoves = this.game.getValidMoves(gameState, currentPlayer)

    if (isMaximizing) {
      let maxScore = -Infinity
      for (const move of validMoves) {
        const tempGameState = this.game.applyMove(gameState, move, currentPlayer)
        const score = this.minimax(tempGameState, depth + 1, false)
        maxScore = Math.max(score, maxScore)
      }
      return maxScore
    } else {
      let minScore = Infinity
      for (const move of validMoves) {
        const tempGameState = this.game.applyMove(gameState, move, currentPlayer)
        const score = this.minimax(tempGameState, depth + 1, true)
        minScore = Math.min(score, minScore)
      }
      return minScore
    }
  }

  /**
   * Finds a move that immediately wins the game for the specified player
   * 
   * @param gameState - Current game state
   * @param playerId - Player to find winning move for
   * @returns Winning move if found, null otherwise
   * @private
   * 
   * @description
   * Tests each valid move to see if it results in an immediate win.
   * Used for both finding AI wins and blocking opponent wins.
   */
  private findWinningMove(gameState: TicTacToeGameState, playerId: string): TicTacToeMove | null {
    const validMoves = this.game.getValidMoves(gameState, playerId as any)
    
    for (const move of validMoves) {
      const tempGameState = this.game.applyMove(gameState, move, playerId as any)
      const result = this.game.checkGameEnd(tempGameState)
      
      if (result && result.winner === playerId) {
        return move
      }
    }
    
    return null
  }

  /**
   * Provides detailed analysis of the current game state
   * 
   * @param gameState - Game state to analyze
   * @returns Human-readable analysis string with strategic insights
   * 
   * @description
   * Analyzes various aspects of the game:
   * - Current game status and active player
   * - Board occupancy statistics
   * - Immediate winning opportunities for both players
   * - Strategic position analysis (center and corners)
   */
  analyzeGameState(gameState: TicTacToeGameState): string {
    const analysis: string[] = []
    
    // Game status
    analysis.push(`Game Status: ${gameState.status}`)
    analysis.push(`Current Player: ${gameState.currentPlayerId}`)
    
    // Board analysis
    const filledCells = gameState.board.flat().filter(cell => cell !== null).length
    analysis.push(`Board filled: ${filledCells}/9 cells`)
    
    // Check for immediate threats/opportunities
    const aiWinMove = this.findWinningMove(gameState, 'ai')
    const playerWinMove = this.findWinningMove(gameState, 'player1')
    
    if (aiWinMove) {
      analysis.push(`AI can win with move: (${aiWinMove.row}, ${aiWinMove.col})`)
    }
    
    if (playerWinMove) {
      analysis.push(`Player can win with move: (${playerWinMove.row}, ${playerWinMove.col})`)
    }
    
    // Strategic position analysis
    const centerOccupied = gameState.board[1][1] !== null
    const cornersOccupied = [
      gameState.board[0][0], gameState.board[0][2],
      gameState.board[2][0], gameState.board[2][2]
    ].filter(cell => cell !== null).length
    
    analysis.push(`Center occupied: ${centerOccupied}`)
    analysis.push(`Corners occupied: ${cornersOccupied}/4`)
    
    return analysis.join('\n')
  }
}
