// Polyfill for localStorage
if (typeof localStorage === 'undefined') {
  global.localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {},
  };
}

if (typeof sessionStorage === 'undefined') {
  global.sessionStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {},
  };
}

// Set up test environment variables
process.env.GOOGLE_API_KEY = 'test-api-key-12345';
process.env.NODE_ENV = 'test';
