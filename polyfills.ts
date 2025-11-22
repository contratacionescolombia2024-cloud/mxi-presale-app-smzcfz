
// CRITICAL: This file MUST be imported FIRST before any other code
// It provides Node.js built-in polyfills for React Native environment

console.log('🔧 Loading polyfills...');

// Import required polyfill modules
import { Buffer } from 'buffer';
import process from 'process/browser.js';
import { EventEmitter } from 'events';

// Get reference to the global object
const getGlobal = (): any => {
  if (typeof globalThis !== 'undefined') return globalThis;
  if (typeof global !== 'undefined') return global;
  if (typeof window !== 'undefined') return window;
  if (typeof self !== 'undefined') return self;
  return {};
};

const globalObj = getGlobal();

// Ensure global object exists and is properly configured
if (typeof global === 'undefined') {
  if (typeof window !== 'undefined') {
    (window as any).global = window;
  } else if (typeof globalThis !== 'undefined') {
    (globalThis as any).global = globalThis;
  } else if (typeof self !== 'undefined') {
    (self as any).global = self;
  }
}

console.log('✅ Global object configured');

// Configure Buffer globally - CRITICAL for ethereumjs-util
try {
  globalObj.Buffer = Buffer;
  
  // Also set on window and globalThis for maximum compatibility
  if (typeof window !== 'undefined') {
    (window as any).Buffer = Buffer;
  }
  if (typeof globalThis !== 'undefined') {
    (globalThis as any).Buffer = Buffer;
  }
  
  // Verify Buffer is accessible
  if (typeof globalObj.Buffer === 'undefined') {
    throw new Error('Buffer not set on global object');
  }
  
  console.log('✅ Buffer module loaded and injected globally');
  console.log('✅ Buffer.from available:', typeof Buffer.from === 'function');
} catch (error) {
  console.error('❌ CRITICAL: Failed to load buffer module:', error);
  throw error; // Don't continue if Buffer fails to load
}

// Configure process globally
try {
  if (!globalObj.process) {
    globalObj.process = process;
  }
  
  // Ensure process.env exists
  if (!globalObj.process.env) {
    globalObj.process.env = {};
  }
  
  // Set NODE_ENV
  if (!globalObj.process.env.NODE_ENV) {
    globalObj.process.env.NODE_ENV = 'production';
  }
  
  // Add browser flag
  globalObj.process.browser = true;
  
  // Add nextTick if missing
  if (!globalObj.process.nextTick) {
    globalObj.process.nextTick = (fn: (...args: any[]) => void, ...args: any[]) => {
      setTimeout(() => fn(...args), 0);
    };
  }
  
  // Set process on window/globalThis
  if (typeof window !== 'undefined') {
    (window as any).process = globalObj.process;
  }
  if (typeof globalThis !== 'undefined') {
    (globalThis as any).process = globalObj.process;
  }
  
  console.log('✅ Process module loaded and configured');
} catch (error) {
  console.error('❌ Failed to load process module:', error);
  // Create a minimal process polyfill as fallback
  const minimalProcess = {
    env: { NODE_ENV: 'production' },
    version: '',
    versions: {},
    platform: 'browser',
    browser: true,
    nextTick: (fn: (...args: any[]) => void, ...args: any[]) => setTimeout(() => fn(...args), 0),
  };
  globalObj.process = minimalProcess;
  console.log('⚠️ Using minimal process polyfill');
}

// Configure EventEmitter globally
try {
  globalObj.EventEmitter = EventEmitter;
  if (typeof window !== 'undefined') {
    (window as any).EventEmitter = EventEmitter;
  }
  if (typeof globalThis !== 'undefined') {
    (globalThis as any).EventEmitter = EventEmitter;
  }
  console.log('✅ EventEmitter module loaded');
} catch (error) {
  console.error('❌ Failed to load events module:', error);
}

// Polyfill setImmediate/clearImmediate
if (typeof globalObj.setImmediate === 'undefined') {
  globalObj.setImmediate = (fn: (...args: any[]) => void, ...args: any[]) => {
    return setTimeout(() => fn(...args), 0);
  };
}

if (typeof globalObj.clearImmediate === 'undefined') {
  globalObj.clearImmediate = (id: any) => {
    clearTimeout(id);
  };
}
console.log('✅ setImmediate/clearImmediate configured');

// Crypto polyfills for ethers.js
if (typeof globalObj.crypto === 'undefined') {
  globalObj.crypto = {
    getRandomValues: (arr: any) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    },
  } as any;
  console.log('✅ Crypto polyfill added');
} else if (typeof globalObj.crypto.getRandomValues === 'undefined') {
  globalObj.crypto.getRandomValues = (arr: any) => {
    for (let i = 0; i < arr.length; i++) {
      arr[i] = Math.floor(Math.random() * 256);
    }
    return arr;
  };
  console.log('✅ Crypto.getRandomValues polyfill added');
}

// Verify polyfills are loaded
console.log('');
console.log('🔍 Polyfill Verification:');
console.log('========================');
console.log('✅ Buffer:', typeof globalObj.Buffer !== 'undefined' ? 'OK' : '❌ MISSING');
console.log('✅ Buffer.from:', typeof globalObj.Buffer?.from === 'function' ? 'OK' : '❌ MISSING');
console.log('✅ process:', typeof globalObj.process !== 'undefined' ? 'OK' : '❌ MISSING');
console.log('✅ process.env:', typeof globalObj.process?.env !== 'undefined' ? 'OK' : '❌ MISSING');
console.log('✅ EventEmitter:', typeof globalObj.EventEmitter !== 'undefined' ? 'OK' : '❌ MISSING');
console.log('✅ setImmediate:', typeof globalObj.setImmediate !== 'undefined' ? 'OK' : '❌ MISSING');
console.log('✅ crypto:', typeof globalObj.crypto !== 'undefined' ? 'OK' : '❌ MISSING');
console.log('========================');
console.log('');
console.log('✅ Polyfills loaded successfully!');

// Export empty object to make this a module
export {};
