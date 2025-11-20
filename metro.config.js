
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Remove the FileStore cache configuration that might be causing issues
config.cacheStores = [];

// Configure resolver with proper node module handling
config.resolver = {
  ...config.resolver,
  // Don't use extraNodeModules - this causes Metro to try to watch these files
  // Instead, we'll handle polyfills at runtime
  sourceExts: [...(config.resolver?.sourceExts || []), 'cjs', 'mjs'],
  assetExts: config.resolver?.assetExts || [],
  // Explicitly exclude problematic node_modules from being watched
  blockList: [
    // Don't block anything - let Metro handle it naturally
  ],
};

// Simplify transformer configuration
config.transformer = {
  ...config.transformer,
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
  }),
};

// Don't add watchFolders - this was causing the SHA-1 error
// Metro will watch what it needs to watch

module.exports = config;
