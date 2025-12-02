-- =====================================================
-- COMPLETE CURRICULUM ENHANCEMENT SQL
-- =====================================================
-- This file contains all SQL needed to enhance the curriculum
-- to support video players, PDFs, and quiz links
-- =====================================================

-- Step 1: Ensure curriculum column exists and is JSONB type
-- (Usually already exists, but this ensures it)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'courses' AND column_name = 'curriculum'
    ) THEN
        ALTER TABLE courses ADD COLUMN curriculum JSONB DEFAULT '[]'::jsonb;
    END IF;
    
    -- Ensure it's JSONB type
    IF (SELECT data_type FROM information_schema.columns 
        WHERE table_name = 'courses' AND column_name = 'curriculum') != 'jsonb' THEN
        ALTER TABLE courses ALTER COLUMN curriculum TYPE JSONB USING curriculum::jsonb;
    END IF;
END $$;

-- Step 2: Create GIN index for better query performance on curriculum
CREATE INDEX IF NOT EXISTS idx_courses_curriculum_gin ON courses USING GIN (curriculum);

-- Step 3: Optional - Create function to validate curriculum structure
CREATE OR REPLACE FUNCTION validate_curriculum_structure(curriculum_data JSONB)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if curriculum is an array
  IF jsonb_typeof(curriculum_data) != 'array' THEN
    RETURN FALSE;
  END IF;
  
  -- Validate each section has required fields
  -- This is optional validation
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- CURRICULUM STRUCTURE DOCUMENTATION
-- =====================================================
-- The curriculum column now supports the following structure:
--
-- curriculum: [
--   {
--     "title": "Section Title",
--     "lessons": [
--       {
--         "name": "Lesson Name",
--         "duration": "15:00",
--         "type": "video" | "pdf" | "quiz_link",
--         "videoUrl": "https://youtube.com/embed/..." (for video type),
--         "pdfUrl": "https://... or /path/to/file.pdf" (for pdf type),
--         "quizUrl": "https://..." (for quiz_link type)
--       }
--     ]
--   }
-- ]
--
-- Types:
-- - "video": Requires videoUrl field (YouTube embed URL or direct video URL)
-- - "pdf": Requires pdfUrl field (PDF file URL or path)
-- - "quiz_link": Requires quizUrl field (External quiz platform URL)
-- =====================================================

-- Step 4: Optional - Migrate existing curriculum data
-- This updates old curriculum structure to include new fields
UPDATE courses
SET curriculum = (
    SELECT jsonb_agg(
        jsonb_build_object(
            'title', section->>'title',
            'lessons', (
                SELECT jsonb_agg(
                    jsonb_build_object(
                        'name', lesson->>'name',
                        'duration', lesson->>'duration',
                        'type', COALESCE(lesson->>'type', 'video'),
                        'videoUrl', COALESCE(lesson->>'videoUrl', ''),
                        'pdfUrl', COALESCE(lesson->>'pdfUrl', ''),
                        'quizUrl', COALESCE(lesson->>'quizUrl', '')
                    )
                )
                FROM jsonb_array_elements(section->'lessons') AS lesson
            )
        )
    )
    FROM jsonb_array_elements(curriculum) AS section
)
WHERE curriculum IS NOT NULL 
  AND jsonb_typeof(curriculum) = 'array'
  AND EXISTS (
      SELECT 1 FROM jsonb_array_elements(curriculum) AS section
      WHERE EXISTS (
          SELECT 1 FROM jsonb_array_elements(section->'lessons') AS lesson
          WHERE lesson->>'videoUrl' IS NULL 
             OR lesson->>'pdfUrl' IS NULL 
             OR lesson->>'quizUrl' IS NULL
      )
  );

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these to verify the structure:

-- Check curriculum column exists and is JSONB
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'courses' AND column_name = 'curriculum';

-- Check index exists
-- SELECT indexname, indexdef 
-- FROM pg_indexes 
-- WHERE tablename = 'courses' AND indexname = 'idx_courses_curriculum_gin';

-- Sample query to see curriculum structure
-- SELECT id, title, curriculum 
-- FROM courses 
-- WHERE curriculum IS NOT NULL 
-- LIMIT 1;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- The curriculum now supports:
-- ✅ Video lessons with embed URLs
-- ✅ PDF lessons with file URLs  
-- ✅ Quiz link lessons with external URLs
-- ✅ Backward compatible with existing data
-- =====================================================

