
// Additional shims for React Native environment
// This provides extra compatibility layers for Node.js built-ins

console.log('🔧 Loading shims...');

// Ensure global exists
if (typeof global === 'undefined') {
  if (typeof window !== 'undefined') {
    (window as any).global = window;
  } else if (typeof globalThis !== 'undefined') {
    (globalThis as any).global = globalThis;
  }
}

// Get global reference
const globalObj = typeof global !== 'undefined' ? global : (typeof window !== 'undefined' ? window : globalThis);

// Minimal process implementation if not already set
if (typeof (globalObj as any).process === 'undefined') {
  (globalObj as any).process = {
    env: { NODE_ENV: 'production' },
    version: '',
    versions: {},
    platform: 'browser',
    browser: true,
    nextTick: (fn: (...args: unknown[]) => void, ...args: unknown[]) => {
      setTimeout(() => fn(...args), 0);
    },
  };
}

// setImmediate polyfill
if (typeof (globalObj as any).setImmediate === 'undefined') {
  (globalObj as any).setImmediate = (fn: (...args: unknown[]) => void, ...args: unknown[]) => {
    return setTimeout(() => fn(...args), 0);
  };
}

// clearImmediate polyfill
if (typeof (globalObj as any).clearImmediate === 'undefined') {
  (globalObj as any).clearImmediate = (id: unknown) => {
    clearTimeout(id as number);
  };
}

// TextEncoder/TextDecoder polyfills for crypto operations
if (typeof (globalObj as any).TextEncoder === 'undefined') {
  (globalObj as any).TextEncoder = class TextEncoder {
    encode(str: string): Uint8Array {
      const utf8: number[] = [];
      for (let i = 0; i < str.length; i++) {
        let charcode = str.charCodeAt(i);
        if (charcode < 0x80) utf8.push(charcode);
        else if (charcode < 0x800) {
          utf8.push(0xc0 | (charcode >> 6), 0x80 | (charcode & 0x3f));
        } else if (charcode < 0xd800 || charcode >= 0xe000) {
          utf8.push(0xe0 | (charcode >> 12), 0x80 | ((charcode >> 6) & 0x3f), 0x80 | (charcode & 0x3f));
        } else {
          i++;
          charcode = 0x10000 + (((charcode & 0x3ff) << 10) | (str.charCodeAt(i) & 0x3ff));
          utf8.push(
            0xf0 | (charcode >> 18),
            0x80 | ((charcode >> 12) & 0x3f),
            0x80 | ((charcode >> 6) & 0x3f),
            0x80 | (charcode & 0x3f)
          );
        }
      }
      return new Uint8Array(utf8);
    }
  };
}

if (typeof (globalObj as any).TextDecoder === 'undefined') {
  (globalObj as any).TextDecoder = class TextDecoder {
    decode(bytes: Uint8Array): string {
      let str = '';
      let i = 0;
      while (i < bytes.length) {
        const byte1 = bytes[i++];
        if (byte1 < 0x80) {
          str += String.fromCharCode(byte1);
        } else if (byte1 >= 0xc0 && byte1 < 0xe0) {
          const byte2 = bytes[i++];
          str += String.fromCharCode(((byte1 & 0x1f) << 6) | (byte2 & 0x3f));
        } else if (byte1 >= 0xe0 && byte1 < 0xf0) {
          const byte2 = bytes[i++];
          const byte3 = bytes[i++];
          str += String.fromCharCode(((byte1 & 0x0f) << 12) | ((byte2 & 0x3f) << 6) | (byte3 & 0x3f));
        } else {
          const byte2 = bytes[i++];
          const byte3 = bytes[i++];
          const byte4 = bytes[i++];
          const codepoint =
            ((byte1 & 0x07) << 18) | ((byte2 & 0x3f) << 12) | ((byte3 & 0x3f) << 6) | (byte4 & 0x3f);
          const high = ((codepoint - 0x10000) >> 10) | 0xd800;
          const low = ((codepoint - 0x10000) & 0x3ff) | 0xdc00;
          str += String.fromCharCode(high, low);
        }
      }
      return str;
    }
  };
}

console.log('✅ Shims loaded successfully');

export {};
