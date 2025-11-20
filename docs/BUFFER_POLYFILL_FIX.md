
# Buffer Polyfill Fix for Crypto Libraries

## Problem
The error "Buffer is not defined" occurs when using cryptographic libraries like `ethers.js` and `@walletconnect/web3-provider` in React Native/Expo environments. These libraries depend on Node.js built-in modules like `Buffer`, `process`, `stream`, and `crypto` which are not available in browser or React Native JavaScript environments by default.

## Solution
We've implemented comprehensive polyfills to make these Node.js built-ins available across all platforms (iOS, Android, and Web).

## Changes Made

### 1. Installed Polyfill Dependencies
```bash
npm install buffer process stream-browserify crypto-browserify events
```

These packages provide browser-compatible implementations of Node.js built-ins.

### 2. Created Polyfill File (`polyfills.ts`)
This file imports and configures all necessary polyfills, making them available globally:
- `Buffer` - for binary data handling
- `process` - for process environment variables
- `EventEmitter` - for event handling
- Sets up `global` object for web environments

### 3. Updated Entry Point (`index.ts`)
```typescript
// Import polyfills first, before anything else
import './polyfills';

// Then import expo-router entry
import 'expo-router/entry';
```

The polyfills MUST be imported before any other code to ensure they're available when crypto libraries are loaded.

### 4. Updated App Layout (`app/_layout.tsx`)
Added polyfill import at the very top:
```typescript
// Import polyfills at the very top
import '../polyfills';
```

### 5. Updated Metro Config (`metro.config.js`)
Added resolver configuration to map Node.js modules to their browser-compatible equivalents:
```javascript
config.resolver = {
  ...config.resolver,
  extraNodeModules: {
    buffer: require.resolve('buffer/'),
    stream: require.resolve('stream-browserify'),
    crypto: require.resolve('crypto-browserify'),
    events: require.resolve('events/'),
    process: require.resolve('process/browser'),
  },
};
```

### 6. Updated Babel Config (`babel.config.js`)
Added module aliases for polyfills:
```javascript
alias: {
  "buffer": "buffer",
  "stream": "stream-browserify",
  "crypto": "crypto-browserify",
  "events": "events",
  "process": "process/browser",
}
```

### 7. Created Webpack Config (`webpack.config.js`)
For web builds, configured webpack to:
- Add fallback resolvers for Node.js modules
- Inject `Buffer` and `process` globally using `ProvidePlugin`

### 8. Added Type Declarations (`global.d.ts`)
Created TypeScript declarations for the global polyfills to avoid type errors.

### 9. Updated TypeScript Config (`tsconfig.json`)
Included `global.d.ts` in the TypeScript compilation.

## How It Works

1. **Polyfills are loaded first** - Before any application code runs, the polyfills set up the global environment
2. **Metro/Webpack resolves imports** - When crypto libraries try to import Node.js modules, they're redirected to browser-compatible versions
3. **Globals are available** - `Buffer`, `process`, etc. are available globally for libraries that expect them
4. **Platform-specific handling** - The polyfills work across iOS, Android, and Web platforms

## Testing

After implementing these changes:

1. **Clear cache and restart**:
   ```bash
   npm start -- --clear
   ```

2. **Test MetaMask connection** on web browser
3. **Test WalletConnect** on web browser
4. **Verify no "Buffer is not defined" errors** in console

## Important Notes

- ⚠️ **Order matters**: Polyfills MUST be imported before any other code
- 🌐 **Web-only features**: MetaMask and WalletConnect only work in web browsers, not in native iOS/Android apps
- 🔄 **Cache clearing**: If you still see errors, clear Metro bundler cache: `npm start -- --clear`
- 📦 **Bundle size**: Polyfills add ~100KB to bundle size, but this is necessary for crypto functionality

## Troubleshooting

### Still seeing "Buffer is not defined"?
1. Clear Metro cache: `npm start -- --clear`
2. Clear node_modules and reinstall: `rm -rf node_modules && npm install`
3. Check that polyfills are imported at the very top of `index.ts` and `app/_layout.tsx`

### Errors on native platforms?
MetaMask and WalletConnect are web-only. The components should show appropriate messages on iOS/Android.

### TypeScript errors?
Make sure `global.d.ts` is included in `tsconfig.json` and restart your TypeScript server.

## References

- [Buffer polyfill](https://www.npmjs.com/package/buffer)
- [Process polyfill](https://www.npmjs.com/package/process)
- [Ethers.js documentation](https://docs.ethers.org/)
- [WalletConnect documentation](https://docs.walletconnect.com/)
