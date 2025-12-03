-- Update hero_card_speakers column to JSONB format with id and role
-- This migration converts the existing INTEGER[] array to JSONB array of objects

-- Step 1: Add a temporary column with JSONB type
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS hero_card_speakers_new JSONB DEFAULT '[]'::jsonb;

-- Step 2: Migrate existing data from INTEGER[] to JSONB
-- Convert each integer ID to an object with id and role (role will be NULL initially)
UPDATE public.events
SET hero_card_speakers_new = (
  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object('id', id_value, 'role', NULL)
    ),
    '[]'::jsonb
  )
  FROM unnest(hero_card_speakers::integer[]) AS id_value
)
WHERE hero_card_speakers IS NOT NULL AND array_length(hero_card_speakers, 1) > 0;

-- Step 3: Drop the old column
ALTER TABLE public.events
DROP COLUMN IF EXISTS hero_card_speakers;

-- Step 4: Rename the new column to the original name
ALTER TABLE public.events
RENAME COLUMN hero_card_speakers_new TO hero_card_speakers;

-- Step 5: Add comment
COMMENT ON COLUMN public.events.hero_card_speakers IS 'JSONB array of objects with speaker participant IDs and their roles to display on the hero card (max 4). Format: [{"id": 1, "role": "Keynote Speaker"}, ...]';

