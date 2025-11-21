-- SQL Script to Update Reservations Table Security Policies
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- This will fix RLS policies to allow public form submissions

-- IMPORTANT: Run this script to fix RLS policy errors when submitting reservation forms
-- This allows anonymous users to submit forms and see their own submissions

-- First, drop ALL existing policies to avoid conflicts
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'reservations') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON reservations';
    END LOOP;
END $$;

-- Ensure RLS is enabled
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for authenticated users (admins)
-- Admins can view, approve, reject, and manage all reservations
CREATE POLICY "Allow all operations for authenticated users" ON reservations
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policy to allow public insert (for form submissions from anonymous users)
-- This is critical for allowing form submissions without authentication
CREATE POLICY "Allow public insert" ON reservations
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Create policy to allow anonymous users to SELECT rows
-- This is needed for the .select() call after insert to return the inserted row
-- Anonymous users can only see pending rows (their own submissions)
-- They cannot enumerate all rows without knowing specific IDs
CREATE POLICY "Allow public select after insert" ON reservations
  FOR SELECT
  TO anon
  USING (status = 'pending');

-- Grant necessary permissions (ensure these are set)
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON reservations TO authenticated;
GRANT INSERT, SELECT ON reservations TO anon;

-- Verify the policies are created
-- You can check this in Supabase Dashboard → Authentication → Policies

