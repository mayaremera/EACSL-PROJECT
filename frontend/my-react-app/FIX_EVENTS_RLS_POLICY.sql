-- Fix Events RLS Policy to Allow Authenticated Users (Admins) to Update
-- Run this in your Supabase SQL Editor
-- This allows logged-in admins to INSERT, UPDATE, and DELETE events

-- Ensure RLS is enabled
ALTER TABLE IF EXISTS public.events ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow service_role full access events" ON public.events;
DROP POLICY IF EXISTS "Allow public read events" ON public.events;
DROP POLICY IF EXISTS "Allow public read access" ON public.events;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.events;
DROP POLICY IF EXISTS "Allow authenticated users to modify events" ON public.events;

-- Policy 1: Allow public read access to all events (for viewing on website)
CREATE POLICY "Allow public read events" ON public.events
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Policy 2: Allow authenticated users (admins) to INSERT, UPDATE, DELETE events
-- This is the key policy - allows logged-in admins to modify events
CREATE POLICY "Allow authenticated users to modify events" ON public.events
  FOR ALL
  TO authenticated
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Grant permissions
GRANT SELECT ON public.events TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.events TO authenticated;

-- Verify the policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'events';

