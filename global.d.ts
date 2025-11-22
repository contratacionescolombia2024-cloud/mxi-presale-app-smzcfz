
// Global type definitions for polyfills

declare global {
  var Buffer: typeof import('buffer').Buffer;
  var process: NodeJS.Process;
  var EventEmitter: typeof import('events').EventEmitter;
  
  interface Window {
    Buffer: typeof import('buffer').Buffer;
    process: NodeJS.Process;
    EventEmitter: typeof import('events').EventEmitter;
  }
}

export {};
