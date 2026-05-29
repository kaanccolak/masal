import * as SecureStore from 'expo-secure-store';
import { createClient } from '@supabase/supabase-js';

const ExpoSecureStoreAdapter = {
  getItem: (key) => SecureStore.getItemAsync(key),
  setItem: (key, value) => SecureStore.setItemAsync(key, value),
  removeItem: (key) => SecureStore.deleteItemAsync(key),
};

const supabaseUrl = 'https://nlltfdioclfqwbgffcep.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5sbHRmZGlvY2xmcXdiZ2ZmY2VwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwNzkwOTksImV4cCI6MjA5NTY1NTA5OX0.uxH78e4NNRCndyQjLBu-lOoOS5rDAsmJM1ZnGDLf7sw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
