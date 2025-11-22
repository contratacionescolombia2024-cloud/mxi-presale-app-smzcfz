
// Polyfills for React Native
import 'react-native-url-polyfill/auto';

// CRITICAL: Shim for Web3Modal custom elements on native platforms
if (typeof window !== 'undefined' && typeof customElements === 'undefined') {
  (global as any).customElements = {
    define: () => {},
    get: () => undefined,
    whenDefined: () => Promise.resolve(),
  };
}

// CRITICAL: Shim for Web3Modal button component on native
if (typeof HTMLElement === 'undefined') {
  (global as any).HTMLElement = class HTMLElement {};
}

console.log('✅ Shims loaded successfully');
