
// CRITICAL: Import polyfills FIRST, before ANYTHING else
// This ensures Buffer and other Node.js globals are available
import './polyfills';

// Verify polyfills are loaded
import './utils/polyfillVerification';

// Then import expo-router entry
import 'expo-router/entry';
