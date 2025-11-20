-- SQL Script to Check if Members Table Exists and Compare Structure
-- Run this in your Supabase SQL Editor to see what you currently have

-- Check if members table exists
SELECT 
  table_name,
  table_schema
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'members';

-- If table exists, show its current structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'members'
ORDER BY ordinal_position;

-- Check if you have the required fields for dashboard functionality
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'members' AND column_name = 'total_money_spent'
    ) THEN '✅ Has total_money_spent'
    ELSE '❌ Missing total_money_spent'
  END as total_money_spent_check,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'members' AND column_name = 'courses_enrolled'
    ) THEN '✅ Has courses_enrolled'
    ELSE '❌ Missing courses_enrolled'
  END as courses_enrolled_check,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'members' AND column_name = 'total_hours_learned'
    ) THEN '✅ Has total_hours_learned'
    ELSE '❌ Missing total_hours_learned'
  END as total_hours_learned_check,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'members' AND column_name = 'active_courses'
    ) THEN '✅ Has active_courses'
    ELSE '❌ Missing active_courses'
  END as active_courses_check,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'members' AND column_name = 'completed_courses'
    ) THEN '✅ Has completed_courses'
    ELSE '❌ Missing completed_courses'
  END as completed_courses_check,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'members' AND column_name = 'image_path'
    ) THEN '✅ Has image_path'
    ELSE '❌ Missing image_path (has image instead?)'
  END as image_path_check;

-- Show count of existing members
SELECT COUNT(*) as total_members FROM members;

