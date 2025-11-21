-- SQL Script to Create Membership Forms Table in Supabase
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- This table will store all "Become a Member" form submissions

-- Create membership_forms table
CREATE TABLE IF NOT EXISTS membership_forms (
  id BIGSERIAL PRIMARY KEY,
  username TEXT NOT NULL,
  email TEXT NOT NULL,
  password TEXT NOT NULL, -- Encrypted password for account creation upon approval
  specialty JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of selected specialties
  previous_work TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  
  -- File storage paths (stored in member-forms-bucket)
  profile_image_path TEXT, -- Path in storage: "profile-images/{filename}"
  profile_image_url TEXT, -- Full URL for easy access
  
  id_image_path TEXT, -- Path in storage: "id-cards/{filename}"
  id_image_url TEXT, -- Full URL for easy access
  
  graduation_cert_path TEXT, -- Path in storage: "certificates/{filename}"
  graduation_cert_url TEXT, -- Full URL for easy access
  
  cv_path TEXT, -- Path in storage: "cvs/{filename}"
  cv_url TEXT, -- Full URL for easy access
  
  -- Metadata
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  review_notes TEXT, -- Optional notes from admin review
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on email for faster lookups and duplicate checking
CREATE INDEX IF NOT EXISTS idx_membership_forms_email ON membership_forms(email);

-- Create index on status for filtering (pending, approved, rejected)
CREATE INDEX IF NOT EXISTS idx_membership_forms_status ON membership_forms(status);

-- Create index on submitted_at for sorting
CREATE INDEX IF NOT EXISTS idx_membership_forms_submitted_at ON membership_forms(submitted_at DESC);

-- Create index on reviewed_by for admin review tracking
CREATE INDEX IF NOT EXISTS idx_membership_forms_reviewed_by ON membership_forms(reviewed_by);

-- Create unique constraint on email + status='pending' to prevent duplicate pending applications
-- Note: This allows same email with different statuses (e.g., rejected then resubmitted)
CREATE UNIQUE INDEX IF NOT EXISTS idx_membership_forms_email_pending 
  ON membership_forms(email) 
  WHERE status = 'pending';

-- Enable Row Level Security (RLS)
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
-- Anyone can submit a form, but only admins can view them
CREATE POLICY "Allow public insert" ON membership_forms
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Create a function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_membership_forms_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER membership_forms_updated_at
  BEFORE UPDATE ON membership_forms
  FOR EACH ROW
  EXECUTE FUNCTION update_membership_forms_updated_at();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON membership_forms TO authenticated;
GRANT INSERT ON membership_forms TO anon;

-- Create helpful comments
COMMENT ON TABLE membership_forms IS 'Stores "Become a Member" form submissions from the website';
COMMENT ON COLUMN membership_forms.status IS 'pending: awaiting review, approved: application approved, rejected: application rejected';
COMMENT ON COLUMN membership_forms.password IS 'Encrypted password stored for account creation when application is approved';
COMMENT ON COLUMN membership_forms.specialty IS 'JSONB array of selected specialties (e.g., ["Phonetics and linguistics", "Speech and language therapy department"])';

