# Dashboard Member Images Storage Setup

## ⚠️ IMPORTANT: This is REQUIRED for Images to Work

**You MUST create this bucket for member images to upload properly.**

The SQL scripts (`CREATE_MEMBERS_TABLE.sql`, etc.) are **OPTIONAL** - they're only for database sync. You don't need them for images to work.

## Bucket Configuration

The dashboard uses a Supabase Storage bucket named **`dashboardmemberimages`** to store member profile images uploaded from the dashboard.

## Setup Instructions

### 1. Create the Bucket (REQUIRED)

1. Go to your Supabase Dashboard
2. Navigate to **Storage**
3. Click **"New bucket"**
4. Name it: `dashboardmemberimages` (exact name, case-sensitive)
5. **IMPORTANT**: Toggle **"Public bucket"** to **ON** (this is required for uploads to work)
6. Click **"Create"**

**That's it!** Images will now work. You don't need to run any SQL scripts for images.

### ⚠️ If Bucket is Already Created but Not Public:

1. Go to Supabase Dashboard → Storage
2. Find the `dashboardmemberimages` bucket
3. Click the **Settings icon** (gear) next to the bucket name
4. Toggle **"Public bucket"** to **ON**
5. Click **"Save"**
6. Try uploading again

### 2. Bucket Settings

- **Name**: `dashboardmemberimages`
- **Public**: Yes (recommended)
- **File size limit**: 5MB (default, can be adjusted)
- **Allowed MIME types**: image/* (or specific: image/jpeg, image/png, image/webp, etc.)

### 3. Benefits

✅ **No localStorage quota issues** - Images stored in Supabase Storage  
✅ **Better performance** - Images load from CDN  
✅ **Scalable** - Can handle many large images  
✅ **Organized** - All dashboard member images in one place  
✅ **Easy updates** - Replace images without affecting localStorage  

## How It Works

1. **On Image Upload**:
   - Image is uploaded to `dashboardmemberimages` bucket
   - Unique filename: `{timestamp}-{random}.{ext}`
   - Public URL is generated and stored in member record
   - Old image is automatically deleted if it exists in storage

2. **Fallback Behavior**:
   - If bucket doesn't exist: Falls back to base64 (stored in localStorage)
   - If upload fails: Falls back to base64
   - User is notified if bucket is missing

3. **Image Access**:
   - Images in Storage: Accessed via public URL
   - Images in base64: Decoded and displayed directly

## Troubleshooting

**Q: Getting "Bucket not found" error?**
- Verify bucket name is exactly `dashboardmemberimages` (case-sensitive)
- Check bucket exists in Supabase Dashboard → Storage
- Ensure bucket is set to Public

**Q: Getting "new row violates row-level security policy" or "403 Forbidden" error?**

Even if your bucket is Public, you still need storage policies for uploads to work!

**Step 1: Make sure bucket is Public**
- Go to Supabase Dashboard → Storage → dashboardmemberimages → Settings (gear icon)
- Toggle "Public bucket" to ON → Save

**Step 2: Add Storage Policies (REQUIRED)**
- Go to Supabase Dashboard → **Storage** → **Policies**
- Click on **"dashboardmemberimages"** bucket
- Click **"New Policy"** or go to SQL Editor and run `STORAGE_POLICIES_DASHBOARDMEMBERIMAGES.sql`
- This adds policies for SELECT, INSERT, UPDATE, DELETE operations

**Alternative: Use SQL Editor**
1. Go to Supabase Dashboard → **SQL Editor**
2. Copy and paste the contents of `STORAGE_POLICIES_DASHBOARDMEMBERIMAGES.sql`
3. Run it
4. If you get "must be owner" error, use the Dashboard UI method above instead

**Q: Bucket exists but upload still fails?**
1. Check browser console (F12) for the exact error message
2. Verify bucket name is exactly `dashboardmemberimages` (no spaces, correct case)
3. Verify bucket is set to **Public** (not Private)
4. Try refreshing the Supabase Dashboard to ensure changes are saved
5. Check if you see any error in the alert message when uploading

**Q: Images not displaying?**
- Check if bucket is set to Public
- Verify the image URL is accessible
- Check browser console for errors

**Q: Storage quota exceeded error?**
- This means images are still being stored in localStorage
- Create the `dashboardmemberimages` bucket to fix this
- Existing base64 images will be migrated on next upload

