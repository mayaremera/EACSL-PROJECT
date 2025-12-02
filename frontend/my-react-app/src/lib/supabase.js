import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jwhvfugznhwtpfurdkxm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3aHZmdWd6bmh3dHBmdXJka3htIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxMzE4OTAsImV4cCI6MjA3ODcwNzg5MH0.Hz79ipl3g-hPPYkEIqZGKQNDQxCvKCR8Ctg94dXfT-s';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Auto-refresh token before it expires (refresh 30 seconds before expiry)
    autoRefreshToken: true,
    // Persist session in localStorage
    persistSession: true,
    // Detect session from URL hash (for OAuth callbacks)
    detectSessionInUrl: true,
    // Flow type - use PKCE for better security
    flowType: 'pkce',
    // Add retry logic for failed requests
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    // Configure token refresh to be less aggressive
    // This helps prevent 429 rate limit errors
    storageKey: 'sb-jwhvfugznhwtpfurdkxm-auth-token',
  },
  // Add global error handler for 429 errors
  global: {
    headers: {
      'x-client-info': 'eacsl-web-app',
    },
  },
});

