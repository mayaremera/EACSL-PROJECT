import { createClient } from '@supabase/supabase-js';

// Use environment variables for production security
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://jwhvfugznhwtpfurdkxm.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3aHZmdWd6bmh3dHBmdXJka3htIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxMzE4OTAsImV4cCI6MjA3ODcwNzg5MH0.Hz79ipl3g-hPPYkEIqZGKQNDQxCvKCR8Ctg94dXfT-s';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

