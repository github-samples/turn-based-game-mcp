// Vitest setup for web package tests
import { vi } from 'vitest'
import '@testing-library/jest-dom'

// Use shared test database setup
import { setupStandardTestDatabase } from '@turn-based-mcp/shared/testing'

// Setup standard test database using shared utility
setupStandardTestDatabase()

// Mock Next.js Request and Response for API route testing
class MockRequest {
  body: string;
  url: string;
  method: string;

  constructor(url: string, init?: { method?: string; body?: string }) {
    this.url = url;
    this.method = init?.method || 'GET';
    this.body = init?.body || '{}';
  }

  async json() {
    try {
      return JSON.parse(this.body || '{}');
    } catch {
      throw new Error('Invalid JSON');
    }
  }
}

const mockResponse = {
  statusCode: 200,
  json: function(data: any) {
    return {
      status: 200,
      json: async () => data
    }
  },
  status: function(code: number) {
    this.statusCode = code
    return this
  }
}

// Mock NextResponse for API routes
const mockNextResponse = {
  json: vi.fn((data: any, init?: { status?: number }) => ({
    json: async () => data,
    status: init?.status || 200,
    ok: (init?.status || 200) >= 200 && (init?.status || 200) < 300
  }))
}

// Global mocks
global.Request = MockRequest as any;
global.Response = vi.fn(() => mockResponse) as any;

// Mock NextResponse
vi.mock('next/server', () => ({
  NextRequest: MockRequest,
  NextResponse: mockNextResponse
}))

// Mock fetch globally
global.fetch = vi.fn()

// Suppress expected console errors during tests
// These are typically from error handling scenarios that we're intentionally testing
const originalConsoleError = console.error
const suppressedConsoleError = (...args: any[]) => {
  const message = args[0]
  
  if (typeof message === 'string') {
    // Suppress expected error messages from API routes
    if (
      message.includes('Error creating game:') ||
      message.includes('Error deleting game:') ||
      message.includes('Error processing move:') ||
      message.includes('Error fetching games for MCP:')
    ) {
      return // Suppress these expected errors
    }
  }
  
  // For all other errors, use the original console.error
  originalConsoleError(...args)
}

// Mock console methods to reduce noise during tests
global.console = {
  ...console,
  log: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: suppressedConsoleError,
}
