-- Migration: Add hero_title and hero_description columns to events table
-- Run this SQL script in your Supabase SQL Editor to add support for separate hero section fields

-- Add hero_title column
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS hero_title TEXT;

-- Add hero_description column
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS hero_description TEXT;

-- Optional: Add comments to document the columns
COMMENT ON COLUMN events.hero_title IS 'Title displayed in the hero section (separate from event title)';
COMMENT ON COLUMN events.hero_description IS 'Description displayed in the hero section (separate from event subtitle)';

