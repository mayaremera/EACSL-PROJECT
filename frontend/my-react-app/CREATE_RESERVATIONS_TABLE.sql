-- SQL Script to Create Reservations Table in Supabase
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- This table will store all Reservation/Assessment booking form submissions

-- Create reservations table
CREATE TABLE IF NOT EXISTS reservations (
  id BIGSERIAL PRIMARY KEY,
  kids_name TEXT NOT NULL,
  your_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  selected_assessments JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of selected assessment types
  concern TEXT NOT NULL, -- Description of child's condition/concern
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  
  -- Metadata
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  review_notes TEXT, -- Optional notes from admin review
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on phone_number for faster lookups
CREATE INDEX IF NOT EXISTS idx_reservations_phone_number ON reservations(phone_number);

-- Create index on your_name for searching
CREATE INDEX IF NOT EXISTS idx_reservations_your_name ON reservations(your_name);

-- Create index on status for filtering (pending, approved, rejected)
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);

-- Create index on submitted_at for sorting
CREATE INDEX IF NOT EXISTS idx_reservations_submitted_at ON reservations(submitted_at DESC);

-- Create index on reviewed_by for admin review tracking
CREATE INDEX IF NOT EXISTS idx_reservations_reviewed_by ON reservations(reviewed_by);

-- Enable Row Level Security (RLS)
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for authenticated users (admins)
-- Admins can view, approve, reject, and manage all reservations
CREATE POLICY "Allow all operations for authenticated users" ON reservations
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Create policy to allow public insert (for form submissions)
-- Anyone can submit a reservation, but only admins can view them
CREATE POLICY "Allow public insert" ON reservations
  FOR INSERT
  WITH CHECK (true);

-- Create a function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_reservations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER reservations_updated_at
  BEFORE UPDATE ON reservations
  FOR EACH ROW
  EXECUTE FUNCTION update_reservations_updated_at();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON reservations TO authenticated;
GRANT INSERT ON reservations TO anon;

-- Create helpful comments
COMMENT ON TABLE reservations IS 'Stores Reservation/Assessment booking form submissions from the website';
COMMENT ON COLUMN reservations.status IS 'pending: awaiting review, approved: reservation approved, rejected: reservation rejected';
COMMENT ON COLUMN reservations.selected_assessments IS 'JSONB array of selected assessment types (e.g., ["تقييم النطق", "تقييم المهارات"])';
COMMENT ON COLUMN reservations.concern IS 'Description of the child''s condition or parent''s concern';

