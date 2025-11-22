
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Database } from './types';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const SUPABASE_URL = "https://kllolspugrhdgytwdmzp.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtsbG9sc3B1Z3JoZGd5dHdkbXpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzMjI0OTYsImV4cCI6MjA3ODg5ODQ5Nn0.OOt5_B-nHRQHmXbWyKFmg938HvlIx84EGWSQjAM9HM0";

// Use different storage based on platform
const storage = Platform.OS === 'web' 
  ? undefined // Use default localStorage on web
  : AsyncStorage; // Use AsyncStorage on native

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: storage as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
  },
});
