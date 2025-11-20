# Events Migration to Supabase - Step-by-Step Guide

This guide will help you migrate events from localStorage to Supabase database, following the same pattern as the members table.

## Prerequisites

- Supabase project set up
- Access to Supabase Dashboard
- EventBucket storage bucket created (you mentioned you already created this)

## Step 1: Create the Events Table in Supabase

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Copy and paste the SQL script from `EVENTS_SUPABASE_SETUP.md`
4. Click **Run** to execute the script

This will create:
- `events` table with all necessary fields
- Indexes for performance
- Row Level Security (RLS) policies
- Automatic timestamp updates

## Step 2: Set Up EventBucket Storage Policies

1. Go to **Storage** in the Supabase Dashboard
2. Verify that `EventBucket` exists (you mentioned you already created it)
3. Click on **EventBucket** → **Policies**
4. Run the storage policies SQL from `EVENTS_SUPABASE_SETUP.md` (Step 2)

This allows:
- Public read access to event images
- Authenticated users to upload/update/delete images

## Step 3: Verify the Setup

The code has already been updated to:
- ✅ Use Supabase for events storage (`eventsService.js` created)
- ✅ Sync events on Dashboard load
- ✅ Sync events when adding/updating/deleting
- ✅ Provide sync buttons in Dashboard

## Step 4: Initial Sync (First Time Setup)

1. Open your application Dashboard
2. Navigate to the **Events** tab
3. Click **"Sync from Supabase"** button
4. If you have existing events in localStorage:
   - The system will offer to upload them to Supabase
   - Click **OK** to upload your local events

## Step 5: Test the Migration

1. **Add a new event** through the Dashboard
   - It should save to Supabase automatically
   - Check Supabase Dashboard → Table Editor → events to verify

2. **Update an existing event**
   - Changes should sync to Supabase

3. **Move event between upcoming/past**
   - Status should update in Supabase

4. **Delete an event**
   - Should be removed from Supabase

## How It Works (Similar to Members)

### Database Structure
- Single `events` table stores all events
- `status` field determines if event is "upcoming" or "past"
- JSONB fields store complex data (tracks, schedules)

### Storage
- Event images stored in `EventBucket` storage
- `hero_image_path` stores the file path
- `hero_image_url` can store external URLs

### Sync Behavior
- **On Load**: Dashboard automatically syncs from Supabase
- **On Change**: All CRUD operations sync to Supabase
- **Manual Sync**: Use "Sync from Supabase" button anytime
- **Fallback**: If Supabase is unavailable, uses localStorage

## File Changes Made

1. **`src/services/eventsService.js`** (NEW)
   - Handles all Supabase operations for events
   - Similar structure to `membersService.js`

2. **`src/utils/dataManager.js`** (UPDATED)
   - `eventsManager` now uses Supabase
   - Added `syncFromSupabase()` and `syncToSupabase()` methods
   - All CRUD operations sync with Supabase

3. **`src/pages/Dashboard.jsx`** (UPDATED)
   - Added automatic sync on load
   - Added "Sync from Supabase" button
   - Updated handlers to be async

4. **`EVENTS_SUPABASE_SETUP.md`** (NEW)
   - Complete SQL setup script
   - Storage policies
   - Documentation

## Troubleshooting

### Error: "Table does not exist"
- Make sure you ran the SQL script from Step 1
- Check Supabase Dashboard → Table Editor to verify `events` table exists

### Events not syncing
- Check browser console for errors
- Verify Supabase credentials in `src/lib/supabase.js`
- Check RLS policies are set correctly

### Images not uploading
- Verify EventBucket exists and is public
- Check storage policies are set correctly
- Ensure user is authenticated when uploading

## Next Steps

After migration is complete:
- ✅ Events are stored in Supabase database
- ✅ Images stored in EventBucket
- ✅ Automatic syncing on all operations
- ✅ Works offline with localStorage fallback
- ✅ Same pattern as members table for consistency

## Notes

- The system maintains backward compatibility with localStorage
- If Supabase table doesn't exist, events still work locally
- All existing events in localStorage will be preserved
- You can sync them to Supabase using the sync button

