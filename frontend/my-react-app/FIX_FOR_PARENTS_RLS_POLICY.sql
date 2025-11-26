-- Fix For Parents RLS Policy to Allow Authenticated Users (Admins) to Update
-- Run this in your Supabase SQL Editor
-- This allows logged-in admins to INSERT, UPDATE, and DELETE for_parents articles

-- Ensure RLS is enabled
ALTER TABLE IF EXISTS public.for_parents ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow service_role full access for_parents" ON public.for_parents;
DROP POLICY IF EXISTS "Allow public read for_parents" ON public.for_parents;
DROP POLICY IF EXISTS "Allow public read access" ON public.for_parents;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.for_parents;
DROP POLICY IF EXISTS "Allow authenticated users to modify for_parents" ON public.for_parents;

-- Policy 1: Allow public read access to all for_parents articles (for viewing on website)
CREATE POLICY "Allow public read for_parents" ON public.for_parents
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Policy 2: Allow authenticated users (admins) to INSERT, UPDATE, DELETE for_parents articles
-- This is the key policy - allows logged-in admins to modify for_parents articles
CREATE POLICY "Allow authenticated users to modify for_parents" ON public.for_parents
  FOR ALL
  TO authenticated
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Grant permissions
GRANT SELECT ON public.for_parents TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.for_parents TO authenticated;

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
WHERE tablename = 'for_parents';

