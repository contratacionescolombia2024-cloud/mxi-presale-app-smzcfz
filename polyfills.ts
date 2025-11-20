
// Polyfills for Node.js built-ins required by crypto libraries (ethers.js, WalletConnect, etc.)

// Only run polyfills in appropriate environments
if (typeof window !== 'undefined' || typeof global !== 'undefined') {
  try {
    // Import polyfills
    const { Buffer } = require('buffer');
    const process = require('process/browser');
    const EventEmitter = require('events').EventEmitter;

    // Make Buffer available globally
    if (typeof global !== 'undefined') {
      (global as any).Buffer = Buffer;
      (global as any).process = process;
      (global as any).EventEmitter = EventEmitter;
    }

    // For web environments
    if (typeof window !== 'undefined') {
      (window as any).Buffer = Buffer;
      (window as any).process = process;
      (window as any).EventEmitter = EventEmitter;
      
      // Polyfill for global if not present
      if (!(window as any).global) {
        (window as any).global = window;
      }
      
      // Ensure process.env exists
      if (!process.env) {
        process.env = {};
      }
      
      // Set NODE_ENV if not set
      if (!process.env.NODE_ENV) {
        process.env.NODE_ENV = 'production';
      }
    }

    console.log('✅ Polyfills loaded successfully');
  } catch (error) {
    console.error('❌ Error loading polyfills:', error);
  }
}

export {};
