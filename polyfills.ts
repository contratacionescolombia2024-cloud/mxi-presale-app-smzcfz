
// Polyfills for web compatibility
// Add any necessary polyfills here for web platform

// Ensure global is defined for web
if (typeof global === 'undefined') {
  (window as any).global = window;
}

// Polyfill for process.env if needed
if (typeof process === 'undefined') {
  (window as any).process = { env: {} };
}
