-- Create proper relationships between custom firmware and handhelds
-- Drop existing table if it exists to recreate with proper structure
DROP TABLE IF EXISTS cfw_compatible_handhelds CASCADE;

-- Create the custom firmware table if it doesn't exist
CREATE TABLE IF NOT EXISTS custom_firmware (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    version VARCHAR(100),
    release_date DATE,
    download_url TEXT,
    documentation_url TEXT,
    source_code_url TEXT,
    license VARCHAR(100),
    installation_difficulty VARCHAR(50) DEFAULT 'intermediate',
    features TEXT[],
    requirements TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the relationship table
CREATE TABLE IF NOT EXISTS cfw_compatible_handhelds (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    custom_firmware_id UUID NOT NULL REFERENCES custom_firmware(id) ON DELETE CASCADE,
    handheld_id UUID NOT NULL REFERENCES handhelds(id) ON DELETE CASCADE,
    compatibility_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(custom_firmware_id, handheld_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cfw_compatible_handhelds_firmware_id ON cfw_compatible_handhelds(custom_firmware_id);
CREATE INDEX IF NOT EXISTS idx_cfw_compatible_handhelds_handheld_id ON cfw_compatible_handhelds(handheld_id);
CREATE INDEX IF NOT EXISTS idx_custom_firmware_slug ON custom_firmware(slug);
CREATE INDEX IF NOT EXISTS idx_custom_firmware_name ON custom_firmware(name);

-- Enable Row Level Security
ALTER TABLE custom_firmware ENABLE ROW LEVEL SECURITY;
ALTER TABLE cfw_compatible_handhelds ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY IF NOT EXISTS "Allow public read access to custom_firmware" ON custom_firmware
    FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Allow public read access to cfw_compatible_handhelds" ON cfw_compatible_handhelds
    FOR SELECT USING (true);

-- Create policies for authenticated users (admin access)
CREATE POLICY IF NOT EXISTS "Allow authenticated users full access to custom_firmware" ON custom_firmware
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Allow authenticated users full access to cfw_compatible_handhelds" ON cfw_compatible_handhelds
    FOR ALL USING (auth.role() = 'authenticated');

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER IF NOT EXISTS update_custom_firmware_updated_at 
    BEFORE UPDATE ON custom_firmware 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample custom firmware if none exists
INSERT INTO custom_firmware (name, slug, description, version, installation_difficulty, features, requirements)
SELECT 
    'Batocera Linux',
    'batocera-linux',
    'A retro-gaming distribution with the aim of turning any computer/nano computer into a gaming console during a game or permanently.',
    '39',
    'intermediate',
    ARRAY['Pre-configured emulators', 'Web interface', 'Automatic controller configuration', 'Kodi integration'],
    ARRAY['SD card (16GB minimum)', 'Compatible handheld device']
WHERE NOT EXISTS (SELECT 1 FROM custom_firmware WHERE slug = 'batocera-linux');

INSERT INTO custom_firmware (name, slug, description, version, installation_difficulty, features, requirements)
SELECT 
    'RetroPie',
    'retropie',
    'RetroPie allows you to turn your handheld device into a retro-gaming machine.',
    '4.8',
    'beginner',
    ARRAY['Easy setup', 'Multiple emulators', 'Customizable interface', 'Save states'],
    ARRAY['MicroSD card', 'Compatible device', 'Basic Linux knowledge helpful']
WHERE NOT EXISTS (SELECT 1 FROM custom_firmware WHERE slug = 'retropie');

INSERT INTO custom_firmware (name, slug, description, version, installation_difficulty, features, requirements)
SELECT 
    'EmuELEC',
    'emuelec',
    'Just enough OS for KODI and retro gaming on ARM devices.',
    '4.7',
    'intermediate',
    ARRAY['Optimized for ARM devices', 'Kodi integration', 'RetroArch frontend', 'Auto-updates'],
    ARRAY['ARM-based handheld', 'MicroSD card (8GB+)', 'HDMI output recommended']
WHERE NOT EXISTS (SELECT 1 FROM custom_firmware WHERE slug = 'emuelec');

INSERT INTO custom_firmware (name, slug, description, version, installation_difficulty, features, requirements)
SELECT 
    'ArkOS',
    'arkos',
    'A custom firmware for handheld devices focused on emulation performance and ease of use.',
    '2.0',
    'beginner',
    ARRAY['Optimized emulators', 'Simple interface', 'Regular updates', 'Community support'],
    ARRAY['Compatible handheld device', 'MicroSD card (32GB recommended)']
WHERE NOT EXISTS (SELECT 1 FROM custom_firmware WHERE slug = 'arkos');

INSERT INTO custom_firmware (name, slug, description, version, installation_difficulty, features, requirements)
SELECT 
    'JELOS',
    'jelos',
    'Just Enough Linux Operating System - A simple, bloat-free Linux distribution for handheld gaming.',
    '20231201',
    'intermediate',
    ARRAY['Minimal footprint', 'Fast boot times', 'RetroArch integration', 'Network play support'],
    ARRAY['ARM-based handheld', 'MicroSD card (16GB+)', 'WiFi capability']
WHERE NOT EXISTS (SELECT 1 FROM custom_firmware WHERE slug = 'jelos');

INSERT INTO custom_firmware (name, slug, description, version, installation_difficulty, features, requirements)
SELECT 
    'AmberELEC',
    'amberelec',
    'Handheld firmware optimized for Anbernic devices with focus on performance and compatibility.',
    '20231115',
    'intermediate',
    ARRAY['Device-specific optimizations', 'Custom themes', 'Performance tweaks', 'Easy installation'],
    ARRAY['Anbernic handheld device', 'MicroSD card (32GB+)', 'Computer for flashing']
WHERE NOT EXISTS (SELECT 1 FROM custom_firmware WHERE slug = 'amberelec');

-- Insert some sample relationships if data exists
INSERT INTO cfw_compatible_handhelds (custom_firmware_id, handheld_id, compatibility_notes)
SELECT 
    cf.id as custom_firmware_id,
    h.id as handheld_id,
    'Fully compatible with excellent performance' as compatibility_notes
FROM custom_firmware cf
CROSS JOIN handhelds h
WHERE cf.slug = 'batocera-linux' AND h.name ILIKE '%steam deck%'
ON CONFLICT (custom_firmware_id, handheld_id) DO NOTHING;

INSERT INTO cfw_compatible_handhelds (custom_firmware_id, handheld_id, compatibility_notes)
SELECT 
    cf.id as custom_firmware_id,
    h.id as handheld_id,
    'Community supported with good compatibility' as compatibility_notes
FROM custom_firmware cf
CROSS JOIN handhelds h
WHERE cf.slug = 'retropie' AND (h.name ILIKE '%raspberry%' OR h.name ILIKE '%pi%')
ON CONFLICT (custom_firmware_id, handheld_id) DO NOTHING;

INSERT INTO cfw_compatible_handhelds (custom_firmware_id, handheld_id, compatibility_notes)
SELECT 
    cf.id as custom_firmware_id,
    h.id as handheld_id,
    'Optimized for ARM-based handhelds' as compatibility_notes
FROM custom_firmware cf
CROSS JOIN handhelds h
WHERE cf.slug = 'emuelec' AND (h.cpu ILIKE '%arm%' OR h.manufacturer ILIKE '%anbernic%' OR h.manufacturer ILIKE '%powkiddy%')
ON CONFLICT (custom_firmware_id, handheld_id) DO NOTHING;

INSERT INTO cfw_compatible_handhelds (custom_firmware_id, handheld_id, compatibility_notes)
SELECT 
    cf.id as custom_firmware_id,
    h.id as handheld_id,
    'Excellent compatibility and performance' as compatibility_notes
FROM custom_firmware cf
CROSS JOIN handhelds h
WHERE cf.slug = 'arkos' AND (h.manufacturer ILIKE '%anbernic%' OR h.manufacturer ILIKE '%powkiddy%' OR h.name ILIKE '%rg%')
ON CONFLICT (custom_firmware_id, handheld_id) DO NOTHING;

INSERT INTO cfw_compatible_handhelds (custom_firmware_id, handheld_id, compatibility_notes)
SELECT 
    cf.id as custom_firmware_id,
    h.id as handheld_id,
    'Lightweight and fast performance' as compatibility_notes
FROM custom_firmware cf
CROSS JOIN handhelds h
WHERE cf.slug = 'jelos' AND (h.manufacturer ILIKE '%anbernic%' OR h.manufacturer ILIKE '%ayn%' OR h.name ILIKE '%odin%')
ON CONFLICT (custom_firmware_id, handheld_id) DO NOTHING;

INSERT INTO cfw_compatible_handhelds (custom_firmware_id, handheld_id, compatibility_notes)
SELECT 
    cf.id as custom_firmware_id,
    h.id as handheld_id,
    'Native support with optimized performance' as compatibility_notes
FROM custom_firmware cf
CROSS JOIN handhelds h
WHERE cf.slug = 'amberelec' AND h.manufacturer ILIKE '%anbernic%'
ON CONFLICT (custom_firmware_id, handheld_id) DO NOTHING;

-- Verify tables were created and show results
SELECT 'custom_firmware table created' as status, count(*) as records FROM custom_firmware;
SELECT 'cfw_compatible_handhelds table created' as status, count(*) as records FROM cfw_compatible_handhelds;

-- Show sample data
SELECT 'Sample Custom Firmware:' as info;
SELECT name, version, installation_difficulty FROM custom_firmware ORDER BY name;

SELECT 'Sample Compatibility Relationships:' as info;
SELECT 
    cf.name as firmware_name,
    h.manufacturer || ' ' || h.name as handheld_name,
    cch.compatibility_notes
FROM cfw_compatible_handhelds cch
JOIN custom_firmware cf ON cch.custom_firmware_id = cf.id
JOIN handhelds h ON cch.handheld_id = h.id
ORDER BY cf.name, h.manufacturer, h.name;
