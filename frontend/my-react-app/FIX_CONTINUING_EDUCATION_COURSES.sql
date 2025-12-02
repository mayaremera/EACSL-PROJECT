-- SQL Script to Fix Continuing Education Courses Storage in Supabase
-- This ensures active_courses and completed_courses are properly stored and never lost
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)

-- First, ensure the columns exist with proper defaults
ALTER TABLE members 
ADD COLUMN IF NOT EXISTS active_courses JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS completed_courses JSONB DEFAULT '[]'::jsonb;

-- Update any NULL values to empty arrays
UPDATE members 
SET active_courses = '[]'::jsonb 
WHERE active_courses IS NULL;

UPDATE members 
SET completed_courses = '[]'::jsonb 
WHERE completed_courses IS NULL;

-- Add constraints to ensure these columns are never NULL
ALTER TABLE members 
ALTER COLUMN active_courses SET DEFAULT '[]'::jsonb,
ALTER COLUMN completed_courses SET DEFAULT '[]'::jsonb;

-- Add a check constraint to ensure they're always arrays (optional but recommended)
-- This prevents storing non-array values
DO $$
BEGIN
  -- Drop existing constraint if it exists
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'check_active_courses_is_array'
  ) THEN
    ALTER TABLE members DROP CONSTRAINT check_active_courses_is_array;
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'check_completed_courses_is_array'
  ) THEN
    ALTER TABLE members DROP CONSTRAINT check_completed_courses_is_array;
  END IF;
  
  -- Add new constraints
  ALTER TABLE members 
  ADD CONSTRAINT check_active_courses_is_array 
  CHECK (jsonb_typeof(active_courses) = 'array');
  
  ALTER TABLE members 
  ADD CONSTRAINT check_completed_courses_is_array 
  CHECK (jsonb_typeof(completed_courses) = 'array');
EXCEPTION
  WHEN OTHERS THEN
    -- If constraints can't be added (e.g., existing invalid data), just log it
    RAISE NOTICE 'Could not add array constraints. Some data may need to be fixed first.';
END $$;

-- Create a trigger function to ensure arrays are never null on insert/update
CREATE OR REPLACE FUNCTION ensure_courses_arrays()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure active_courses is always an array
  IF NEW.active_courses IS NULL OR jsonb_typeof(NEW.active_courses) != 'array' THEN
    NEW.active_courses := '[]'::jsonb;
  END IF;
  
  -- Ensure completed_courses is always an array
  IF NEW.completed_courses IS NULL OR jsonb_typeof(NEW.completed_courses) != 'array' THEN
    NEW.completed_courses := '[]'::jsonb;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if it exists
DROP TRIGGER IF EXISTS trigger_ensure_courses_arrays ON members;

-- Create trigger to run before insert or update
CREATE TRIGGER trigger_ensure_courses_arrays
  BEFORE INSERT OR UPDATE ON members
  FOR EACH ROW
  EXECUTE FUNCTION ensure_courses_arrays();

-- Verify the setup
SELECT 
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'members'
  AND column_name IN ('active_courses', 'completed_courses')
ORDER BY column_name;

-- Show sample data to verify
SELECT 
  id,
  name,
  email,
  jsonb_array_length(COALESCE(active_courses, '[]'::jsonb)) as active_courses_count,
  jsonb_array_length(COALESCE(completed_courses, '[]'::jsonb)) as completed_courses_count,
  active_courses,
  completed_courses
FROM members
LIMIT 5;

