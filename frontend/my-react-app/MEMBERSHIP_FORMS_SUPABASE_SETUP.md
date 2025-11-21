# Supabase Membership Forms Table Setup

To enable Supabase integration for the "Become a Member" form, you need to create a `membership_forms` table in your Supabase database and set up the `member-forms-bucket` storage bucket.

## ⚠️ Important

This will replace localStorage storage with Supabase database storage, allowing all admins to see form submissions in the dashboard.

## Step 1: Create Membership Forms Table

Run the SQL script from `CREATE_MEMBERSHIP_FORMS_TABLE.sql` in your Supabase SQL Editor:

1. Go to Supabase Dashboard → SQL Editor
2. Click "New Query"
3. Copy and paste the entire contents of `CREATE_MEMBERSHIP_FORMS_TABLE.sql`
4. Click "Run" or press `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)
5. Verify the table was created by checking the Table Editor

### What this creates:

- `membership_forms` table with all form fields
- Indexes for performance (email, status, submitted_at)
- Unique constraint preventing duplicate pending applications with the same email
- Row-Level Security (RLS) policies:
  - Authenticated users (admins) can do all operations (SELECT, INSERT, UPDATE, DELETE)
  - Anonymous users (public) can only INSERT (submit forms)
- Automatic `updated_at` timestamp trigger

## Step 2: Create Storage Bucket

You need to create a storage bucket for form attachments (images and documents).

1. Go to Supabase Dashboard → Storage
2. Click "New bucket"
3. Name it: `member-forms-bucket`
4. Set it to **Public** (toggle "Public bucket" to ON)
   - This is required for the form to upload files
5. Click "Create bucket"

### Folder Structure in Bucket

The bucket will automatically organize files into these folders:
- `profile-images/` - User profile images
- `id-cards/` - ID card images (front & back)
- `certificates/` - Graduation certificates
- `cvs/` - CV/Resume PDF files

### Storage Policies (If Bucket is Private)

If you need to keep the bucket private for security reasons, you can set up RLS policies:

1. Go to Supabase Dashboard → Storage → Policies
2. Select `member-forms-bucket`
3. Create these policies:

**Policy 1: Allow public uploads**
- Policy name: "Allow public uploads"
- Allowed operation: INSERT
- Target roles: anon, authenticated
- Policy definition: `true`

**Policy 2: Allow public access to files**
- Policy name: "Allow public file access"
- Allowed operation: SELECT
- Target roles: anon, authenticated
- Policy definition: `true`

**Policy 3: Allow authenticated users to delete**
- Policy name: "Allow admins to delete files"
- Allowed operation: DELETE
- Target roles: authenticated
- Policy definition: `true`

> **Note:** If you make the bucket Public, you don't need these policies. Public buckets allow all operations.

## Step 3: Verify Setup

### Verify Table:

1. Go to Supabase Dashboard → Table Editor
2. Look for `membership_forms` table
3. Check that it has these columns:
   - `id` (bigserial, primary key)
   - `username`, `email`, `password`
   - `specialty` (jsonb)
   - `previous_work`
   - `status` (pending/approved/rejected)
   - File path and URL columns (profile_image_path, id_image_path, etc.)
   - Timestamps (submitted_at, created_at, updated_at)

### Verify Bucket:

1. Go to Supabase Dashboard → Storage
2. Look for `member-forms-bucket`
3. Verify it's set to Public (if you want public access)
4. Test upload: Try uploading a test file to confirm it works

## Step 4: Update Application Code

After creating the table and bucket, you'll need to update your application code to:

1. Save form submissions to Supabase instead of localStorage
2. Upload files to `member-forms-bucket` instead of other buckets
3. Display submissions in the dashboard from Supabase

See the implementation guide for code changes.

## Form Fields Stored

The table stores the following data from the "Become a Member" form:

| Field | Type | Description |
|-------|------|-------------|
| `username` | TEXT | User's name |
| `email` | TEXT | Email address (unique per pending application) |
| `password` | TEXT | Encrypted password (for account creation on approval) |
| `specialty` | JSONB | Array of selected specialties |
| `previous_work` | TEXT | Description of previous work experience |
| `profile_image_path` | TEXT | Path to profile image in storage |
| `id_image_path` | TEXT | Path to ID card image in storage |
| `graduation_cert_path` | TEXT | Path to graduation certificate in storage |
| `cv_path` | TEXT | Path to CV/Resume PDF in storage |
| `status` | TEXT | 'pending', 'approved', or 'rejected' |
| `submitted_at` | TIMESTAMPTZ | When the form was submitted |
| `reviewed_at` | TIMESTAMPTZ | When admin reviewed the form |
| `reviewed_by` | UUID | Admin user ID who reviewed |
| `review_notes` | TEXT | Optional notes from admin |

## Security Notes

- **Email uniqueness**: The table has a unique constraint on email for pending applications, preventing duplicate submissions
- **Password storage**: Passwords should be encrypted/hashed before storing (consider using Supabase Auth for this)
- **File security**: If bucket is public, anyone with the URL can access files. Consider:
  - Using signed URLs for sensitive documents
  - Making bucket private and using RLS policies
  - Restricting file access to authenticated users only

## Troubleshooting

### Error: "relation 'membership_forms' does not exist"
- The table wasn't created. Run the SQL script again.

### Error: "new row violates row-level security policy"
- Check RLS policies are correctly set up (Step 1)
- Verify you're using the correct authentication (for admin access)

### Error: "bucket not found"
- Create the `member-forms-bucket` in Storage (Step 2)
- Verify the bucket name matches exactly: `member-forms-bucket`

### Error: "The resource already exists" (file upload)
- This means a file with the same path already exists
- The application code should handle this by generating unique filenames
- Check that your file upload code includes timestamps/random strings in filenames

## Next Steps

After setting up the table and bucket:

1. Update form submission code to save to Supabase
2. Update file upload code to use `member-forms-bucket`
3. Update dashboard to read from Supabase instead of localStorage
4. Add admin functionality to approve/reject applications

