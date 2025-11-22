
// Polyfills for React Native
import 'react-native-url-polyfill/auto';

// CRITICAL: Shim for Web3Modal custom elements on native platforms
// These must be simple objects with no complex dependencies
if (typeof window !== 'undefined' && typeof customElements === 'undefined') {
  // Create a dummy customElements object for native platforms
  // CRITICAL: Use simple functions that don't capture any external variables
  (global as any).customElements = {
    define: function() {},
    get: function() { return undefined; },
    whenDefined: function() { return Promise.resolve(); },
  };
}

// CRITICAL: Shim for Web3Modal button component on native
// Create a simple class with no complex dependencies
if (typeof HTMLElement === 'undefined') {
  (global as any).HTMLElement = class HTMLElement {};
}

console.log('✅ Shims loaded successfully');
