
module.exports = {
  extends: ['expo', 'plugin:@typescript-eslint/recommended'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react', 'import'],
  rules: {
    // Disable exhaustive-deps warnings - we know what we're doing
    'react-hooks/exhaustive-deps': 'off',
    // Allow Function type for polyfills
    '@typescript-eslint/ban-types': [
      'error',
      {
        types: {
          Function: false,
        },
        extendDefaults: true,
      },
    ],
    // Allow import order flexibility for polyfills
    'import/first': 'off',
  },
};
