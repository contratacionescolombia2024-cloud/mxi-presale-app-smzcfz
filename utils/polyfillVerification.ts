
// Utility to verify polyfills are loaded correctly
export function verifyPolyfills(): boolean {
  const checks = {
    Buffer: typeof Buffer !== 'undefined',
    globalBuffer: typeof (global as any).Buffer !== 'undefined',
    process: typeof process !== 'undefined',
    globalProcess: typeof (global as any).process !== 'undefined',
    processEnv: typeof process !== 'undefined' && typeof process.env !== 'undefined',
    setImmediate: typeof setImmediate !== 'undefined',
    clearImmediate: typeof clearImmediate !== 'undefined',
  };

  console.log('🔍 Polyfill Verification:');
  console.log('========================');
  Object.entries(checks).forEach(([name, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${name}: ${passed ? 'OK' : 'MISSING'}`);
  });
  console.log('========================');

  const allPassed = Object.values(checks).every(check => check === true);
  
  if (allPassed) {
    console.log('✅ All polyfills loaded successfully!');
  } else {
    console.error('❌ Some polyfills are missing! App may not work correctly.');
  }

  return allPassed;
}

// Run verification immediately
verifyPolyfills();
