-- Create all missing tables that the codebase expects

-- Create custom_firmware table
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

-- Create handhelds table
CREATE TABLE IF NOT EXISTS handhelds (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    manufacturer VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2),
    release_date DATE,
    cpu VARCHAR(255),
    ram VARCHAR(100),
    storage VARCHAR(100),
    display VARCHAR(255),
    battery_life VARCHAR(100),
    weight VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create consoles table
CREATE TABLE IF NOT EXISTS consoles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    manufacturer VARCHAR(255) NOT NULL,
    description TEXT,
    release_date DATE,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create emulators table
CREATE TABLE IF NOT EXISTS emulators (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    console_id UUID REFERENCES consoles(id) ON DELETE CASCADE,
    description TEXT,
    developer VARCHAR(255),
    version VARCHAR(100),
    license VARCHAR(100),
    download_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create games table
CREATE TABLE IF NOT EXISTS games (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    console_id UUID REFERENCES consoles(id) ON DELETE CASCADE,
    description TEXT,
    developer VARCHAR(255),
    publisher VARCHAR(255),
    genre VARCHAR(100),
    release_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tools table
CREATE TABLE IF NOT EXISTS tools (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    developer VARCHAR(255),
    version VARCHAR(100),
    license VARCHAR(100),
    download_url TEXT,
    category_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cfw_apps table
CREATE TABLE IF NOT EXISTS cfw_apps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    developer VARCHAR(255),
    version VARCHAR(100),
    license VARCHAR(100),
    download_url TEXT,
    source_code_url TEXT,
    features TEXT[],
    requirements TEXT[],
    category_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create relationship tables
CREATE TABLE IF NOT EXISTS cfw_compatible_handhelds (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    custom_firmware_id UUID NOT NULL REFERENCES custom_firmware(id) ON DELETE CASCADE,
    handheld_id UUID NOT NULL REFERENCES handhelds(id) ON DELETE CASCADE,
    compatibility_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(custom_firmware_id, handheld_id)
);

-- Create links table for external URLs
CREATE TABLE IF NOT EXISTS links (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create retailers table
CREATE TABLE IF NOT EXISTS retailers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    website_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create error_logs table
CREATE TABLE IF NOT EXISTS error_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    error_message TEXT NOT NULL,
    stack_trace TEXT,
    context JSONB,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create emulation_performance table
CREATE TABLE IF NOT EXISTS emulation_performance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    handheld_id UUID NOT NULL REFERENCES handhelds(id) ON DELETE CASCADE,
    emulator_id UUID NOT NULL REFERENCES emulators(id) ON DELETE CASCADE,
    performance_rating INTEGER CHECK (performance_rating >= 1 AND performance_rating <= 5),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(handheld_id, emulator_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_custom_firmware_slug ON custom_firmware(slug);
CREATE INDEX IF NOT EXISTS idx_handhelds_slug ON handhelds(slug);
CREATE INDEX IF NOT EXISTS idx_consoles_slug ON consoles(slug);
CREATE INDEX IF NOT EXISTS idx_emulators_slug ON emulators(slug);
CREATE INDEX IF NOT EXISTS idx_games_slug ON games(slug);
CREATE INDEX IF NOT EXISTS idx_tools_slug ON tools(slug);
CREATE INDEX IF NOT EXISTS idx_cfw_apps_slug ON cfw_apps(slug);

-- Enable Row Level Security
ALTER TABLE custom_firmware ENABLE ROW LEVEL SECURITY;
ALTER TABLE handhelds ENABLE ROW LEVEL SECURITY;
ALTER TABLE consoles ENABLE ROW LEVEL SECURITY;
ALTER TABLE emulators ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE cfw_apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE cfw_compatible_handhelds ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY IF NOT EXISTS "Allow public read access to custom_firmware" ON custom_firmware FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Allow public read access to handhelds" ON handhelds FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Allow public read access to consoles" ON consoles FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Allow public read access to emulators" ON emulators FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Allow public read access to games" ON games FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Allow public read access to tools" ON tools FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Allow public read access to cfw_apps" ON cfw_apps FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Allow public read access to cfw_compatible_handhelds" ON cfw_compatible_handhelds FOR SELECT USING (true);

-- Create policies for service role (admin) access
CREATE POLICY IF NOT EXISTS "Allow service role full access to custom_firmware" ON custom_firmware FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
CREATE POLICY IF NOT EXISTS "Allow service role full access to handhelds" ON handhelds FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
CREATE POLICY IF NOT EXISTS "Allow service role full access to consoles" ON consoles FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
CREATE POLICY IF NOT EXISTS "Allow service role full access to emulators" ON emulators FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
CREATE POLICY IF NOT EXISTS "Allow service role full access to games" ON games FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
CREATE POLICY IF NOT EXISTS "Allow service role full access to tools" ON tools FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
CREATE POLICY IF NOT EXISTS "Allow service role full access to cfw_apps" ON cfw_apps FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
CREATE POLICY IF NOT EXISTS "Allow service role full access to cfw_compatible_handhelds" ON cfw_compatible_handhelds FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Insert sample custom firmware data
INSERT INTO custom_firmware (name, slug, description, version, installation_difficulty, features, requirements) VALUES
('Batocera Linux', 'batocera-linux', 'A retro-gaming distribution with the aim of turning any computer/nano computer into a gaming console during a game or permanently.', '39', 'intermediate', ARRAY['Pre-configured emulators', 'Web interface', 'Automatic controller configuration', 'Kodi integration'], ARRAY['SD card (16GB minimum)', 'Compatible handheld device']),
('RetroPie', 'retropie', 'RetroPie allows you to turn your handheld device into a retro-gaming machine.', '4.8', 'beginner', ARRAY['Easy setup', 'Multiple emulators', 'Customizable interface', 'Save states'], ARRAY['MicroSD card', 'Compatible device', 'Basic Linux knowledge helpful']),
('ArkOS', 'arkos', 'A custom firmware for handheld devices focused on emulation performance and ease of use.', '2.0', 'beginner', ARRAY['Optimized emulators', 'Simple interface', 'Regular updates', 'Community support'], ARRAY['Compatible handheld device', 'MicroSD card (32GB recommended)']),
('JELOS', 'jelos', 'Just Enough Linux Operating System - A simple, bloat-free Linux distribution for handheld gaming.', '20231201', 'intermediate', ARRAY['Minimal footprint', 'Fast boot times', 'RetroArch integration', 'Network play support'], ARRAY['ARM-based handheld', 'MicroSD card (16GB+)', 'WiFi capability']),
('AmberELEC', 'amberelec', 'Handheld firmware optimized for Anbernic devices with focus on performance and compatibility.', '20231115', 'intermediate', ARRAY['Device-specific optimizations', 'Custom themes', 'Performance tweaks', 'Easy installation'], ARRAY['Anbernic handheld device', 'MicroSD card (32GB+)', 'Computer for flashing'])
ON CONFLICT (slug) DO NOTHING;

-- Insert sample handheld data
INSERT INTO handhelds (name, slug, manufacturer, description, price, cpu, ram, storage, display, battery_life) VALUES
('Steam Deck OLED', 'steam-deck-oled', 'Valve', 'Premium handheld gaming PC with OLED display', 549.00, 'AMD APU', '16GB LPDDR5', '512GB NVMe SSD', '7.4" OLED 1280x800', '3-12 hours'),
('ASUS ROG Ally', 'asus-rog-ally', 'ASUS', 'Windows-based handheld gaming device', 699.99, 'AMD Ryzen Z1 Extreme', '16GB LPDDR5', '512GB NVMe SSD', '7" IPS 1920x1080', '1-3 hours'),
('Anbernic RG35XX SP', 'anbernic-rg35xx-sp', 'Anbernic', 'Compact retro handheld with excellent build quality', 89.99, 'ARM Cortex-A53', '1GB DDR3', '64GB eMMC', '3.5" IPS 640x480', '4-6 hours'),
('Ayaneo 2S', 'ayaneo-2s', 'Ayaneo', 'High-performance Windows handheld gaming device', 1299.00, 'AMD Ryzen 7 6800U', '32GB LPDDR5', '2TB NVMe SSD', '7" IPS 1920x1200', '2-4 hours'),
('GPD Win 4', 'gpd-win-4', 'GPD', 'Ultra-portable Windows gaming handheld', 899.00, 'AMD Ryzen 7 6800U', '16GB LPDDR5', '1TB NVMe SSD', '6" IPS 1920x1080', '2-8 hours')
ON CONFLICT (slug) DO NOTHING;

-- Insert sample console data
INSERT INTO consoles (name, slug, manufacturer, description, release_date) VALUES
('Nintendo Entertainment System', 'nes', 'Nintendo', 'Classic 8-bit home video game console', '1985-10-18'),
('Super Nintendo Entertainment System', 'snes', 'Nintendo', '16-bit home video game console', '1990-11-21'),
('Sega Genesis', 'sega-genesis', 'Sega', '16-bit home video game console', '1988-10-29'),
('PlayStation', 'playstation', 'Sony', '32-bit home video game console', '1994-12-03'),
('Game Boy', 'game-boy', 'Nintendo', 'Portable handheld game console', '1989-04-21')
ON CONFLICT (slug) DO NOTHING;

-- Show results
SELECT 'Tables created successfully!' as status;
SELECT 'Custom Firmware:' as info, count(*) as count FROM custom_firmware;
SELECT 'Handhelds:' as info, count(*) as count FROM handhelds;
SELECT 'Consoles:' as info, count(*) as count FROM consoles;
