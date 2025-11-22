
// CRITICAL: Minimal polyfills - only what's absolutely necessary
// Avoid importing large packages that could cause bundling issues

import { Platform } from 'react-native';

// URL polyfill for React Native
import 'react-native-url-polyfill/auto';

// Only add Buffer and process if they don't exist
if (typeof global.Buffer === 'undefined') {
  try {
    global.Buffer = require('buffer').Buffer;
  } catch (e) {
    console.warn('Buffer polyfill not available');
  }
}

if (typeof global.process === 'undefined') {
  try {
    global.process = require('process');
  } catch (e) {
    console.warn('Process polyfill not available');
  }
}

if (typeof global.process !== 'undefined' && typeof global.process.version === 'undefined') {
  global.process.version = 'v16.0.0';
}

// CRITICAL FIX: Add window polyfill for React Native
// This prevents "window.addEventListener is not a function" errors
if (Platform.OS !== 'web') {
  // Create a minimal window object if it doesn't exist
  if (typeof window === 'undefined') {
    (global as any).window = global;
  }

  // Add addEventListener polyfill if it doesn't exist
  if (typeof (global as any).window.addEventListener === 'undefined') {
    console.log('🔧 Adding window.addEventListener polyfill for native platform');
    
    const listeners: { [key: string]: Array<(event: any) => void> } = {};
    
    (global as any).window.addEventListener = function(type: string, listener: (event: any) => void) {
      if (!listeners[type]) {
        listeners[type] = [];
      }
      listeners[type].push(listener);
      console.log(`✅ addEventListener: ${type} listener added`);
    };
    
    (global as any).window.removeEventListener = function(type: string, listener: (event: any) => void) {
      if (listeners[type]) {
        const index = listeners[type].indexOf(listener);
        if (index > -1) {
          listeners[type].splice(index, 1);
          console.log(`✅ removeEventListener: ${type} listener removed`);
        }
      }
    };
    
    (global as any).window.dispatchEvent = function(event: any) {
      const type = event.type || event;
      if (listeners[type]) {
        listeners[type].forEach(listener => {
          try {
            listener(event);
          } catch (error) {
            console.error(`Error in ${type} listener:`, error);
          }
        });
      }
      return true;
    };
  }

  // Add location polyfill if it doesn't exist
  if (typeof (global as any).window.location === 'undefined') {
    console.log('🔧 Adding window.location polyfill for native platform');
    (global as any).window.location = {
      href: '',
      protocol: 'https:',
      host: 'localhost',
      hostname: 'localhost',
      port: '',
      pathname: '/',
      search: '',
      hash: '',
      origin: 'https://localhost',
    };
  }

  // Add document polyfill if it doesn't exist
  if (typeof (global as any).document === 'undefined') {
    console.log('🔧 Adding document polyfill for native platform');
    (global as any).document = {
      addEventListener: (global as any).window.addEventListener,
      removeEventListener: (global as any).window.removeEventListener,
      dispatchEvent: (global as any).window.dispatchEvent,
      createElement: () => ({}),
      createEvent: () => ({ type: '', initEvent: () => {} }),
    };
  }
}

console.log('✅ Polyfills loaded successfully');
