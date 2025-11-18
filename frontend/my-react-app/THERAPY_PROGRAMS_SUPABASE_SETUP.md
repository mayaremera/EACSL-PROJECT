# Supabase Therapy Programs Table Setup

To enable full Supabase integration for therapy programs, you need to create a `therapy_programs` table in your Supabase database and set up the `TherapyBucket` storage bucket.

## ⚠️ Important: Error PGRST205

If you see the error `PGRST205: Could not find the table 'public.therapy_programs' in the schema cache`, it means the `therapy_programs` table doesn't exist yet. Follow the steps below to create it.

## Step 1: Create Therapy Programs Table

Run this SQL script in your Supabase SQL Editor:

```sql
-- Create therapy_programs table
CREATE TABLE IF NOT EXISTS therapy_programs (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT DEFAULT 'MessageCircle',
  image_url TEXT, -- External URL (for backward compatibility)
  image_path TEXT, -- Path to image in TherapyBucket storage
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_therapy_programs_created_at ON therapy_programs(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE therapy_programs ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for authenticated users
CREATE POLICY "Allow all operations for authenticated users" ON therapy_programs
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Create policy to allow public read access (for viewing programs on website)
CREATE POLICY "Allow public read access" ON therapy_programs
  FOR SELECT
  USING (true);

-- Create a function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_therapy_programs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER therapy_programs_updated_at
  BEFORE UPDATE ON therapy_programs
  FOR EACH ROW
  EXECUTE FUNCTION update_therapy_programs_updated_at();
```

## Step 2: Set Up TherapyBucket Storage

1. Go to **Storage** in the Supabase Dashboard
2. Click **New bucket**
3. Name it: `TherapyBucket` (exact name, case-sensitive)
4. Set it to **Public** (so images can be accessed from the website)
5. Click **Create bucket**

### Storage Policies for TherapyBucket

After creating the bucket, set up storage policies. Go to **Storage** → **Policies** → **TherapyBucket** and run this SQL:

```sql
-- Allow public read access to therapy program images
CREATE POLICY "Allow public reads from TherapyBucket"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'TherapyBucket');

-- Allow authenticated users to upload images
CREATE POLICY "Allow authenticated uploads to TherapyBucket"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'TherapyBucket');

-- Allow authenticated users to update images
CREATE POLICY "Allow authenticated updates to TherapyBucket"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'TherapyBucket')
WITH CHECK (bucket_id = 'TherapyBucket');

-- Allow authenticated users to delete images
CREATE POLICY "Allow authenticated deletes from TherapyBucket"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'TherapyBucket');
```

## Step 3: Insert Existing Therapy Programs

After creating the table, you can insert the existing 6 therapy programs. Run this SQL script:

```sql
-- Insert existing therapy programs
INSERT INTO therapy_programs (title, description, icon, image_url) VALUES
('جلسات علاج النطق للأطفال', 'توفير جلسات للأطفال لعلاج مجموعة متنوعة من الاضطرابات والإعاقات باستخدام تقنيات حديثة مثل التوحد واضطرابات السمع والشلل الدماغي ومتلازمة داون', 'MessageCircle', 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=600&q=80'),
('جلسات علاج النطق للبالغين', 'توفير جلسات علاج النطق للبالغين الذين يعانون من اضطرابات النطق والطلاقة', 'Users', 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&q=80'),
('تنمية المهارات', 'العمل مع الأطفال لتعزيز الذاكرة والانتباه والمهارات البصرية ومهارات الحياة والمهارات الأكاديمية', 'Brain', 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=80'),
('التدخل المبكر', 'توفير التدخل المبكر لتحسين إنتاج الكلام والمهارات العامة للأطفال', 'Baby', 'https://images.unsplash.com/photo-1476703993599-0035a21b17a9?w=600&q=80'),
('الدعم النفسي والأسري', 'نحن نقدم لك الدعم الذي تحتاجه لتحسين حياتك وحياة طفلك خاصة من يعانون من تحديات سلوكية', 'Users', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&q=80'),
('الاختبارات والتقييمات', 'نحن نجري أنواعًا مختلفة من التقييمات والاختبارات مثل اختبار الذكاء واختبار CARS والمزيد', 'ClipboardList', 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&q=80');
```

## Troubleshooting

### Error: "Table does not exist"
- Make sure you ran the SQL script from Step 1
- Check Supabase Dashboard → Table Editor to verify `therapy_programs` table exists

### Programs not syncing
- Check browser console for errors
- Verify Supabase credentials in `src/lib/supabase.js`
- Check RLS policies are set correctly

### Images not uploading
- Verify TherapyBucket exists and is public
- Check storage policies are set correctly
- Ensure user is authenticated when uploading
- Check browser console for upload errors

### Drag-and-drop not working
- Make sure you're using a modern browser
- Check that the file is an image format
- Try clicking "Select Image" as an alternative

