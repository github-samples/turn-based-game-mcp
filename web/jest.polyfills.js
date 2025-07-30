// Global polyfills for Jest tests
// Must run before any Next.js imports to establish Web API environment

// Force polyfills to be set synchronously before any module loading
(function setupPolyfills() {
  'use strict';
  
  // Set up all Web APIs immediately
  
  // Crypto
  if (!globalThis.crypto) {
    try {
      const { webcrypto } = require('node:crypto');
      globalThis.crypto = webcrypto;
    } catch (e) {
      // Fallback crypto implementation
      globalThis.crypto = {
        randomUUID: () => {
          // Simple UUID v4 implementation for testing
          return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
          });
        }
      };
    }
  }
  
  // Ensure randomUUID method exists even if crypto is partially supported
  if (globalThis.crypto && !globalThis.crypto.randomUUID) {
    globalThis.crypto.randomUUID = () => {
      // Simple UUID v4 implementation for testing
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    };
  }

  // Text encoding
  if (!globalThis.TextEncoder) {
    try {
      const { TextEncoder, TextDecoder } = require('util');
      globalThis.TextEncoder = TextEncoder;
      globalThis.TextDecoder = TextDecoder;
    } catch (e) {}
  }

  // Streams
  if (!globalThis.ReadableStream) {
    try {
      const streams = require('node:stream/web');
      globalThis.ReadableStream = streams.ReadableStream;
      globalThis.WritableStream = streams.WritableStream;
      globalThis.TransformStream = streams.TransformStream;
    } catch (e) {}
  }

  // Fetch APIs - be very careful here
  if (!globalThis.fetch) {
    try {
      // Use undici but catch all errors and continue
      const undici = require('undici');
      if (undici && undici.fetch) {
        globalThis.fetch = undici.fetch;
      }
      if (undici && undici.Request && !globalThis.Request) {
        globalThis.Request = undici.Request;
      }
      if (undici && undici.Response && !globalThis.Response) {
        globalThis.Response = undici.Response;
      }
      if (undici && undici.Headers && !globalThis.Headers) {
        globalThis.Headers = undici.Headers;
      }
      if (undici && undici.FormData && !globalThis.FormData) {
        globalThis.FormData = undici.FormData;
      }
    } catch (e) {
      // Silent fail for fetch APIs - Next.js will handle this
    }
  }
})();
