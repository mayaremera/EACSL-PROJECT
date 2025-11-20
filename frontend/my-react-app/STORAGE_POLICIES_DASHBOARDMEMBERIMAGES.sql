-- SQL Script to Add Storage Policies for dashboardmemberimages Bucket
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- 
-- ⚠️ IMPORTANT: Even if your bucket is Public, you still need these policies for uploads to work!
--
-- If you get "must be owner" error, use the Dashboard UI method instead:
-- 1. Go to Storage → Policies → dashboardmemberimages
-- 2. Click "New Policy" and create policies manually

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Public read access for dashboardmemberimages" ON storage.objects;
DROP POLICY IF EXISTS "Public upload access for dashboardmemberimages" ON storage.objects;
DROP POLICY IF EXISTS "Public update access for dashboardmemberimages" ON storage.objects;
DROP POLICY IF EXISTS "Public delete access for dashboardmemberimages" ON storage.objects;

-- Allow public read access (viewing images)
CREATE POLICY "Public read access for dashboardmemberimages"
ON storage.objects
FOR SELECT
USING (bucket_id = 'dashboardmemberimages');

-- Allow public uploads (INSERT) - REQUIRED for uploads to work
CREATE POLICY "Public upload access for dashboardmemberimages"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'dashboardmemberimages');

-- Allow public updates (replacing images)
CREATE POLICY "Public update access for dashboardmemberimages"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'dashboardmemberimages')
WITH CHECK (bucket_id = 'dashboardmemberimages');

-- Allow public deletes (removing images)
CREATE POLICY "Public delete access for dashboardmemberimages"
ON storage.objects
FOR DELETE
USING (bucket_id = 'dashboardmemberimages');

-- Verify policies were created
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND policyname LIKE '%dashboardmemberimages%';
