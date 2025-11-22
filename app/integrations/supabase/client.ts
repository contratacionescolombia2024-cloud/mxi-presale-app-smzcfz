
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Database } from './types';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const SUPABASE_URL = "https://kllolspugrhdgytwdmzp.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtsbG9sc3B1Z3JoZGd5dHdkbXpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzMjI0OTYsImV4cCI6MjA3ODg5ODQ5Nn0.OOt5_B-nHRQHmXbWyKFmg938HvlIx84EGWSQjAM9HM0";

// CRITICAL: Lazy initialization to avoid accessing native modules during module load
// This prevents the "__fbBatchedBridgeConfig is not set" error
console.log('🔧 Supabase client module loaded (lazy initialization)');

let supabaseInstance: SupabaseClient<Database> | null = null;
let isInitializing = false;

// Getter function that creates the client on first access
function getSupabaseClient(): SupabaseClient<Database> {
  // If already initialized, return the instance
  if (supabaseInstance) {
    return supabaseInstance;
  }

  // Prevent multiple simultaneous initializations
  if (isInitializing) {
    throw new Error('Supabase client is already being initialized');
  }

  console.log('🔧 Creating Supabase client (first access)...');
  isInitializing = true;

  try {
    // Use different storage based on platform
    const storage = Platform.OS === 'web' 
      ? undefined // Use default localStorage on web
      : AsyncStorage; // Use AsyncStorage on native

    supabaseInstance = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: {
        storage: storage as any,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: Platform.OS === 'web',
      },
    });
    console.log('✅ Supabase client created successfully');
  } catch (error) {
    console.error('❌ Failed to create Supabase client:', error);
    isInitializing = false;
    throw error;
  }

  isInitializing = false;
  return supabaseInstance;
}

// Export a Proxy that lazily initializes the client on first property access
// This ensures the client is only created when actually used, not during module load
export const supabase = new Proxy({} as SupabaseClient<Database>, {
  get(_target, prop) {
    const client = getSupabaseClient();
    const value = (client as any)[prop];
    
    // If the property is a function, bind it to the client
    if (typeof value === 'function') {
      return value.bind(client);
    }
    
    return value;
  },
});
