-- Add developer column to emulators table
ALTER TABLE emulators 
ADD COLUMN IF NOT EXISTS developer VARCHAR(255);

-- Update existing emulators with sample developer data
UPDATE emulators SET developer = 'RetroArch Team' WHERE name ILIKE '%retroarch%';
UPDATE emulators SET developer = 'Dolphin Team' WHERE name ILIKE '%dolphin%';
UPDATE emulators SET developer = 'PCSX2 Team' WHERE name ILIKE '%pcsx2%';
UPDATE emulators SET developer = 'Citra Team' WHERE name ILIKE '%citra%';
UPDATE emulators SET developer = 'Yuzu Team' WHERE name ILIKE '%yuzu%';
UPDATE emulators SET developer = 'RPCS3 Team' WHERE name ILIKE '%rpcs3%';
UPDATE emulators SET developer = 'Xenia Team' WHERE name ILIKE '%xenia%';
UPDATE emulators SET developer = 'MAME Team' WHERE name ILIKE '%mame%';
UPDATE emulators SET developer = 'PPSSPP Team' WHERE name ILIKE '%ppsspp%';
UPDATE emulators SET developer = 'DeSmuME Team' WHERE name ILIKE '%desmume%';

-- Set default developer for any remaining emulators without one
UPDATE emulators SET developer = 'Community' WHERE developer IS NULL;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_emulators_developer ON emulators(developer);
