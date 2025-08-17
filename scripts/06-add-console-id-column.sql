-- Add console_id column to emulators table
-- This creates a foreign key relationship between emulators and consoles

-- First, add the console_id column
ALTER TABLE emulators 
ADD COLUMN console_id INTEGER REFERENCES consoles(id);

-- Create an index for better query performance
CREATE INDEX idx_emulators_console_id ON emulators(console_id);

-- Update existing emulators with appropriate console relationships
-- These are common emulator-to-console mappings
UPDATE emulators SET console_id = (SELECT id FROM consoles WHERE name = 'Nintendo Entertainment System' LIMIT 1) WHERE name = 'Nestopia';
UPDATE emulators SET console_id = (SELECT id FROM consoles WHERE name = 'Super Nintendo Entertainment System' LIMIT 1) WHERE name = 'Snes9x';
UPDATE emulators SET console_id = (SELECT id FROM consoles WHERE name = 'Nintendo 64' LIMIT 1) WHERE name = 'Project64';
UPDATE emulators SET console_id = (SELECT id FROM consoles WHERE name = 'Nintendo GameCube' LIMIT 1) WHERE name = 'Dolphin';
UPDATE emulators SET console_id = (SELECT id FROM consoles WHERE name = 'Sony PlayStation' LIMIT 1) WHERE name = 'DuckStation';
UPDATE emulators SET console_id = (SELECT id FROM consoles WHERE name = 'Sony PlayStation 2' LIMIT 1) WHERE name = 'PCSX2';
UPDATE emulators SET console_id = (SELECT id FROM consoles WHERE name = 'Sega Genesis' LIMIT 1) WHERE name = 'Genesis Plus GX';
UPDATE emulators SET console_id = (SELECT id FROM consoles WHERE name = 'Game Boy Advance' LIMIT 1) WHERE name = 'mGBA';

-- For multi-system emulators like RetroArch, we'll set it to a popular console
-- In practice, RetroArch supports many systems through cores
UPDATE emulators SET console_id = (SELECT id FROM consoles WHERE name = 'Nintendo Entertainment System' LIMIT 1) WHERE name = 'RetroArch';

-- Add a comment to the column
COMMENT ON COLUMN emulators.console_id IS 'Foreign key reference to the primary console this emulator targets';
