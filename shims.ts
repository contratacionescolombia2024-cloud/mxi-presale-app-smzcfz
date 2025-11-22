
// Polyfills for React Native
import 'react-native-url-polyfill/auto';

// Shim for Web3Modal custom elements on native platforms
if (typeof window !== 'undefined' && typeof customElements === 'undefined') {
  // Create a dummy customElements object for native platforms
  (global as any).customElements = {
    define: () => {},
    get: () => undefined,
    whenDefined: () => Promise.resolve(),
  };
}

// Shim for Web3Modal button component on native
if (typeof HTMLElement === 'undefined') {
  (global as any).HTMLElement = class {};
}
