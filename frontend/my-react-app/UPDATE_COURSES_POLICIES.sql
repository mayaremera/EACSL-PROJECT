-- SQL Script to Update Courses Table RLS Policies for Admin Access
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- This will allow authenticated admin users to add, update, and delete courses

-- ============================================================================
-- DROP EXISTING POLICIES (to avoid conflicts)
-- ============================================================================

DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.courses;
DROP POLICY IF EXISTS "Allow authenticated users to manage courses" ON public.courses;
DROP POLICY IF EXISTS "Allow service_role full access courses" ON public.courses;

-- ============================================================================
-- CREATE NEW POLICIES
-- ============================================================================

-- Policy 1: Allow public (anon) and authenticated users to READ courses
-- This allows everyone to view courses on the website
CREATE POLICY "Allow public read courses" ON public.courses
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Policy 2: Allow authenticated users (admins) to INSERT courses
-- This allows admins to add new courses from the dashboard
-- Option A: Allow all authenticated users (simpler, frontend handles admin check)
CREATE POLICY "Allow authenticated users to insert courses" ON public.courses
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Option B: Only allow users with Admin role in members table (more secure)
-- Uncomment this and comment out Option A if you want stricter security:
-- CREATE POLICY "Allow admin users to insert courses" ON public.courses
--   FOR INSERT
--   TO authenticated
--   WITH CHECK (
--     EXISTS (
--       SELECT 1 FROM public.members 
--       WHERE supabase_user_id = auth.uid() 
--       AND role = 'Admin'
--     )
--   );

-- Policy 3: Allow authenticated users (admins) to UPDATE courses
-- This allows admins to edit existing courses from the dashboard
-- Option A: Allow all authenticated users (simpler, frontend handles admin check)
CREATE POLICY "Allow authenticated users to update courses" ON public.courses
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Option B: Only allow users with Admin role in members table (more secure)
-- Uncomment this and comment out Option A if you want stricter security:
-- CREATE POLICY "Allow admin users to update courses" ON public.courses
--   FOR UPDATE
--   TO authenticated
--   USING (
--     EXISTS (
--       SELECT 1 FROM public.members 
--       WHERE supabase_user_id = auth.uid() 
--       AND role = 'Admin'
--     )
--   )
--   WITH CHECK (
--     EXISTS (
--       SELECT 1 FROM public.members 
--       WHERE supabase_user_id = auth.uid() 
--       AND role = 'Admin'
--     )
--   );

-- Policy 4: Allow authenticated users (admins) to DELETE courses
-- This allows admins to delete courses from the dashboard
-- Option A: Allow all authenticated users (simpler, frontend handles admin check)
CREATE POLICY "Allow authenticated users to delete courses" ON public.courses
  FOR DELETE
  TO authenticated
  USING (true);

-- Option B: Only allow users with Admin role in members table (more secure)
-- Uncomment this and comment out Option A if you want stricter security:
-- CREATE POLICY "Allow admin users to delete courses" ON public.courses
--   FOR DELETE
--   TO authenticated
--   USING (
--     EXISTS (
--       SELECT 1 FROM public.members 
--       WHERE supabase_user_id = auth.uid() 
--       AND role = 'Admin'
--     )
--   );

-- Policy 5: Allow service_role (backend/admin operations) full access
-- This is for service-level operations and should already work
CREATE POLICY "Allow service_role full access courses" ON public.courses
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Grant SELECT to everyone (public read access)
GRANT SELECT ON public.courses TO anon, authenticated;

-- Grant INSERT, UPDATE, DELETE to authenticated users (admins)
GRANT INSERT, UPDATE, DELETE ON public.courses TO authenticated;

-- Grant ALL to service_role (for backend operations)
GRANT ALL ON public.courses TO service_role;

-- ============================================================================
-- VERIFY RLS IS ENABLED
-- ============================================================================

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- VERIFY POLICIES WERE CREATED
-- ============================================================================

-- Check all policies on the courses table
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'courses'
ORDER BY policyname;

-- ============================================================================
-- NOTES
-- ============================================================================
-- 
-- After running this script:
-- 1. Public users (anon) can READ courses (view on website)
-- 2. Authenticated users (admins) can INSERT, UPDATE, DELETE courses (manage from dashboard)
-- 3. Service role has full access (for backend operations)
--
-- If you want to restrict admin access further (e.g., only users with a specific role),
-- you can modify the policies to check user metadata:
--
-- Example: Only allow users with role = 'admin' in their user_metadata
-- USING (
--   auth.role() = 'authenticated' AND
--   (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
-- )
--
-- Or check if the user exists in a members table with is_admin = true:
-- USING (
--   auth.role() = 'authenticated' AND
--   EXISTS (
--     SELECT 1 FROM public.members 
--     WHERE supabase_user_id = auth.uid() 
--     AND is_admin = true
--   )
-- )

