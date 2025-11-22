
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import 'react-native-url-polyfill/auto';

const supabaseUrl = 'https://kllolspugrhdgytwdmzp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtsbG9sc3B1Z3JoZGd5dHdkbXpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE5NTQ1NzUsImV4cCI6MjA0NzUzMDU3NX0.Ks5Zy0Zy-Ks5Zy0Zy-Ks5Zy0Zy-Ks5Zy0Zy-Ks5Zy0Zy';

// Lazy initialization to avoid accessing native modules before React Native bridge is ready
let supabaseInstance: ReturnType<typeof createClient> | null = null;

function getSupabaseClient() {
  if (!supabaseInstance) {
    console.log('🔧 Initializing Supabase client...');
    
    // Only use AsyncStorage on native platforms
    const clientConfig: any = {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: Platform.OS === 'web',
      },
    };

    // Import AsyncStorage only on native platforms
    if (Platform.OS !== 'web') {
      try {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        clientConfig.auth.storage = AsyncStorage;
        console.log('✅ Using AsyncStorage for session persistence');
      } catch (error) {
        console.warn('⚠️ AsyncStorage not available, sessions will not persist:', error);
      }
    } else {
      console.log('✅ Using browser storage for session persistence');
    }

    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, clientConfig);
    console.log('✅ Supabase client initialized');
  }
  
  return supabaseInstance;
}

// Export a proxy that lazily initializes the client
export const supabase = new Proxy({} as ReturnType<typeof createClient>, {
  get(target, prop) {
    const client = getSupabaseClient();
    const value = (client as any)[prop];
    
    if (typeof value === 'function') {
      return value.bind(client);
    }
    
    return value;
  }
});
