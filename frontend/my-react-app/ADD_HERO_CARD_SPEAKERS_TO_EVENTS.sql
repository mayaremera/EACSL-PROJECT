-- Add hero_card_speakers column to events table
-- This column stores an array of speaker IDs to display on the hero card

ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS hero_card_speakers INTEGER[] DEFAULT '{}';

-- Add comment
COMMENT ON COLUMN public.events.hero_card_speakers IS 'Array of speaker participant IDs to display on the hero card (max 4)';

