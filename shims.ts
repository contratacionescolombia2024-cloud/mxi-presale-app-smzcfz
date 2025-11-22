
// Shims for native modules that might not be available immediately
// This file provides fallbacks to prevent crashes during initialization

console.log('🔧 Loading shims...');

// Ensure global objects exist
if (typeof global !== 'undefined') {
  // Ensure window exists
  if (typeof (global as any).window === 'undefined') {
    (global as any).window = global;
  }

  // Ensure document exists (minimal)
  if (typeof (global as any).document === 'undefined') {
    (global as any).document = {
      createElement: () => ({}),
      createEvent: () => ({ type: '', initEvent: () => {} }),
      documentElement: {},
      body: {},
      head: {},
    };
  }

  // Ensure location exists
  if (typeof (global as any).location === 'undefined') {
    (global as any).location = {
      href: 'https://localhost/',
      protocol: 'https:',
      host: 'localhost',
      hostname: 'localhost',
      port: '',
      pathname: '/',
      search: '',
      hash: '',
      origin: 'https://localhost',
    };
  }

  // Ensure navigator exists
  if (typeof (global as any).navigator === 'undefined') {
    (global as any).navigator = {
      userAgent: 'React Native',
      product: 'ReactNative',
    };
  }
}

console.log('✅ Shims loaded');
