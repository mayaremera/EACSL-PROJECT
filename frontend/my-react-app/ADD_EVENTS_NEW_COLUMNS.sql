-- Add New Columns to Events Table
-- Run this in your Supabase SQL Editor
-- This adds the missing columns for header info and event overview

-- Add header info columns
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS header_info_1 TEXT,
ADD COLUMN IF NOT EXISTS header_info_2 TEXT;

-- Add event overview columns
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS overview_description TEXT,
ADD COLUMN IF NOT EXISTS duration_text TEXT,
ADD COLUMN IF NOT EXISTS tracks_description TEXT;

-- Verify the columns were added
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'events'
  AND column_name IN ('header_info_1', 'header_info_2', 'overview_description', 'duration_text', 'tracks_description')
ORDER BY column_name;

-- Optional: Add comments to document the columns
COMMENT ON COLUMN public.events.header_info_1 IS 'Header info 1 (e.g., "Two Days Conference")';
COMMENT ON COLUMN public.events.header_info_2 IS 'Header info 2 (e.g., "All Attendees Welcome")';
COMMENT ON COLUMN public.events.overview_description IS 'Event overview description';
COMMENT ON COLUMN public.events.duration_text IS 'Duration text (e.g., "Two Full Days")';
COMMENT ON COLUMN public.events.tracks_description IS 'Tracks description (e.g., "3 Parallel Sessions")';

