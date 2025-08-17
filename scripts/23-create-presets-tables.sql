-- Create presets and preset_items tables for the preset builder functionality

-- Create presets table
CREATE TABLE IF NOT EXISTS public.presets (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    handheld_id INTEGER REFERENCES handhelds(id),
    created_by VARCHAR(255) NOT NULL DEFAULT 'anonymous',
    is_public BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create preset_items table
CREATE TABLE IF NOT EXISTS public.preset_items (
    id SERIAL PRIMARY KEY,
    preset_id INTEGER NOT NULL REFERENCES presets(id) ON DELETE CASCADE,
    item_type VARCHAR(50) NOT NULL CHECK (item_type IN ('emulator', 'game', 'cfw_app', 'tool', 'custom_firmware')),
    item_id VARCHAR(255) NOT NULL,
    notes TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_presets_created_by ON presets(created_by);
CREATE INDEX IF NOT EXISTS idx_presets_is_public ON presets(is_public);
CREATE INDEX IF NOT EXISTS idx_presets_handheld_id ON presets(handheld_id);
CREATE INDEX IF NOT EXISTS idx_preset_items_preset_id ON preset_items(preset_id);
CREATE INDEX IF NOT EXISTS idx_preset_items_item_type ON preset_items(item_type);
CREATE INDEX IF NOT EXISTS idx_preset_items_sort_order ON preset_items(preset_id, sort_order);

-- Enable Row Level Security
ALTER TABLE presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE preset_items ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since this is a demo app)
CREATE POLICY "Allow all operations on presets" ON presets FOR ALL USING (true);
CREATE POLICY "Allow all operations on preset_items" ON preset_items FOR ALL USING (true);

-- Insert sample data
INSERT INTO presets (name, description, handheld_id, created_by, is_public) VALUES
('Steam Deck Gaming Setup', 'Complete gaming setup for Steam Deck with emulators and tools', 1, 'demo_user', true),
('ROG Ally Retro Pack', 'Retro gaming focused preset for ASUS ROG Ally', 2, 'demo_user', true),
('Universal Handheld Kit', 'Works great on any handheld device', NULL, 'demo_user', true)
ON CONFLICT DO NOTHING;

-- Insert sample preset items (assuming some items exist with these IDs)
INSERT INTO preset_items (preset_id, item_type, item_id, notes, sort_order) VALUES
(1, 'emulator', '1', 'Great for PlayStation games', 0),
(1, 'emulator', '2', 'Perfect for Nintendo games', 1),
(1, 'tool', '1', 'Essential for managing ROMs', 2),
(2, 'emulator', '1', 'Works well on ROG Ally', 0),
(2, 'cfw_app', '1', 'Enhances the gaming experience', 1),
(3, 'emulator', '1', 'Universal emulator', 0),
(3, 'emulator', '2', 'Another great emulator', 1)
ON CONFLICT DO NOTHING;
