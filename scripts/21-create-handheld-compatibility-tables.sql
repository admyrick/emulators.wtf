-- Create missing tables for handheld compatibility

-- Create handheld_custom_firmware table
CREATE TABLE IF NOT EXISTS handheld_custom_firmware (
    id SERIAL PRIMARY KEY,
    handheld_id INTEGER NOT NULL REFERENCES handhelds(id) ON DELETE CASCADE,
    custom_firmware_id UUID NOT NULL REFERENCES custom_firmware(id) ON DELETE CASCADE,
    compatibility_notes TEXT,
    status VARCHAR(50) DEFAULT 'compatible',
    install_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(handheld_id, custom_firmware_id)
);

-- Create emulation_performance table
CREATE TABLE IF NOT EXISTS emulation_performance (
    id SERIAL PRIMARY KEY,
    handheld_id INTEGER NOT NULL REFERENCES handhelds(id) ON DELETE CASCADE,
    console_id INTEGER NOT NULL REFERENCES consoles(id) ON DELETE CASCADE,
    performance_rating VARCHAR(20) NOT NULL CHECK (performance_rating IN ('excellent', 'good', 'fair', 'poor', 'unplayable')),
    fps_range VARCHAR(50),
    resolution_supported VARCHAR(100),
    notes TEXT,
    tested_games TEXT[],
    settings_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(handheld_id, console_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_handheld_custom_firmware_handheld_id ON handheld_custom_firmware(handheld_id);
CREATE INDEX IF NOT EXISTS idx_handheld_custom_firmware_custom_firmware_id ON handheld_custom_firmware(custom_firmware_id);
CREATE INDEX IF NOT EXISTS idx_emulation_performance_handheld_id ON emulation_performance(handheld_id);
CREATE INDEX IF NOT EXISTS idx_emulation_performance_console_id ON emulation_performance(console_id);
CREATE INDEX IF NOT EXISTS idx_emulation_performance_rating ON emulation_performance(performance_rating);

-- Enable RLS
ALTER TABLE handheld_custom_firmware ENABLE ROW LEVEL SECURITY;
ALTER TABLE emulation_performance ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public read access
CREATE POLICY "Allow public read access to handheld_custom_firmware" ON handheld_custom_firmware
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access to emulation_performance" ON emulation_performance
    FOR SELECT USING (true);

-- Insert sample data for handheld_custom_firmware
INSERT INTO handheld_custom_firmware (handheld_id, custom_firmware_id, compatibility_notes, status) VALUES
-- Steam Deck compatibility (assuming handheld_id = 1)
(1, (SELECT id FROM custom_firmware WHERE name = 'SteamOS' LIMIT 1), 'Native OS, fully supported', 'excellent'),
(1, (SELECT id FROM custom_firmware WHERE name = 'EmuDeck' LIMIT 1), 'Works perfectly with SteamOS', 'excellent'),
(1, (SELECT id FROM custom_firmware WHERE name = 'RetroDECK' LIMIT 1), 'Alternative to EmuDeck, fully compatible', 'excellent')
ON CONFLICT (handheld_id, custom_firmware_id) DO NOTHING;

-- Insert sample data for emulation_performance
INSERT INTO emulation_performance (handheld_id, console_id, performance_rating, fps_range, resolution_supported, notes, tested_games, settings_notes) VALUES
-- Steam Deck performance (assuming handheld_id = 1)
(1, (SELECT id FROM consoles WHERE name ILIKE '%nintendo%switch%' LIMIT 1), 'good', '30-60 FPS', '720p-1080p', 'Most games run well with some tweaking', ARRAY['Super Mario Odyssey', 'The Legend of Zelda: Breath of the Wild'], 'Use Vulkan renderer for best performance'),
(1, (SELECT id FROM consoles WHERE name ILIKE '%playstation%3%' LIMIT 1), 'excellent', '60 FPS', '1080p', 'Nearly perfect compatibility', ARRAY['The Last of Us', 'God of War III'], 'Default settings work well'),
(1, (SELECT id FROM consoles WHERE name ILIKE '%xbox%360%' LIMIT 1), 'good', '30-60 FPS', '720p-1080p', 'Good compatibility with most titles', ARRAY['Halo 3', 'Gears of War'], 'May need per-game tweaking'),
(1, (SELECT id FROM consoles WHERE name ILIKE '%gamecube%' LIMIT 1), 'excellent', '60 FPS', '1080p+', 'Perfect emulation for most games', ARRAY['Super Mario Sunshine', 'Metroid Prime'], 'Can upscale to higher resolutions'),
(1, (SELECT id FROM consoles WHERE name ILIKE '%wii%' LIMIT 1), 'excellent', '60 FPS', '1080p+', 'Excellent compatibility', ARRAY['Super Mario Galaxy', 'Donkey Kong Country Returns'], 'Motion controls work with gyro')
ON CONFLICT (handheld_id, console_id) DO NOTHING;

-- Add sample handhelds if they don't exist
INSERT INTO handhelds (name, slug, manufacturer, description, price_range, release_date, screen_size, processor, ram, storage, battery_life, weight, dimensions, operating_system, connectivity, supported_formats) VALUES
('Steam Deck', 'steam-deck', 'Valve', 'Powerful handheld gaming PC running SteamOS', '$399-$649', '2022-02-25', '7" 1280x800 LCD', 'AMD APU (Zen 2 + RDNA 2)', '16 GB LPDDR5', '64GB-512GB', '2-8 hours', '669g', '298mm x 117mm x 49mm', 'SteamOS 3.0', ARRAY['Wi-Fi 5', 'Bluetooth 5.0', 'USB-C'], ARRAY['Steam games', 'Linux games']),
('ASUS ROG Ally', 'asus-rog-ally', 'ASUS', 'Windows-based handheld gaming device', '$599-$699', '2023-06-13', '7" 1920x1080 IPS', 'AMD Ryzen Z1 Extreme', '16 GB LPDDR5', '512GB SSD', '1-3 hours', '608g', '280mm x 111mm x 32mm', 'Windows 11', ARRAY['Wi-Fi 6E', 'Bluetooth 5.2', 'USB-C'], ARRAY['PC games', 'Xbox Game Pass']),
('Ayaneo 2', 'ayaneo-2', 'Ayaneo', 'Premium Windows handheld with OLED display', '$949-$1,299', '2022-12-01', '7" 1280x800 OLED', 'AMD Ryzen 7 6800U', '16-32 GB LPDDR5', '512GB-2TB SSD', '2-4 hours', '720g', '264mm x 105mm x 23mm', 'Windows 11', ARRAY['Wi-Fi 6', 'Bluetooth 5.2', 'USB-C'], ARRAY['PC games', 'Retro games'])
ON CONFLICT (slug) DO NOTHING;
