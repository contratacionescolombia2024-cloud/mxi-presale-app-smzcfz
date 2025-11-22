
// CRITICAL: Ultra-minimal polyfills
// This file must NOT import or use ANY native modules
// It runs BEFORE the React Native bridge is initialized

console.log('🔧 ========== POLYFILLS LOADING ==========');

// URL polyfill - this is safe, pure JavaScript
try {
  console.log('📦 Loading URL polyfill...');
  import('react-native-url-polyfill/auto');
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

// CRITICAL: Detect platform WITHOUT importing React Native
// We check for web-specific globals instead
const isWeb = typeof window !== 'undefined' && 
              typeof window.document !== 'undefined' && 
              typeof window.navigator !== 'undefined';

console.log('🌍 Platform detected:', isWeb ? 'web' : 'native');

if (!isWeb) {
  console.log('📱 Adding native platform polyfills...');
  
  // Create minimal window object if needed
  if (typeof window === 'undefined') {
    console.log('🔧 Creating window object...');
    (global as any).window = global;
  }

  // Minimal event system - pure JavaScript, no native modules
  if (typeof (global as any).window.addEventListener !== 'function') {
    console.log('🔧 Adding event system...');
    const eventListeners: { [key: string]: Array<(event: any) => void> } = {};
    
    (global as any).window.addEventListener = function(type: string, listener: (event: any) => void) {
      if (!eventListeners[type]) {
        eventListeners[type] = [];
      }
      if (!eventListeners[type].includes(listener)) {
        eventListeners[type].push(listener);
      }
    };
    
    (global as any).window.removeEventListener = function(type: string, listener: (event: any) => void) {
      if (eventListeners[type]) {
        const index = eventListeners[type].indexOf(listener);
        if (index > -1) {
          eventListeners[type].splice(index, 1);
        }
      }
    };
    
    (global as any).window.dispatchEvent = function(event: any) {
      const type = event.type || event;
      if (eventListeners[type]) {
        eventListeners[type].forEach(listener => {
          try {
            listener(event);
          } catch (error) {
            console.error(`Error in ${type} listener:`, error);
          }
        });
      }
      return true;
    };
    
    console.log('✅ Event system added');
  }

  // Minimal location polyfill
  if (typeof (global as any).window.location === 'undefined') {
    console.log('🔧 Adding location polyfill...');
    (global as any).window.location = {
      href: 'https://localhost/',
      protocol: 'https:',
      host: 'localhost',
      hostname: 'localhost',
      port: '',
      pathname: '/',
      search: '',
      hash: '',
      origin: 'https://localhost',
      assign: () => {},
      reload: () => {},
      replace: () => {},
    };
    console.log('✅ Location polyfill added');
  }

  // Minimal document polyfill
  if (typeof (global as any).document === 'undefined') {
    console.log('🔧 Adding document polyfill...');
    (global as any).document = {
      addEventListener: (global as any).window.addEventListener,
      removeEventListener: (global as any).window.removeEventListener,
      dispatchEvent: (global as any).window.dispatchEvent,
      createElement: () => ({}),
      createEvent: () => ({ type: '', initEvent: () => {} }),
      documentElement: {},
      body: {},
      head: {},
    };
    console.log('✅ Document polyfill added');
  }
}

console.log('✅ ========== POLYFILLS LOADED SUCCESSFULLY ==========');
