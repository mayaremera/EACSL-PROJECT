-- SQL Script to Add Storage Policies for EventBucket
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- 
-- ⚠️ IMPORTANT: Even if your bucket is Public, you still need these policies for uploads to work!
--
-- This bucket stores:
-- - Event hero images (JPG, PNG, etc.)
-- - Event participant images (JPG, PNG, etc.)
-- - Event booklet PDFs (PDF files)
--
-- If you get "must be owner" error, use the Dashboard UI method instead:
-- 1. Go to Storage → Policies → EventBucket
-- 2. Click "New Policy" and create policies manually (see instructions below)

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Public read access for EventBucket" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for event images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload access for EventBucket" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload event images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated update access for EventBucket" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update event images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete access for EventBucket" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete event images" ON storage.objects;

-- ============================================================================
-- PUBLIC POLICIES (For displaying images and PDFs on website)
-- ============================================================================

-- Allow public read access (viewing images and PDFs on website)
-- This allows anyone to view/download the files via URL
CREATE POLICY "Public read access for EventBucket"
ON storage.objects
FOR SELECT
USING (bucket_id = 'EventBucket');

-- ============================================================================
-- AUTHENTICATED POLICIES (For admin uploads from dashboard)
-- ============================================================================

-- Allow authenticated users (admins) to upload files (images and PDFs)
-- This allows logged-in admins to upload event images, participant images, and booklet PDFs
CREATE POLICY "Authenticated upload access for EventBucket"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'EventBucket');

-- Allow authenticated users (admins) to update files
-- This allows logged-in admins to replace existing files
CREATE POLICY "Authenticated update access for EventBucket"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'EventBucket')
WITH CHECK (bucket_id = 'EventBucket');

-- Allow authenticated users (admins) to delete files
-- This allows logged-in admins to delete files when events are deleted
CREATE POLICY "Authenticated delete access for EventBucket"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'EventBucket');

-- ============================================================================
-- VERIFY POLICIES WERE CREATED
-- ============================================================================

-- Check all policies on EventBucket
SELECT 
  policyname,
  cmd,
  qual,
  with_check,
  roles
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND policyname LIKE '%EventBucket%'
ORDER BY policyname;

-- ============================================================================
-- NOTES
-- ============================================================================
--
-- After running this script:
-- 1. ✅ Public users (anon) can READ files (view images and PDFs on website)
-- 2. ✅ Authenticated users (admins) can UPLOAD files (images and PDFs from dashboard)
-- 3. ✅ Authenticated users (admins) can UPDATE files (replace existing)
-- 4. ✅ Authenticated users (admins) can DELETE files (when events deleted)
--
-- Supported file types:
-- - Images: JPG, PNG, GIF, WebP, etc. (for hero images and participant images)
-- - PDFs: PDF files (for event booklets)
--
-- If you get "must be owner" error:
-- - Use the Dashboard UI method (see EVENTS_SUPABASE_SETUP.md)
-- - Or make sure the bucket is set to Public in Storage settings
--
-- Security Note:
-- - Public read access is required for files to display on the website
-- - Authenticated upload/update/delete ensures only admins can modify files
-- - This is more secure than allowing public uploads
--
-- Bucket Setup (if not already created):
-- 1. Go to Supabase Dashboard → Storage
-- 2. Click "New bucket"
-- 3. Name: EventBucket (exact name, case-sensitive)
-- 4. Set to Public (required for files to be accessible)
-- 5. Click "Create bucket"
-- 6. Then run this SQL script to set up policies

