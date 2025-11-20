# Supabase Reservations Table Setup

To enable Supabase integration for the Reservation/Assessment booking form, you need to create a `reservations` table in your Supabase database.

## ⚠️ Important

This will replace localStorage storage with Supabase database storage, allowing all admins to see reservation submissions in the dashboard.

## Step 1: Create Reservations Table

Run the SQL script from `CREATE_RESERVATIONS_TABLE.sql` in your Supabase SQL Editor:

1. Go to Supabase Dashboard → SQL Editor
2. Click "New Query"
3. Copy and paste the entire contents of `CREATE_RESERVATIONS_TABLE.sql`
4. Click "Run" or press `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)
5. Verify the table was created by checking the Table Editor

### What this creates:

- `reservations` table with all form fields:
  - `kids_name` (TEXT) - Child's name
  - `your_name` (TEXT) - Parent/Guardian name
  - `phone_number` (TEXT) - Phone number
  - `selected_assessments` (JSONB) - Array of selected assessment types
  - `concern` (TEXT) - Description of child's condition/concern
  - `status` (TEXT) - pending, approved, or rejected
- Indexes for performance (phone_number, your_name, status, submitted_at)
- Row-Level Security (RLS) policies:
  - Authenticated users (admins): full access (SELECT, INSERT, UPDATE, DELETE)
  - Anonymous users (public): INSERT only (can submit forms)
- Automatic `updated_at` timestamp trigger

## Step 2: Verify Setup

### Verify Table:

1. Go to Supabase Dashboard → Table Editor
2. Look for `reservations` table
3. Check that it has these columns:
   - `id` (bigserial, primary key)
   - `kids_name`, `your_name`, `phone_number`
   - `selected_assessments` (jsonb)
   - `concern`
   - `status` (pending/approved/rejected)
   - Timestamps (submitted_at, created_at, updated_at)
   - Review fields (reviewed_at, reviewed_by, review_notes)

## Step 3: Update Application Code

After creating the table, your application code has already been updated to:

1. ✅ Save form submissions to Supabase instead of localStorage
2. ✅ Display submissions in the dashboard from Supabase
3. ✅ Sync functionality with "Sync from Supabase" button

## Form Fields Stored

The table stores the following data from the Reservation form:

| Field | Type | Description |
|-------|------|-------------|
| `kids_name` | TEXT | Child's name |
| `your_name` | TEXT | Parent/Guardian name |
| `phone_number` | TEXT | Phone number |
| `selected_assessments` | JSONB | Array of selected assessment types (Arabic labels) |
| `concern` | TEXT | Description of the child's condition or parent's concern |
| `status` | TEXT | 'pending', 'approved', or 'rejected' |
| `submitted_at` | TIMESTAMPTZ | When the form was submitted |
| `reviewed_at` | TIMESTAMPTZ | When admin reviewed the form |
| `reviewed_by` | UUID | Admin user ID who reviewed |
| `review_notes` | TEXT | Optional notes from admin |

### Assessment Types (stored in selected_assessments array):
- `تقييم النطق` - Speech Assessment
- `تقييم المهارات` - Skills Assessment
- `التقييم الأكاديمي` - Academic Assessment
- `اختبار الذكاء أو اختبارات أخرى` - IQ Tests or Other

## Security Notes

- **Public insert**: Anyone can submit reservations without authentication
- **Admin access only**: Only authenticated users (admins) can view, update, or delete reservations
- **No sensitive data**: Reservations don't store passwords or other sensitive information beyond contact details

## Troubleshooting

### Error: "relation 'reservations' does not exist"
- The table wasn't created. Run the SQL script from `CREATE_RESERVATIONS_TABLE.sql` again.
- Verify the table exists in Supabase Dashboard → Table Editor

### Error: "new row violates row-level security policy"
- Check RLS policies are correctly set up (Step 1)
- Verify you have the policy "Allow public insert" for INSERT operations
- Check that authenticated users have full access policy

### Error: "Failed to save your reservation"
- Verify the table exists in Supabase
- Check your Supabase connection settings
- Verify RLS policies allow public INSERT
- Check browser console for detailed error messages

### Reservations not showing in Dashboard
- Click the "Sync from Supabase" button in the Dashboard → Applications tab
- Check that reservations exist in Supabase Table Editor
- Verify you're logged in as an authenticated user (admin)

## Next Steps

After setting up the table:

1. ✅ Form submission code already saves to Supabase
2. ✅ Dashboard already reads from Supabase
3. ✅ Sync button is available in Dashboard → Applications tab

You can now:
- View all reservation submissions in the dashboard
- Approve/reject reservations
- Delete reservations
- Sync data from Supabase using the sync button

