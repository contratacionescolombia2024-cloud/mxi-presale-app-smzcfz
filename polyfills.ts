
// CRITICAL: Minimal polyfills - only what's absolutely necessary
// NO complex objects, NO closures, NO non-serializable code

console.log('🔧 Loading minimal polyfills...');

// Get global object
const globalObj = typeof globalThis !== 'undefined' ? globalThis : 
                  typeof global !== 'undefined' ? global : 
                  typeof window !== 'undefined' ? window : {};

// Ensure global exists
if (typeof global === 'undefined') {
  (globalObj as any).global = globalObj;
}

// Minimal process polyfill
if (!globalObj.process) {
  globalObj.process = {
    env: { NODE_ENV: 'production' },
    version: 'v16.0.0',
    platform: 'browser',
    browser: true,
    nextTick: (cb: any) => setTimeout(cb, 0),
  };
}

// Minimal Buffer polyfill
if (!globalObj.Buffer) {
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
}

// setImmediate polyfill
if (!globalObj.setImmediate) {
  globalObj.setImmediate = (cb: any) => setTimeout(cb, 0);
}

if (!globalObj.clearImmediate) {
  globalObj.clearImmediate = (id: any) => clearTimeout(id);
}

console.log('✅ Minimal polyfills loaded');

export {};
