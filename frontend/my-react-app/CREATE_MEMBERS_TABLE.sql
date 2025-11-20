-- SQL Script to Create Members Table in Supabase
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- This will create the members table needed for syncing member data

-- Create members table
CREATE TABLE IF NOT EXISTS members (
  id BIGSERIAL PRIMARY KEY,
  supabase_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'Member',
  nationality TEXT DEFAULT 'Egyptian',
  flag_code TEXT DEFAULT 'eg',
  description TEXT,
  full_description TEXT,
  membership_date TEXT,
  is_active BOOLEAN DEFAULT true,
  active_till TEXT,
  certificates JSONB DEFAULT '[]'::jsonb,
  phone TEXT,
  location TEXT,
  website TEXT,
  linkedin TEXT,
  image_path TEXT, -- Path to image in Supabase Storage (e.g., "profile-images/123.jpg")
  total_money_spent TEXT DEFAULT '0 EGP',
  courses_enrolled INTEGER DEFAULT 0,
  total_hours_learned INTEGER DEFAULT 0,
  active_courses JSONB DEFAULT '[]'::jsonb,
  completed_courses JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on supabase_user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_members_supabase_user_id ON members(supabase_user_id);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_members_email ON members(email);

-- Create index on is_active for filtering
CREATE INDEX IF NOT EXISTS idx_members_is_active ON members(is_active);

-- Enable Row Level Security (RLS)
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for authenticated users
-- Adjust this based on your security requirements
CREATE POLICY "Allow all operations for authenticated users" ON members
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Or if you want public read access (for displaying members on website):
CREATE POLICY "Allow public read access" ON members
  FOR SELECT
  USING (true);

-- Create a function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_members_updated_at
  BEFORE UPDATE ON members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Verify the table was created
SELECT 
  table_name, 
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_name = 'members' 
ORDER BY ordinal_position;

