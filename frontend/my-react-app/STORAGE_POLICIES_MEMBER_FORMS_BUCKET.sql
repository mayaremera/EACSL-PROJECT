-- SQL Script to Add Storage Policies for member-forms-bucket
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- 
-- ⚠️ IMPORTANT: This allows PUBLIC (unauthenticated) uploads!
-- This is required for the "Become a Member" form to work.
--
-- If you get "must be owner" error, use the Dashboard UI method instead:
-- 1. Go to Storage → Policies → member-forms-bucket
-- 2. Click "New Policy" and create policies manually (see instructions below)

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Public read access for member-forms-bucket" ON storage.objects;
DROP POLICY IF EXISTS "Public upload access for member-forms-bucket" ON storage.objects;
DROP POLICY IF EXISTS "Public update access for member-forms-bucket" ON storage.objects;
DROP POLICY IF EXISTS "Public delete access for member-forms-bucket" ON storage.objects;

-- Allow public read access (viewing uploaded files)
-- This allows anyone to view/download the files via URL
CREATE POLICY "Public read access for member-forms-bucket"
ON storage.objects
FOR SELECT
USING (bucket_id = 'member-forms-bucket');

-- Allow public uploads (INSERT) - REQUIRED for form submissions to work
-- This allows anyone (even non-logged-in users) to upload files
CREATE POLICY "Public upload access for member-forms-bucket"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'member-forms-bucket');

-- Allow public updates (replacing files if needed)
CREATE POLICY "Public update access for member-forms-bucket"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'member-forms-bucket')
WITH CHECK (bucket_id = 'member-forms-bucket');

-- Allow public deletes (removing files if needed)
-- ⚠️ WARNING: This allows anyone to delete files. Consider restricting to authenticated users only.
CREATE POLICY "Public delete access for member-forms-bucket"
ON storage.objects
FOR DELETE
USING (bucket_id = 'member-forms-bucket');

-- Verify policies were created
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND policyname LIKE '%member-forms-bucket%';

-- If you prefer to restrict DELETE to authenticated users only, use this instead:
-- (Comment out the public delete policy above and uncomment this)
/*
DROP POLICY IF EXISTS "Public delete access for member-forms-bucket" ON storage.objects;

CREATE POLICY "Authenticated users can delete from member-forms-bucket"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'member-forms-bucket' 
  AND auth.role() = 'authenticated'
);
*/

