
// CRITICAL: This file MUST be imported FIRST before any other code
// It provides Node.js built-in polyfills for React Native environment

console.log('🔧 Loading polyfills...');

// Import statements instead of require()
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

// Ensure global object exists
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

// Import and configure Buffer - CRITICAL for ethereumjs-util
try {
  // Set Buffer on all possible global objects
  globalObj.Buffer = Buffer;
  
  if (typeof global !== 'undefined') {
    (global as any).Buffer = Buffer;
  }
  
  if (typeof window !== 'undefined') {
    (window as any).Buffer = Buffer;
  }
  
  if (typeof globalThis !== 'undefined') {
    (globalThis as any).Buffer = Buffer;
  }
  
  if (typeof self !== 'undefined') {
    (self as any).Buffer = Buffer;
  }
  
  console.log('✅ Buffer module loaded and injected globally');
  console.log('   Buffer.from:', typeof Buffer.from);
  console.log('   Buffer.alloc:', typeof Buffer.alloc);
} catch (error) {
  console.error('❌ Failed to load buffer module:', error);
  // Create a minimal Buffer polyfill as fallback
  const MinimalBuffer = class Buffer {
    static from(data: any): any {
      return data;
    }
    static alloc(size: number): any {
      return new Uint8Array(size);
    }
    static isBuffer(obj: any): boolean {
      return obj instanceof Uint8Array;
    }
  };
  globalObj.Buffer = MinimalBuffer;
  console.log('⚠️ Using minimal Buffer polyfill');
}

// Import and configure process
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

// Import and configure EventEmitter
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
  // Create a minimal EventEmitter polyfill as fallback
  const MinimalEventEmitter = class EventEmitter {
    private events: Map<string, Array<(...args: any[]) => void>> = new Map();
    
    on(event: string, listener: (...args: any[]) => void) {
      if (!this.events.has(event)) {
        this.events.set(event, []);
      }
      this.events.get(event)!.push(listener);
    }
    
    emit(event: string, ...args: any[]) {
      const listeners = this.events.get(event);
      if (listeners) {
        listeners.forEach(listener => listener(...args));
      }
    }
    
    removeListener(event: string, listener: (...args: any[]) => void) {
      const listeners = this.events.get(event);
      if (listeners) {
        const index = listeners.indexOf(listener);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    }
  };
  globalObj.EventEmitter = MinimalEventEmitter;
  console.log('⚠️ Using minimal EventEmitter polyfill');
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

// Verify polyfills are loaded
console.log('');
console.log('🔍 Polyfill Verification:');
console.log('========================');
console.log('✅ Buffer:', typeof globalObj.Buffer !== 'undefined' ? 'OK' : 'MISSING');
console.log('✅ process:', typeof globalObj.process !== 'undefined' ? 'OK' : 'MISSING');
console.log('✅ process.env:', typeof globalObj.process?.env !== 'undefined' ? 'OK' : 'MISSING');
console.log('✅ EventEmitter:', typeof globalObj.EventEmitter !== 'undefined' ? 'OK' : 'MISSING');
console.log('✅ setImmediate:', typeof globalObj.setImmediate !== 'undefined' ? 'OK' : 'MISSING');
console.log('========================');
console.log('');
console.log('✅ Polyfills loaded successfully!');

// Export empty object to make this a module
export {};
