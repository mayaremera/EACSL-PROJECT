# Migrate Existing Articles to Supabase

This guide will help you migrate all existing articles (including default articles) to your Supabase database.

## Quick Migration Steps

### Option 1: Using the Dashboard (Recommended)

1. **Make sure the articles table exists in Supabase**
   - Follow `ARTICLES_SUPABASE_SETUP.md` to create the table if you haven't already

2. **Open your Dashboard**
   - Navigate to the **Articles** tab

3. **Click "Sync from Supabase"**
   - This will first try to download articles from Supabase
   - If no articles exist in Supabase, it will prompt you to upload local articles

4. **Click "OK" when prompted**
   - The system will upload all local articles (including default articles) to Supabase
   - You'll see a success message showing how many articles were synced

### Option 2: Using Browser Console (Advanced)

If you want to run the migration manually, you can use the browser console:

1. Open your application in the browser
2. Open Developer Tools (F12)
3. Go to the Console tab
4. Run this command:

```javascript
// Import the articles manager (if available globally)
// Or use this if articlesManager is accessible:
articlesManager.syncToSupabase().then(result => {
  console.log('Migration Result:', result);
  if (result.synced) {
    console.log(`✅ Successfully synced ${result.syncedCount} out of ${result.total} articles`);
    if (result.errorCount > 0) {
      console.warn(`⚠️ ${result.errorCount} articles failed to sync`);
      console.log('Errors:', result.errors);
    }
  } else {
    console.error('Migration failed:', result.error);
  }
});
```

## What Gets Migrated

The migration will add all articles from:
- **localStorage** (`eacsl_articles`)
- **Default articles** (if localStorage is empty)

### Default Articles Included:

1. Developing Communication Skills in Children with Autism
2. Aphasia: Causes and Treatment
3. The Importance of Early Intervention in Speech Disorders
4. Swallowing Disorders: Diagnosis and Treatment
5. Stuttering Treatment in Children and Adults
6. Language Development in Bilingual Children
7. Voice Disorders: Causes and Prevention
8. Speech and Language Delays in Children

## After Migration

1. **Verify in Supabase Dashboard**
   - Go to Table Editor → `articles`
   - You should see all 8 default articles (plus any custom articles you had)

2. **Check the Dashboard**
   - Go to Articles tab
   - All articles should be visible
   - Click "Sync from Supabase" to verify they're loading from the database

3. **Test Adding a New Article**
   - Add a new article with drag-and-drop image
   - Verify it saves to Supabase automatically

## Troubleshooting

### "Table does not exist" Error
- Make sure you've run the SQL script from `ARTICLES_SUPABASE_SETUP.md`
- Check Supabase Dashboard → Table Editor to verify the `articles` table exists

### Articles Not Appearing
- Check browser console for errors
- Verify you're authenticated (if RLS policies require it)
- Try clicking "Sync from Supabase" again

### Some Articles Failed to Sync
- Check the console for specific error messages
- Verify all article fields are valid (no null required fields)
- Make sure dates are in YYYY-MM-DD format

## Notes

- **Image URLs**: Existing articles use external image URLs (Unsplash). These will be stored in the `image_url` field.
- **IDs**: Local article IDs may differ from Supabase IDs after migration. The system handles this automatically.
- **Duplicates**: The sync function checks for existing articles by ID to avoid duplicates.
- **Backward Compatibility**: Articles with external image URLs will continue to work as before.

