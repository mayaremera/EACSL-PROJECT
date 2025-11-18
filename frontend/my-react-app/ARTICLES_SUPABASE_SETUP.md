# Supabase Articles Table Setup

To enable full Supabase integration for articles, you need to create an `articles` table in your Supabase database and set up the `ArticlesBucket` storage bucket.

## ⚠️ Important: Error PGRST205

If you see the error `PGRST205: Could not find the table 'public.articles' in the schema cache`, it means the `articles` table doesn't exist yet. Follow the steps below to create it.

## Step 1: Create Articles Table

Run this SQL script in your Supabase SQL Editor:

```sql
-- Create articles table
CREATE TABLE IF NOT EXISTS articles (
  id BIGSERIAL PRIMARY KEY,
  title_ar TEXT NOT NULL,
  title_en TEXT NOT NULL,
  category TEXT NOT NULL,
  category_ar TEXT NOT NULL,
  date DATE NOT NULL,
  image_url TEXT, -- External URL (for backward compatibility)
  image_path TEXT, -- Path to image in ArticlesBucket storage
  excerpt_ar TEXT NOT NULL,
  excerpt_en TEXT NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on category for faster filtering
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);

-- Create index on date for sorting
CREATE INDEX IF NOT EXISTS idx_articles_date ON articles(date);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_articles_created_at ON articles(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for authenticated users
CREATE POLICY "Allow all operations for authenticated users" ON articles
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Create policy to allow public read access (for viewing articles on website)
CREATE POLICY "Allow public read access" ON articles
  FOR SELECT
  USING (true);

-- Create a function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_articles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_articles_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW
  EXECUTE FUNCTION update_articles_updated_at();
```

## Step 2: Set Up ArticlesBucket Storage

1. Go to your Supabase Dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **New bucket**
4. Name it: `ArticlesBucket`
5. Set it to **Public** (so images can be accessed from the website)
6. Click **Create bucket**

### Storage Policies for ArticlesBucket

After creating the bucket, set up storage policies. Go to **Storage** → **Policies** → **ArticlesBucket** and run this SQL:

```sql
-- Allow public read access to article images
CREATE POLICY "Public read access for article images"
ON storage.objects FOR SELECT
USING (bucket_id = 'ArticlesBucket');

-- Allow authenticated users to upload article images
CREATE POLICY "Authenticated users can upload article images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'ArticlesBucket' 
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to update article images
CREATE POLICY "Authenticated users can update article images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'ArticlesBucket' 
  AND auth.role() = 'authenticated'
)
WITH CHECK (
  bucket_id = 'ArticlesBucket' 
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to delete article images
CREATE POLICY "Authenticated users can delete article images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'ArticlesBucket' 
  AND auth.role() = 'authenticated'
);
```

## Step 3: Migration Steps

After creating the table and bucket:

1. **The application will automatically sync articles when:**
   - Dashboard loads
   - Articles are added/updated/deleted
   - "Sync from Supabase" button is clicked

2. **Existing articles in localStorage:**
   - The first time you load the Dashboard, existing articles will be synced to Supabase
   - You can also manually trigger a sync by clicking "Sync to Supabase" (if added)

3. **New articles:**
   - Will be saved directly to Supabase
   - Images will be uploaded to ArticlesBucket storage via drag-and-drop
   - Images can also use external URLs (backward compatible)

## Notes

1. **Row Level Security (RLS)**: 
   - Authenticated users can perform all operations (add, update, delete)
   - Public users can only read articles (for viewing on website)

2. **Image Storage**:
   - `image_url`: Can store external URLs (for backward compatibility)
   - `image_path`: Stores the path to images uploaded to ArticlesBucket
   - The application will use `image_path` if available, otherwise falls back to `image_url`
   - Drag-and-drop uploads go directly to ArticlesBucket

3. **Bilingual Support**:
   - Articles support both Arabic and English titles and excerpts
   - Categories are also bilingual

## After Setup

1. The `articlesManager` in `dataManager.js` will automatically use Supabase
2. All CRUD operations will sync with the database
3. Images can be uploaded via drag-and-drop to ArticlesBucket
4. Articles will be dynamically loaded from Supabase instead of localStorage

