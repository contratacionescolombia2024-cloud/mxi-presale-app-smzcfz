
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Database } from './types';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://kllolspugrhdgytwdmzp.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtsbG9sc3B1Z3JoZGd5dHdkbXpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzMjI0OTYsImV4cCI6MjA3ODg5ODQ5Nn0.OOt5_B-nHRQHmXbWyKFmg938HvlIx84EGWSQjAM9HM0";

// CRITICAL: Initialize Supabase client with error handling
console.log('🔧 Creating Supabase client...');

// Create the client - if this fails, the error will be caught by the app's error boundary
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

console.log('✅ Supabase client created successfully');
