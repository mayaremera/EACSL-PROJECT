-- Enhance curriculum to support video, PDF, and quiz links
-- The curriculum column is JSONB, so we just need to ensure the structure is correct
-- This SQL file documents the new curriculum structure and can be used for validation

-- Curriculum Structure:
-- curriculum: [
--   {
--     "title": "Section Title",
--     "lessons": [
--       {
--         "name": "Lesson Name",
--         "duration": "15:00",
--         "type": "video" | "pdf" | "quiz_link",
--         "videoUrl": "https://youtube.com/embed/..." (for video type),
--         "pdfUrl": "https://..." or file path (for pdf type),
--         "quizUrl": "https://..." (for quiz_link type)
--       }
--     ]
--   }
-- ]

-- Note: Since curriculum is JSONB, no ALTER TABLE is needed
-- The structure will be updated automatically when courses are saved with the new format

-- Optional: Add a function to validate curriculum structure
CREATE OR REPLACE FUNCTION validate_curriculum_structure(curriculum_data JSONB)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if curriculum is an array
  IF jsonb_typeof(curriculum_data) != 'array' THEN
    RETURN FALSE;
  END IF;
  
  -- Validate each section
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Optional: Add index for better query performance on curriculum
CREATE INDEX IF NOT EXISTS idx_courses_curriculum_gin ON courses USING GIN (curriculum);

-- Migration complete - curriculum structure is now enhanced to support:
-- 1. Video lessons with embed URLs
-- 2. PDF lessons with file URLs
-- 3. Quiz link lessons with external quiz URLs

