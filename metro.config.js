
const { getDefaultConfig } = require('expo/metro-config');
const { FileStore } = require('metro-cache');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Use turborepo to restore the cache when possible
config.cacheStores = [
  new FileStore({ root: path.join(__dirname, 'node_modules', '.cache', 'metro') }),
];

// Configure resolver to handle Web3 packages and block problematic modules
config.resolver = {
  ...config.resolver,
  unstable_enablePackageExports: true,
  unstable_conditionNames: ['react-native', 'browser', 'require'],
  sourceExts: [...(config.resolver?.sourceExts || []), 'mjs', 'cjs'],
  
  resolveRequest: (context, moduleName, platform) => {
    // CRITICAL: Block ALL problematic packages that cause WorkletsError
    const blockedPackages = [
      'react-native-reanimated',
      'react-native-worklets',
      'expo-blur',
      'expo-glass-effect',
    ];

    // Block on ALL platforms
    for (const pkg of blockedPackages) {
      if (moduleName.includes(pkg)) {
        console.log(`[Metro] BLOCKING ${moduleName} - causes WorkletsError`);
        return { type: 'empty' };
      }
    }

    // Block Web3 packages on native platforms
    const web3Packages = [
      'porto',
      '@wagmi/connectors',
      '@web3modal/wagmi',
      '@web3modal/base',
      '@web3modal/scaffold',
      '@web3modal/ui',
      'wagmi',
      'viem',
      'ox/',
      'elliptic',
      'bn.js',
      'brorand',
      'hash.js',
      'hmac-drbg',
      'minimalistic-assert',
      'minimalistic-crypto-utils',
    ];

    if (platform !== 'web') {
      for (const pkg of web3Packages) {
        if (moduleName.includes(pkg)) {
          console.log(`[Metro] Blocking ${moduleName} on ${platform}`);
          return { type: 'empty' };
        }
      }
    }

    // Handle porto connector
    if (moduleName.includes('porto')) {
      return { type: 'empty' };
    }
    
    // Handle ox package imports
    if (moduleName.includes('ox/') || moduleName.includes('ox\\')) {
      return { type: 'empty' };
    }

    // Block crypto libraries on native
    if (platform !== 'web' && (
      moduleName.includes('elliptic') ||
      moduleName.includes('bn.js') ||
      moduleName.includes('brorand') ||
      moduleName.includes('hash.js') ||
      moduleName.includes('hmac-drbg') ||
      moduleName.includes('minimalistic-')
    )) {
      return { type: 'empty' };
    }
    
    // Handle .js extensions in TypeScript imports
    if (moduleName.endsWith('.js')) {
      const withoutExtension = moduleName.replace(/\.js$/, '');
      try {
        return context.resolveRequest(context, withoutExtension, platform);
      } catch (e) {
        try {
          return context.resolveRequest(context, withoutExtension + '.ts', platform);
        } catch (e2) {
          try {
            return context.resolveRequest(context, withoutExtension + '.tsx', platform);
          } catch (e3) {
            // Fall through to default resolution
          }
        }
      }
    }
    
    // Default resolution
    return context.resolveRequest(context, moduleName, platform);
  },
};

// Add transformer configuration
config.transformer = {
  ...config.transformer,
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
  }),
};

module.exports = config;
