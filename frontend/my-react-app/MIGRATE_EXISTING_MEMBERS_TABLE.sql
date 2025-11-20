-- SQL Script to Add Missing Fields to Existing Members Table
-- Run this ONLY if you already have a members table but it's missing some fields
-- This will add the dashboard-specific fields without affecting existing data

-- Add continuing education fields (if they don't exist)
ALTER TABLE members 
ADD COLUMN IF NOT EXISTS total_money_spent TEXT DEFAULT '0 EGP',
ADD COLUMN IF NOT EXISTS courses_enrolled INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_hours_learned INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS active_courses JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS completed_courses JSONB DEFAULT '[]'::jsonb;

-- Handle image field - check if you have 'image' or 'image_path'
-- If you have 'image' but need 'image_path', we can add it
-- (The app can work with either, but 'image_path' is preferred for Supabase Storage)
DO $$
BEGIN
  -- Check if image_path doesn't exist but image does
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'members' AND column_name = 'image_path'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'members' AND column_name = 'image'
  ) THEN
    -- Add image_path column
    ALTER TABLE members ADD COLUMN image_path TEXT;
    
    -- Optionally copy existing image URLs to image_path
    -- Uncomment the line below if you want to migrate existing image data
    -- UPDATE members SET image_path = image WHERE image IS NOT NULL AND image_path IS NULL;
  END IF;
END $$;

-- Verify the migration
SELECT 
  column_name,
  data_type,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'members'
  AND column_name IN (
    'total_money_spent',
    'courses_enrolled', 
    'total_hours_learned',
    'active_courses',
    'completed_courses',
    'image_path',
    'image'
  )
ORDER BY column_name;

