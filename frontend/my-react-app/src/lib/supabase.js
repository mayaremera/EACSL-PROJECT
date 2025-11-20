import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jwhvfugznhwtpfurdkxm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3aHZmdWd6bmh3dHBmdXJka3htIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxMzE4OTAsImV4cCI6MjA3ODcwNzg5MH0.Hz79ipl3g-hPPYkEIqZGKQNDQxCvKCR8Ctg94dXfT-s';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

