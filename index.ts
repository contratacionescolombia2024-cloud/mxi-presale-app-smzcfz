
// CRITICAL: Absolute minimal entry point
// This file should do NOTHING except start expo-router

console.log('🚀 MXI Presale App - Entry Point');
console.log('📦 Loading polyfills...');

// Load polyfills first
import './polyfills';

console.log('✅ Polyfills loaded');
console.log('🎯 Starting Expo Router...');

// Start expo-router - this is the ONLY thing this file should do
import 'expo-router/entry';
