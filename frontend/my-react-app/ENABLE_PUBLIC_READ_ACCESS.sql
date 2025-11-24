-- SQL Script to Enable Public Read Access for All Data Tables
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- This allows guests, members, and admins to view all data (courses, articles, events, members, etc.)

-- ============================================================================
-- MEMBERS TABLE - Public Read Access
-- ============================================================================

-- Ensure RLS is enabled
ALTER TABLE IF EXISTS public.members ENABLE ROW LEVEL SECURITY;

-- Drop existing read policies to avoid conflicts
DROP POLICY IF EXISTS "Allow public read active members" ON public.members;
DROP POLICY IF EXISTS "Allow authenticated users read only" ON public.members;

-- Policy: Allow public read access to all members (guests, members, admins)
CREATE POLICY "Allow public read all members" ON public.members
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Policy: Only service_role (admins) can modify members
-- (This should already exist from AUTH_ACCOUNT_CREATION_POLICIES.sql)
-- If not, create it:
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'members' 
    AND policyname = 'Allow service_role full access'
  ) THEN
    CREATE POLICY "Allow service_role full access" ON public.members
      FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- Grant SELECT to public
GRANT SELECT ON public.members TO anon, authenticated;

-- ============================================================================
-- COURSES TABLE - Public Read Access
-- ============================================================================

-- Check if courses table exists, if not, create it
CREATE TABLE IF NOT EXISTS public.courses (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  instructor TEXT,
  price TEXT,
  duration TEXT,
  level TEXT,
  image_url TEXT,
  image_path TEXT,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Allow public read courses" ON public.courses;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.courses;

-- Policy: Allow public read access to all courses
CREATE POLICY "Allow public read courses" ON public.courses
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Policy: Only service_role (admins) can modify courses
CREATE POLICY "Allow service_role full access courses" ON public.courses
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Grant permissions
GRANT SELECT ON public.courses TO anon, authenticated;
GRANT ALL ON public.courses TO service_role;

-- ============================================================================
-- EVENTS TABLE - Public Read Access
-- ============================================================================

-- Check if events table exists, if not, create it
CREATE TABLE IF NOT EXISTS public.events (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  date TEXT,
  location TEXT,
  image_url TEXT,
  image_path TEXT,
  status TEXT DEFAULT 'upcoming',
  hero_title TEXT,
  hero_subtitle TEXT,
  hero_image_url TEXT,
  hero_image_path TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Allow public read events" ON public.events;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.events;

-- Policy: Allow public read access to all events
CREATE POLICY "Allow public read events" ON public.events
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Policy: Only service_role (admins) can modify events
CREATE POLICY "Allow service_role full access events" ON public.events
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Grant permissions
GRANT SELECT ON public.events TO anon, authenticated;
GRANT ALL ON public.events TO service_role;

-- ============================================================================
-- ARTICLES TABLE - Public Read Access
-- ============================================================================

-- Ensure RLS is enabled
ALTER TABLE IF EXISTS public.articles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Allow public read access" ON public.articles;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.articles;

-- Policy: Allow public read access to all articles
CREATE POLICY "Allow public read articles" ON public.articles
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Policy: Only service_role (admins) can modify articles
CREATE POLICY "Allow service_role full access articles" ON public.articles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Grant permissions
GRANT SELECT ON public.articles TO anon, authenticated;
GRANT ALL ON public.articles TO service_role;

-- ============================================================================
-- THERAPY PROGRAMS TABLE - Public Read Access
-- ============================================================================

-- Ensure RLS is enabled
ALTER TABLE IF EXISTS public.therapy_programs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Allow public read access" ON public.therapy_programs;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.therapy_programs;

-- Policy: Allow public read access to all therapy programs
CREATE POLICY "Allow public read therapy programs" ON public.therapy_programs
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Policy: Only service_role (admins) can modify therapy programs
CREATE POLICY "Allow service_role full access therapy programs" ON public.therapy_programs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Grant permissions
GRANT SELECT ON public.therapy_programs TO anon, authenticated;
GRANT ALL ON public.therapy_programs TO service_role;

-- ============================================================================
-- FOR PARENTS TABLE - Public Read Access
-- ============================================================================

-- Ensure RLS is enabled
ALTER TABLE IF EXISTS public.for_parents ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Allow public read access" ON public.for_parents;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.for_parents;

-- Policy: Allow public read access to all for parents articles
CREATE POLICY "Allow public read for parents" ON public.for_parents
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Policy: Only service_role (admins) can modify for parents articles
CREATE POLICY "Allow service_role full access for parents" ON public.for_parents
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Grant permissions
GRANT SELECT ON public.for_parents TO anon, authenticated;
GRANT ALL ON public.for_parents TO service_role;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check all policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename IN ('members', 'courses', 'events', 'articles', 'therapy_programs', 'for_parents')
ORDER BY tablename, policyname;

-- ============================================================================
-- NOTES
-- ============================================================================
--
-- After running this script:
-- 1. All tables now allow public (anon) and authenticated users to READ data
-- 2. Only service_role (admins) can INSERT, UPDATE, DELETE data
-- 3. Guests, members, and admins can all view the data on the website
-- 4. Only admins can modify data through the dashboard
--
-- ============================================================================

