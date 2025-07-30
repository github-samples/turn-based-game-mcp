// Setup file for API route tests running in Node.js environment
// Provides Web API polyfills needed for Next.js server-side code

// Polyfill crypto
const { webcrypto } = require('node:crypto');
if (!globalThis.crypto) {
  globalThis.crypto = webcrypto;
}

// Polyfill streams
try {
  const { ReadableStream, WritableStream, TransformStream } = require('node:stream/web');
  if (!globalThis.ReadableStream) {
    globalThis.ReadableStream = ReadableStream;
  }
  if (!globalThis.WritableStream) {
    globalThis.WritableStream = WritableStream;
  }
  if (!globalThis.TransformStream) {
    globalThis.TransformStream = TransformStream;
  }
} catch (error) {
  // Streams might not be available in older Node versions
}

// Add fetch polyfill using undici
const { fetch, Request, Response, Headers, FormData } = require('undici');
globalThis.fetch = fetch;
globalThis.Request = Request;
globalThis.Response = Response;
globalThis.Headers = Headers;
globalThis.FormData = FormData;

// Set up text encoding/decoding
const { TextEncoder, TextDecoder } = require('util');
globalThis.TextEncoder = TextEncoder;
globalThis.TextDecoder = TextDecoder;

// Set up test database for API route tests
const { setupTestDatabase, teardownTestDatabase } = require('@turn-based-mcp/shared');

// Setup test database before all tests
beforeAll(async () => {
  try {
    await setupTestDatabase(true); // Use in-memory database for speed
  } catch (error) {
    console.error('Failed to setup test database:', error);
    throw error;
  }
});

// Cleanup test database after all tests
afterAll(async () => {
  try {
    await teardownTestDatabase();
  } catch (error) {
    console.error('Failed to teardown test database:', error);
    // Don't throw here to avoid masking other test failures
  }
});
