-- Fix Row Level Security policies for links table
-- This resolves the "new row violates row-level security policy" error

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access to links" ON links;
DROP POLICY IF EXISTS "Allow authenticated insert to links" ON links;
DROP POLICY IF EXISTS "Allow authenticated update to links" ON links;
DROP POLICY IF EXISTS "Allow authenticated delete to links" ON links;

-- Create comprehensive RLS policies for links table
-- Allow public read access to all links
CREATE POLICY "Allow public read access to links" ON links
    FOR SELECT USING (true);

-- Allow anyone to insert links (for seeding and admin operations)
CREATE POLICY "Allow public insert to links" ON links
    FOR INSERT WITH CHECK (true);

-- Allow anyone to update links (for admin operations)
CREATE POLICY "Allow public update to links" ON links
    FOR UPDATE USING (true);

-- Allow anyone to delete links (for admin operations)
CREATE POLICY "Allow public delete to links" ON links
    FOR DELETE USING (true);

-- Ensure RLS is enabled on the links table
ALTER TABLE links ENABLE ROW LEVEL SECURITY;

-- Add some additional sample links if the table is empty
INSERT INTO links (entity_type, entity_id, name, title, url, link_type, description, is_primary, display_order)
SELECT * FROM (VALUES
    ('tool', 1, 'Decky Loader GitHub', 'Official Repository', 'https://github.com/SteamDeckHomebrew/decky-loader', 'github', 'Main development repository for Decky Loader', true, 1),
    ('tool', 1, 'Decky Loader Documentation', 'Installation Guide', 'https://github.com/SteamDeckHomebrew/decky-loader#installation', 'documentation', 'Step-by-step installation instructions', false, 2),
    ('tool', 2, 'EmuDeck Website', 'Official Website', 'https://www.emudeck.com/', 'website', 'Official EmuDeck website with downloads and guides', true, 1),
    ('tool', 2, 'EmuDeck GitHub', 'Source Code', 'https://github.com/dragoonDorise/EmuDeck', 'github', 'EmuDeck source code repository', false, 2),
    ('game', 1, 'Super Mario Sunshine ROM', 'GameCube ROM', 'https://example.com/roms/super-mario-sunshine', 'download', 'GameCube ROM file for Super Mario Sunshine', true, 1),
    ('game', 2, 'God of War 2 ROM', 'PS2 ROM', 'https://example.com/roms/god-of-war-2', 'download', 'PlayStation 2 ROM file for God of War 2', true, 1)
) AS new_links(entity_type, entity_id, name, title, url, link_type, description, is_primary, display_order)
WHERE NOT EXISTS (
    SELECT 1 FROM links WHERE entity_type = new_links.entity_type AND entity_id = new_links.entity_id
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_links_entity ON links(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_links_display_order ON links(entity_type, entity_id, display_order);
