
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// List of Web3 packages to block on native platforms
const WEB3_PACKAGES = [
  'porto',
  '@wagmi/connectors',
  '@wagmi/core',
  '@web3modal/wagmi',
  '@web3modal/base',
  '@web3modal/scaffold',
  '@web3modal/ui',
  '@web3modal/core',
  '@web3modal/siwe',
  'wagmi',
  'viem',
  'ox',
  '@reown',
  '@walletconnect',
];

config.resolver = {
  ...config.resolver,
  unstable_enablePackageExports: true,
  unstable_conditionNames: ['react-native', 'browser', 'require'],
  // Ensure platform-specific extensions are resolved correctly
  sourceExts: [
    'web.tsx',
    'web.ts',
    'web.jsx',
    'web.js',
    ...(config.resolver?.sourceExts || []),
    'mjs',
    'cjs',
  ],
  
  resolveRequest: (context, moduleName, platform) => {
    // CRITICAL: Block Web3 packages on native platforms FIRST
    // This prevents metro from trying to resolve their dependencies
    if (platform !== 'web') {
      // Check if this is a Web3 package or a subpath of one
      for (const pkg of WEB3_PACKAGES) {
        if (moduleName === pkg || moduleName.startsWith(pkg + '/')) {
          console.log(`🚫 Metro: Blocking ${moduleName} on ${platform}`);
          return { type: 'empty' };
        }
      }
      
      // CRITICAL FIX: Block expo-auth-session when it's being imported from Web3 packages
      // This is necessary because porto connector tries to import it
      if (moduleName === 'expo-auth-session' || moduleName === 'expo-web-browser') {
        // We need to check if this is being imported from a Web3 package
        // Since we can't reliably check the call stack, we'll allow it by default
        // but log it for debugging
        console.log(`⚠️ Metro: ${moduleName} import detected on ${platform}`);
      }
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
