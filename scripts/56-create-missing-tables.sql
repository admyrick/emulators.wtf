-- Create missing database tables for emulation website
-- This script creates all the tables that the application expects

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create presets table
CREATE TABLE IF NOT EXISTS presets (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    target_device VARCHAR(255),
    created_by UUID REFERENCES auth.users(id),
    is_featured BOOLEAN DEFAULT false,
    download_count INTEGER DEFAULT 0,
    slug VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create preset_items table for linking presets to various items
CREATE TABLE IF NOT EXISTS preset_items (
    id SERIAL PRIMARY KEY,
    preset_id INTEGER REFERENCES presets(id) ON DELETE CASCADE,
    item_type VARCHAR(50) NOT NULL, -- 'emulator', 'game', 'cfw_app', 'tool', 'custom_firmware'
    item_id INTEGER NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create setups table if it doesn't exist
CREATE TABLE IF NOT EXISTS setups (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    difficulty VARCHAR(50) DEFAULT 'beginner', -- 'beginner', 'intermediate', 'advanced'
    estimated_time VARCHAR(100),
    target_device VARCHAR(255),
    requirements TEXT[],
    steps JSONB,
    images TEXT[],
    links JSONB,
    slug VARCHAR(255) UNIQUE NOT NULL,
    featured BOOLEAN DEFAULT false,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create setup_components table for linking setups to various components
CREATE TABLE IF NOT EXISTS setup_components (
    id SERIAL PRIMARY KEY,
    setup_id INTEGER REFERENCES setups(id) ON DELETE CASCADE,
    component_type VARCHAR(50) NOT NULL, -- 'emulator', 'game', 'cfw_app', 'tool', 'custom_firmware', 'handheld'
    component_id INTEGER NOT NULL,
    required BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create handheld_emulation_performance table if it doesn't exist
CREATE TABLE IF NOT EXISTS handheld_emulation_performance (
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
CREATE INDEX IF NOT EXISTS idx_presets_slug ON presets(slug);
CREATE INDEX IF NOT EXISTS idx_presets_featured ON presets(is_featured);
CREATE INDEX IF NOT EXISTS idx_preset_items_preset_id ON preset_items(preset_id);
CREATE INDEX IF NOT EXISTS idx_preset_items_type_id ON preset_items(item_type, item_id);

CREATE INDEX IF NOT EXISTS idx_setups_slug ON setups(slug);
CREATE INDEX IF NOT EXISTS idx_setups_featured ON setups(featured);
CREATE INDEX IF NOT EXISTS idx_setup_components_setup_id ON setup_components(setup_id);
CREATE INDEX IF NOT EXISTS idx_setup_components_type_id ON setup_components(component_type, component_id);

CREATE INDEX IF NOT EXISTS idx_performance_handheld ON handheld_emulation_performance(handheld_id);
CREATE INDEX IF NOT EXISTS idx_performance_console ON handheld_emulation_performance(console_id);

-- Enable Row Level Security
ALTER TABLE presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE preset_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE setups ENABLE ROW LEVEL SECURITY;
ALTER TABLE setup_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE handheld_emulation_performance ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public read access
CREATE POLICY "Allow public read access to presets" ON presets FOR SELECT USING (true);
CREATE POLICY "Allow public read access to preset_items" ON preset_items FOR SELECT USING (true);
CREATE POLICY "Allow public read access to setups" ON setups FOR SELECT USING (true);
CREATE POLICY "Allow public read access to setup_components" ON setup_components FOR SELECT USING (true);
CREATE POLICY "Allow public read access to handheld_emulation_performance" ON handheld_emulation_performance FOR SELECT USING (true);

-- Insert sample presets data
INSERT INTO presets (name, description, target_device, slug, is_featured) VALUES
('Retro Gaming Starter Pack', 'Essential emulators and games for retro gaming on Steam Deck', 'Steam Deck', 'retro-gaming-starter-pack', true),
('Nintendo Switch Emulation Setup', 'Complete setup for Nintendo Switch emulation with Yuzu and Ryujinx', 'ROG Ally', 'nintendo-switch-emulation-setup', true),
('Portable Arcade Collection', 'Classic arcade games and MAME setup for handheld devices', 'Anbernic RG35XX SP', 'portable-arcade-collection', false),
('PlayStation Portable Collection', 'PSP games and PPSSPP emulator setup', 'AYN Odin 2', 'playstation-portable-collection', false)
ON CONFLICT (slug) DO NOTHING;

-- Insert sample setups data
INSERT INTO setups (title, description, difficulty, estimated_time, target_device, requirements, steps, slug, featured) VALUES
('Steam Deck EmuDeck Installation', 'Complete guide to installing EmuDeck on Steam Deck for retro gaming', 'beginner', '30-45 minutes', 'Steam Deck', 
 ARRAY['Steam Deck', 'MicroSD Card (64GB+)', 'Desktop Mode Access'], 
 '[{"step": 1, "title": "Enter Desktop Mode", "description": "Hold power button and select Switch to Desktop"}, {"step": 2, "title": "Download EmuDeck", "description": "Visit emudeck.com and download the installer"}, {"step": 3, "title": "Run Installation", "description": "Follow the EmuDeck setup wizard"}]'::jsonb,
 'steam-deck-emudeck-installation', true),
('ROG Ally Windows Setup', 'Optimize ROG Ally for emulation with Windows tweaks', 'intermediate', '1-2 hours', 'ROG Ally',
 ARRAY['ROG Ally', 'Windows 11', 'Administrator Access'],
 '[{"step": 1, "title": "Update Windows", "description": "Ensure Windows 11 is fully updated"}, {"step": 2, "title": "Install Armoury Crate", "description": "Download and install ASUS Armoury Crate"}, {"step": 3, "title": "Configure Power Settings", "description": "Optimize power settings for gaming"}]'::jsonb,
 'rog-ally-windows-setup', true),
('Anbernic Custom Firmware Flash', 'Install custom firmware on Anbernic devices', 'advanced', '45-60 minutes', 'Anbernic RG35XX SP',
 ARRAY['Anbernic Device', 'MicroSD Card', 'Card Reader', 'Computer'],
 '[{"step": 1, "title": "Backup Original Firmware", "description": "Create backup of stock firmware"}, {"step": 2, "title": "Download Custom Firmware", "description": "Get latest custom firmware release"}, {"step": 3, "title": "Flash Firmware", "description": "Flash custom firmware to device"}]'::jsonb,
 'anbernic-custom-firmware-flash', false)
ON CONFLICT (slug) DO NOTHING;

-- Verify tables were created
SELECT 'presets' as table_name, count(*) as row_count FROM presets
UNION ALL
SELECT 'setups' as table_name, count(*) as row_count FROM setups
UNION ALL
SELECT 'preset_items' as table_name, count(*) as row_count FROM preset_items
UNION ALL
SELECT 'setup_components' as table_name, count(*) as row_count FROM setup_components
UNION ALL
SELECT 'handheld_emulation_performance' as table_name, count(*) as row_count FROM handheld_emulation_performance;
