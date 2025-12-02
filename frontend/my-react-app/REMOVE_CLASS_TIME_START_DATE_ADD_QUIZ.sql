-- Remove class_time and start_date columns from courses table
-- Add quizzes column to courses table

-- Step 1: Add the quizzes column (or rename if quiz already exists)
DO $$ 
BEGIN
    -- Check if quiz column exists and rename it to quizzes
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'courses' AND column_name = 'quiz') THEN
        ALTER TABLE courses RENAME COLUMN quiz TO quizzes;
    ELSE
        -- If quiz doesn't exist, add quizzes column
        ALTER TABLE courses ADD COLUMN IF NOT EXISTS quizzes TEXT;
    END IF;
END $$;

-- Step 2: Remove class_time column
ALTER TABLE courses
DROP COLUMN IF EXISTS class_time;

-- Step 3: Remove start_date column
ALTER TABLE courses
DROP COLUMN IF EXISTS start_date;

-- Verify the changes
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'courses' 
-- ORDER BY ordinal_position;

