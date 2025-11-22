
// CRITICAL: Ultra-minimal polyfills
// This file must NOT import or use ANY native modules
// It runs BEFORE the React Native bridge is initialized

console.log('🔧 ========== POLYFILLS LOADING ==========');

// URL polyfill - this is safe, pure JavaScript
try {
  console.log('📦 Loading URL polyfill...');
  require('react-native-url-polyfill/auto');
  console.log('✅ URL polyfill loaded');
} catch (error) {
  console.error('❌ Error loading URL polyfill:', error);
}

// Buffer polyfill - safe, pure JavaScript
if (typeof global.Buffer === 'undefined') {
  try {
    console.log('📦 Loading Buffer polyfill...');
    const { Buffer } = require('buffer');
    global.Buffer = Buffer;
    console.log('✅ Buffer polyfill loaded');
  } catch (e) {
    console.warn('⚠️ Buffer polyfill not available:', e);
  }
}

// Process polyfill - safe, pure JavaScript
if (typeof global.process === 'undefined') {
  try {
    console.log('📦 Loading Process polyfill...');
    global.process = require('process');
    console.log('✅ Process polyfill loaded');
  } catch (e) {
    console.warn('⚠️ Process polyfill not available:', e);
  }
}

// Ensure process.version exists
if (typeof global.process !== 'undefined' && typeof global.process.version === 'undefined') {
  global.process.version = 'v16.0.0';
  console.log('✅ Process version set');
}

// Ensure process.env exists
if (typeof global.process !== 'undefined' && typeof global.process.env === 'undefined') {
  global.process.env = {};
  console.log('✅ Process env initialized');
}

console.log('✅ ========== POLYFILLS LOADED SUCCESSFULLY ==========');
