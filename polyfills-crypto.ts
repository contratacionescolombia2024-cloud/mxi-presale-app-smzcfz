
// Polyfills for crypto functionality in React Native
import { Buffer } from 'buffer';

// Make Buffer available globally
if (typeof global.Buffer === 'undefined') {
  global.Buffer = Buffer;
}

// Polyfill for crypto.getRandomValues if not available
if (typeof global.crypto === 'undefined') {
  global.crypto = {
    getRandomValues: (arr: any) => {
      // Use a simple random number generator
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    },
  } as any;
} else if (typeof global.crypto.getRandomValues === 'undefined') {
  global.crypto.getRandomValues = (arr: any) => {
    for (let i = 0; i < arr.length; i++) {
      arr[i] = Math.floor(Math.random() * 256);
    }
    return arr;
  };
}

export {};
