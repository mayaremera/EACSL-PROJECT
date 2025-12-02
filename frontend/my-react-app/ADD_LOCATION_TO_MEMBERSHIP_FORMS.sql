-- SQL Script to Add Location Column to Membership Forms Table
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- This adds the location field to the membership_forms table

-- Add location column to membership_forms table
ALTER TABLE membership_forms 
ADD COLUMN IF NOT EXISTS location TEXT;

-- Create index on location for faster filtering/searching
CREATE INDEX IF NOT EXISTS idx_membership_forms_location ON membership_forms(location);

-- Add comment to document the column
COMMENT ON COLUMN membership_forms.location IS 'Member location (city, country, etc.)';

-- Verify the column was added
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'membership_forms' 
  AND column_name = 'location';

