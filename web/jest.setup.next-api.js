// Simple mock setup for Next.js API route testing
// Focus on mocking the essential parts without external dependencies

// Mock the Next.js Request and Response classes directly
const mockRequest = {
  json: async function() {
    try {
      return JSON.parse(this.body || '{}');
    } catch {
      throw new Error('Invalid JSON');
    }
  }
};

const mockResponse = {
  json: function(data) {
    return {
      status: 200,
      json: async () => data
    };
  }
};

// Mock Next.js server module
jest.mock('next/server', () => {
  class MockNextRequest {
    constructor(url, { method = 'GET', body = '' } = {}) {
      this.url = url;
      this.method = method;
      this.body = body;
      this.nextUrl = new URL(url);
    }
    
    async json() {
      try {
        return JSON.parse(this.body || '{}');
      } catch {
        throw new Error('Invalid JSON');
      }
    }
  }
  
  class MockNextResponse {
    constructor(body, init = {}) {
      this.body = body;
      this.status = init.status || 200;
      this.headers = init.headers || {};
    }
    
    static json(data, init = {}) {
      const response = new MockNextResponse(JSON.stringify(data), {
        status: init.status || 200,
        headers: {
          'content-type': 'application/json',
          ...init.headers
        }
      });
      response._jsonData = data;
      return response;
    }
    
    async json() {
      if (this._jsonData !== undefined) {
        return this._jsonData;
      }
      try {
        return JSON.parse(this.body);
      } catch {
        return {};
      }
    }
  }
  
  return {
    NextRequest: MockNextRequest,
    NextResponse: MockNextResponse
  };
});