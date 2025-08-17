-- Create links table for storing external links related to games, emulators, tools, etc.
CREATE TABLE IF NOT EXISTS public.links (
    id SERIAL PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL, -- 'game', 'emulator', 'tool', 'handheld', etc.
    entity_id INTEGER NOT NULL, -- ID of the related entity
    title VARCHAR(255), -- Optional custom title for the link
    url TEXT NOT NULL, -- The actual URL
    description TEXT, -- Optional description
    link_type VARCHAR(50), -- 'download', 'github', 'documentation', 'website', etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_links_entity ON links(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_links_type ON links(link_type);
CREATE INDEX IF NOT EXISTS idx_links_created_at ON links(created_at);

-- Enable Row Level Security
ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Allow public read access to links" ON public.links
    FOR SELECT USING (true);

-- Create policy for authenticated users to insert/update/delete
CREATE POLICY "Allow authenticated users to manage links" ON public.links
    FOR ALL USING (auth.role() = 'authenticated');

-- Add some sample game links
INSERT INTO public.links (entity_type, entity_id, title, url, link_type, description) VALUES
-- Links for game with ID 1 (assuming Super Mario Sunshine exists)
('game', 1, 'GameCube ROM', 'https://example.com/super-mario-sunshine.iso', 'download', 'GameCube ROM file for Super Mario Sunshine'),
('game', 1, 'Dolphin Emulator Guide', 'https://wiki.dolphin-emu.org/index.php?title=Super_Mario_Sunshine', 'documentation', 'Official Dolphin wiki page with compatibility info'),
('game', 1, 'Speedrun Community', 'https://www.speedrun.com/sms', 'website', 'Super Mario Sunshine speedrunning community'),

-- Links for game with ID 2 (assuming God of War 2 exists)
('game', 2, 'PS2 ROM', 'https://example.com/god-of-war-2.iso', 'download', 'PlayStation 2 ROM file for God of War 2'),
('game', 2, 'PCSX2 Setup Guide', 'https://pcsx2.net/guides/', 'documentation', 'Guide for setting up God of War 2 on PCSX2'),
('game', 2, 'Game Walkthrough', 'https://example.com/gow2-walkthrough', 'website', 'Complete walkthrough for God of War 2'),

-- Links for game with ID 3
('game', 3, 'ROM Download', 'https://example.com/game3.rom', 'download', 'ROM file download'),
('game', 3, 'GitHub Repository', 'https://github.com/example/game3-tools', 'github', 'Community tools and patches'),
('game', 3, 'Official Website', 'https://example.com/game3-official', 'website', 'Official game website');

-- Update the updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_links_updated_at BEFORE UPDATE ON public.links
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
