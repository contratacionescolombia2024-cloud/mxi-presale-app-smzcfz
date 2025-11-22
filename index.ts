
// CRITICAL: Minimal entry point - no verification, no complex imports
// Just load the bare minimum and start the app

console.log('🚀 MXI Presale App Starting...');

// Load polyfills first
import './polyfills';

// Load shims
import './shims';

// Start expo-router
import 'expo-router/entry';
