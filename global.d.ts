
// Global type declarations for polyfills

import { Buffer } from 'buffer';

declare global {
  var Buffer: typeof Buffer;
  var process: NodeJS.Process;
  
  namespace NodeJS {
    interface Process {
      env: {
        [key: string]: string | undefined;
        NODE_ENV?: string;
      };
      version: string;
      versions: {
        node?: string;
        [key: string]: string | undefined;
      };
      platform: string;
      browser?: boolean;
      nextTick: (callback: (...args: unknown[]) => void, ...args: unknown[]) => void;
    }
    
    interface Global {
      Buffer: typeof Buffer;
      process: Process;
    }
  }
  
  interface Window {
    Buffer: typeof Buffer;
    process: NodeJS.Process;
    global: typeof globalThis;
    ethereum?: unknown;
  }

  // Fix for setImmediate/clearImmediate
  function setImmediate(callback: (...args: unknown[]) => void, ...args: unknown[]): number;
  function clearImmediate(id: number): void;
}

export {};
