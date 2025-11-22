
// Basic polyfills for React Native
import 'react-native-url-polyfill/auto';

// Buffer polyfill
if (typeof global.Buffer === 'undefined') {
  try {
    const { Buffer } = require('buffer');
    global.Buffer = Buffer;
  } catch (e) {
    console.warn('Buffer polyfill not available');
  }
}

// Process polyfill
if (typeof global.process === 'undefined') {
  try {
    global.process = require('process');
  } catch (e) {
    console.warn('Process polyfill not available');
  }
}

// Ensure process.version exists
if (typeof global.process !== 'undefined' && typeof global.process.version === 'undefined') {
  global.process.version = 'v16.0.0';
}

// Ensure process.env exists
if (typeof global.process !== 'undefined' && typeof global.process.env === 'undefined') {
  global.process.env = {};
}
