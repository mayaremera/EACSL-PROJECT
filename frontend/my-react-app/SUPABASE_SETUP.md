# Supabase Members Table Setup

To enable full Supabase integration for members, you need to create a `members` table in your Supabase database.

## ⚠️ Important: Error PGRST205

If you see the error `PGRST205: Could not find the table 'public.members' in the schema cache`, it means the `members` table doesn't exist yet. Follow the steps below to create it.

## SQL Script to Create Members Table

Run this SQL script in your Supabase SQL Editor:

```sql
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
  image TEXT,
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

-- Or if you want public read access:
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
```

## Notes

1. **Row Level Security (RLS)**: The policies above allow authenticated users to perform all operations. You may want to adjust these based on your security requirements.

2. **Public Read Access**: If you want the members list to be publicly readable (for the Active Members page), use the public read policy. Otherwise, remove it.

3. **Foreign Key**: The `supabase_user_id` references `auth.users(id)`, which links members to Supabase authentication users.

4. **JSONB for Certificates**: Certificates are stored as JSONB, which allows for flexible array storage.

## After Creating the Table

1. The application will automatically sync members when:
   - Dashboard loads
   - Members are added/updated/deleted
   - "Sync from Supabase" button is clicked

2. New signups will automatically create member records in Supabase.

3. Existing members can be synced by clicking "Sync from Supabase" in the Dashboard.

## Adding Members to the Table

There are several ways to add members:

### Method 1: Through the Dashboard (Recommended)
1. Go to `/dashboard` in your application
2. Click on the "Members" tab
3. Click the "Add Member" button
4. Fill in the member information
5. Click "Save" - the member will be saved both locally and in Supabase

### Method 2: Through User Signup (Automatic)
1. When a new user signs up through the Login/Signup modal
2. A member record is automatically created in Supabase
3. The member will appear in the Active Members page

### Method 3: Direct SQL Insert (For Testing)
If you want to add a test member directly via SQL, run this in Supabase SQL Editor:

```sql
-- Insert a test member
INSERT INTO members (
  name,
  email,
  role,
  nationality,
  flag_code,
  description,
  full_description,
  membership_date,
  is_active,
  active_till,
  certificates,
  phone,
  location,
  website,
  linkedin,
  image
) VALUES (
  'Dr. Test Member',
  'test@example.com',
  'Member',
  'Egyptian',
  'eg',
  'Test member description',
  'Full description of the test member',
  'January 2024',
  true,
  '2025',
  '["Test Certificate 1", "Test Certificate 2"]'::jsonb,
  '+20 123 456 7890',
  'Cairo, Egypt',
  'www.testmember.com',
  'linkedin.com/in/testmember',
  'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.1.0&auto=format&fit=crop&q=60&w=600'
);
```

After inserting, click "Sync from Supabase" in the Dashboard to see the member.

### Method 4: Sync Existing Local Members
If you have members stored locally (in localStorage):
1. Go to Dashboard
2. Click "Sync from Supabase" - this will upload your local members to Supabase
3. Note: This only works if members don't already exist in Supabase (based on email or ID)

