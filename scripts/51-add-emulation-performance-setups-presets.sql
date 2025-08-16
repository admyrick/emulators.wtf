-- Add Emulation Performance, Setups, and Presets Database Schema
-- This script creates tables for handheld emulation performance, setup guides, and preset builder functionality

-- Emulation Performance table - tracks how well each handheld performs with different consoles
CREATE TABLE IF NOT EXISTS emulation_performance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    handheld_id INTEGER NOT NULL,
    console_id UUID NOT NULL,
    performance_rating TEXT CHECK (performance_rating IN ('excellent', 'good', 'fair', 'poor', 'unplayable')),
    fps_range TEXT, -- e.g., "55-60", "30-45", "15-30"
    resolution_supported TEXT, -- e.g., "1080p", "720p", "480p"
    notes TEXT,
    tested_games TEXT[], -- Array of game names tested
    settings_notes TEXT, -- Recommended emulator settings
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (handheld_id) REFERENCES handhelds(id) ON DELETE CASCADE,
    FOREIGN KEY (console_id) REFERENCES consoles(id) ON DELETE CASCADE
);

-- Setups table - comprehensive setup guides
CREATE TABLE IF NOT EXISTS setups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    long_description TEXT,
    difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
    estimated_time TEXT, -- e.g., "30 minutes", "2 hours"
    requirements TEXT[],
    steps TEXT[],
    image_url TEXT,
    featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Setup Components - links setups to various components
CREATE TABLE IF NOT EXISTS setup_components (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setup_id UUID NOT NULL,
    component_type TEXT NOT NULL CHECK (component_type IN ('handheld', 'emulator', 'game', 'cfw_app', 'custom_firmware', 'tool')),
    component_id UUID NOT NULL,
    is_required BOOLEAN DEFAULT TRUE,
    notes TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (setup_id) REFERENCES setups(id) ON DELETE CASCADE
);

-- Presets table - user-created collections for download
CREATE TABLE IF NOT EXISTS presets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    handheld_id INTEGER, -- Optional: specific handheld this preset is for
    created_by TEXT, -- User identifier
    download_count INTEGER DEFAULT 0,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (handheld_id) REFERENCES handhelds(id) ON DELETE SET NULL
);

-- Preset Items - components included in each preset
CREATE TABLE IF NOT EXISTS preset_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    preset_id UUID NOT NULL,
    item_type TEXT NOT NULL CHECK (item_type IN ('emulator', 'game', 'cfw_app', 'tool', 'custom_firmware')),
    item_id UUID NOT NULL,
    notes TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (preset_id) REFERENCES presets(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_emulation_performance_handheld ON emulation_performance(handheld_id);
CREATE INDEX IF NOT EXISTS idx_emulation_performance_console ON emulation_performance(console_id);
CREATE INDEX IF NOT EXISTS idx_setups_slug ON setups(slug);
CREATE INDEX IF NOT EXISTS idx_setups_featured ON setups(featured);
CREATE INDEX IF NOT EXISTS idx_setup_components_setup ON setup_components(setup_id);
CREATE INDEX IF NOT EXISTS idx_setup_components_type ON setup_components(component_type);
CREATE INDEX IF NOT EXISTS idx_presets_handheld ON presets(handheld_id);
CREATE INDEX IF NOT EXISTS idx_presets_public ON presets(is_public);
CREATE INDEX IF NOT EXISTS idx_preset_items_preset ON preset_items(preset_id);
CREATE INDEX IF NOT EXISTS idx_preset_items_type ON preset_items(item_type);

-- Add sample emulation performance data
INSERT INTO emulation_performance (handheld_id, console_id, performance_rating, fps_range, resolution_supported, notes, tested_games, settings_notes) VALUES
(1, (SELECT id FROM consoles WHERE name = 'Nintendo Switch' LIMIT 1), 'good', '45-60', '720p', 'Most games run well with some frame drops in demanding scenes', ARRAY['Super Mario Odyssey', 'Zelda BOTW'], 'Use Vulkan renderer for best performance'),
(1, (SELECT id FROM consoles WHERE name = 'PlayStation 2' LIMIT 1), 'excellent', '60', '1080p', 'Perfect emulation for most PS2 games', ARRAY['God of War', 'Shadow of the Colossus'], 'Default settings work great'),
(2, (SELECT id FROM consoles WHERE name = 'Nintendo 64' LIMIT 1), 'excellent', '60', '720p', 'Flawless N64 emulation', ARRAY['Super Mario 64', 'Zelda OOT'], 'Use ParaLLEl-RDP for accuracy')
ON CONFLICT DO NOTHING;

-- Add sample setup data
INSERT INTO setups (title, slug, description, long_description, difficulty_level, estimated_time, requirements, steps, image_url, featured) VALUES
(
    'Complete Retro Gaming Setup for Steam Deck',
    'steam-deck-retro-gaming-complete',
    'Transform your Steam Deck into the ultimate retro gaming machine',
    'This comprehensive guide will walk you through setting up emulation for multiple consoles on your Steam Deck, including optimal settings, game organization, and performance tweaks.',
    'intermediate',
    '2-3 hours',
    ARRAY['Steam Deck', 'MicroSD card (64GB+)', 'Computer for file transfer'],
    ARRAY[
        'Install EmuDeck via Desktop Mode',
        'Configure emulator settings for each console',
        'Set up ROM folder structure',
        'Install and configure RetroArch',
        'Add custom artwork and themes',
        'Test performance and adjust settings'
    ],
    '/images/setups/steam-deck-retro.jpg',
    true
),
(
    'Anbernic RG35XX Perfect Setup',
    'anbernic-rg35xx-perfect-setup',
    'Optimize your RG35XX with custom firmware and perfect game library',
    'Get the most out of your Anbernic RG35XX with this step-by-step setup guide covering firmware installation, game setup, and performance optimization.',
    'beginner',
    '1 hour',
    ARRAY['Anbernic RG35XX', 'MicroSD card', 'Card reader'],
    ARRAY[
        'Flash custom firmware to SD card',
        'Set up BIOS files',
        'Organize ROM collection',
        'Configure controls and display',
        'Add box art and metadata'
    ],
    '/images/setups/rg35xx-setup.jpg',
    true
)
ON CONFLICT (slug) DO NOTHING;

-- Add sample preset data
INSERT INTO presets (name, description, handheld_id, created_by, is_public) VALUES
(
    'Essential Retro Pack',
    'Must-have emulators and tools for any handheld gaming device',
    NULL,
    'admin',
    true
),
(
    'Steam Deck Gaming Suite',
    'Complete emulation setup optimized for Steam Deck',
    (SELECT id FROM handhelds WHERE slug = 'steam-deck-oled' LIMIT 1),
    'admin',
    true
),
(
    'Portable Arcade Collection',
    'Classic arcade emulators and essential tools',
    NULL,
    'admin',
    true
)
ON CONFLICT DO NOTHING;

-- Enable Row Level Security
ALTER TABLE emulation_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE setups ENABLE ROW LEVEL SECURITY;
ALTER TABLE setup_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE preset_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public read access
CREATE POLICY "Public read access for emulation_performance" ON emulation_performance FOR SELECT USING (true);
CREATE POLICY "Public read access for setups" ON setups FOR SELECT USING (true);
CREATE POLICY "Public read access for setup_components" ON setup_components FOR SELECT USING (true);
CREATE POLICY "Public read access for presets" ON presets FOR SELECT USING (is_public = true);
CREATE POLICY "Public read access for preset_items" ON preset_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM presets WHERE presets.id = preset_items.preset_id AND presets.is_public = true)
);

-- Verification queries
SELECT 'Emulation Performance table created' as status, COUNT(*) as sample_records FROM emulation_performance;
SELECT 'Setups table created' as status, COUNT(*) as sample_records FROM setups;
SELECT 'Setup Components table created' as status, COUNT(*) as sample_records FROM setup_components;
SELECT 'Presets table created' as status, COUNT(*) as sample_records FROM presets;
SELECT 'Preset Items table created' as status, COUNT(*) as sample_records FROM preset_items;
