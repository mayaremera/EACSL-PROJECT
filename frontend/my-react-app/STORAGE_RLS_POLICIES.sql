-- SQL Script to Enable Public Uploads to MemberBucket
-- Run this in Supabase SQL Editor if your bucket is Private

-- First, check if bucket exists and is Private
-- If bucket is Public, you don't need these policies

-- Policy 1: Allow public to INSERT (upload) files
CREATE POLICY "Allow public uploads to MemberBucket"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'MemberBucket');

-- Policy 2: Allow public to SELECT (read/download) files
CREATE POLICY "Allow public reads from MemberBucket"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'MemberBucket');

-- Policy 3: Allow public to UPDATE files (optional, for replacing files)
CREATE POLICY "Allow public updates to MemberBucket"
ON storage.objects
FOR UPDATE
TO public
USING (bucket_id = 'MemberBucket')
WITH CHECK (bucket_id = 'MemberBucket');

-- Policy 4: Allow public to DELETE files (optional, for cleanup)
-- Uncomment if you want to allow public deletion
-- CREATE POLICY "Allow public deletes from MemberBucket"
-- ON storage.objects
-- FOR DELETE
-- TO public
-- USING (bucket_id = 'MemberBucket');

-- Verify policies were created
SELECT * FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname LIKE '%MemberBucket%';

