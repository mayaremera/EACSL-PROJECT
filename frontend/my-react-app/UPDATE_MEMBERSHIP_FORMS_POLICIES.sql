-- SQL Script to Update Membership Forms Table Security Policies
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- This will fix RLS policies to allow public form submissions

-- First, drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON membership_forms;
DROP POLICY IF EXISTS "Allow public insert" ON membership_forms;

-- Ensure RLS is enabled
ALTER TABLE membership_forms ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for authenticated users (admins)
-- Admins can view, approve, reject, and manage all forms
CREATE POLICY "Allow all operations for authenticated users" ON membership_forms
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policy to allow public insert (for form submissions from anonymous users)
-- This is critical for allowing form submissions without authentication
CREATE POLICY "Allow public insert" ON membership_forms
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Grant necessary permissions (ensure these are set)
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON membership_forms TO authenticated;
GRANT INSERT ON membership_forms TO anon;

-- Verify the policies are created
-- You can check this in Supabase Dashboard → Authentication → Policies

