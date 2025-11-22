
// CRITICAL: This file MUST be imported FIRST before any other code
// It provides Node.js built-in polyfills for React Native environment
// IMPORTANT: Uses ONLY simple, serializable objects to avoid worklets errors

console.log('🔧 Loading polyfills...');

// CRITICAL: Get reference to the global object FIRST
// Use a simple function that returns the global object
function getGlobalObject(): any {
  if (typeof globalThis !== 'undefined') return globalThis;
  if (typeof global !== 'undefined') return global;
  if (typeof window !== 'undefined') return window;
  if (typeof self !== 'undefined') return self;
  return {};
}

const globalObj = getGlobalObject();

// Ensure global object exists BEFORE anything else
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

// CRITICAL: Polyfill process with ONLY simple, serializable objects
// No complex objects, no closures, no external dependencies
try {
  if (!globalObj.process) {
    // Create simple process object with only primitive values and simple functions
    // CRITICAL: All functions must be simple and not capture any external variables
    globalObj.process = {
      env: { NODE_ENV: 'production' },
      version: 'v16.0.0',
      versions: { node: '16.0.0' },
      platform: 'browser',
      browser: true,
      nextTick: function(callback: Function, ...args: any[]) {
        setTimeout(function() { callback(...args); }, 0);
      },
      cwd: function() { return '/'; },
      chdir: function() {},
      umask: function() { return 0; },
    };
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
  
  // Add nextTick if missing (simple function, no closures)
  if (!globalObj.process.nextTick) {
    globalObj.process.nextTick = function(callback: Function, ...args: any[]) {
      setTimeout(function() { callback(...args); }, 0);
    };
  }
  
  // Set process on window/globalThis
  if (typeof window !== 'undefined') {
    (window as any).process = globalObj.process;
  }
  if (typeof globalThis !== 'undefined') {
    (globalThis as any).process = globalObj.process;
  }
  
  console.log('✅ Process module polyfilled');
} catch (error) {
  console.error('❌ Failed to polyfill process:', error);
}

// Import Buffer after process is set up
import { Buffer } from 'buffer';

try {
  globalObj.Buffer = Buffer;
  if (typeof window !== 'undefined') {
    (window as any).Buffer = Buffer;
  }
  if (typeof globalThis !== 'undefined') {
    (globalThis as any).Buffer = Buffer;
  }
  console.log('✅ Buffer module loaded');
} catch (error) {
  console.error('❌ Failed to load buffer:', error);
  
  // Create a minimal Buffer polyfill as fallback (simple class, no complex objects)
  class MinimalBuffer {
    static from(data: any): any {
      if (typeof data === 'string') {
        return new TextEncoder().encode(data);
      }
      return data;
    }
    static alloc(size: number): any {
      return new Uint8Array(size);
    }
    static isBuffer(obj: any): boolean {
      return obj instanceof Uint8Array;
    }
  }
  globalObj.Buffer = MinimalBuffer;
  console.log('⚠️ Using minimal Buffer polyfill');
}

// Import EventEmitter
import { EventEmitter } from 'events';

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
  console.error('❌ Failed to load events:', error);
}

// CRITICAL: Polyfill setImmediate/clearImmediate with simple functions
// These must be simple functions that don't capture any external variables
if (typeof globalObj.setImmediate === 'undefined') {
  globalObj.setImmediate = function(callback: Function, ...args: any[]) {
    return setTimeout(function() { callback(...args); }, 0);
  };
}

if (typeof globalObj.clearImmediate === 'undefined') {
  globalObj.clearImmediate = function(id: any) {
    clearTimeout(id);
  };
}

// Polyfill crypto for web (simple object reference)
if (typeof window !== 'undefined' && typeof globalObj.crypto === 'undefined') {
  if (typeof window.crypto !== 'undefined') {
    globalObj.crypto = window.crypto;
  }
}

// CRITICAL: Polyfill crypto.getRandomValues with simple function
if (typeof globalObj.crypto !== 'undefined' && typeof globalObj.crypto.getRandomValues === 'undefined') {
  globalObj.crypto.getRandomValues = function(array: any) {
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
    return array;
  };
}

console.log('✅ setImmediate/clearImmediate configured');

// Verify polyfills are loaded
console.log('');
console.log('🔍 Polyfill Verification:');
console.log('========================');
console.log('✅ global:', typeof globalObj !== 'undefined' ? 'OK' : 'MISSING');
console.log('✅ Buffer:', typeof globalObj.Buffer !== 'undefined' ? 'OK' : 'MISSING');
console.log('✅ process:', typeof globalObj.process !== 'undefined' ? 'OK' : 'MISSING');
console.log('✅ process.env:', typeof globalObj.process?.env !== 'undefined' ? 'OK' : 'MISSING');
console.log('✅ EventEmitter:', typeof globalObj.EventEmitter !== 'undefined' ? 'OK' : 'MISSING');
console.log('✅ setImmediate:', typeof globalObj.setImmediate !== 'undefined' ? 'OK' : 'MISSING');
console.log('✅ crypto:', typeof globalObj.crypto !== 'undefined' ? 'OK' : 'MISSING');
console.log('========================');
console.log('');
console.log('✅ Polyfills loaded successfully!');

// Export empty object to make this a module
export {};
