# Supabase Storage Setup for Member Applications

## Bucket Configuration

The application uses a Supabase Storage bucket named **`MemberBucket`** to store member application files.

## Folder Structure

Files are organized in the following folders within `MemberBucket`:

- `profile-images/` - Profile pictures
- `id-cards/` - ID card images (front & back)
- `certificates/` - Graduation certificates
- `cvs/` - CV/Resume PDFs

## Setup Instructions

### 1. Create the Bucket

1. Go to your Supabase Dashboard
2. Navigate to **Storage**
3. Click **"New bucket"**
4. Name it: `MemberBucket` (exact name, case-sensitive)
5. Choose visibility:
   - **Public**: Files are publicly accessible via URL (REQUIRED for form submissions without login)
   - **Private**: Files require authentication to access (will cause upload failures for non-logged-in users)
   
   ⚠️ **Important**: Set bucket to **Public** to allow form submissions from non-authenticated users.

### 2. Configure Bucket Policies (if Private - NOT RECOMMENDED)

If you set the bucket to **Private**, you **MUST** configure Row Level Security (RLS) policies to allow public uploads, otherwise you'll get "new row violates row-level security policy" errors.

**Quick Fix**: Run the SQL script from `STORAGE_RLS_POLICIES.sql` in Supabase SQL Editor:

1. Go to Supabase Dashboard → SQL Editor
2. Copy the entire content from `STORAGE_RLS_POLICIES.sql`
3. Paste and run it
4. This will create policies to allow public uploads

Or manually create policies:

```sql
-- Allow public uploads (required for form submissions)
CREATE POLICY "Allow public uploads to MemberBucket"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'MemberBucket');

-- Allow public reads
CREATE POLICY "Allow public reads from MemberBucket"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'MemberBucket');
```

⚠️ **Note**: Setting bucket to **Public** is simpler and recommended. Private buckets with public upload policies work but are more complex.

### 3. File Size Limits

- **Individual file limit**: 5MB per file
- **Total submission limit**: 10MB (for base64 fallback)
- **With Storage**: No practical limit (Supabase Storage supports large files)

## How It Works

1. **On Form Submission**:
   - Files are uploaded to `MemberBucket` in organized folders
   - Each file gets a unique name: `{type}_{timestamp}.{ext}`
   - Public URLs are generated and stored in localStorage

2. **Storage vs Base64**:
   - **If bucket exists**: Files upload to Supabase Storage (no size limit)
   - **If bucket doesn't exist**: Falls back to base64 (10MB total limit)

3. **File Access**:
   - Files stored in Storage: Accessed via public URL or signed URL
   - Files in base64: Decoded and downloaded directly

## Benefits of Using Storage

✅ **No localStorage limits** - Files don't count against browser storage  
✅ **Better performance** - Files load faster from CDN  
✅ **Scalable** - Can handle large files without issues  
✅ **Organized** - Files are stored in logical folders  
✅ **Secure** - Can control access with RLS policies  

## Troubleshooting

**Q: Getting "new row violates row-level security policy" error?**
- **This is the most common error!** Your bucket has RLS enabled but no public upload policy
- **Solution 1 (Easiest)**: Set bucket to Public in Supabase Dashboard → Storage → MemberBucket → Settings
- **Solution 2**: Run `STORAGE_RLS_POLICIES.sql` in Supabase SQL Editor to add public upload policies
- After fixing, try submitting the form again

**Q: Files not uploading?**
- Check if bucket name is exactly `MemberBucket` (case-sensitive)
- Verify bucket is set to Public OR RLS policies are configured (see above)
- Check browser console for error messages

**Q: Getting "bucket not found" error?**
- Verify bucket exists in Supabase Dashboard
- Check bucket name spelling (must be exactly `MemberBucket`)
- Ensure bucket is active (not deleted)

**Q: Files uploaded but can't download?**
- If bucket is Private, check RLS policies include SELECT (read) permission
- Verify signed URL generation is working
- Check file path in storage matches what's stored

## Testing

1. Submit a test application with files
2. Check Supabase Dashboard → Storage → MemberBucket
3. Verify files appear in correct folders
4. Try downloading files from Dashboard
5. Verify files are accessible via public URLs

