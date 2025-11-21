# Supabase Contact Forms Table Setup

To enable Supabase integration for the Contact form, you need to create a `contact_forms` table in your Supabase database.

## ⚠️ Important

This will replace localStorage storage with Supabase database storage, allowing all admins to see contact form submissions in the dashboard.

## Step 1: Create Contact Forms Table

Run the SQL script from `CREATE_CONTACT_FORMS_TABLE.sql` in your Supabase SQL Editor:

1. Go to Supabase Dashboard → SQL Editor
2. Click "New Query"
3. Copy and paste the entire contents of `CREATE_CONTACT_FORMS_TABLE.sql`
4. Click "Run" or press `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)
5. Verify the table was created by checking the Table Editor

### What this creates:

- `contact_forms` table with all form fields:
  - `name` (TEXT) - Full name
  - `email` (TEXT) - Email address
  - `phone` (TEXT, optional) - Phone number
  - `subject` (TEXT) - Message subject
  - `message` (TEXT) - Message content
  - `status` (TEXT) - pending, approved, or rejected
- Indexes for performance (email, status, submitted_at)
- Row-Level Security (RLS) policies:
  - Authenticated users (admins): full access (SELECT, INSERT, UPDATE, DELETE)
  - Anonymous users (public): INSERT only (can submit forms)
- Automatic `updated_at` timestamp trigger

## Step 2: Verify Setup

### Verify Table:

1. Go to Supabase Dashboard → Table Editor
2. Look for `contact_forms` table
3. Check that it has these columns:
   - `id` (bigserial, primary key)
   - `name`, `email`, `phone`, `subject`, `message`
   - `status` (pending/approved/rejected)
   - Timestamps (submitted_at, created_at, updated_at)
   - Review fields (reviewed_at, reviewed_by, review_notes)

## Step 3: Update Application Code

After creating the table, your application code has already been updated to:

1. ✅ Save form submissions to Supabase instead of localStorage
2. ✅ Display submissions in the dashboard from Supabase
3. ✅ Sync functionality with "Sync from Supabase" button

## Form Fields Stored

The table stores the following data from the Contact form:

| Field | Type | Description |
|-------|------|-------------|
| `name` | TEXT | Full name |
| `email` | TEXT | Email address |
| `phone` | TEXT | Phone number (optional) |
| `subject` | TEXT | Message subject |
| `message` | TEXT | Message content |
| `status` | TEXT | 'pending', 'approved', or 'rejected' |
| `submitted_at` | TIMESTAMPTZ | When the form was submitted |
| `reviewed_at` | TIMESTAMPTZ | When admin reviewed the form |
| `reviewed_by` | UUID | Admin user ID who reviewed |
| `review_notes` | TEXT | Optional notes from admin |

## Security Notes

- **Public insert**: Anyone can submit contact forms without authentication
- **Admin access only**: Only authenticated users (admins) can view, update, or delete forms
- **No sensitive data**: Contact forms don't store passwords or other sensitive information

## Troubleshooting

### Error: "relation 'contact_forms' does not exist"
- The table wasn't created. Run the SQL script from `CREATE_CONTACT_FORMS_TABLE.sql` again.
- Verify the table exists in Supabase Dashboard → Table Editor

### Error: "new row violates row-level security policy"
- Check RLS policies are correctly set up (Step 1)
- Verify you have the policy "Allow public insert" for INSERT operations
- Check that authenticated users have full access policy

### Error: "Failed to save your message"
- Verify the table exists in Supabase
- Check your Supabase connection settings
- Verify RLS policies allow public INSERT
- Check browser console for detailed error messages

### Forms not showing in Dashboard
- Click the "Sync from Supabase" button in the Dashboard → Applications tab
- Check that forms exist in Supabase Table Editor
- Verify you're logged in as an authenticated user (admin)

## Next Steps

After setting up the table:

1. ✅ Form submission code already saves to Supabase
2. ✅ Dashboard already reads from Supabase
3. ✅ Sync button is available in Dashboard → Applications tab

You can now:
- View all contact form submissions in the dashboard
- Approve/reject messages
- Delete messages
- Sync data from Supabase using the sync button

