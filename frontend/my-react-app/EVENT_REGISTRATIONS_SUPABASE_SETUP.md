# Supabase Event Registrations Table Setup

To enable full Supabase integration for event registration forms, you need to create an `event_registrations` table in your Supabase database.

## ⚠️ Important

This will replace localStorage storage with Supabase database storage, allowing all admins to see form submissions in the dashboard and ensuring data syncs across all devices.

## Step 1: Create Event Registrations Table

Run the SQL script from `CREATE_EVENT_REGISTRATIONS_TABLE.sql` in your Supabase SQL Editor:

1. Go to Supabase Dashboard → SQL Editor
2. Click "New Query"
3. Copy and paste the entire contents of `CREATE_EVENT_REGISTRATIONS_TABLE.sql`
4. Click "Run" or press `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)
5. Verify the table was created by checking the Table Editor

### What this creates:

- `event_registrations` table with all form fields:
  - `id` - Primary key (auto-incrementing)
  - `event_id` - Optional link to events table
  - `full_name` - Registrant's full name
  - `email` - Email address
  - `phone` - Phone number
  - `organization` - Organization name (optional)
  - `membership_type` - 'member' or 'guest'
  - `selected_tracks` - JSONB array of selected track names
  - `special_requirements` - Special requirements or notes
  - `registration_fee` - Fee amount in EGP
  - `status` - 'pending', 'approved', or 'rejected'
  - `submitted_at` - Timestamp of submission
  - `reviewed_at` - Timestamp of admin review
  - `reviewed_by` - Admin user ID who reviewed
  - `review_notes` - Admin review notes
  - `created_at` - Record creation timestamp
  - `updated_at` - Record update timestamp (auto-updated)

- Indexes for performance:
  - Email lookup
  - Status filtering
  - Submission date sorting
  - Event ID filtering
  - Reviewer tracking

- Row-Level Security (RLS) policies:
  - Authenticated users (admins) can do all operations (SELECT, INSERT, UPDATE, DELETE)
  - Anonymous users (public) can only INSERT (submit forms)

- Automatic `updated_at` timestamp trigger

## Step 2: Verify Setup

1. Go to Supabase Dashboard → Table Editor
2. Find the `event_registrations` table
3. Verify all columns are present
4. Try submitting a test registration from the website
5. Check that it appears in the Supabase table

## How It Works

### Form Submission (UpcomingEventsPage.jsx)

1. User fills out the registration form
2. Form data is saved to Supabase `event_registrations` table
3. If Supabase fails, it falls back to localStorage
4. Success message is shown to user

### Dashboard (Dashboard.jsx)

1. Dashboard loads registrations from Supabase
2. Admins can view, approve, reject, or delete registrations
3. All changes sync to Supabase immediately
4. If Supabase is unavailable, falls back to localStorage

### Data Sync

- **Real-time**: Changes in Supabase are immediately available to all admins
- **Backup**: Data is also saved to localStorage as a backup
- **Fallback**: If Supabase table doesn't exist, system uses localStorage

## Troubleshooting

### Error: "PGRST116" or "does not exist"

This means the `event_registrations` table hasn't been created yet. Run the SQL script from `CREATE_EVENT_REGISTRATIONS_TABLE.sql`.

### Error: "permission denied"

Check your RLS policies. Make sure:
- Authenticated users have full access
- Anonymous users can INSERT

### Data not syncing

1. Check Supabase connection in browser console
2. Verify table exists in Supabase Dashboard
3. Check RLS policies are correct
4. Verify you're logged in as an authenticated user in the dashboard

## Migration from localStorage

If you have existing registrations in localStorage:

1. The system will automatically use Supabase for new registrations
2. Old localStorage data will still be accessible as fallback
3. To migrate old data, you can manually import it or let it naturally phase out

## Security Notes

- **Public Insert**: Anyone can submit a registration (required for the form)
- **Admin Only View**: Only authenticated users (admins) can view registrations
- **Email Privacy**: Email addresses are stored but only visible to admins
- **No Password Storage**: This form doesn't require passwords (unlike membership forms)

