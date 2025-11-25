-- SQL Script to Add Storage Policies for CoursesBucket
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- 
-- ⚠️ IMPORTANT: Even if your bucket is Public, you still need these policies for uploads to work!
--
-- If you get "must be owner" error, use the Dashboard UI method instead:
-- 1. Go to Storage → Policies → CoursesBucket
-- 2. Click "New Policy" and create policies manually (see instructions below)

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Public read access for CoursesBucket" ON storage.objects;
DROP POLICY IF EXISTS "Public upload access for CoursesBucket" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload access for CoursesBucket" ON storage.objects;
DROP POLICY IF EXISTS "Public update access for CoursesBucket" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated update access for CoursesBucket" ON storage.objects;
DROP POLICY IF EXISTS "Public delete access for CoursesBucket" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete access for CoursesBucket" ON storage.objects;

-- ============================================================================
-- PUBLIC POLICIES (For displaying images on website)
-- ============================================================================

-- Allow public read access (viewing images on website)
-- This allows anyone to view/download the images via URL
CREATE POLICY "Public read access for CoursesBucket"
ON storage.objects
FOR SELECT
USING (bucket_id = 'CoursesBucket');

-- ============================================================================
-- AUTHENTICATED POLICIES (For admin uploads from dashboard)
-- ============================================================================

-- Allow authenticated users (admins) to upload images
-- This allows logged-in admins to upload course and instructor images
CREATE POLICY "Authenticated upload access for CoursesBucket"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'CoursesBucket');

-- Allow authenticated users (admins) to update images
-- This allows logged-in admins to replace existing images
CREATE POLICY "Authenticated update access for CoursesBucket"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'CoursesBucket')
WITH CHECK (bucket_id = 'CoursesBucket');

-- Allow authenticated users (admins) to delete images
-- This allows logged-in admins to delete images when courses are deleted
CREATE POLICY "Authenticated delete access for CoursesBucket"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'CoursesBucket');

-- ============================================================================
-- OPTIONAL: PUBLIC UPLOAD (If you want public uploads - NOT RECOMMENDED)
-- ============================================================================
-- Uncomment these if you want to allow public uploads (not recommended for security)
-- 
-- CREATE POLICY "Public upload access for CoursesBucket"
-- ON storage.objects
-- FOR INSERT
-- WITH CHECK (bucket_id = 'CoursesBucket');
--
-- CREATE POLICY "Public update access for CoursesBucket"
-- ON storage.objects
-- FOR UPDATE
-- USING (bucket_id = 'CoursesBucket')
-- WITH CHECK (bucket_id = 'CoursesBucket');
--
-- CREATE POLICY "Public delete access for CoursesBucket"
-- ON storage.objects
-- FOR DELETE
-- USING (bucket_id = 'CoursesBucket');

-- ============================================================================
-- VERIFY POLICIES WERE CREATED
-- ============================================================================

-- Check all policies on CoursesBucket
SELECT 
  policyname,
  cmd,
  qual,
  with_check,
  roles
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND policyname LIKE '%CoursesBucket%'
ORDER BY policyname;

-- ============================================================================
-- NOTES
-- ============================================================================
--
-- After running this script:
-- 1. ✅ Public users (anon) can READ images (view on website)
-- 2. ✅ Authenticated users (admins) can UPLOAD images (from dashboard)
-- 3. ✅ Authenticated users (admins) can UPDATE images (replace existing)
-- 4. ✅ Authenticated users (admins) can DELETE images (when courses deleted)
--
-- If you get "must be owner" error:
-- - Use the Dashboard UI method (see COURSES_STORAGE_SETUP.md)
-- - Or make sure the bucket is set to Public in Storage settings
--
-- Security Note:
-- - Public read access is required for images to display on the website
-- - Authenticated upload/update/delete ensures only admins can modify images
-- - This is more secure than allowing public uploads

