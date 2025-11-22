
// Polyfills for React Native
import 'react-native-url-polyfill/auto';

console.log('🔧 Loading shims...');

// CRITICAL: Shim for Web3Modal custom elements on native platforms
// These are simple, serializable objects
if (typeof window !== 'undefined' && typeof customElements === 'undefined') {
  const customElementsShim = {
    define: () => {
      // no-op
    },
    get: () => undefined,
    whenDefined: () => Promise.resolve(),
  };
  
  (global as any).customElements = customElementsShim;
  console.log('✅ customElements shimmed');
}

// CRITICAL: Shim for Web3Modal button component on native
if (typeof HTMLElement === 'undefined') {
  class HTMLElementShim {
    // Empty class for type compatibility
  }
  
  (global as any).HTMLElement = HTMLElementShim;
  console.log('✅ HTMLElement shimmed');
}

console.log('✅ Shims loaded successfully');
