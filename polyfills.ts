
// Polyfills for Node.js built-ins required by crypto libraries (ethers.js, WalletConnect, etc.)
// This must be imported FIRST before any other imports

// Import Buffer and process BEFORE anything else
import { Buffer } from 'buffer';
import process from 'process/browser';
import { EventEmitter } from 'events';

// Ensure global exists first
if (typeof global === 'undefined') {
  if (typeof window !== 'undefined') {
    (window as any).global = window;
  } else if (typeof globalThis !== 'undefined') {
    (globalThis as any).global = globalThis;
  }
}

// Get the global object
const globalObj = (typeof global !== 'undefined' ? global : 
                   typeof window !== 'undefined' ? window : 
                   typeof globalThis !== 'undefined' ? globalThis : 
                   {}) as any;

// Make Buffer available globally IMMEDIATELY
globalObj.Buffer = Buffer;
if (typeof window !== 'undefined') {
  (window as any).Buffer = Buffer;
}
if (typeof globalThis !== 'undefined') {
  (globalThis as any).Buffer = Buffer;
}

// Set process globally
globalObj.process = process;
if (typeof window !== 'undefined') {
  (window as any).process = process;
  (window as any).global = window;
}
if (typeof globalThis !== 'undefined') {
  (globalThis as any).process = process;
}

// Set EventEmitter
globalObj.EventEmitter = EventEmitter;
if (typeof window !== 'undefined') {
  (window as any).EventEmitter = EventEmitter;
}
if (typeof globalThis !== 'undefined') {
  (globalThis as any).EventEmitter = EventEmitter;
}

// Ensure process.env exists
if (!process.env) {
  (process as any).env = {};
}

// Set NODE_ENV if not set
if (!process.env.NODE_ENV) {
  (process as any).env.NODE_ENV = 'production';
}

// Add browser flag
(process as any).browser = true;

// Add nextTick if not present
if (!process.nextTick) {
  (process as any).nextTick = (fn: (...args: any[]) => void, ...args: any[]) => {
    setTimeout(() => fn(...args), 0);
  };
}

// Polyfill for setImmediate if not available
if (typeof globalObj.setImmediate === 'undefined') {
  globalObj.setImmediate = (fn: (...args: any[]) => void, ...args: any[]) => {
    setTimeout(() => fn(...args), 0);
  };
}

// Polyfill for clearImmediate if not available
if (typeof globalObj.clearImmediate === 'undefined') {
  globalObj.clearImmediate = (id: any) => {
    clearTimeout(id);
  };
}

console.log('✅ Polyfills loaded successfully');
console.log('✅ Buffer available:', typeof Buffer !== 'undefined');
console.log('✅ process available:', typeof process !== 'undefined');
console.log('✅ global.Buffer available:', typeof globalObj.Buffer !== 'undefined');
console.log('✅ global.process available:', typeof globalObj.process !== 'undefined');

export {};
