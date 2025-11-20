
// Additional shims for React Native environment
// This provides extra compatibility layers

// Ensure global exists
if (typeof global === 'undefined') {
  if (typeof window !== 'undefined') {
    (window as any).global = window;
  } else if (typeof globalThis !== 'undefined') {
    (globalThis as any).global = globalThis;
  }
}

// Minimal process implementation if not already set
if (typeof (global as any).process === 'undefined') {
  (global as any).process = {
    env: {},
    version: '',
    versions: {},
    platform: 'browser',
    browser: true,
    nextTick: (fn: (...args: unknown[]) => void, ...args: unknown[]) => {
      setTimeout(() => fn(...args), 0);
    },
  };
}

// setImmediate polyfill
if (typeof (global as any).setImmediate === 'undefined') {
  (global as any).setImmediate = (fn: (...args: unknown[]) => void, ...args: unknown[]) => {
    return setTimeout(() => fn(...args), 0);
  };
}

// clearImmediate polyfill
if (typeof (global as any).clearImmediate === 'undefined') {
  (global as any).clearImmediate = (id: unknown) => {
    clearTimeout(id as number);
  };
}

export {};
