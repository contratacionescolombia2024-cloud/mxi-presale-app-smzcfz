
// CRITICAL: Minimal polyfills - only what's absolutely necessary
// Avoid importing large packages that could cause bundling issues

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

console.log('✅ Polyfills loaded successfully');
