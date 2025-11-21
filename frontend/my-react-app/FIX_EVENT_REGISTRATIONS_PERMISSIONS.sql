-- Quick Fix: Event Registrations Permissions
-- Run this if you're getting permission errors when submitting forms
-- This ensures the minimum required permissions are set

-- Ensure RLS is enabled
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

-- Drop and recreate the public insert policy (most important for form submissions)
DROP POLICY IF EXISTS "Allow public insert" ON event_registrations;
CREATE POLICY "Allow public insert" ON event_registrations
  FOR INSERT
  WITH CHECK (true);

-- Ensure authenticated users can do everything
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON event_registrations;
CREATE POLICY "Allow all operations for authenticated users" ON event_registrations
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Grant permissions
GRANT INSERT ON event_registrations TO anon;
GRANT ALL ON event_registrations TO authenticated;

