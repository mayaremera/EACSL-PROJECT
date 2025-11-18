# Supabase Events Table Setup

To enable full Supabase integration for events, you need to create an `events` table in your Supabase database and set up the `EventBucket` storage bucket.

## ⚠️ Important: Error PGRST205

If you see the error `PGRST205: Could not find the table 'public.events' in the schema cache`, it means the `events` table doesn't exist yet. Follow the steps below to create it.

## Step 1: Create Events Table

Run this SQL script in your Supabase SQL Editor:

```sql
-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  member_fee DECIMAL(10, 2) DEFAULT 500.00,
  guest_fee DECIMAL(10, 2) DEFAULT 800.00,
  tracks JSONB DEFAULT '[]'::jsonb,
  schedule_day1 JSONB DEFAULT '[]'::jsonb,
  schedule_day2 JSONB DEFAULT '[]'::jsonb,
  day1_title TEXT DEFAULT 'Day One - Knowledge and Innovation',
  day2_title TEXT DEFAULT 'Day Two - Collaboration and Future Directions',
  hero_image_url TEXT,
  hero_image_path TEXT, -- Path to image in EventBucket storage
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'past')),
  event_date DATE, -- Optional: date of the event
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on status for faster filtering (upcoming vs past)
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);

-- Create index on event_date for sorting
CREATE INDEX IF NOT EXISTS idx_events_event_date ON events(event_date);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for authenticated users
CREATE POLICY "Allow all operations for authenticated users" ON events
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Create policy to allow public read access (for viewing events on website)
CREATE POLICY "Allow public read access" ON events
  FOR SELECT
  USING (true);

-- Create a function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_events_updated_at();
```

## Step 2: Set Up EventBucket Storage

1. Go to your Supabase Dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **New bucket**
4. Name it: `EventBucket`
5. Set it to **Public** (so images can be accessed from the website)
6. Click **Create bucket**

### Storage Policies for EventBucket

After creating the bucket, set up storage policies. Go to **Storage** → **Policies** → **EventBucket** and run this SQL:

```sql
-- Allow public read access to event images
CREATE POLICY "Public read access for event images"
ON storage.objects FOR SELECT
USING (bucket_id = 'EventBucket');

-- Allow authenticated users to upload event images
CREATE POLICY "Authenticated users can upload event images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'EventBucket' 
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to update event images
CREATE POLICY "Authenticated users can update event images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'EventBucket' 
  AND auth.role() = 'authenticated'
)
WITH CHECK (
  bucket_id = 'EventBucket' 
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to delete event images
CREATE POLICY "Authenticated users can delete event images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'EventBucket' 
  AND auth.role() = 'authenticated'
);
```

## Step 3: Migration Steps

After creating the table and bucket:

1. **The application will automatically sync events when:**
   - Dashboard loads
   - Events are added/updated/deleted
   - "Sync from Supabase" button is clicked (if added to Dashboard)

2. **Existing events in localStorage:**
   - The first time you load the Dashboard, existing events will be synced to Supabase
   - You can also manually trigger a sync by clicking "Sync to Supabase" (if added)

3. **New events:**
   - Will be saved directly to Supabase
   - Images will be uploaded to EventBucket storage
   - Events will be automatically categorized as "upcoming" or "past" based on status

## Notes

1. **Row Level Security (RLS)**: 
   - Authenticated users can perform all operations (add, update, delete)
   - Public users can only read events (for viewing on website)

2. **JSONB Fields**: 
   - `tracks`, `schedule_day1`, and `schedule_day2` are stored as JSONB for flexible array/object storage

3. **Image Storage**:
   - `hero_image_url`: Can store external URLs (e.g., Unsplash)
   - `hero_image_path`: Stores the path to images uploaded to EventBucket
   - The application will use `hero_image_path` if available, otherwise falls back to `hero_image_url`

4. **Status Field**:
   - Events are categorized as "upcoming" or "past"
   - This replaces the previous structure of separate `upcoming` and `past` arrays
   - The application will filter events by status when displaying

## After Setup

1. The `eventsManager` in `dataManager.js` will automatically use Supabase
2. All CRUD operations will sync with the database
3. Images can be uploaded to EventBucket through the Dashboard
4. Events will be dynamically loaded from Supabase instead of localStorage

