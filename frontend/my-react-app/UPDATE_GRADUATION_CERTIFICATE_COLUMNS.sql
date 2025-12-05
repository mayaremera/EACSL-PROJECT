-- SQL Script to Update Graduation Certificate Columns in membership_forms Table
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- This replaces the graduation_cert_path and graduation_cert_url columns with certificate_name and certificate_date

-- Step 1: Add new columns
ALTER TABLE membership_forms 
ADD COLUMN IF NOT EXISTS certificate_name TEXT,
ADD COLUMN IF NOT EXISTS certificate_date DATE;

-- Step 2: Drop old columns (this will remove graduation_cert_path and graduation_cert_url)
ALTER TABLE membership_forms 
DROP COLUMN IF EXISTS graduation_cert_path,
DROP COLUMN IF EXISTS graduation_cert_url;

-- Step 3: Add comments to document the new columns
COMMENT ON COLUMN membership_forms.certificate_name IS 'Name of the graduation certificate';
COMMENT ON COLUMN membership_forms.certificate_date IS 'Date when the graduation certificate was issued';

-- Step 4: Verify the changes
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'membership_forms' 
  AND column_name IN ('certificate_name', 'certificate_date', 'graduation_cert_path', 'graduation_cert_url')
ORDER BY column_name;

-- Expected result: Should show certificate_name and certificate_date, but NOT graduation_cert_path or graduation_cert_url

