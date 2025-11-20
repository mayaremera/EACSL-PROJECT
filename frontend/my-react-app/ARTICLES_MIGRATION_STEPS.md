# Articles Migration to Supabase - Step-by-Step Guide

This guide will help you migrate articles from localStorage to Supabase database, with drag-and-drop image upload support.

## Prerequisites

- Supabase project set up
- Access to Supabase Dashboard

## Step 1: Create the Articles Table in Supabase

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Copy and paste the SQL script from `ARTICLES_SUPABASE_SETUP.md` (Step 1)
4. Click **Run** to execute the script

This will create:
- `articles` table with all necessary fields
- Indexes for performance
- Row Level Security (RLS) policies
- Automatic timestamp updates

## Step 2: Set Up ArticlesBucket Storage

1. Go to **Storage** in the Supabase Dashboard
2. Click **New bucket**
3. Name it: `ArticlesBucket`
4. Set it to **Public** (so images can be accessed from the website)
5. Click **Create bucket**

### Storage Policies for ArticlesBucket

After creating the bucket, set up storage policies. Go to **Storage** → **Policies** → **ArticlesBucket** and run the storage policies SQL from `ARTICLES_SUPABASE_SETUP.md` (Step 2).

This allows:
- Public read access to article images
- Authenticated users to upload/update/delete images

## Step 3: Initial Sync (First Time Setup)

1. Open your application Dashboard
2. Navigate to the **Articles** tab
3. Click **"Sync from Supabase"** button
4. If you have existing articles in localStorage:
   - The system will offer to upload them to Supabase
   - Click **OK** to upload your local articles

## Step 4: Test the Migration

1. **Add a new article** through the Dashboard
   - Use drag-and-drop to upload an image
   - It should save to Supabase automatically
   - Check Supabase Dashboard → Table Editor → articles to verify

2. **Update an existing article**
   - Try uploading a new image via drag-and-drop
   - Changes should sync to Supabase

3. **Delete an article**
   - Should be removed from Supabase
   - Image should also be deleted from ArticlesBucket

## How It Works

### Database Structure
- Single `articles` table stores all articles
- Bilingual support (Arabic and English)
- Image storage in ArticlesBucket

### Image Upload
- **Drag-and-Drop**: Primary method - uploads directly to ArticlesBucket
- **External URL**: Fallback option for external images
- Images are automatically uploaded when you save the article

### Storage
- Article images stored in `ArticlesBucket` storage
- `image_path` stores the file path in storage
- `image_url` can store external URLs (backward compatible)
- The application uses `image_path` if available, otherwise falls back to `image_url`

### Sync Behavior
- **On Load**: Dashboard automatically syncs from Supabase
- **On Change**: All CRUD operations sync to Supabase
- **Manual Sync**: Use "Sync from Supabase" button anytime
- **Fallback**: If Supabase is unavailable, uses localStorage

## File Changes Made

1. **`src/services/articlesService.js`** (NEW)
   - Handles all Supabase operations for articles
   - Image upload/delete to ArticlesBucket
   - Similar structure to `membersService.js` and `eventsService.js`

2. **`src/utils/dataManager.js`** (UPDATED)
   - `articlesManager` now uses Supabase
   - Added `syncFromSupabase()` and `syncToSupabase()` methods
   - All CRUD operations sync with Supabase

3. **`src/components/dashboard/ArticleEditForm.jsx`** (UPDATED)
   - Added drag-and-drop image upload
   - Replaced URL input with file upload interface
   - Still supports external URLs as fallback
   - Shows image preview
   - Uploads images to ArticlesBucket on save

4. **`src/pages/Dashboard.jsx`** (UPDATED)
   - Added automatic sync on load
   - Added "Sync from Supabase" button
   - Updated handlers to be async

5. **`ARTICLES_SUPABASE_SETUP.md`** (NEW)
   - Complete SQL setup script
   - Storage policies
   - Documentation

## Drag-and-Drop Image Upload

### How to Use:
1. Open the Article Edit Form (Add or Edit)
2. In the "Article Image" section:
   - **Drag and drop** an image file onto the upload area, OR
   - **Click** "Select Image" to browse for a file
3. The image will show a preview
4. Click the trash icon to remove the image
5. You can also use the external URL field as a fallback
6. Save the article - the image will be uploaded to ArticlesBucket automatically

### Supported Formats:
- JPG/JPEG
- PNG
- GIF
- WebP
- BMP

## Troubleshooting

### Error: "Table does not exist"
- Make sure you ran the SQL script from Step 1
- Check Supabase Dashboard → Table Editor to verify `articles` table exists

### Articles not syncing
- Check browser console for errors
- Verify Supabase credentials in `src/lib/supabase.js`
- Check RLS policies are set correctly

### Images not uploading
- Verify ArticlesBucket exists and is public
- Check storage policies are set correctly
- Ensure user is authenticated when uploading
- Check browser console for upload errors

### Drag-and-drop not working
- Make sure you're using a modern browser
- Check that the file is an image format
- Try clicking "Select Image" as an alternative

## Next Steps

After migration is complete:
- ✅ Articles are stored in Supabase database
- ✅ Images stored in ArticlesBucket via drag-and-drop
- ✅ Automatic syncing on all operations
- ✅ Works offline with localStorage fallback
- ✅ Same pattern as members and events tables for consistency

## Notes

- The system maintains backward compatibility with localStorage
- If Supabase table doesn't exist, articles still work locally
- All existing articles in localStorage will be preserved
- You can sync them to Supabase using the sync button
- External image URLs are still supported for backward compatibility

