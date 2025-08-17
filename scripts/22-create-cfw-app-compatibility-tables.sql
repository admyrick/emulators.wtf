-- Create CFW app compatibility tables for handhelds and firmware
-- This fixes the "relation does not exist" errors in the CFW app detail pages

-- Create CFW app to handheld compatibility table
CREATE TABLE IF NOT EXISTS cfw_app_handheld_compatibility (
    id SERIAL PRIMARY KEY,
    cfw_app_id UUID NOT NULL REFERENCES cfw_apps(id) ON DELETE CASCADE,
    handheld_id INTEGER NOT NULL REFERENCES handhelds(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'supported',
    compatibility_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(cfw_app_id, handheld_id)
);

-- Create CFW app to firmware compatibility table
CREATE TABLE IF NOT EXISTS cfw_app_firmware_compatibility (
    id SERIAL PRIMARY KEY,
    cfw_app_id UUID NOT NULL REFERENCES cfw_apps(id) ON DELETE CASCADE,
    custom_firmware_id UUID NOT NULL REFERENCES custom_firmware(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'supported',
    compatibility_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(cfw_app_id, custom_firmware_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cfw_app_handheld_compatibility_cfw_app_id ON cfw_app_handheld_compatibility(cfw_app_id);
CREATE INDEX IF NOT EXISTS idx_cfw_app_handheld_compatibility_handheld_id ON cfw_app_handheld_compatibility(handheld_id);
CREATE INDEX IF NOT EXISTS idx_cfw_app_firmware_compatibility_cfw_app_id ON cfw_app_firmware_compatibility(cfw_app_id);
CREATE INDEX IF NOT EXISTS idx_cfw_app_firmware_compatibility_firmware_id ON cfw_app_firmware_compatibility(custom_firmware_id);

-- Enable RLS for security
ALTER TABLE cfw_app_handheld_compatibility ENABLE ROW LEVEL SECURITY;
ALTER TABLE cfw_app_firmware_compatibility ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access" ON cfw_app_handheld_compatibility FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON cfw_app_handheld_compatibility FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON cfw_app_handheld_compatibility FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON cfw_app_handheld_compatibility FOR DELETE USING (true);

CREATE POLICY "Allow public read access" ON cfw_app_firmware_compatibility FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON cfw_app_firmware_compatibility FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON cfw_app_firmware_compatibility FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON cfw_app_firmware_compatibility FOR DELETE USING (true);

-- Insert sample compatibility data
-- First, get some CFW app IDs and handheld/firmware IDs to create relationships

-- Sample handheld compatibility data (assuming some CFW apps and handhelds exist)
INSERT INTO cfw_app_handheld_compatibility (cfw_app_id, handheld_id, status, compatibility_notes)
SELECT 
    ca.id as cfw_app_id,
    h.id as handheld_id,
    'supported' as status,
    'Fully compatible with all features' as compatibility_notes
FROM cfw_apps ca
CROSS JOIN handhelds h
WHERE ca.name IN ('EmuDeck', 'RetroDECK', 'Decky Loader')
AND h.name IN ('Steam Deck', 'ROG Ally', 'Legion Go')
ON CONFLICT (cfw_app_id, handheld_id) DO NOTHING;

-- Sample firmware compatibility data
INSERT INTO cfw_app_firmware_compatibility (cfw_app_id, custom_firmware_id, status, compatibility_notes)
SELECT 
    ca.id as cfw_app_id,
    cf.id as custom_firmware_id,
    'supported' as status,
    'Compatible with this firmware version' as compatibility_notes
FROM cfw_apps ca
CROSS JOIN custom_firmware cf
WHERE ca.name IN ('EmuDeck', 'RetroDECK', 'Decky Loader')
AND cf.name IN ('SteamOS', 'HoloISO', 'ChimeraOS')
ON CONFLICT (cfw_app_id, custom_firmware_id) DO NOTHING;
