-- SQL Script to Create Contact Forms Table in Supabase
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- This table will store all Contact form submissions

-- Create contact_forms table
CREATE TABLE IF NOT EXISTS contact_forms (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT, -- Optional phone number
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
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
CREATE INDEX IF NOT EXISTS idx_contact_forms_email ON contact_forms(email);

-- Create index on status for filtering (pending, approved, rejected)
CREATE INDEX IF NOT EXISTS idx_contact_forms_status ON contact_forms(status);

-- Create index on submitted_at for sorting
CREATE INDEX IF NOT EXISTS idx_contact_forms_submitted_at ON contact_forms(submitted_at DESC);

-- Create index on reviewed_by for admin review tracking
CREATE INDEX IF NOT EXISTS idx_contact_forms_reviewed_by ON contact_forms(reviewed_by);

-- Enable Row Level Security (RLS)
ALTER TABLE contact_forms ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for authenticated users (admins)
-- Admins can view, approve, reject, and manage all forms
CREATE POLICY "Allow all operations for authenticated users" ON contact_forms
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Create policy to allow public insert (for form submissions)
-- Anyone can submit a form, but only admins can view them
CREATE POLICY "Allow public insert" ON contact_forms
  FOR INSERT
  WITH CHECK (true);

-- Create a function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_contact_forms_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER contact_forms_updated_at
  BEFORE UPDATE ON contact_forms
  FOR EACH ROW
  EXECUTE FUNCTION update_contact_forms_updated_at();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON contact_forms TO authenticated;
GRANT INSERT ON contact_forms TO anon;

-- Create helpful comments
COMMENT ON TABLE contact_forms IS 'Stores Contact form submissions from the website';
COMMENT ON COLUMN contact_forms.status IS 'pending: awaiting review, approved: message approved, rejected: message rejected';
COMMENT ON COLUMN contact_forms.phone IS 'Optional phone number - may be null';

