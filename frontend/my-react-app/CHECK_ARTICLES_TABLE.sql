-- SQL Script to Check Articles Table Structure
-- Run this in your Supabase SQL Editor to see what columns actually exist

-- Check if articles table exists
SELECT 
  table_name,
  table_schema
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'articles';

-- Show all columns in the articles table
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'articles'
ORDER BY ordinal_position;

-- Check for specific columns
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'articles' AND column_name = 'title_ar'
    ) THEN '✅ Has title_ar'
    ELSE '❌ Missing title_ar'
  END as title_ar_check,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'articles' AND column_name = 'title_en'
    ) THEN '✅ Has title_en'
    ELSE '❌ Missing title_en'
  END as title_en_check,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'articles' AND column_name = 'category_ar'
    ) THEN '✅ Has category_ar'
    ELSE '❌ Missing category_ar'
  END as category_ar_check,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'articles' AND column_name = 'excerpt_ar'
    ) THEN '✅ Has excerpt_ar'
    ELSE '❌ Missing excerpt_ar'
  END as excerpt_ar_check,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'articles' AND column_name = 'excerpt_en'
    ) THEN '✅ Has excerpt_en'
    ELSE '❌ Missing excerpt_en'
  END as excerpt_en_check;

-- Show a sample article to see actual data structure
SELECT * FROM articles LIMIT 1;

