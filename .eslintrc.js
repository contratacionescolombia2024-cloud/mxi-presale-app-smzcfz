
module.exports = {
  extends: [
    'expo',
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime'
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react', 'import'],
  root: true,
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  ignorePatterns: [
    '/dist/*',
    '/public/*',
    '/babel-plugins/*',
    'node_modules/',
    '.expo/',
    'android/',
    'ios/',
    'web-build/',
    '.next/',
    '*.md',
    '*.json',
    'metro.config.js',
    'babel.config.js',
    'webpack.config.js',
  ],
  env: {
    browser: true,
    node: true,
    es2021: true,
  },
  rules: {
    "@typescript-eslint/no-unused-vars": ["warn", { 
      "argsIgnorePattern": "^_",
      "varsIgnorePattern": "^_",
      "ignoreRestSiblings": true
    }],
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/prefer-as-const": "off",
    "@typescript-eslint/no-var-requires": "off",
    "@typescript-eslint/no-empty-object-type": "off",
    "@typescript-eslint/no-wrapper-object-types": "off",
    "@typescript-eslint/ban-ts-comment": "off",
    "@typescript-eslint/no-empty-function": "off",
    "react/react-in-jsx-scope": "off",
    "react/no-unescaped-entities": "off",
    "react/prop-types": "off",
    "react/display-name": "off",
    "react/jsx-key": "warn",
    "react/jsx-no-duplicate-props": "error",
    "react/jsx-no-undef": "error",
    "react/jsx-uses-react": "off",
    "react/jsx-uses-vars": "warn",
    "react-hooks/exhaustive-deps": "warn",
    "import/no-unresolved": "off",
    "prefer-const": "warn",
    "no-case-declarations": "off",
    "no-empty": ["warn", { "allowEmptyCatch": true }],
    "no-var": "warn",
    "no-console": "off",
    "no-debugger": "warn",
    "no-unused-vars": "off",
  },
  overrides: [
    {
      files: ['metro.config.js', 'babel.config.js', 'webpack.config.js'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off'
      }
    }
  ]
};
