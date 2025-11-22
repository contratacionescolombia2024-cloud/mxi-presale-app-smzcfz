
const { getDefaultConfig } = require('expo/metro-config');
const { FileStore } = require('metro-cache');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Use file cache for better performance
config.cacheStores = [
  new FileStore({ root: path.join(__dirname, 'node_modules', '.cache', 'metro') }),
];

// Enhanced resolver configuration
config.resolver = {
  ...config.resolver,
  
  // Enable package exports for better module resolution
  unstable_enablePackageExports: true,
  unstable_conditionNames: ['react-native', 'browser', 'require'],
  
  // Platform-specific extensions in order of priority
  sourceExts: [
    'expo.tsx',
    'expo.ts',
    'expo.js',
    'native.tsx',
    'native.ts',
    'native.js',
    'ios.tsx',
    'ios.ts',
    'ios.js',
    'android.tsx',
    'android.ts',
    'android.js',
    'web.tsx',
    'web.ts',
    'web.js',
    'tsx',
    'ts',
    'jsx',
    'js',
    'json',
    'mjs',
    'cjs',
  ],
  
  // Asset extensions
  assetExts: [
    ...(config.resolver?.assetExts || []),
    'png',
    'jpg',
    'jpeg',
    'gif',
    'webp',
    'svg',
    'ttf',
    'otf',
    'woff',
    'woff2',
  ],
};

// Transformer configuration
config.transformer = {
  ...config.transformer,
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
  }),
  // Enable minification for better performance
  minifierConfig: {
    keep_classnames: true,
    keep_fnames: true,
    mangle: {
      keep_classnames: true,
      keep_fnames: true,
    },
  },
};

// Server configuration
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      // Add CORS headers for web
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      
      return middleware(req, res, next);
    };
  },
};

module.exports = config;
