-- SQL Script to Remove First 2 Specialties from Members and Membership Forms Tables
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- This removes 'Phonetics and linguistics' and 'Speech and language therapy department' 
-- from all specialty arrays in both members and membership_forms tables

-- Remove first 2 specialties from members table
-- This removes 'Phonetics and linguistics' and 'Speech and language therapy department' from specialty JSONB arrays
-- COALESCE ensures empty arrays are set to '[]'::jsonb instead of NULL
UPDATE members
SET specialty = COALESCE(
  (
    SELECT jsonb_agg(elem)
    FROM jsonb_array_elements(specialty) elem
    WHERE elem::text NOT IN ('"Phonetics and linguistics"', '"Speech and language therapy department"')
  ),
  '[]'::jsonb
)
WHERE specialty IS NOT NULL 
  AND specialty != '[]'::jsonb
  AND (
    specialty @> '["Phonetics and linguistics"]'::jsonb 
    OR specialty @> '["Speech and language therapy department"]'::jsonb
  );

-- Remove first 2 specialties from membership_forms table
-- This removes 'Phonetics and linguistics' and 'Speech and language therapy department' from specialty JSONB arrays
-- COALESCE ensures empty arrays are set to '[]'::jsonb instead of NULL
UPDATE membership_forms
SET specialty = COALESCE(
  (
    SELECT jsonb_agg(elem)
    FROM jsonb_array_elements(specialty) elem
    WHERE elem::text NOT IN ('"Phonetics and linguistics"', '"Speech and language therapy department"')
  ),
  '[]'::jsonb
)
WHERE specialty IS NOT NULL 
  AND specialty != '[]'::jsonb
  AND (
    specialty @> '["Phonetics and linguistics"]'::jsonb 
    OR specialty @> '["Speech and language therapy department"]'::jsonb
  );

-- Verify the update: Count members with removed specialties (should be 0)
SELECT 
  COUNT(*) as members_with_removed_specialties
FROM members
WHERE specialty IS NOT NULL
  AND (
    specialty @> '["Phonetics and linguistics"]'::jsonb 
    OR specialty @> '["Speech and language therapy department"]'::jsonb
  );

-- Verify the update: Count membership_forms with removed specialties (should be 0)
SELECT 
  COUNT(*) as forms_with_removed_specialties
FROM membership_forms
WHERE specialty IS NOT NULL
  AND (
    specialty @> '["Phonetics and linguistics"]'::jsonb 
    OR specialty @> '["Speech and language therapy department"]'::jsonb
  );

-- Optional: Show sample of updated records
SELECT 
  id,
  name,
  specialty
FROM members
WHERE specialty IS NOT NULL 
  AND specialty != '[]'::jsonb
LIMIT 5;

SELECT 
  id,
  username,
  specialty
FROM membership_forms
WHERE specialty IS NOT NULL 
  AND specialty != '[]'::jsonb
LIMIT 5;

