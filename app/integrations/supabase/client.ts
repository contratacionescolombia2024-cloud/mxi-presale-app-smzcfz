
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-url-polyfill/auto';

const supabaseUrl = 'https://kllolspugrhdgytwdmzp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtsbG9sc3B1Z3JoZGd5dHdkbXpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE5NTQ1NzUsImV4cCI6MjA0NzUzMDU3NX0.Ks5Zy0Zy-Ks5Zy0Zy-Ks5Zy0Zy-Ks5Zy0Zy-Ks5Zy0Zy';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
