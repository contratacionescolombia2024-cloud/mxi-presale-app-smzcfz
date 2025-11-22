
// CRITICAL: Load polyfills FIRST before anything else
import './polyfills';
import './shims';

// Run startup verification in development mode
if (__DEV__) {
  console.log('🚀 MXI Presale App - Development Mode');
  console.log('=====================================');
  
  // Import and run verification
  import('./utils/startupVerification')
    .then(({ startupVerification }) => {
      startupVerification.runAll().catch((error: Error) => {
        console.error('❌ Startup verification failed:', error);
      });
    })
    .catch((error: Error) => {
      console.error('❌ Failed to load startup verification:', error);
    });
}

// Now load expo-router
import 'expo-router/entry';
