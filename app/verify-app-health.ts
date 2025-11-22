
// CRITICAL: This file should NOT be imported at module load time
// It should only be called after the app is fully initialized

export async function verifyAppHealth() {
  console.log('🏥 ========== APP HEALTH CHECK ==========');
  
  const checks = {
    nativeModules: false,
    asyncStorage: false,
    supabase: false,
  };

  // Check 1: Native Modules
  try {
    const { NativeModules } = require('react-native');
    if (NativeModules && typeof NativeModules === 'object') {
      console.log('✅ Native modules available');
      checks.nativeModules = true;
    } else {
      console.error('❌ Native modules not available');
    }
  } catch (error) {
    console.error('❌ Error checking native modules:', error);
  }

  // Check 2: AsyncStorage
  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    await AsyncStorage.setItem('health-check', 'ok');
    const value = await AsyncStorage.getItem('health-check');
    if (value === 'ok') {
      console.log('✅ AsyncStorage working');
      checks.asyncStorage = true;
      await AsyncStorage.removeItem('health-check');
    } else {
      console.error('❌ AsyncStorage not working correctly');
    }
  } catch (error) {
    console.error('❌ Error checking AsyncStorage:', error);
  }

  // Check 3: Supabase
  try {
    const { supabase } = require('./integrations/supabase/client');
    if (supabase && typeof supabase.auth === 'object') {
      console.log('✅ Supabase client initialized');
      checks.supabase = true;
    } else {
      console.error('❌ Supabase client not initialized correctly');
    }
  } catch (error) {
    console.error('❌ Error checking Supabase:', error);
  }

  console.log('🏥 Health check results:', checks);
  console.log('🏥 ========== END HEALTH CHECK ==========');

  return checks;
}
