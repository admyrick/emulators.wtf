-- Add release_year column to handhelds table
ALTER TABLE handhelds ADD COLUMN IF NOT EXISTS release_year INTEGER;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_handhelds_release_year ON handhelds(release_year);

-- Update existing handhelds with realistic release years
UPDATE handhelds SET release_year = 2024 WHERE name ILIKE '%steam deck%' OR name ILIKE '%rog ally%' OR name ILIKE '%legion go%';
UPDATE handhelds SET release_year = 2023 WHERE name ILIKE '%ayaneo%' OR name ILIKE '%gpd%' OR name ILIKE '%onexplayer%';
UPDATE handhelds SET release_year = 2022 WHERE name ILIKE '%retroid%' OR name ILIKE '%anbernic%';
UPDATE handhelds SET release_year = 2021 WHERE name ILIKE '%miyoo%' OR name ILIKE '%powkiddy%';
UPDATE handhelds SET release_year = 2020 WHERE release_year IS NULL;

-- Update RLS policies to include the new column
DROP POLICY IF EXISTS "handhelds_select_policy" ON handhelds;
CREATE POLICY "handhelds_select_policy" ON handhelds FOR SELECT USING (true);

-- Verify the changes
SELECT name, manufacturer, release_year FROM handhelds ORDER BY release_year DESC NULLS LAST;
