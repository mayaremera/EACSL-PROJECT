-- SQL Script to Add Specialty Column to Members Table
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- This adds a specialty field that stores the member's specialties as a JSONB array

-- Add specialty column to members table
ALTER TABLE members 
ADD COLUMN IF NOT EXISTS specialty JSONB DEFAULT '[]'::jsonb;

-- Create index on specialty for faster filtering/searching
-- Using GIN index for JSONB array queries
CREATE INDEX IF NOT EXISTS idx_members_specialty ON members USING GIN (specialty);

-- Add comment to document the column
COMMENT ON COLUMN members.specialty IS 'Array of specialties (JSONB). Matches specialties from membership_forms table. Used for filtering members by specialty.';

-- Verify the column was added
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'members' 
  AND column_name = 'specialty';

