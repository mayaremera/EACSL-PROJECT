-- Add Modal Image Fields to Articles Table
-- This script adds support for a separate modal image that displays in the article modal

-- Add modal_image_url column (for external URLs)
ALTER TABLE articles 
ADD COLUMN IF NOT EXISTS modal_image_url TEXT;

-- Add modal_image_path column (for images stored in ArticlesBucket)
ALTER TABLE articles 
ADD COLUMN IF NOT EXISTS modal_image_path TEXT;

-- Add comments to document the columns
COMMENT ON COLUMN articles.modal_image_url IS 'External URL for the modal image (displayed in article modal)';
COMMENT ON COLUMN articles.modal_image_path IS 'Path to modal image in ArticlesBucket storage (displayed in article modal)';

-- Optional: Create index if you plan to query by modal image
-- CREATE INDEX IF NOT EXISTS idx_articles_modal_image_path ON articles(modal_image_path) WHERE modal_image_path IS NOT NULL;

-- Verify the columns were added
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'articles' 
  AND column_name IN ('modal_image_url', 'modal_image_path')
ORDER BY column_name;

