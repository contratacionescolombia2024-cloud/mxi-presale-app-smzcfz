
// CRITICAL: Ultra-minimal entry point
// This file must do NOTHING except load polyfills and start expo-router
// NO imports of app code, NO side effects, NO native module access

console.log('🚀 ========== APP STARTING ==========');
console.log('📍 Entry point: index.ts');
console.log('⏰ Time:', new Date().toISOString());

// Step 1: Load polyfills (pure JavaScript, no native modules)
console.log('📦 Step 1: Loading polyfills...');
import './polyfills';
console.log('✅ Step 1 Complete: Polyfills loaded');

// Step 2: Start Expo Router (this initializes React Native)
console.log('🎯 Step 2: Starting Expo Router...');
console.log('⚠️  If the app crashes here, the issue is in expo-router initialization');
import 'expo-router/entry';
console.log('✅ Step 2 Complete: Expo Router started');

console.log('🚀 ========== APP STARTED SUCCESSFULLY ==========');
