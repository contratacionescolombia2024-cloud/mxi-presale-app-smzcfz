
/**
 * App Health Verification Script
 * 
 * This file can be imported to verify the app's health status.
 * It checks for common issues and provides diagnostic information.
 */

export interface HealthCheck {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
}

export async function verifyAppHealth(): Promise<HealthCheck[]> {
  const checks: HealthCheck[] = [];

  // Check 1: React Native version
  try {
    const { Platform } = require('react-native');
    checks.push({
      name: 'React Native Platform',
      status: 'pass',
      message: `Running on ${Platform.OS} ${Platform.Version || 'unknown version'}`,
    });
  } catch (error) {
    checks.push({
      name: 'React Native Platform',
      status: 'fail',
      message: 'Could not detect React Native platform',
    });
  }

  // Check 2: Expo Router
  try {
    require('expo-router');
    checks.push({
      name: 'Expo Router',
      status: 'pass',
      message: 'Expo Router is available',
    });
  } catch (error) {
    checks.push({
      name: 'Expo Router',
      status: 'fail',
      message: 'Expo Router is not available',
    });
  }

  // Check 3: Supabase Client
  try {
    const { supabase } = require('./integrations/supabase/client');
    if (supabase) {
      checks.push({
        name: 'Supabase Client',
        status: 'pass',
        message: 'Supabase client is initialized',
      });
    } else {
      checks.push({
        name: 'Supabase Client',
        status: 'warning',
        message: 'Supabase client exists but may not be configured',
      });
    }
  } catch (error) {
    checks.push({
      name: 'Supabase Client',
      status: 'fail',
      message: 'Supabase client is not available',
    });
  }

  // Check 4: Contexts
  try {
    require('../contexts/AuthContext');
    require('../contexts/LanguageContext');
    require('../contexts/PreSaleContext');
    checks.push({
      name: 'App Contexts',
      status: 'pass',
      message: 'All required contexts are available',
    });
  } catch (error) {
    checks.push({
      name: 'App Contexts',
      status: 'fail',
      message: 'One or more contexts are missing',
    });
  }

  // Check 5: No Reanimated (should be removed)
  try {
    require('react-native-reanimated');
    checks.push({
      name: 'Reanimated Check',
      status: 'warning',
      message: 'Reanimated is still installed (should be removed)',
    });
  } catch (error) {
    checks.push({
      name: 'Reanimated Check',
      status: 'pass',
      message: 'Reanimated is not installed (correct)',
    });
  }

  return checks;
}

export function printHealthReport(checks: HealthCheck[]): void {
  console.log('\n🏥 ========== APP HEALTH REPORT ==========\n');
  
  let passCount = 0;
  let failCount = 0;
  let warningCount = 0;

  checks.forEach((check) => {
    const icon = check.status === 'pass' ? '✅' : check.status === 'fail' ? '❌' : '⚠️';
    console.log(`${icon} ${check.name}`);
    console.log(`   ${check.message}\n`);

    if (check.status === 'pass') passCount++;
    else if (check.status === 'fail') failCount++;
    else warningCount++;
  });

  console.log('========================================');
  console.log(`Total Checks: ${checks.length}`);
  console.log(`✅ Passed: ${passCount}`);
  console.log(`⚠️  Warnings: ${warningCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log('========================================\n');

  if (failCount === 0 && warningCount === 0) {
    console.log('🎉 All checks passed! App is healthy.\n');
  } else if (failCount === 0) {
    console.log('✅ No critical issues. Warnings can be addressed later.\n');
  } else {
    console.log('⚠️  Critical issues detected. Please review failed checks.\n');
  }
}

// Auto-run in development
if (__DEV__) {
  verifyAppHealth().then(printHealthReport).catch((error) => {
    console.error('❌ Health check failed:', error);
  });
}
