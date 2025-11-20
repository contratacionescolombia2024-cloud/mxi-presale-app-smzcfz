
// Global type declarations for polyfills

import { Buffer } from 'buffer';

declare global {
  var Buffer: typeof Buffer;
  var process: NodeJS.Process;
  
  interface Window {
    Buffer: typeof Buffer;
    process: NodeJS.Process;
    global: typeof globalThis;
    ethereum?: any;
  }
}

export {};
