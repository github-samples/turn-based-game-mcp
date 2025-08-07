// Vitest setup for web package tests
import { vi } from 'vitest'
import '@testing-library/jest-dom'

// Use shared test database setup
import { setupStandardTestDatabase } from '@turn-based-mcp/shared'

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

// Mock console methods to reduce noise during tests
global.console = {
  ...console,
  log: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
}
