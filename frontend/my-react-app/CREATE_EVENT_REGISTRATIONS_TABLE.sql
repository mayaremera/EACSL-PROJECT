-- SQL Script to Create Event Registrations Table in Supabase
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- This table will store all event registration form submissions

-- Create event_registrations table
CREATE TABLE IF NOT EXISTS event_registrations (
  id BIGSERIAL PRIMARY KEY,
  event_id BIGINT, -- Optional: link to events table if needed
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  organization TEXT,
  membership_type TEXT NOT NULL CHECK (membership_type IN ('member', 'guest')),
  selected_tracks JSONB DEFAULT '[]'::jsonb, -- Array of selected track names
  special_requirements TEXT,
  registration_fee DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  
  -- Metadata
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  review_notes TEXT, -- Optional notes from admin review
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_event_registrations_email ON event_registrations(email);

-- Create index on status for filtering (pending, approved, rejected)
CREATE INDEX IF NOT EXISTS idx_event_registrations_status ON event_registrations(status);

-- Create index on submitted_at for sorting
CREATE INDEX IF NOT EXISTS idx_event_registrations_submitted_at ON event_registrations(submitted_at DESC);

-- Create index on event_id for filtering by event
CREATE INDEX IF NOT EXISTS idx_event_registrations_event_id ON event_registrations(event_id);

-- Create index on reviewed_by for admin review tracking
CREATE INDEX IF NOT EXISTS idx_event_registrations_reviewed_by ON event_registrations(reviewed_by);

-- Enable Row Level Security (RLS)
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for authenticated users (admins)
-- Admins can view, approve, reject, and manage all registrations
CREATE POLICY "Allow all operations for authenticated users" ON event_registrations
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Create policy to allow public insert (for form submissions)
-- Anyone can submit a registration, but only admins can view them
CREATE POLICY "Allow public insert" ON event_registrations
  FOR INSERT
  WITH CHECK (true);

-- Create a function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_event_registrations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER event_registrations_updated_at
  BEFORE UPDATE ON event_registrations
  FOR EACH ROW
  EXECUTE FUNCTION update_event_registrations_updated_at();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON event_registrations TO authenticated;
GRANT INSERT ON event_registrations TO anon;

-- Create helpful comments
COMMENT ON TABLE event_registrations IS 'Stores event registration form submissions from the website';
COMMENT ON COLUMN event_registrations.status IS 'pending: awaiting review, approved: registration approved, rejected: registration rejected';
COMMENT ON COLUMN event_registrations.membership_type IS 'member: EACSL member, guest: non-member guest';
COMMENT ON COLUMN event_registrations.selected_tracks IS 'JSONB array of selected track names (e.g., ["Track A: Speech & Swallowing", "Track B: Language Disorders"])';
COMMENT ON COLUMN event_registrations.registration_fee IS 'Registration fee in EGP based on membership type';

