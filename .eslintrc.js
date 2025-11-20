
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
    // Allow explicit any types (we're using them intentionally)
    '@typescript-eslint/no-explicit-any': 'off',
    // Allow unused vars that start with underscore
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      },
    ],
    // Allow console statements (we use them for debugging)
    'no-console': 'off',
    // Allow empty functions (sometimes needed for callbacks)
    '@typescript-eslint/no-empty-function': 'off',
    // Allow non-null assertions (we know when values are safe)
    '@typescript-eslint/no-non-null-assertion': 'off',
    // Allow require statements (needed for polyfills)
    '@typescript-eslint/no-var-requires': 'off',
    // Disable prefer-const for variables that might be reassigned
    'prefer-const': 'warn',
    // Allow empty catch blocks with comment
    'no-empty': ['error', { allowEmptyCatch: true }],
    // Disable no-empty-object-type rule
    '@typescript-eslint/no-empty-object-type': 'off',
    // Disable no-wrapper-object-types rule
    '@typescript-eslint/no-wrapper-object-types': 'off',
  },
};
