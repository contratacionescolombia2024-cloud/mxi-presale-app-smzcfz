
// CRITICAL: This file MUST be imported FIRST before any other code
// It provides Node.js built-in polyfills for React Native environment

console.log('🔧 Loading polyfills...');

// Import polyfills dynamically to avoid Metro watching issues
let Buffer: any;
let process: any;
let EventEmitter: any;

try {
  // Use require instead of import to avoid Metro issues
  const bufferModule = require('buffer');
  Buffer = bufferModule.Buffer;
  console.log('✅ Buffer module loaded');
} catch (error) {
  console.error('❌ Failed to load buffer module:', error);
  // Create a minimal Buffer polyfill
  Buffer = class Buffer {
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
}

try {
  process = require('process/browser.js');
  console.log('✅ Process module loaded');
} catch (error) {
  console.error('❌ Failed to load process module:', error);
  // Create a minimal process polyfill
  process = {
    env: { NODE_ENV: 'production' },
    version: '',
    versions: {},
    platform: 'browser',
    browser: true,
    nextTick: (fn: any, ...args: any[]) => setTimeout(() => fn(...args), 0),
  };
}

try {
  const eventsModule = require('events');
  EventEmitter = eventsModule.EventEmitter;
  console.log('✅ Events module loaded');
} catch (error) {
  console.error('❌ Failed to load events module:', error);
  // Create a minimal EventEmitter polyfill
  EventEmitter = class EventEmitter {
    private events: Map<string, Function[]> = new Map();
    
    on(event: string, listener: Function) {
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
    
    removeListener(event: string, listener: Function) {
      const listeners = this.events.get(event);
      if (listeners) {
        const index = listeners.indexOf(listener);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    }
  };
}

// Get reference to the global object
const getGlobal = (): any => {
  if (typeof global !== 'undefined') return global;
  if (typeof window !== 'undefined') return window;
  if (typeof globalThis !== 'undefined') return globalThis;
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
  } else {
    (self as any).global = self;
  }
}

console.log('✅ Global object configured');

// Inject Buffer globally IMMEDIATELY
globalObj.Buffer = Buffer;
if (typeof window !== 'undefined') {
  (window as any).Buffer = Buffer;
}
if (typeof globalThis !== 'undefined') {
  (globalThis as any).Buffer = Buffer;
}
console.log('✅ Buffer injected globally');

// Configure process object
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
  (window as any).global = window;
}
if (typeof globalThis !== 'undefined') {
  (globalThis as any).process = globalObj.process;
}
console.log('✅ Process configured globally');

// Set EventEmitter
globalObj.EventEmitter = EventEmitter;
if (typeof window !== 'undefined') {
  (window as any).EventEmitter = EventEmitter;
}
if (typeof globalThis !== 'undefined') {
  (globalThis as any).EventEmitter = EventEmitter;
}
console.log('✅ EventEmitter configured');

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
console.log('✅ Buffer:', typeof Buffer !== 'undefined' ? 'OK' : 'MISSING');
console.log('✅ global.Buffer:', typeof globalObj.Buffer !== 'undefined' ? 'OK' : 'MISSING');
console.log('✅ process:', typeof process !== 'undefined' ? 'OK' : 'MISSING');
console.log('✅ global.process:', typeof globalObj.process !== 'undefined' ? 'OK' : 'MISSING');
console.log('✅ process.env:', typeof globalObj.process.env !== 'undefined' ? 'OK' : 'MISSING');
console.log('✅ setImmediate:', typeof globalObj.setImmediate !== 'undefined' ? 'OK' : 'MISSING');
console.log('========================');
console.log('');
console.log('✅ Polyfills loaded successfully!');

// Export empty object to make this a module
export {};
