-- SQL Script to Add Display Role Column to Members Table
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- This adds a display_role field that can be edited in the dashboard

-- Add display_role column to members table
ALTER TABLE members 
ADD COLUMN IF NOT EXISTS display_role TEXT;

-- Create index on display_role for faster filtering/searching
CREATE INDEX IF NOT EXISTS idx_members_display_role ON members(display_role);

-- Add comment to document the column
COMMENT ON COLUMN members.display_role IS 'Public-facing role displayed on website. If NULL, uses role field. Admin role is automatically mapped to display_role if set, otherwise to default.';

-- Verify the column was added
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'members' 
  AND column_name = 'display_role';

