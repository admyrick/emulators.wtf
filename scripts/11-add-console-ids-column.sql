-- Add console_ids column to emulators table
-- This column will store an array of console IDs that an emulator supports

-- Add the console_ids column as an array of integers
ALTER TABLE emulators 
ADD COLUMN console_ids INTEGER[] DEFAULT '{}';

-- Update existing emulators with appropriate console_ids based on their names and capabilities
-- RetroArch supports multiple consoles
UPDATE emulators 
SET console_ids = ARRAY[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
WHERE name ILIKE '%retroarch%';

-- Dolphin emulates GameCube and Wii
UPDATE emulators 
SET console_ids = ARRAY[9, 11]
WHERE name ILIKE '%dolphin%';

-- PCSX2 emulates PlayStation 2
UPDATE emulators 
SET console_ids = ARRAY[8]
WHERE name ILIKE '%pcsx2%';

-- PPSSPP emulates PlayStation Portable
UPDATE emulators 
SET console_ids = ARRAY[12]
WHERE name ILIKE '%ppsspp%';

-- Citra emulates Nintendo 3DS
UPDATE emulators 
SET console_ids = ARRAY[4]
WHERE name ILIKE '%citra%';

-- DeSmuME emulates Nintendo DS
UPDATE emulators 
SET console_ids = ARRAY[6]
WHERE name ILIKE '%desmume%';

-- VisualBoy Advance emulates Game Boy Advance
UPDATE emulators 
SET console_ids = ARRAY[7]
WHERE name ILIKE '%visualboy%' OR name ILIKE '%vba%';

-- Project64 emulates Nintendo 64
UPDATE emulators 
SET console_ids = ARRAY[10]
WHERE name ILIKE '%project64%';

-- ZSNES emulates Super Nintendo
UPDATE emulators 
SET console_ids = ARRAY[13]
WHERE name ILIKE '%zsnes%' OR name ILIKE '%snes%';

-- Nestopia emulates Nintendo Entertainment System
UPDATE emulators 
SET console_ids = ARRAY[14]
WHERE name ILIKE '%nestopia%' OR name ILIKE '%nes%';

-- For emulators that don't match specific patterns, set console_ids based on console_id if it exists
UPDATE emulators 
SET console_ids = ARRAY[console_id]
WHERE console_ids = '{}' AND console_id IS NOT NULL;

-- Add some additional console entries if they don't exist
INSERT INTO consoles (id, name, manufacturer, release_year, created_at, updated_at) VALUES
(11, 'Nintendo Wii', 'Nintendo', 2006, NOW(), NOW()),
(12, 'PlayStation Portable', 'Sony', 2004, NOW(), NOW()),
(13, 'Super Nintendo Entertainment System', 'Nintendo', 1990, NOW(), NOW()),
(14, 'Nintendo Entertainment System', 'Nintendo', 1985, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Add index for better performance when querying by console_ids
CREATE INDEX IF NOT EXISTS idx_emulators_console_ids ON emulators USING GIN (console_ids);

-- Add comment to document the column
COMMENT ON COLUMN emulators.console_ids IS 'Array of console IDs that this emulator supports';
