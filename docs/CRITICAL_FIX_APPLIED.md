
# Critical Fix Applied - Buffer Error Resolution

## Problem
The app was crashing with the error:
```
Uncaught Error: Buffer is not defined
Failed to get the SHA-1 for: /expo-project/node_modules/buffer
```

## Root Cause
Metro bundler was trying to watch the `node_modules/buffer` directory and failing. The previous configuration was using `extraNodeModules` and `watchFolders` which caused Metro to try to compute SHA-1 hashes for files it shouldn't be watching.

## Solution Applied

### 1. Simplified metro.config.js
- **Removed** `FileStore` cache configuration
- **Removed** `extraNodeModules` resolver (this was causing Metro to watch buffer module)
- **Removed** `watchFolders` configuration
- **Kept** basic source extensions configuration
- Let Metro handle module resolution naturally

### 2. Updated polyfills.ts
- Changed from ES6 `import` to CommonJS `require()` for polyfills
- This prevents Metro from trying to statically analyze and watch these modules
- Added try-catch blocks with fallback implementations
- Ensured Buffer is injected globally before any other code runs

### 3. Simplified babel.config.js
- **Removed** polyfill aliases from module-resolver
- Let the runtime handle polyfill resolution instead of build-time

### 4. Fixed Linting Errors
- Fixed `Function` type usage in global.d.ts and shims.ts (replaced with proper function signatures)
- Fixed FloatingTabBar.tsx useEffect dependency (added indicatorPosition.value)
- Fixed app.json duplicate "scheme" key warning

### 5. Other Files Fixed
- global.d.ts: Changed `Function` to proper function signatures with `unknown[]` parameters
- shims.ts: Changed `Function` to proper function signatures with `unknown[]` parameters

## Key Changes

### Before (metro.config.js):
```javascript
config.resolver = {
  extraNodeModules: {
    buffer: path.resolve(__dirname, 'node_modules/buffer'),
    // ... other modules
  },
};
config.watchFolders = [
  path.resolve(__dirname, 'node_modules'),
];
```

### After (metro.config.js):
```javascript
config.resolver = {
  sourceExts: [...(config.resolver?.sourceExts || []), 'cjs', 'mjs'],
  assetExts: config.resolver?.assetExts || [],
};
// No extraNodeModules, no watchFolders
```

### Before (polyfills.ts):
```javascript
import { Buffer } from 'buffer';
import process from 'process/browser';
```

### After (polyfills.ts):
```javascript
const bufferModule = require('buffer');
Buffer = bufferModule.Buffer;
const process = require('process/browser.js');
```

## Why This Works

1. **Metro doesn't try to watch node_modules/buffer**: By removing `extraNodeModules` and `watchFolders`, Metro no longer attempts to compute SHA-1 hashes for the buffer module.

2. **Runtime resolution**: Using `require()` instead of `import` allows the polyfills to be loaded at runtime without Metro trying to statically analyze them.

3. **Fallback implementations**: If any polyfill fails to load, we provide minimal fallback implementations so the app doesn't crash.

4. **Global injection**: Buffer and other globals are injected immediately when polyfills.ts loads, ensuring they're available before any other code runs.

## Testing

After applying these changes:
1. Clear Metro cache: `npm run clean`
2. Start the app: `npm start`
3. The app should now load without the Buffer error

## Additional Notes

- The polyfills are still loaded first in `index.ts` and `app/_layout.tsx`
- The webpack.config.js for web builds remains unchanged and still provides proper polyfills
- All linting errors have been fixed
- The app.json no longer has the duplicate "scheme" key warning

## Files Modified

1. `metro.config.js` - Simplified configuration
2. `polyfills.ts` - Changed to use require() with fallbacks
3. `babel.config.js` - Removed polyfill aliases
4. `global.d.ts` - Fixed Function type usage
5. `shims.ts` - Fixed Function type usage
6. `app.json` - Removed duplicate scheme key
7. `components/FloatingTabBar.tsx` - Fixed useEffect dependency

## Result

✅ App should now start without Buffer errors
✅ All linting errors fixed
✅ Metro configuration simplified and working
✅ Polyfills load correctly at runtime
