-- Add Student Fee and Booklet URL to Events Table
-- Run this in your Supabase SQL Editor

-- Add student_fee column
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS student_fee DECIMAL(10, 2) DEFAULT 300.00;

-- Add booklet_url column for the event booklet PDF
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS booklet_url TEXT;

-- Add comments to document the columns
COMMENT ON COLUMN public.events.student_fee IS 'Registration fee for students';
COMMENT ON COLUMN public.events.booklet_url IS 'URL to the event booklet PDF file';

