/**
 * MCP Elicitation handlers for user input collection
 * Provides structured ways to gather user preferences and decisions
 */

export interface ElicitationResult {
  action: "accept" | "decline" | "cancel"
  content?: Record<string, any>
}

/**
 * Game creation preferences elicitation
 */
export async function elicitGameCreationPreferences(
  server: any,
  gameType: string,
  existingArgs?: Record<string, any>
): Promise<ElicitationResult> {
  const schemas = {
    'tic-tac-toe': {
      type: "object",
      properties: {
        difficulty: {
          type: "string",
          enum: ["easy", "medium", "hard"],
          title: "AI Difficulty Level",
          description: "How challenging should the AI opponent be?"
        },
        playerSymbol: {
          type: "string",
          enum: ["X", "O"],
          title: "Your Symbol",
          description: "Do you want to be X (goes first) or O (goes second)?"
        },
        playerName: {
          type: "string",
          title: "Player Name",
          description: "What should we call you in the game?",
          default: "Player"
        }
      },
      required: ["difficulty"]
    },
    'rock-paper-scissors': {
      type: "object", 
      properties: {
        difficulty: {
          type: "string",
          enum: ["easy", "medium", "hard"],
          title: "AI Difficulty Level",
          description: "How smart should the AI be at pattern recognition?"
        },
        maxRounds: {
          type: "number",
          minimum: 1,
          maximum: 10,
          title: "Number of Rounds",
          description: "How many rounds should we play?",
          default: 3
        },
        playerName: {
          type: "string", 
          title: "Player Name",
          description: "What should we call you?",
          default: "Player"
        }
      },
      required: ["difficulty"]
    }
  }

  const schema = schemas[gameType as keyof typeof schemas]
  if (!schema) {
    throw new Error(`No elicitation schema defined for game type: ${gameType}`)
  }

  const message = `Let's set up your ${gameType.replace('-', ' ')} game! 🎮\n\nI'll need a few preferences to customize your experience:`

  try {
    const result = await server.elicitInput({
      message,
      requestedSchema: schema
    })

    return result
  } catch (error) {
    console.error('Elicitation failed:', error)
    // Return default preferences if elicitation fails
    return {
      action: "accept",
      content: {
        difficulty: existingArgs?.aiDifficulty || "medium",
        playerName: existingArgs?.playerName || "Player",
        ...(gameType === 'rock-paper-scissors' && { maxRounds: 3 }),
        ...(gameType === 'tic-tac-toe' && { playerSymbol: "X" })
      }
    }
  }
}

/**
 * Mid-game decision elicitation
 */
export async function elicitMidGameDecision(
  server: any,
  context: {
    gameType: string
    gameId: string
    situation: string
    options: Array<{ value: string; label: string; description?: string }>
  }
): Promise<ElicitationResult> {
  const { gameType, gameId, situation, options } = context

  const schema = {
    type: "object",
    properties: {
      choice: {
        type: "string",
        enum: options.map(opt => opt.value),
        enumNames: options.map(opt => opt.label),
        title: "Your Choice",
        description: "What would you like to do?"
      },
      feedback: {
        type: "string",
        title: "Any feedback? (Optional)",
        description: "Let me know if you have any thoughts about the game so far"
      }
    },
    required: ["choice"]
  }

  const message = `🤔 **${gameType.replace('-', ' ')} Game Decision**\n\n${situation}\n\nWhat would you like to do?`

  try {
    return await server.elicitInput({
      message,
      requestedSchema: schema
    })
  } catch (error) {
    console.error('Mid-game elicitation failed:', error)
    // Return first option as default
    return {
      action: "accept", 
      content: { choice: options[0]?.value || "continue" }
    }
  }
}

/**
 * Game completion feedback elicitation
 */
export async function elicitGameCompletionFeedback(
  server: any,
  context: {
    gameType: string
    gameId: string
    result: 'win' | 'loss' | 'draw'
    aiDifficulty: string
  }
): Promise<ElicitationResult> {
  const { gameType, result, aiDifficulty } = context

  const resultMessages = {
    win: "🎉 Congratulations! You won!",
    loss: "😅 Good game! The AI won this time.",
    draw: "🤝 It's a draw! Well played by both sides."
  }

  const schema = {
    type: "object",
    properties: {
      difficultyFeedback: {
        type: "string",
        enum: ["too_easy", "just_right", "too_hard"],
        enumNames: ["Too Easy", "Just Right", "Too Hard"],
        title: "How was the difficulty?",
        description: `The AI was set to ${aiDifficulty} difficulty`
      },
      playAgain: {
        type: "boolean",
        title: "Play another game?",
        description: "Would you like to start a new game?"
      },
      gameTypeForNext: {
        type: "string",
        enum: ["same", "tic-tac-toe", "rock-paper-scissors"],
        enumNames: ["Same Game", "Tic-Tac-Toe", "Rock Paper Scissors"],
        title: "If playing again, which game?",
        description: "Choose the game type for your next match"
      },
      comments: {
        type: "string",
        title: "Any comments? (Optional)",
        description: "Share your thoughts about the game experience"
      }
    },
    required: ["difficultyFeedback", "playAgain"]
  }

  const message = `${resultMessages[result]}\n\n**Game Complete: ${gameType.replace('-', ' ')}**\n\nI'd love to get your feedback to improve future games:`

  try {
    return await server.elicitInput({
      message,
      requestedSchema: schema
    })
  } catch (error) {
    console.error('Completion feedback elicitation failed:', error)
    return {
      action: "decline",
      content: {}
    }
  }
}

/**
 * Strategy hint elicitation
 */
export async function elicitStrategyPreference(
  server: any,
  context: {
    gameType: string
    gameId: string 
    availableHints: string[]
    currentSituation: string
  }
): Promise<ElicitationResult> {
  const { gameType, availableHints, currentSituation } = context

  const schema = {
    type: "object",
    properties: {
      wantHint: {
        type: "boolean",
        title: "Would you like a strategy hint?",
        description: "I can provide some strategic advice for this situation"
      },
      hintType: {
        type: "string",
        enum: ["beginner", "intermediate", "advanced"],
        enumNames: ["Basic Tips", "Strategic Insights", "Advanced Analysis"],
        title: "What level of hint?",
        description: "Choose the depth of strategic advice"
      },
      explainMoves: {
        type: "boolean", 
        title: "Explain possible moves?",
        description: "Would you like me to analyze the available options?"
      }
    },
    required: ["wantHint"]
  }

  const message = `🧠 **Strategy Assistance Available**\n\n**Current situation:** ${currentSituation}\n\nI can provide strategic guidance if you'd like:`

  try {
    return await server.elicitInput({
      message,
      requestedSchema: schema
    })
  } catch (error) {
    console.error('Strategy elicitation failed:', error)
    return {
      action: "decline",
      content: { wantHint: false }
    }
  }
}

/**
 * Error recovery elicitation
 */
export async function elicitErrorRecovery(
  server: any,
  context: {
    gameType: string
    gameId: string
    error: string
    recoveryOptions: Array<{ value: string; label: string; description: string }>
  }
): Promise<ElicitationResult> {
  const { gameType, error, recoveryOptions } = context

  const schema = {
    type: "object", 
    properties: {
      action: {
        type: "string",
        enum: recoveryOptions.map(opt => opt.value),
        enumNames: recoveryOptions.map(opt => opt.label),
        title: "How should we handle this?",
        description: "Choose your preferred recovery option"
      },
      reportIssue: {
        type: "boolean",
        title: "Report this issue for improvement?",
        description: "Help us improve by reporting this problem"
      }
    },
    required: ["action"]
  }

  const message = `⚠️ **${gameType.replace('-', ' ')} Game Issue**\n\n**Problem:** ${error}\n\nHow would you like to proceed?`

  try {
    return await server.elicitInput({
      message,
      requestedSchema: schema
    })
  } catch (error) {
    console.error('Error recovery elicitation failed:', error)
    return {
      action: "accept",
      content: { 
        action: recoveryOptions[0]?.value || "retry",
        reportIssue: false
      }
    }
  }
}
