/**
 * MCP Prompt handlers for turn-based games
 * Provides educational and guidance prompts for users
 */

import type { Prompt, PromptMessage } from '@modelcontextprotocol/sdk/types.js'

export interface PromptDefinition {
  name: string
  description: string
  arguments?: Array<{
    name: string
    description: string
    required?: boolean
  }>
  handler: (args?: Record<string, any>) => Promise<{
    description?: string
    messages: PromptMessage[]
  }>
}

/**
 * Game rules and how-to-play prompts
 */
export const GAME_RULES_PROMPTS: PromptDefinition[] = [
  {
    name: 'tic_tac_toe_rules',
    description: 'Learn how to play Tic-Tac-Toe and understand the rules',
    handler: async () => ({
      description: 'Complete guide to Tic-Tac-Toe rules and gameplay',
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Please explain how to play Tic-Tac-Toe, including:

1. The objective of the game
2. Game setup and rules
3. How to make moves (using positions 1-9)
4. All possible winning conditions
5. Basic strategy tips for beginners
6. How to use the MCP commands (create_game with gameType: 'tic-tac-toe', play_game with gameType: 'tic-tac-toe', wait_for_player_move)
7. What happens with perfect play

Make it comprehensive but easy to understand for someone who has never played before.`
          }
        }
      ]
    })
  },
  {
    name: 'rock_paper_scissors_rules',
    description: 'Learn how to play Rock Paper Scissors and understand the rules',
    handler: async () => ({
      description: 'Complete guide to Rock Paper Scissors rules and strategy',
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Please explain how to play Rock Paper Scissors, including:

1. The objective and basic rules (what beats what)
2. Game setup and scoring system
3. Strategy tips for beginners and advanced players
4. How psychology and pattern recognition work in this game
5. What the different AI difficulty levels mean and how to counter them
6. How to use the MCP commands (create_game with gameType: 'rock-paper-scissors', play_game with gameType: 'rock-paper-scissors', wait_for_player_move)
7. Why unpredictability is key to mastery

Make it comprehensive and include both basic rules and advanced psychological strategies.`
          }
        }
      ]
    })
  }
]

/**
 * Game strategy prompts for different difficulty levels
 */
export const STRATEGY_PROMPTS: PromptDefinition[] = [
  {
    name: 'difficulty_strategy_guide',
    description: 'Learn strategies for playing against different AI difficulty levels',
    arguments: [
      {
        name: 'gameType',
        description: 'Game type (tic-tac-toe, rock-paper-scissors)',
        required: false
      },
      {
        name: 'difficulty',
        description: 'AI difficulty level (easy, medium, hard)',
        required: false
      }
    ],
    handler: async (args = {}) => {
      const gameType = args.gameType?.toLowerCase()
      const difficulty = args.difficulty?.toLowerCase()

      let content = `# AI Difficulty Strategy Guide\n\n`

      if (gameType && difficulty) {
        content += getSpecificStrategyGuide(gameType, difficulty)
      } else if (gameType) {
        content += getGameTypeStrategies(gameType)
      } else if (difficulty) {
        content += getDifficultyStrategies(difficulty)
      } else {
        content += getCompleteStrategyGuide()
      }

      return {
        description: 'Strategy guide for different AI difficulty levels',
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `${content}

Please provide detailed strategic advice based on the game type and difficulty level specified above.`
            }
          }
        ]
      }
    }
  },
  {
    name: 'beating_hard_ai',
    description: 'Advanced strategies for challenging the hardest AI opponents',
    handler: async () => ({
      description: 'Expert-level strategies for beating hard AI difficulty',
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `I want to understand how to beat the hardest AI opponents in turn-based games. Please explain:

1. How hard AI behaves in each game type (Tic-Tac-Toe, Rock Paper Scissors)
2. What algorithms and strategies these AIs typically use
3. Universal tactics for challenging hard AI (exploiting computational limits, psychological approaches, opening theory, endgame mastery)
4. Game-specific counters and strategies for each game type
5. Why some games are impossible to win against perfect AI and how to achieve the best possible result

I'm looking for advanced, expert-level advice that goes beyond basic gameplay.`
          }
        }
      ]
    })
  }
]

/**
 * Getting started and workflow prompts
 */
export const WORKFLOW_PROMPTS: PromptDefinition[] = [
  {
    name: 'getting_started',
    description: 'Complete guide to getting started with turn-based games via MCP',
    handler: async () => ({
      description: 'Step-by-step guide for new users',
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `I'm new to this turn-based games MCP server. Please help me get started by explaining:

1. What games are available and their key characteristics
2. How to create a new game and choose difficulty levels
3. The game flow pattern and how MCP tools work together
4. A complete example session showing the typical workflow
5. Pro tips for getting the most out of the system
6. How game state and resources work

I want a comprehensive guide that will help me understand both the basics and the overall system architecture.`
          }
        }
      ]
    })
  },
  {
    name: 'mcp_game_workflow',
    description: 'Understanding the Model Context Protocol game workflow and architecture',
    handler: async () => ({
      description: 'Technical guide to MCP game architecture and workflow',
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `I want to understand the technical architecture of this Model Context Protocol game system. Please explain:

1. The system architecture and how components communicate
2. How MCP tools work and their workflow patterns
3. The resource system and what resources are available
4. Error handling patterns and common issues
5. Best practices for MCP client development and game sessions
6. Advanced features like game analysis and multi-game management
7. How this architecture ensures reliable, scalable turn-based gaming

I'm looking for a technical deep-dive that will help me understand and work with the MCP game architecture effectively.`
          }
        }
      ]
    })
  }
]

/**
 * Troubleshooting and help prompts
 */
export const HELP_PROMPTS: PromptDefinition[] = [
  {
    name: 'troubleshooting',
    description: 'Common issues and solutions for turn-based games MCP',
    handler: async () => ({
      description: 'Troubleshooting guide for common problems',
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `I'm having issues with the turn-based games MCP system. Please provide a comprehensive troubleshooting guide that covers:

1. Common errors and their solutions ("Game Not Found", "Not AI's Turn", "Game Already Finished", Network/API errors, Game Logic issues)
2. Performance issues (slow AI response, memory issues)
3. Environment setup problems (missing dependencies, development server issues)
4. How to collect debug information and self-diagnose problems
5. When to start fresh vs trying to fix issues
6. Best practices for preventing common problems

I need practical, step-by-step solutions that will help me identify and resolve issues quickly.`
          }
        }
      ]
    })
  }
]

/**
 * All available prompts combined
 */
export const ALL_PROMPTS: PromptDefinition[] = [
  ...GAME_RULES_PROMPTS,
  ...STRATEGY_PROMPTS,
  ...WORKFLOW_PROMPTS,
  ...HELP_PROMPTS
]

/**
 * Handle prompt requests
 */
export async function listPrompts(): Promise<{ prompts: Prompt[] }> {
  return {
    prompts: ALL_PROMPTS.map(prompt => ({
      name: prompt.name,
      description: prompt.description,
      arguments: prompt.arguments
    }))
  }
}

export async function getPrompt(name: string, args?: Record<string, any>) {
  const prompt = ALL_PROMPTS.find(p => p.name === name)
  if (!prompt) {
    throw new Error(`Prompt not found: ${name}`)
  }

  return await prompt.handler(args)
}

// Helper functions for strategy guide generation

function getSpecificStrategyGuide(gameType: string, difficulty: string): string {
  const strategies: Record<string, Record<string, string>> = {
    'tic-tac-toe': {
      easy: 'How should I play against easy Tic-Tac-Toe AI? Any reasonable strategy works. I should focus on learning basic tactics like center control and blocking.',
      medium: 'What strategy works against medium Tic-Tac-Toe AI? I should use corner-center-corner strategy, block threats immediately, and create double threats when possible.',
      hard: 'How can I handle hard Tic-Tac-Toe AI? Perfect play is required. I should start with center or corner and make every move optimal to achieve a draw.'
    },
    'rock-paper-scissors': {
      easy: 'What approach works against easy Rock Paper Scissors AI? Since it makes completely random choices, any strategy works equally.',
      medium: 'How do I beat medium Rock Paper Scissors AI? I should watch for short patterns, mix my choices but avoid obvious patterns.',
      hard: 'What strategy works against hard Rock Paper Scissors AI? I need true randomness and should avoid any detectable patterns. Anti-pattern strategies might work.'
    }
  }

  return strategies[gameType]?.[difficulty] || 'Please provide strategy advice for this game type and difficulty combination.'
}

function getGameTypeStrategies(gameType: string): string {
  // Return strategies for all difficulties of a specific game
  return `Please provide comprehensive strategies for ${gameType.toUpperCase()} across all difficulty levels:\n\n` +
    ['easy', 'medium', 'hard'].map(diff => 
      `For ${diff.toUpperCase()} difficulty: ${getSpecificStrategyGuide(gameType, diff)}\n`
    ).join('\n')
}

function getDifficultyStrategies(difficulty: string): string {
  // Return strategies for a specific difficulty across all games
  return `Please provide strategies for ${difficulty.toUpperCase()} difficulty across all games:\n\n` +
    ['tic-tac-toe', 'rock-paper-scissors'].map(game => 
      `For ${game.replace(/-/g, ' ').toUpperCase()}: ${getSpecificStrategyGuide(game, difficulty)}\n`
    ).join('\n')
}

function getCompleteStrategyGuide(): string {
  return `Please provide a complete strategy guide for all games and difficulties. I want to understand:

1. Difficulty Levels Overview:
   - Easy: Random or basic play, great for learning
   - Medium: Some strategy and pattern recognition  
   - Hard: Advanced algorithms, expert-level play

2. Universal Principles for improvement across all games

3. Specific strategies for each game type and difficulty combination

4. How to progress from easy to hard difficulty effectively

Please make it comprehensive and practical for someone wanting to master all the available games.`
}
