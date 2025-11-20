
// Additional shims for React Native environment
// This file provides extra compatibility for Node.js modules

// Ensure global exists
if (typeof global === 'undefined') {
  (window as any).global = window;
}

// Ensure process exists with minimal implementation
if (typeof process === 'undefined') {
  (global as any).process = {
    env: {},
    version: '',
    versions: {},
    platform: 'browser',
    nextTick: (fn: (...args: any[]) => void, ...args: any[]) => {
      setTimeout(() => fn(...args), 0);
    },
  };
}

// Polyfill for setImmediate if not available
if (typeof setImmediate === 'undefined') {
  (global as any).setImmediate = (fn: (...args: any[]) => void, ...args: any[]) => {
    setTimeout(() => fn(...args), 0);
  };
}

// Polyfill for clearImmediate if not available
if (typeof clearImmediate === 'undefined') {
  (global as any).clearImmediate = (id: any) => {
    clearTimeout(id);
  };
}

export {};
