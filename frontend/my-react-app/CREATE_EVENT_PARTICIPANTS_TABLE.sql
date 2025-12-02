-- SQL Script to Create Event Participants Table in Supabase
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- This table will store speakers, scientific committee, and organizing committee members for events

-- Create event_participants table
CREATE TABLE IF NOT EXISTS event_participants (
  id BIGSERIAL PRIMARY KEY,
  event_id BIGINT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  image_url TEXT,
  image_path TEXT, -- Path to image in EventBucket storage
  bio TEXT, -- Description/bio of the participant
  linkedin_url TEXT, -- LinkedIn profile URL
  role TEXT NOT NULL CHECK (role IN ('speaker', 'scientific_committee', 'organizing_committee')),
  display_order INTEGER DEFAULT 0, -- Order for display (optional)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on event_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_event_participants_event_id ON event_participants(event_id);

-- Create index on role for filtering
CREATE INDEX IF NOT EXISTS idx_event_participants_role ON event_participants(role);

-- Create index on event_id and role for combined filtering
CREATE INDEX IF NOT EXISTS idx_event_participants_event_role ON event_participants(event_id, role);

-- Create index on display_order for sorting
CREATE INDEX IF NOT EXISTS idx_event_participants_display_order ON event_participants(display_order);

-- Enable Row Level Security (RLS)
ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access (for displaying on event pages)
CREATE POLICY "Allow public read event_participants" ON event_participants
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Create policy to allow authenticated users (admins) to do all operations
CREATE POLICY "Allow authenticated users full access event_participants" ON event_participants
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Grant permissions
GRANT SELECT ON event_participants TO anon, authenticated;
GRANT ALL ON event_participants TO authenticated;

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_event_participants_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_event_participants_updated_at
  BEFORE UPDATE ON event_participants
  FOR EACH ROW
  EXECUTE FUNCTION update_event_participants_updated_at();

-- Add comments to document the table
COMMENT ON TABLE event_participants IS 'Stores speakers, scientific committee, and organizing committee members for events';
COMMENT ON COLUMN event_participants.role IS 'Role type: speaker, scientific_committee, or organizing_committee';
COMMENT ON COLUMN event_participants.display_order IS 'Order for displaying participants (lower numbers appear first)';

