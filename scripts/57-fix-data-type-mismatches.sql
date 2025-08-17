-- Fix data type mismatches in database schema
-- This script ensures all ID columns use consistent data types for proper foreign key relationships

-- Drop existing tables with data type issues (in correct order to avoid dependency conflicts)
DROP TABLE IF EXISTS preset_items CASCADE;
DROP TABLE IF EXISTS presets CASCADE;
DROP TABLE IF EXISTS setup_components CASCADE;
DROP TABLE IF EXISTS setups CASCADE;
DROP TABLE IF EXISTS handheld_emulation_performance CASCADE;

-- Create setups table with integer ID
CREATE TABLE setups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    difficulty_level VARCHAR(50) CHECK (difficulty_level IN ('Beginner', 'Intermediate', 'Advanced')),
    estimated_time VARCHAR(100),
    target_device VARCHAR(255),
    requirements TEXT[],
    steps JSONB,
    images TEXT[],
    links JSONB,
    tags TEXT[],
    featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create setup_components table with integer foreign key
CREATE TABLE setup_components (
    id SERIAL PRIMARY KEY,
    setup_id INTEGER REFERENCES setups(id) ON DELETE CASCADE,
    component_type VARCHAR(50) NOT NULL CHECK (component_type IN ('emulator', 'game', 'cfw_app', 'tool', 'custom_firmware', 'handheld')),
    component_id INTEGER NOT NULL,
    notes TEXT,
    required BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create presets table with integer ID
CREATE TABLE presets (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    target_device VARCHAR(255),
    created_by VARCHAR(255),
    featured BOOLEAN DEFAULT false,
    download_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create preset_items table with integer foreign key
CREATE TABLE preset_items (
    id SERIAL PRIMARY KEY,
    preset_id INTEGER REFERENCES presets(id) ON DELETE CASCADE,
    item_type VARCHAR(50) NOT NULL CHECK (item_type IN ('emulator', 'game', 'cfw_app', 'tool', 'custom_firmware')),
    item_id INTEGER NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create handheld_emulation_performance table with integer foreign keys
CREATE TABLE handheld_emulation_performance (
    id SERIAL PRIMARY KEY,
    handheld_id INTEGER REFERENCES handhelds(id) ON DELETE CASCADE,
    console_id INTEGER REFERENCES consoles(id) ON DELETE CASCADE,
    performance_rating INTEGER CHECK (performance_rating >= 1 AND performance_rating <= 5),
    notes TEXT,
    tested_games TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(handheld_id, console_id)
);

-- Create indexes for better performance
CREATE INDEX idx_setups_slug ON setups(slug);
CREATE INDEX idx_setups_featured ON setups(featured);
CREATE INDEX idx_setup_components_setup_id ON setup_components(setup_id);
CREATE INDEX idx_setup_components_type ON setup_components(component_type);

CREATE INDEX idx_presets_slug ON presets(slug);
CREATE INDEX idx_presets_featured ON presets(featured);
CREATE INDEX idx_preset_items_preset_id ON preset_items(preset_id);
CREATE INDEX idx_preset_items_type ON preset_items(item_type);

CREATE INDEX idx_performance_handheld ON handheld_emulation_performance(handheld_id);
CREATE INDEX idx_performance_console ON handheld_emulation_performance(console_id);

-- Enable RLS on all tables
ALTER TABLE setups ENABLE ROW LEVEL SECURITY;
ALTER TABLE setup_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE preset_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE handheld_emulation_performance ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public read access
CREATE POLICY "Allow public read access to setups" ON setups FOR SELECT USING (true);
CREATE POLICY "Allow public read access to setup_components" ON setup_components FOR SELECT USING (true);
CREATE POLICY "Allow public read access to presets" ON presets FOR SELECT USING (true);
CREATE POLICY "Allow public read access to preset_items" ON preset_items FOR SELECT USING (true);
CREATE POLICY "Allow public read access to handheld_emulation_performance" ON handheld_emulation_performance FOR SELECT USING (true);

-- Insert sample setups data
INSERT INTO setups (name, slug, description, difficulty_level, estimated_time, target_device, requirements, steps, images, links, tags, featured) VALUES
('EmuDeck Steam Deck Setup', 'emudeck-steam-deck-setup', 'Complete guide to setting up EmuDeck on Steam Deck for retro gaming', 'Beginner', '30-45 minutes', 'Steam Deck', ARRAY['Steam Deck', 'MicroSD Card (64GB+)', 'Internet Connection'], 
 '{"steps": [{"title": "Download EmuDeck", "description": "Visit emudeck.com and download the installer"}, {"title": "Run Installer", "description": "Execute the installer and follow the setup wizard"}, {"title": "Configure Emulators", "description": "Set up individual emulators through EmuDeck interface"}]}',
 ARRAY['https://example.com/emudeck-setup.jpg'], 
 '{"official": "https://www.emudeck.com", "guide": "https://github.com/dragoonDorise/EmuDeck"}',
 ARRAY['steam-deck', 'emudeck', 'retro-gaming'], true),

('Batocera Handheld Setup', 'batocera-handheld-setup', 'Install and configure Batocera Linux on handheld devices', 'Advanced', '1-2 hours', 'Various Handhelds', ARRAY['Compatible Handheld', 'USB Drive (8GB+)', 'Computer for Setup'], 
 '{"steps": [{"title": "Download Batocera", "description": "Get the latest Batocera image for your device"}, {"title": "Flash Image", "description": "Use balenaEtcher to flash the image to USB/SD"}, {"title": "Configure System", "description": "Set up controllers, WiFi, and game directories"}]}',
 ARRAY['https://example.com/batocera-setup.jpg'], 
 '{"official": "https://batocera.org", "documentation": "https://wiki.batocera.org"}',
 ARRAY['batocera', 'linux', 'handheld'], true);

-- Insert sample presets data
INSERT INTO presets (name, slug, description, target_device, created_by, featured) VALUES
('Retro Gaming Essentials', 'retro-gaming-essentials', 'Essential emulators and games for classic retro gaming experience', 'Steam Deck', 'Admin', true),
('Nintendo Collection', 'nintendo-collection', 'Complete Nintendo emulator setup with popular games', 'ROG Ally', 'Admin', true),
('Arcade Classics Pack', 'arcade-classics-pack', 'MAME setup with classic arcade games', 'Any Device', 'Admin', false);

-- Insert sample preset items (assuming some emulators and games exist)
INSERT INTO preset_items (preset_id, item_type, item_id, notes) VALUES
(1, 'emulator', 1, 'RetroArch - Multi-system emulator'),
(1, 'emulator', 2, 'PCSX2 - PlayStation 2 emulator'),
(2, 'emulator', 3, 'Dolphin - GameCube/Wii emulator'),
(3, 'emulator', 4, 'MAME - Arcade emulator');

-- Insert sample performance data (assuming some handhelds and consoles exist)
INSERT INTO handheld_emulation_performance (handheld_id, console_id, performance_rating, notes, tested_games) VALUES
(1, 1, 5, 'Perfect performance for NES games', ARRAY['Super Mario Bros.', 'The Legend of Zelda']),
(1, 2, 4, 'Great performance for SNES games', ARRAY['Super Metroid', 'A Link to the Past']),
(2, 3, 3, 'Good performance for N64 games with some slowdown', ARRAY['Super Mario 64', 'Mario Kart 64']);

-- Verify the tables were created successfully
SELECT 'setups' as table_name, count(*) as row_count FROM setups
UNION ALL
SELECT 'setup_components', count(*) FROM setup_components
UNION ALL
SELECT 'presets', count(*) FROM presets
UNION ALL
SELECT 'preset_items', count(*) FROM preset_items
UNION ALL
SELECT 'handheld_emulation_performance', count(*) FROM handheld_emulation_performance;
