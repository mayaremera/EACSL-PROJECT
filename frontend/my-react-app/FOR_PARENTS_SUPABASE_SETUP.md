# Supabase For Parents Table Setup

To enable full Supabase integration for For Parents articles, you need to create a `for_parents` table in your Supabase database and set up the `ParentBucket` storage bucket.

## ⚠️ Important: Error PGRST205

If you see the error `PGRST205: Could not find the table 'public.for_parents' in the schema cache`, it means the `for_parents` table doesn't exist yet. Follow the steps below to create it.

## Step 1: Create For Parents Table

Run this SQL script in your Supabase SQL Editor:

```sql
-- Create for_parents table
CREATE TABLE IF NOT EXISTS for_parents (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  date TEXT NOT NULL,
  author TEXT NOT NULL,
  article_url TEXT NOT NULL,
  image_url TEXT, -- External URL (for backward compatibility)
  image_path TEXT, -- Path to image in ParentBucket storage
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_for_parents_created_at ON for_parents(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE for_parents ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for authenticated users
CREATE POLICY "Allow all operations for authenticated users" ON for_parents
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Create policy to allow public read access (for viewing articles on website)
CREATE POLICY "Allow public read access" ON for_parents
  FOR SELECT
  USING (true);

-- Create a function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_for_parents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER for_parents_updated_at
  BEFORE UPDATE ON for_parents
  FOR EACH ROW
  EXECUTE FUNCTION update_for_parents_updated_at();
```

## Step 2: Set Up ParentBucket Storage

1. Go to **Storage** in the Supabase Dashboard
2. Click **New bucket**
3. Name it: `ParentBucket` (exact name, case-sensitive)
4. Set it to **Public** (so images can be accessed from the website)
5. Click **Create bucket**

### Storage Policies for ParentBucket

After creating the bucket, set up storage policies. Go to **Storage** → **Policies** → **ParentBucket** and run this SQL:

```sql
-- Allow public read access to parent article images
CREATE POLICY "Allow public reads from ParentBucket"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'ParentBucket');

-- Allow authenticated users to upload images
CREATE POLICY "Allow authenticated uploads to ParentBucket"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'ParentBucket');

-- Allow authenticated users to update images
CREATE POLICY "Allow authenticated updates to ParentBucket"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'ParentBucket')
WITH CHECK (bucket_id = 'ParentBucket');

-- Allow authenticated users to delete images
CREATE POLICY "Allow authenticated deletes from ParentBucket"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'ParentBucket');
```

## Step 3: Insert Existing For Parents Articles

After creating the table, you can insert the existing 9 parent articles. Run this SQL script:

```sql
-- Insert existing for parents articles
INSERT INTO for_parents (title, excerpt, date, author, article_url, image_url) VALUES
('كيفية تعزيز الثقة بالنفس لدى الأطفال', 'نصائح عملية لبناء ثقة طفلك بنفسه منذ الصغر', '15 أكتوبر 2024', 'د. سارة أحمد', 'https://www.example.com/article1', 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=600&q=80'),
('التواصل الفعال مع الأطفال', 'أساليب التواصل الصحيحة التي تبني علاقة قوية مع طفلك', '10 أكتوبر 2024', 'د. محمد حسن', 'https://www.example.com/article2', 'https://images.unsplash.com/photo-1476703993599-0035a21b17a9?w=600&q=80'),
('التعامل مع نوبات الغضب عند الأطفال', 'استراتيجيات فعالة للتعامل مع الغضب والانفعالات', '5 أكتوبر 2024', 'د. ليلى إبراهيم', 'https://www.example.com/article3', 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=80'),
('أهمية اللعب في نمو الطفل', 'كيف يساهم اللعب في التطور المعرفي والاجتماعي للطفل', '1 أكتوبر 2024', 'د. فاطمة علي', 'https://www.example.com/article4', 'https://images.unsplash.com/photo-1587616211892-c1c8c6b76d4c?w=600&q=80'),
('تنمية المهارات اللغوية للطفل', 'طرق فعالة لتطوير مهارات النطق واللغة عند الأطفال', '28 سبتمبر 2024', 'د. خالد محمود', 'https://www.example.com/article5', 'https://images.unsplash.com/photo-1609220136736-443140cffec6?w=600&q=80'),
('التربية الإيجابية وأثرها على الطفل', 'مبادئ التربية الإيجابية وكيفية تطبيقها في حياتك اليومية', '25 سبتمبر 2024', 'د. منى سالم', 'https://www.example.com/article6', 'https://images.unsplash.com/photo-1491013516836-7db643ee125a?w=600&q=80'),
('كيفية بناء روتين يومي صحي للأطفال', 'أهمية الروتين اليومي وكيفية إنشائه بطريقة فعالة', '20 سبتمبر 2024', 'د. أحمد يوسف', 'https://www.example.com/article7', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&q=80'),
('التعامل مع التنمر والتحديات الاجتماعية', 'كيف تحمي طفلك من التنمر وتعزز مهاراته الاجتماعية', '15 سبتمبر 2024', 'د. نادية فريد', 'https://www.example.com/article8', 'https://images.unsplash.com/photo-1588392382834-a891154bca4d?w=600&q=80'),
('تطوير الذكاء العاطفي عند الأطفال', 'طرق لمساعدة طفلك على فهم وإدارة مشاعره بشكل صحي', '10 سبتمبر 2024', 'د. طارق سمير', 'https://www.example.com/article9', 'https://images.unsplash.com/photo-1571442463800-1337d7af9d2f?w=600&q=80');
```

## Troubleshooting

### Error: "Table does not exist"
- Make sure you ran the SQL script from Step 1
- Check Supabase Dashboard → Table Editor to verify `for_parents` table exists

### Articles not syncing
- Check browser console for errors
- Verify Supabase credentials in `src/lib/supabase.js`
- Check RLS policies are set correctly

### Images not uploading
- Verify ParentBucket exists and is public
- Check storage policies are set correctly
- Ensure user is authenticated when uploading
- Check browser console for upload errors

### Drag-and-drop not working
- Make sure you're using a modern browser
- Check that the file is an image format
- Try clicking "Select Image" as an alternative

