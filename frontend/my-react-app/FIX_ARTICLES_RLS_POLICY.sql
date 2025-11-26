-- Fix Articles RLS Policy to Allow Authenticated Users (Admins) to Update
-- Run this in your Supabase SQL Editor
-- This allows logged-in admins to INSERT, UPDATE, and DELETE articles

-- Ensure RLS is enabled
ALTER TABLE IF EXISTS public.articles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow service_role full access articles" ON public.articles;
DROP POLICY IF EXISTS "Allow public read articles" ON public.articles;
DROP POLICY IF EXISTS "Allow public read access" ON public.articles;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.articles;
DROP POLICY IF EXISTS "Allow authenticated users to modify articles" ON public.articles;

-- Policy 1: Allow public read access to all articles (for viewing on website)
CREATE POLICY "Allow public read articles" ON public.articles
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Policy 2: Allow authenticated users (admins) to INSERT, UPDATE, DELETE articles
-- This is the key policy - allows logged-in admins to modify articles
CREATE POLICY "Allow authenticated users to modify articles" ON public.articles
  FOR ALL
  TO authenticated
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Grant permissions
GRANT SELECT ON public.articles TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.articles TO authenticated;

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
WHERE tablename = 'articles';

