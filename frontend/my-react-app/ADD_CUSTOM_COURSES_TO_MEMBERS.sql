-- Add custom_courses column to members table
-- This column stores an array of custom courses with title and image for each member
-- These are separate from the website's courses

ALTER TABLE public.members
ADD COLUMN IF NOT EXISTS custom_courses JSONB DEFAULT '[]'::jsonb;

-- Add comment
COMMENT ON COLUMN public.members.custom_courses IS 'JSONB array of custom courses with title and image. Format: [{"title": "Course Name", "image": "url_or_path", "imagePath": "storage_path"}, ...]';

