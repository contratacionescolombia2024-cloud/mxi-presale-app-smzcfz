
// Minimal shims for React Native
import 'react-native-url-polyfill/auto';

console.log('🔧 Loading minimal shims...');

// Shim customElements for native
if (typeof customElements === 'undefined') {
  (global as any).customElements = {
    define: () => {},
    get: () => undefined,
    whenDefined: () => Promise.resolve(),
  };
}

// Shim HTMLElement for native
if (typeof HTMLElement === 'undefined') {
  (global as any).HTMLElement = class {};
}

console.log('✅ Minimal shims loaded');
