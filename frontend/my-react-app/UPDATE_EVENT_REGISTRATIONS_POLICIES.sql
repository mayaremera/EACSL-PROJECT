-- SQL Script to Update Event Registrations RLS Policies
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- This will fix permission issues for form submissions and admin access

-- First, drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON event_registrations;
DROP POLICY IF EXISTS "Allow public insert" ON event_registrations;
DROP POLICY IF EXISTS "Allow public read access" ON event_registrations;

-- Policy 1: Allow authenticated users (admins) to do ALL operations
-- This allows admins to view, approve, reject, and delete registrations
CREATE POLICY "Allow all operations for authenticated users" ON event_registrations
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Policy 2: Allow anonymous/public users to INSERT (submit forms)
-- This is required for the registration form to work without login
CREATE POLICY "Allow public insert" ON event_registrations
  FOR INSERT
  WITH CHECK (true);

-- Policy 3: Allow anonymous/public users to SELECT their own registrations (optional)
-- This allows users to view their own submissions if needed
-- Comment this out if you don't want public users to see any registrations
CREATE POLICY "Allow public read own registrations" ON event_registrations
  FOR SELECT
  USING (true);
-- If you want to restrict to only their own email, use this instead:
-- USING (email = current_setting('request.jwt.claims', true)::json->>'email');

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON event_registrations TO authenticated;
GRANT INSERT, SELECT ON event_registrations TO anon;

-- Verify RLS is enabled
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

-- Helpful comments
COMMENT ON POLICY "Allow all operations for authenticated users" ON event_registrations IS 
  'Allows authenticated users (admins) to view, update, and delete all registrations';
COMMENT ON POLICY "Allow public insert" ON event_registrations IS 
  'Allows anyone (including anonymous users) to submit registration forms';
COMMENT ON POLICY "Allow public read own registrations" ON event_registrations IS 
  'Allows public users to view registrations (optional - can be removed for privacy)';

