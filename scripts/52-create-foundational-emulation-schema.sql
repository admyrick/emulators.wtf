-- Create foundational emulation database schema
-- This script creates all the tables that the emulation website expects

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create basic entity tables
CREATE TABLE IF NOT EXISTS handhelds (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    manufacturer VARCHAR(255),
    release_date DATE,
    price_range VARCHAR(100),
    screen_size VARCHAR(50),
    resolution VARCHAR(50),
    processor VARCHAR(255),
    ram VARCHAR(50),
    storage VARCHAR(100),
    battery_life VARCHAR(100),
    weight VARCHAR(50),
    dimensions VARCHAR(100),
    operating_system VARCHAR(255),
    supported_formats TEXT[],
    connectivity TEXT[],
    image_url TEXT,
    official_website TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS consoles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    manufacturer VARCHAR(255),
    release_date DATE,
    generation INTEGER,
    type VARCHAR(100),
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS emulators (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    version VARCHAR(100),
    developer VARCHAR(255),
    supported_systems TEXT[],
    platforms TEXT[],
    license VARCHAR(100),
    source_code_url TEXT,
    download_url TEXT,
    documentation_url TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS games (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    console_id INTEGER REFERENCES consoles(id),
    release_date DATE,
    genre VARCHAR(255),
    developer VARCHAR(255),
    publisher VARCHAR(255),
    rating VARCHAR(50),
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS custom_firmware (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    version VARCHAR(100),
    download_url TEXT,
    documentation_url TEXT,
    source_code_url TEXT,
    license VARCHAR(100),
    installation_difficulty VARCHAR(50),
    features TEXT[],
    requirements TEXT[],
    compatibility TEXT[],
    release_date DATE,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tools (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    version VARCHAR(100),
    category VARCHAR(100),
    platforms TEXT[],
    download_url TEXT,
    documentation_url TEXT,
    source_code_url TEXT,
    license VARCHAR(100),
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cfw_apps (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    version VARCHAR(100),
    category VARCHAR(100),
    developer VARCHAR(255),
    download_url TEXT,
    source_code_url TEXT,
    documentation_url TEXT,
    license VARCHAR(100),
    compatibility TEXT[],
    features TEXT[],
    screenshots TEXT[],
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create relationship tables
CREATE TABLE IF NOT EXISTS handheld_emulation_performance (
    id SERIAL PRIMARY KEY,
    handheld_id INTEGER REFERENCES handhelds(id) ON DELETE CASCADE,
    console_id INTEGER REFERENCES consoles(id) ON DELETE CASCADE,
    performance_rating INTEGER CHECK (performance_rating >= 1 AND performance_rating <= 5),
    notes TEXT,
    fps_range VARCHAR(50),
    compatibility_level VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(handheld_id, console_id)
);

CREATE TABLE IF NOT EXISTS cfw_app_handheld_compatibility (
    id SERIAL PRIMARY KEY,
    cfw_app_id INTEGER REFERENCES cfw_apps(id) ON DELETE CASCADE,
    handheld_id INTEGER REFERENCES handhelds(id) ON DELETE CASCADE,
    compatibility_status VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(cfw_app_id, handheld_id)
);

-- Create setups system
CREATE TABLE IF NOT EXISTS setups (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    difficulty VARCHAR(50),
    estimated_time VARCHAR(100),
    target_devices TEXT[],
    requirements TEXT[],
    steps JSONB,
    images TEXT[],
    video_url TEXT,
    guide_url TEXT,
    author VARCHAR(255),
    tags TEXT[],
    featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS setup_components (
    id SERIAL PRIMARY KEY,
    setup_id INTEGER REFERENCES setups(id) ON DELETE CASCADE,
    component_type VARCHAR(50) NOT NULL, -- 'handheld', 'emulator', 'game', 'cfw_app', 'custom_firmware', 'tool'
    component_id INTEGER NOT NULL,
    component_name VARCHAR(255),
    required BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create presets system
CREATE TABLE IF NOT EXISTS presets (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    target_device VARCHAR(255),
    category VARCHAR(100),
    difficulty VARCHAR(50),
    estimated_setup_time VARCHAR(100),
    download_count INTEGER DEFAULT 0,
    featured BOOLEAN DEFAULT FALSE,
    created_by VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS preset_items (
    id SERIAL PRIMARY KEY,
    preset_id INTEGER REFERENCES presets(id) ON DELETE CASCADE,
    item_type VARCHAR(50) NOT NULL, -- 'emulator', 'game', 'cfw_app', 'custom_firmware', 'tool'
    item_id INTEGER NOT NULL,
    item_name VARCHAR(255),
    notes TEXT,
    download_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_handhelds_slug ON handhelds(slug);
CREATE INDEX IF NOT EXISTS idx_consoles_slug ON consoles(slug);
CREATE INDEX IF NOT EXISTS idx_emulators_slug ON emulators(slug);
CREATE INDEX IF NOT EXISTS idx_games_slug ON games(slug);
CREATE INDEX IF NOT EXISTS idx_custom_firmware_slug ON custom_firmware(slug);
CREATE INDEX IF NOT EXISTS idx_tools_slug ON tools(slug);
CREATE INDEX IF NOT EXISTS idx_cfw_apps_slug ON cfw_apps(slug);
CREATE INDEX IF NOT EXISTS idx_setups_slug ON setups(slug);
CREATE INDEX IF NOT EXISTS idx_presets_slug ON presets(slug);

CREATE INDEX IF NOT EXISTS idx_handheld_performance_handheld ON handheld_emulation_performance(handheld_id);
CREATE INDEX IF NOT EXISTS idx_handheld_performance_console ON handheld_emulation_performance(console_id);
CREATE INDEX IF NOT EXISTS idx_setup_components_setup ON setup_components(setup_id);
CREATE INDEX IF NOT EXISTS idx_preset_items_preset ON preset_items(preset_id);

-- Insert sample data
INSERT INTO handhelds (name, slug, description, manufacturer, release_date, price_range, screen_size, resolution, processor, ram, storage, battery_life, weight, dimensions, operating_system, supported_formats, connectivity, image_url, official_website) VALUES
('Steam Deck OLED', 'steam-deck-oled', 'Premium handheld gaming PC with OLED display and enhanced performance', 'Valve', '2023-11-16', '$549-$649', '7.4"', '1280x800 OLED', 'AMD APU', '16GB LPDDR5', '512GB/1TB NVMe SSD', '3-12 hours', '669g', '298 x 117 x 49mm', 'SteamOS 3.0', ARRAY['Steam games', 'Emulation', 'Desktop apps'], ARRAY['Wi-Fi 6E', 'Bluetooth 5.3', 'USB-C'], '/placeholder.svg?height=300&width=400', 'https://store.steampowered.com/steamdeck'),
('ASUS ROG Ally', 'asus-rog-ally', 'Windows-based handheld gaming device with high-performance AMD processor', 'ASUS', '2023-06-13', '$599-$699', '7"', '1920x1080 IPS', 'AMD Ryzen Z1 Extreme', '16GB LPDDR5', '512GB NVMe SSD', '1-3 hours', '608g', '280 x 111 x 21-32mm', 'Windows 11', ARRAY['Steam', 'Epic Games', 'Xbox Game Pass', 'Emulation'], ARRAY['Wi-Fi 6E', 'Bluetooth 5.2', 'USB-C'], '/placeholder.svg?height=300&width=400', 'https://rog.asus.com/gaming-handhelds/rog-ally/'),
('Anbernic RG35XX SP', 'anbernic-rg35xx-sp', 'Retro gaming handheld with clamshell design and excellent emulation performance', 'Anbernic', '2024-01-15', '$89-$109', '3.5"', '640x480 IPS', 'Unisoc Tiger T606', '1GB DDR4', '64GB eMMC + microSD', '4-6 hours', '340g', '155 x 85 x 20mm', 'Linux (ArkOS/Batocera)', ARRAY['Retro consoles up to PS1'], ARRAY['Wi-Fi', 'Bluetooth', 'USB-C'], '/placeholder.svg?height=300&width=400', 'https://anbernic.com/'),
('AYN Odin 2', 'ayn-odin-2', 'High-performance Android handheld with flagship mobile processor', 'AYN', '2024-03-20', '$399-$599', '6"', '1920x1080 AMOLED', 'Snapdragon 8 Gen 2', '8-12GB LPDDR5', '128-512GB UFS 3.1', '4-8 hours', '420g', '225 x 95 x 15mm', 'Android 13', ARRAY['Android games', 'Emulation', 'Streaming'], ARRAY['Wi-Fi 6', 'Bluetooth 5.3', 'USB-C'], '/placeholder.svg?height=300&width=400', 'https://www.ayn.hk/'),
('Retroid Pocket 4 Pro', 'retroid-pocket-4-pro', 'Versatile retro gaming handheld with dual boot Android/Linux support', 'Retroid', '2024-02-10', '$199-$249', '4.7"', '750x1334 IPS', 'Snapdragon 865', '8GB LPDDR4X', '128GB UFS 2.1', '5-7 hours', '230g', '184 x 81 x 15mm', 'Android 13 / Linux', ARRAY['Retro consoles', 'PSP', 'Dreamcast', 'N64'], ARRAY['Wi-Fi 5', 'Bluetooth 5.0', 'USB-C'], '/placeholder.svg?height=300&width=400', 'https://www.goretroid.com/')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO consoles (name, slug, description, manufacturer, release_date, generation, type, image_url) VALUES
('Nintendo Entertainment System', 'nes', 'Classic 8-bit home video game console', 'Nintendo', '1985-10-18', 3, 'Home Console', '/placeholder.svg?height=200&width=300'),
('Super Nintendo Entertainment System', 'snes', '16-bit home video game console', 'Nintendo', '1991-08-23', 4, 'Home Console', '/placeholder.svg?height=200&width=300'),
('Nintendo 64', 'n64', '64-bit home video game console with 3D graphics', 'Nintendo', '1996-06-23', 5, 'Home Console', '/placeholder.svg?height=200&width=300'),
('Game Boy', 'gameboy', 'Portable 8-bit handheld game console', 'Nintendo', '1989-04-21', 4, 'Handheld', '/placeholder.svg?height=200&width=300'),
('Game Boy Advance', 'gba', '32-bit handheld game console', 'Nintendo', '2001-03-21', 6, 'Handheld', '/placeholder.svg?height=200&width=300'),
('PlayStation', 'psx', '32-bit home video game console', 'Sony', '1994-12-03', 5, 'Home Console', '/placeholder.svg?height=200&width=300'),
('PlayStation Portable', 'psp', 'Handheld game console with multimedia capabilities', 'Sony', '2004-12-12', 7, 'Handheld', '/placeholder.svg?height=200&width=300'),
('Sega Genesis', 'genesis', '16-bit home video game console', 'Sega', '1988-10-29', 4, 'Home Console', '/placeholder.svg?height=200&width=300'),
('Dreamcast', 'dreamcast', '128-bit home video game console', 'Sega', '1998-11-27', 6, 'Home Console', '/placeholder.svg?height=200&width=300')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO emulators (name, slug, description, version, developer, supported_systems, platforms, license, source_code_url, download_url, documentation_url, image_url) VALUES
('RetroArch', 'retroarch', 'Frontend for emulators, game engines and media players', '1.16.0', 'Libretro Team', ARRAY['Multiple systems via cores'], ARRAY['Windows', 'macOS', 'Linux', 'Android', 'iOS'], 'GPL-3.0', 'https://github.com/libretro/RetroArch', 'https://www.retroarch.com/index.php?page=platforms', 'https://docs.libretro.com/', '/placeholder.svg?height=200&width=300'),
('Dolphin', 'dolphin', 'GameCube and Wii emulator', '5.0-20347', 'Dolphin Team', ARRAY['GameCube', 'Wii'], ARRAY['Windows', 'macOS', 'Linux', 'Android'], 'GPL-2.0', 'https://github.com/dolphin-emu/dolphin', 'https://dolphin-emu.org/download/', 'https://dolphin-emu.org/docs/', '/placeholder.svg?height=200&width=300'),
('PCSX2', 'pcsx2', 'PlayStation 2 emulator', '1.7.5', 'PCSX2 Team', ARRAY['PlayStation 2'], ARRAY['Windows', 'macOS', 'Linux'], 'GPL-3.0', 'https://github.com/PCSX2/pcsx2', 'https://pcsx2.net/downloads/', 'https://pcsx2.net/docs/', '/placeholder.svg?height=200&width=300'),
('Citra', 'citra', 'Nintendo 3DS emulator', '1.0.0', 'Citra Team', ARRAY['Nintendo 3DS'], ARRAY['Windows', 'macOS', 'Linux', 'Android'], 'GPL-2.0', 'https://github.com/citra-emu/citra', 'https://citra-emu.org/download/', 'https://citra-emu.org/wiki/', '/placeholder.svg?height=200&width=300'),
('PPSSPP', 'ppsspp', 'PlayStation Portable emulator', '1.17.1', 'Henrik Rydgård', ARRAY['PlayStation Portable'], ARRAY['Windows', 'macOS', 'Linux', 'Android', 'iOS'], 'GPL-2.0', 'https://github.com/hrydgard/ppsspp', 'https://www.ppsspp.org/download/', 'https://www.ppsspp.org/docs/', '/placeholder.svg?height=200&width=300')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO custom_firmware (name, slug, description, version, download_url, documentation_url, source_code_url, license, installation_difficulty, features, requirements, compatibility, release_date, image_url) VALUES
('ArkOS', 'arkos', 'Custom firmware for Anbernic and other handheld devices', '2.0-11262023', 'https://github.com/christianhaitian/arkos/releases', 'https://github.com/christianhaitian/arkos/wiki', 'https://github.com/christianhaitian/arkos', 'Various', 'Intermediate', ARRAY['RetroArch integration', 'Game scraping', 'Save states', 'Custom themes'], ARRAY['Compatible handheld device', 'microSD card (32GB+)'], ARRAY['RG35XX', 'RG353P', 'RG503', 'RG552'], '2023-11-26', '/placeholder.svg?height=200&width=300'),
('Batocera', 'batocera', 'Retro gaming distribution based on Linux', '39', 'https://batocera.org/download', 'https://wiki.batocera.org/', 'https://github.com/batocera-linux/batocera.linux', 'Various', 'Beginner', ARRAY['Plug and play', 'Web interface', 'Kodi integration', 'Netplay'], ARRAY['Compatible device', 'USB drive or SD card'], ARRAY['PC', 'Raspberry Pi', 'Various handhelds'], '2024-01-15', '/placeholder.svg?height=200&width=300'),
('EmuELEC', 'emuelec', 'Emulation distribution for ARM devices', '4.7', 'https://github.com/EmuELEC/EmuELEC/releases', 'https://github.com/EmuELEC/EmuELEC/wiki', 'https://github.com/EmuELEC/EmuELEC', 'Various', 'Intermediate', ARRAY['Optimized for ARM', 'EmulationStation frontend', 'Automatic game detection'], ARRAY['ARM-based device', 'microSD card'], ARRAY['Odroid', 'Amlogic devices', 'Some handhelds'], '2023-12-10', '/placeholder.svg?height=200&width=300')
ON CONFLICT (slug) DO NOTHING;

-- Insert sample emulation performance data
INSERT INTO handheld_emulation_performance (handheld_id, console_id, performance_rating, notes, fps_range, compatibility_level) VALUES
((SELECT id FROM handhelds WHERE slug = 'steam-deck-oled'), (SELECT id FROM consoles WHERE slug = 'psx'), 5, 'Perfect emulation with upscaling support', '60 FPS', 'Excellent'),
((SELECT id FROM handhelds WHERE slug = 'steam-deck-oled'), (SELECT id FROM consoles WHERE slug = 'n64'), 5, 'Great performance with most games', '60 FPS', 'Excellent'),
((SELECT id FROM handhelds WHERE slug = 'steam-deck-oled'), (SELECT id FROM consoles WHERE slug = 'psp'), 5, 'Excellent PSP emulation', '60 FPS', 'Excellent'),
((SELECT id FROM handhelds WHERE slug = 'anbernic-rg35xx-sp'), (SELECT id FROM consoles WHERE slug = 'nes'), 5, 'Perfect NES emulation', '60 FPS', 'Excellent'),
((SELECT id FROM handhelds WHERE slug = 'anbernic-rg35xx-sp'), (SELECT id FROM consoles WHERE slug = 'snes'), 5, 'Excellent SNES performance', '60 FPS', 'Excellent'),
((SELECT id FROM handhelds WHERE slug = 'anbernic-rg35xx-sp'), (SELECT id FROM consoles WHERE slug = 'gameboy'), 5, 'Perfect Game Boy emulation', '60 FPS', 'Excellent'),
((SELECT id FROM handhelds WHERE slug = 'anbernic-rg35xx-sp'), (SELECT id FROM consoles WHERE slug = 'gba'), 5, 'Great GBA performance', '60 FPS', 'Excellent'),
((SELECT id FROM handhelds WHERE slug = 'anbernic-rg35xx-sp'), (SELECT id FROM consoles WHERE slug = 'psx'), 4, 'Good PSX emulation, some games may struggle', '30-60 FPS', 'Good'),
((SELECT id FROM handhelds WHERE slug = 'asus-rog-ally'), (SELECT id FROM consoles WHERE slug = 'psx'), 5, 'Perfect PlayStation emulation', '60 FPS', 'Excellent'),
((SELECT id FROM handhelds WHERE slug = 'asus-rog-ally'), (SELECT id FROM consoles WHERE slug = 'psp'), 5, 'Excellent PSP performance', '60 FPS', 'Excellent'),
((SELECT id FROM handhelds WHERE slug = 'asus-rog-ally'), (SELECT id FROM consoles WHERE slug = 'dreamcast'), 5, 'Great Dreamcast emulation', '60 FPS', 'Excellent')
ON CONFLICT (handheld_id, console_id) DO NOTHING;

-- Insert sample setup data
INSERT INTO setups (title, slug, description, difficulty, estimated_time, target_devices, requirements, steps, images, video_url, guide_url, author, tags, featured) VALUES
('Perfect Retro Gaming Setup for RG35XX SP', 'rg35xx-sp-retro-setup', 'Complete guide to set up the ultimate retro gaming experience on your RG35XX SP with ArkOS', 'Intermediate', '2-3 hours', ARRAY['Anbernic RG35XX SP'], ARRAY['RG35XX SP device', '64GB+ microSD card', 'Computer with SD card reader', 'ROM files'], 
'[
  {"step": 1, "title": "Download ArkOS", "description": "Download the latest ArkOS image for RG35XX SP from the official GitHub releases page"},
  {"step": 2, "title": "Flash SD Card", "description": "Use balenaEtcher or similar tool to flash the ArkOS image to your microSD card"},
  {"step": 3, "title": "Initial Setup", "description": "Insert the SD card into your device and complete the initial setup wizard"},
  {"step": 4, "title": "Add ROMs", "description": "Copy your ROM files to the appropriate folders on the SD card"},
  {"step": 5, "title": "Configure Emulators", "description": "Adjust emulator settings for optimal performance and visual quality"},
  {"step": 6, "title": "Install Themes", "description": "Download and install custom themes to personalize your experience"}
]'::jsonb,
ARRAY['/placeholder.svg?height=400&width=600'], 
'https://youtube.com/watch?v=example', 
'https://github.com/christianhaitian/arkos/wiki', 
'RetroGaming Pro', 
ARRAY['ArkOS', 'RG35XX SP', 'Retro Gaming', 'Setup Guide'], 
true),

('Steam Deck Emulation Station Setup', 'steam-deck-emulation-station', 'Transform your Steam Deck into the ultimate emulation machine with EmuDeck', 'Beginner', '1-2 hours', ARRAY['Steam Deck', 'Steam Deck OLED'], ARRAY['Steam Deck', 'microSD card (optional)', 'ROM files'], 
'[
  {"step": 1, "title": "Install EmuDeck", "description": "Download and run the EmuDeck installer in Desktop Mode"},
  {"step": 2, "title": "Choose Installation Path", "description": "Select internal storage or SD card for emulator installation"},
  {"step": 3, "title": "Configure Emulators", "description": "Let EmuDeck automatically configure all emulators with optimal settings"},
  {"step": 4, "title": "Add ROM Files", "description": "Copy ROM files to the Emulation/roms folder structure"},
  {"step": 5, "title": "Steam ROM Manager", "description": "Use Steam ROM Manager to add games to your Steam library"},
  {"step": 6, "title": "Gaming Mode Setup", "description": "Switch to Gaming Mode and enjoy your retro games"}
]'::jsonb,
ARRAY['/placeholder.svg?height=400&width=600'], 
'https://youtube.com/watch?v=example2', 
'https://www.emudeck.com/', 
'SteamDeck Master', 
ARRAY['Steam Deck', 'EmuDeck', 'Emulation', 'Setup Guide'], 
true)
ON CONFLICT (slug) DO NOTHING;

-- Insert sample preset data
INSERT INTO presets (name, slug, description, target_device, category, difficulty, estimated_setup_time, download_count, featured, created_by, notes) VALUES
('Essential Retro Pack', 'essential-retro-pack', 'Must-have emulators and tools for classic console gaming', 'Any Device', 'Retro Gaming', 'Beginner', '30 minutes', 1250, true, 'RetroGaming Community', 'Perfect starter pack for retro gaming enthusiasts'),
('Handheld Powerhouse', 'handheld-powerhouse', 'Advanced emulation setup for high-performance handhelds', 'Steam Deck, ROG Ally', 'Advanced Emulation', 'Intermediate', '2 hours', 890, true, 'EmulationExpert', 'Optimized for devices with powerful processors'),
('Portable Arcade', 'portable-arcade', 'Classic arcade games and MAME setup for on-the-go gaming', 'Any Handheld', 'Arcade', 'Beginner', '45 minutes', 650, false, 'ArcadeNinja', 'Curated collection of the best arcade classics')
ON CONFLICT (slug) DO NOTHING;

-- Enable Row Level Security (optional, can be configured later)
-- ALTER TABLE handhelds ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE consoles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE emulators ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE games ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE custom_firmware ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE tools ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE cfw_apps ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE setups ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE presets ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (uncomment if RLS is enabled)
-- CREATE POLICY "Public read access" ON handhelds FOR SELECT USING (true);
-- CREATE POLICY "Public read access" ON consoles FOR SELECT USING (true);
-- CREATE POLICY "Public read access" ON emulators FOR SELECT USING (true);
-- CREATE POLICY "Public read access" ON games FOR SELECT USING (true);
-- CREATE POLICY "Public read access" ON custom_firmware FOR SELECT USING (true);
-- CREATE POLICY "Public read access" ON tools FOR SELECT USING (true);
-- CREATE POLICY "Public read access" ON cfw_apps FOR SELECT USING (true);
-- CREATE POLICY "Public read access" ON setups FOR SELECT USING (true);
-- CREATE POLICY "Public read access" ON presets FOR SELECT USING (true);

-- Verify tables were created
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('handhelds', 'consoles', 'emulators', 'games', 'custom_firmware', 'tools', 'cfw_apps', 'setups', 'presets')
ORDER BY tablename;

-- Show row counts
SELECT 
    'handhelds' as table_name, COUNT(*) as row_count FROM handhelds
UNION ALL
SELECT 'consoles', COUNT(*) FROM consoles
UNION ALL
SELECT 'emulators', COUNT(*) FROM emulators
UNION ALL
SELECT 'custom_firmware', COUNT(*) FROM custom_firmware
UNION ALL
SELECT 'setups', COUNT(*) FROM setups
UNION ALL
SELECT 'presets', COUNT(*) FROM presets;
