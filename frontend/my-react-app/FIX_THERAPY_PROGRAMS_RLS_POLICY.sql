-- Fix Therapy Programs RLS Policy to Allow Authenticated Users (Admins) to Update
-- Run this in your Supabase SQL Editor
-- This allows logged-in admins to INSERT, UPDATE, and DELETE therapy programs

-- Ensure RLS is enabled
ALTER TABLE IF EXISTS public.therapy_programs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow service_role full access therapy_programs" ON public.therapy_programs;
DROP POLICY IF EXISTS "Allow public read therapy_programs" ON public.therapy_programs;
DROP POLICY IF EXISTS "Allow public read access" ON public.therapy_programs;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.therapy_programs;
DROP POLICY IF EXISTS "Allow authenticated users to modify therapy_programs" ON public.therapy_programs;

-- Policy 1: Allow public read access to all therapy programs (for viewing on website)
CREATE POLICY "Allow public read therapy_programs" ON public.therapy_programs
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Policy 2: Allow authenticated users (admins) to INSERT, UPDATE, DELETE therapy programs
-- This is the key policy - allows logged-in admins to modify therapy programs
CREATE POLICY "Allow authenticated users to modify therapy_programs" ON public.therapy_programs
  FOR ALL
  TO authenticated
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Grant permissions
GRANT SELECT ON public.therapy_programs TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.therapy_programs TO authenticated;

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
WHERE tablename = 'therapy_programs';

