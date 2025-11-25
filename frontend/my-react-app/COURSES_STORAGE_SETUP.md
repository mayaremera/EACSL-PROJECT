# Courses Storage Setup Guide

## Overview

This guide will help you set up Supabase Storage for course images. The system uses a bucket named **`CoursesBucket`** to store course images and instructor images.

## Bucket Structure

The `CoursesBucket` stores images in organized folders:
- `course-images/` - Main course images
- `instructor-images/` - Instructor profile images

## Setup Instructions

### Step 1: Create the Storage Bucket

1. Go to your **Supabase Dashboard**
2. Navigate to **Storage**
3. Click **"New bucket"**
4. Name it: `CoursesBucket` (exact name, case-sensitive)
5. **IMPORTANT**: Toggle **"Public bucket"** to **ON** (required for images to display on the website)
6. Click **"Create"**

### Step 2: Verify Bucket Settings

- **Name**: `CoursesBucket`
- **Public**: Yes (required)
- **File size limit**: 5MB (default, can be adjusted)
- **Allowed MIME types**: image/* (or specific: image/jpeg, image/png, image/webp, etc.)

### Step 3: Configure Storage Policies (REQUIRED)

Even if your bucket is Public, you **MUST** configure RLS policies for uploads to work properly.

#### Method 1: Using SQL (Recommended)

Run the SQL script from `STORAGE_POLICIES_COURSES_BUCKET.sql` in your Supabase SQL Editor:

1. Go to Supabase Dashboard → SQL Editor
2. Click "New Query"
3. Copy and paste the entire contents of `STORAGE_POLICIES_COURSES_BUCKET.sql`
4. Click "Run" or press `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)
5. Verify the policies were created by checking the output

This will create policies for:
- ✅ Public read access (SELECT) - Required for images to display on website
- ✅ Authenticated upload access (INSERT) - Only admins can upload
- ✅ Authenticated update access (UPDATE) - Only admins can replace images
- ✅ Authenticated delete access (DELETE) - Only admins can delete images

#### Method 2: Using Dashboard UI (If SQL doesn't work)

If you get a "must be owner" error with the SQL method, use the Dashboard UI:

1. Go to Supabase Dashboard → Storage → Policies
2. Select `CoursesBucket`
3. Click "New Policy" and create these policies:

**Policy 1: Allow public read access** (REQUIRED)
- Policy name: "Public read access for CoursesBucket"
- Allowed operation: **SELECT**
- Target roles: **anon**, **authenticated**
- Policy definition: `bucket_id = 'CoursesBucket'`

**Policy 2: Allow authenticated uploads** (REQUIRED for admin uploads)
- Policy name: "Authenticated upload access for CoursesBucket"
- Allowed operation: **INSERT**
- Target roles: **authenticated** (admins only)
- Policy definition: `bucket_id = 'CoursesBucket'`

**Policy 3: Allow authenticated updates** (Optional but recommended)
- Policy name: "Authenticated update access for CoursesBucket"
- Allowed operation: **UPDATE**
- Target roles: **authenticated**
- Policy definition: `bucket_id = 'CoursesBucket'`

**Policy 4: Allow authenticated deletes** (Optional but recommended)
- Policy name: "Authenticated delete access for CoursesBucket"
- Allowed operation: **DELETE**
- Target roles: **authenticated**
- Policy definition: `bucket_id = 'CoursesBucket'`

## How It Works

1. **On Image Upload**:
   - Course image → Uploads to `CoursesBucket/course-images/`
   - Instructor image → Uploads to `CoursesBucket/instructor-images/`
   - Returns public URL and file path
   - Stores URL and path in the `courses` table

2. **On Course Save**:
   - Images are uploaded to storage first
   - Storage URLs/paths are saved to Supabase database
   - No large data URLs stored in localStorage

3. **On Course Display**:
   - Images load from Supabase Storage URLs
   - Fast CDN delivery
   - No localStorage quota issues

## Benefits

✅ **No localStorage quota issues** - Images stored in Supabase Storage  
✅ **Better performance** - Images load from CDN  
✅ **Scalable** - Can handle unlimited course images  
✅ **Organized** - Images organized in folders  
✅ **Easy management** - All course images in one bucket  
✅ **Fast loading** - CDN delivery for images

## Troubleshooting

### Error: "Bucket not found"
- Make sure the bucket name is exactly `CoursesBucket` (case-sensitive)
- Check that the bucket exists in Supabase Dashboard → Storage

### Error: "Permission denied" or "new row violates row-level security policy"
- Make sure the bucket is set to **Public**
- Go to Storage → Find `CoursesBucket` → Settings → Toggle "Public bucket" to ON

### Images not displaying
- Check that the bucket is Public
- Verify the image URLs in the database
- Check browser console for CORS errors

### Upload fails
- Check file size (should be under 5MB by default)
- Verify file type is an image (jpg, png, webp, etc.)
- Make sure bucket is Public

