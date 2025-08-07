#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'

// Import handlers
import { listResources, readResource } from './handlers/resource-handlers.js'
import { TOOL_DEFINITIONS, handleToolCall } from './handlers/tool-handlers.js'
import { listPrompts, getPrompt } from './handlers/prompt-handlers.js'

const server = new Server(
  {
    name: 'turn-based-games-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
      resources: {},
      prompts: {},
      elicitation: {},
    },
  }
)

// Resource handlers
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return await listResources()
})

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params
  return await readResource(uri)
})

// Prompt handlers
server.setRequestHandler(ListPromptsRequestSchema, async () => {
  return await listPrompts()
})

server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  const { name, arguments: args } = request.params
  return await getPrompt(name, args)
})

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: TOOL_DEFINITIONS
  }
})

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params

  // GAME FLOW PATTERN:
  // 1. Use play_[game_type] to make AI move (returns immediately)
  // 2. Use wait_for_player_move to wait for human response
  // 3. Repeat until game ends
  //
  // This pattern allows for immediate AI feedback while maintaining 
  // conversational flow between moves.

  try {
  const result = await handleToolCall(name, args ?? {}, server)
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result),
        },
      ],
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
      ],
      isError: true,
    }
  }
})

// Start the server
async function main(): Promise<void> {
  console.error('Starting Turn-based Games MCP server...')

  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error('Turn-based Games MCP server running on stdio')
}

main().catch((error) => {
  console.error('Server error:', error)
  process.exit(1)
})
