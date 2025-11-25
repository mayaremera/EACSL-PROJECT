-- SQL Script to Update Courses Table in Supabase
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- This will add all the course detail fields to the existing courses table

-- ============================================================================
-- ADD NEW COLUMNS TO COURSES TABLE
-- ============================================================================

-- Add title translations (English and Arabic)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'courses' 
                   AND column_name = 'title_en') THEN
        ALTER TABLE public.courses ADD COLUMN title_en TEXT;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'courses' 
                   AND column_name = 'title_ar') THEN
        ALTER TABLE public.courses ADD COLUMN title_ar TEXT;
    END IF;
END $$;

-- Add category Arabic translation
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'courses' 
                   AND column_name = 'category_ar') THEN
        ALTER TABLE public.courses ADD COLUMN category_ar TEXT;
    END IF;
END $$;

-- Add short description
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'courses' 
                   AND column_name = 'description_short') THEN
        ALTER TABLE public.courses ADD COLUMN description_short TEXT;
    END IF;
END $$;

-- Add skill level (separate from level)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'courses' 
                   AND column_name = 'skill_level') THEN
        ALTER TABLE public.courses ADD COLUMN skill_level TEXT;
    END IF;
END $$;

-- Add numeric fields (lessons, lectures, students, enrolled)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'courses' 
                   AND column_name = 'lessons') THEN
        ALTER TABLE public.courses ADD COLUMN lessons INTEGER DEFAULT 0;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'courses' 
                   AND column_name = 'lectures') THEN
        ALTER TABLE public.courses ADD COLUMN lectures INTEGER DEFAULT 0;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'courses' 
                   AND column_name = 'students') THEN
        ALTER TABLE public.courses ADD COLUMN students INTEGER DEFAULT 0;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'courses' 
                   AND column_name = 'enrolled') THEN
        ALTER TABLE public.courses ADD COLUMN enrolled INTEGER DEFAULT 0;
    END IF;
END $$;

-- Add money back guarantee
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'courses' 
                   AND column_name = 'money_back_guarantee') THEN
        ALTER TABLE public.courses ADD COLUMN money_back_guarantee TEXT;
    END IF;
END $$;

-- Add instructor details (image, title, bio)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'courses' 
                   AND column_name = 'instructor_image') THEN
        ALTER TABLE public.courses ADD COLUMN instructor_image TEXT;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'courses' 
                   AND column_name = 'instructor_image_path') THEN
        ALTER TABLE public.courses ADD COLUMN instructor_image_path TEXT;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'courses' 
                   AND column_name = 'instructor_title') THEN
        ALTER TABLE public.courses ADD COLUMN instructor_title TEXT;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'courses' 
                   AND column_name = 'instructor_bio') THEN
        ALTER TABLE public.courses ADD COLUMN instructor_bio TEXT;
    END IF;
END $$;

-- Add language
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'courses' 
                   AND column_name = 'language') THEN
        ALTER TABLE public.courses ADD COLUMN language TEXT DEFAULT 'English';
    END IF;
END $$;

-- Add class time and start date
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'courses' 
                   AND column_name = 'class_time') THEN
        ALTER TABLE public.courses ADD COLUMN class_time TEXT;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'courses' 
                   AND column_name = 'start_date') THEN
        ALTER TABLE public.courses ADD COLUMN start_date TEXT;
    END IF;
END $$;

-- Add JSONB fields for arrays (learning outcomes and curriculum)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'courses' 
                   AND column_name = 'learning_outcomes') THEN
        ALTER TABLE public.courses ADD COLUMN learning_outcomes JSONB DEFAULT '[]'::jsonb;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'courses' 
                   AND column_name = 'curriculum') THEN
        ALTER TABLE public.courses ADD COLUMN curriculum JSONB DEFAULT '[]'::jsonb;
    END IF;
END $$;

-- ============================================================================
-- VERIFY COLUMNS WERE ADDED
-- ============================================================================

-- Check all columns in the courses table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'courses'
ORDER BY ordinal_position;

-- ============================================================================
-- NOTES
-- ============================================================================
-- This script safely adds all new columns only if they don't already exist.
-- It won't break if you run it multiple times.
-- 
-- The new columns added:
-- - title_en, title_ar: Multi-language support for course titles
-- - category_ar: Arabic category name
-- - description_short: Short description for previews
-- - skill_level: Additional skill level field
-- - lessons, lectures, students, enrolled: Numeric course statistics
-- - money_back_guarantee: Guarantee text
-- - instructor_image, instructor_title, instructor_bio: Extended instructor info
-- - language: Course language
-- - class_time, start_date: Schedule information
-- - learning_outcomes, curriculum: JSONB arrays for structured data
--
-- After running this script, update your coursesService.js mapLocalToSupabase()
-- and mapSupabaseToLocal() functions to include these new fields.

