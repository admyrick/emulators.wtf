-- Fix data type mismatch between console_id (integer) and consoles.id (uuid)
-- This script standardizes all IDs to use integers for consistency

-- First, drop the existing consoles table if it exists (since it has uuid IDs)
DROP TABLE IF EXISTS consoles CASCADE;

-- Recreate consoles table with integer ID
CREATE TABLE consoles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    manufacturer VARCHAR(255),
    release_date DATE,
    description TEXT,
    image_url TEXT,
    generation INTEGER,
    discontinued_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on consoles table
ALTER TABLE consoles ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Allow public read access on consoles" ON consoles
    FOR SELECT USING (true);

-- Insert sample console data with integer IDs
INSERT INTO consoles (name, slug, manufacturer, release_date, description, image_url, generation) VALUES
('Nintendo Entertainment System', 'nes', 'Nintendo', '1985-10-18', 'The Nintendo Entertainment System (NES) is an 8-bit third-generation home video game console produced by Nintendo.', '/placeholder.svg?height=200&width=300', 3),
('Super Nintendo Entertainment System', 'snes', 'Nintendo', '1990-11-21', 'The Super Nintendo Entertainment System (SNES) is a 16-bit home video game console developed by Nintendo.', '/placeholder.svg?height=200&width=300', 4),
('Nintendo 64', 'n64', 'Nintendo', '1996-06-23', 'The Nintendo 64 (N64) is a home video game console developed by Nintendo.', '/placeholder.svg?height=200&width=300', 5),
('Nintendo GameCube', 'gamecube', 'Nintendo', '2001-09-14', 'The Nintendo GameCube is a home video game console released by Nintendo in Japan and North America in 2001.', '/placeholder.svg?height=200&width=300', 6),
('Nintendo Wii', 'wii', 'Nintendo', '2006-11-19', 'The Wii is a home video game console released by Nintendo on November 19, 2006.', '/placeholder.svg?height=200&width=300', 7),
('Sega Genesis', 'genesis', 'Sega', '1988-10-29', 'The Sega Genesis, known as the Mega Drive outside North America, is a 16-bit fourth-generation home video game console.', '/placeholder.svg?height=200&width=300', 4),
('Sega Dreamcast', 'dreamcast', 'Sega', '1998-11-27', 'The Dreamcast is a home video game console released by Sega on November 27, 1998.', '/placeholder.svg?height=200&width=300', 6),
('Sony PlayStation', 'playstation', 'Sony', '1994-12-03', 'The PlayStation (PS) is a home video game console developed by Sony Computer Entertainment.', '/placeholder.svg?height=200&width=300', 5),
('Sony PlayStation 2', 'playstation-2', 'Sony', '2000-03-04', 'The PlayStation 2 (PS2) is a home video game console manufactured by Sony Computer Entertainment.', '/placeholder.svg?height=200&width=300', 6),
('Sony PlayStation Portable', 'psp', 'Sony', '2004-12-12', 'The PlayStation Portable (PSP) is a handheld game console developed by Sony Computer Entertainment.', '/placeholder.svg?height=200&width=300', 7),
('Game Boy', 'gameboy', 'Nintendo', '1989-04-21', 'The Game Boy is an 8-bit handheld game console developed and manufactured by Nintendo.', '/placeholder.svg?height=200&width=300', 4),
('Game Boy Advance', 'gba', 'Nintendo', '2001-03-21', 'The Game Boy Advance (GBA) is a 32-bit handheld game console developed by Nintendo.', '/placeholder.svg?height=200&width=300', 6),
('Nintendo DS', 'nds', 'Nintendo', '2004-11-21', 'The Nintendo DS is a handheld game console developed by Nintendo, released globally across 2004 and 2005.', '/placeholder.svg?height=200&width=300', 7),
('Atari 2600', 'atari-2600', 'Atari', '1977-09-11', 'The Atari 2600 is a home video game console developed and produced by Atari, Inc.', '/placeholder.svg?height=200&width=300', 2);

-- Now add the console_id column to emulators table
ALTER TABLE emulators ADD COLUMN IF NOT EXISTS console_id INTEGER;

-- Add foreign key constraint
ALTER TABLE emulators 
ADD CONSTRAINT emulators_console_id_fkey 
FOREIGN KEY (console_id) REFERENCES consoles(id);

-- Update existing emulators with appropriate console relationships
UPDATE emulators SET console_id = (SELECT id FROM consoles WHERE slug = 'nes') WHERE name ILIKE '%nestopia%' OR name ILIKE '%fceux%';
UPDATE emulators SET console_id = (SELECT id FROM consoles WHERE slug = 'snes') WHERE name ILIKE '%snes9x%' OR name ILIKE '%bsnes%';
UPDATE emulators SET console_id = (SELECT id FROM consoles WHERE slug = 'n64') WHERE name ILIKE '%mupen64%' OR name ILIKE '%project64%';
UPDATE emulators SET console_id = (SELECT id FROM consoles WHERE slug = 'gamecube') WHERE name ILIKE '%dolphin%';
UPDATE emulators SET console_id = (SELECT id FROM consoles WHERE slug = 'genesis') WHERE name ILIKE '%genesis%' OR name ILIKE '%kega%';
UPDATE emulators SET console_id = (SELECT id FROM consoles WHERE slug = 'playstation') WHERE name ILIKE '%pcsx%' OR name ILIKE '%duckstation%';
UPDATE emulators SET console_id = (SELECT id FROM consoles WHERE slug = 'playstation-2') WHERE name ILIKE '%pcsx2%';
UPDATE emulators SET console_id = (SELECT id FROM consoles WHERE slug = 'psp') WHERE name ILIKE '%ppsspp%';
UPDATE emulators SET console_id = (SELECT id FROM consoles WHERE slug = 'gameboy') WHERE name ILIKE '%visualboy%' OR name ILIKE '%gambatte%';
UPDATE emulators SET console_id = (SELECT id FROM consoles WHERE slug = 'gba') WHERE name ILIKE '%visualboy%' OR name ILIKE '%mgba%';
UPDATE emulators SET console_id = (SELECT id FROM consoles WHERE slug = 'nds') WHERE name ILIKE '%desmume%' OR name ILIKE '%melonds%';

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_emulators_console_id ON emulators(console_id);

-- Update the updated_at timestamp
UPDATE emulators SET updated_at = NOW() WHERE console_id IS NOT NULL;
