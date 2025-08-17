-- Create foundational database schema for emulation website
-- This script sets up all required tables with proper relationships

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create main entity tables
CREATE TABLE IF NOT EXISTS handhelds (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  manufacturer VARCHAR(255),
  description TEXT,
  image_url TEXT,
  price_range VARCHAR(100),
  release_date DATE,
  screen_size VARCHAR(50),
  resolution VARCHAR(50),
  processor VARCHAR(255),
  ram VARCHAR(100),
  storage VARCHAR(100),
  battery_life VARCHAR(100),
  weight VARCHAR(50),
  dimensions VARCHAR(100),
  operating_system VARCHAR(255),
  connectivity TEXT[],
  supported_formats TEXT[],
  official_website TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS consoles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  manufacturer VARCHAR(255),
  description TEXT,
  image_url TEXT,
  release_date DATE,
  generation INTEGER,
  cpu VARCHAR(255),
  memory VARCHAR(100),
  storage VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS emulators (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  developer VARCHAR(255),
  license VARCHAR(100),
  platforms TEXT[],
  supported_systems TEXT[],
  website_url TEXT,
  github_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS games (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  console_id INTEGER REFERENCES consoles(id),
  release_date DATE,
  genre VARCHAR(255),
  developer VARCHAR(255),
  publisher VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS custom_firmware (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  version VARCHAR(100),
  developer VARCHAR(255),
  license VARCHAR(100),
  supported_devices TEXT[],
  features TEXT[],
  installation_guide TEXT,
  download_url TEXT,
  documentation_url TEXT,
  github_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tools (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  category VARCHAR(100),
  developer VARCHAR(255),
  platforms TEXT[],
  download_url TEXT,
  website_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cfw_apps (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  category VARCHAR(100),
  developer VARCHAR(255),
  version VARCHAR(100),
  download_url TEXT,
  github_url TEXT,
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(handheld_id, console_id)
);

CREATE TABLE IF NOT EXISTS setups (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  difficulty VARCHAR(50) DEFAULT 'Beginner',
  estimated_time VARCHAR(100),
  category VARCHAR(100),
  target_device VARCHAR(255),
  requirements TEXT[],
  steps JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS setup_components (
  id SERIAL PRIMARY KEY,
  setup_id INTEGER REFERENCES setups(id) ON DELETE CASCADE,
  component_type VARCHAR(50) NOT NULL, -- 'emulator', 'game', 'tool', 'cfw_app', 'custom_firmware'
  component_id INTEGER NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS presets (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  target_device VARCHAR(255),
  category VARCHAR(100),
  created_by VARCHAR(255),
  is_featured BOOLEAN DEFAULT FALSE,
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS preset_items (
  id SERIAL PRIMARY KEY,
  preset_id INTEGER REFERENCES presets(id) ON DELETE CASCADE,
  item_type VARCHAR(50) NOT NULL, -- 'emulator', 'game', 'tool', 'cfw_app', 'custom_firmware'
  item_id INTEGER NOT NULL,
  notes TEXT,
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

-- Enable Row Level Security
ALTER TABLE handhelds ENABLE ROW LEVEL SECURITY;
ALTER TABLE consoles ENABLE ROW LEVEL SECURITY;
ALTER TABLE emulators ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_firmware ENABLE ROW LEVEL SECURITY;
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE cfw_apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE setups ENABLE ROW LEVEL SECURITY;
ALTER TABLE presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE handheld_emulation_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE setup_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE preset_items ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access" ON handhelds FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON consoles FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON emulators FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON games FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON custom_firmware FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON tools FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON cfw_apps FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON setups FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON presets FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON handheld_emulation_performance FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON setup_components FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON preset_items FOR SELECT USING (true);

-- Insert sample data
INSERT INTO handhelds (name, slug, manufacturer, description, price_range, release_date, screen_size, processor, ram, storage, operating_system) VALUES
('Steam Deck OLED', 'steam-deck-oled', 'Valve', 'Premium handheld gaming PC with OLED display', '$549-$649', '2023-11-16', '7.4"', 'AMD APU', '16GB LPDDR5', '512GB/1TB NVMe SSD', 'SteamOS 3.0'),
('ROG Ally', 'rog-ally', 'ASUS', 'Windows-based handheld gaming device', '$699', '2023-06-13', '7"', 'AMD Ryzen Z1 Extreme', '16GB LPDDR5', '512GB NVMe SSD', 'Windows 11'),
('Anbernic RG35XX SP', 'anbernic-rg35xx-sp', 'Anbernic', 'Retro gaming handheld with classic design', '$59-$79', '2024-01-15', '3.5"', 'ARM Cortex-A53', '1GB DDR3', '64GB eMMC', 'Linux'),
('AYN Odin 2', 'ayn-odin-2', 'AYN', 'High-performance Android gaming handheld', '$399-$799', '2024-03-20', '6"', 'Snapdragon 8 Gen 2', '8-16GB LPDDR5', '128-512GB UFS', 'Android 13');

INSERT INTO consoles (name, slug, manufacturer, description, generation, release_date) VALUES
('Nintendo Entertainment System', 'nes', 'Nintendo', 'Classic 8-bit home video game console', 3, '1985-10-18'),
('Super Nintendo', 'snes', 'Nintendo', '16-bit home video game console', 4, '1990-11-21'),
('PlayStation', 'playstation', 'Sony', 'Original PlayStation console', 5, '1994-12-03'),
('Nintendo 64', 'nintendo-64', 'Nintendo', '64-bit home video game console', 5, '1996-06-23'),
('Game Boy Advance', 'gba', 'Nintendo', 'Portable 32-bit handheld game console', 6, '2001-03-21');

INSERT INTO custom_firmware (name, slug, description, developer, supported_devices, features) VALUES
('EmuDeck', 'emudeck', 'All-in-one emulation setup tool for Steam Deck', 'EmuDeck Team', ARRAY['Steam Deck', 'Linux PC'], ARRAY['Automated setup', 'Multiple emulators', 'ROM management']),
('RetroDECK', 'retrodeck', 'Flatpak application for retro gaming on Steam Deck', 'RetroDECK Team', ARRAY['Steam Deck', 'Linux'], ARRAY['Flatpak distribution', 'Sandboxed environment', 'Easy updates']),
('Batocera', 'batocera', 'Retro gaming distribution based on Linux', 'Batocera Team', ARRAY['PC', 'Raspberry Pi', 'Various SBCs'], ARRAY['Live USB/SD', 'Web interface', 'Automatic scraping']),
('ChimeraOS', 'chimera-os', 'Gaming-focused Linux distribution', 'ChimeraOS Team', ARRAY['PC', 'Steam Deck'], ARRAY['Steam-like interface', 'Game mode', 'Automatic updates']);

INSERT INTO emulators (name, slug, description, developer, supported_systems) VALUES
('RetroArch', 'retroarch', 'Multi-platform frontend for emulators and game engines', 'Libretro Team', ARRAY['Multiple systems']),
('Dolphin', 'dolphin', 'GameCube and Wii emulator', 'Dolphin Team', ARRAY['GameCube', 'Wii']),
('PCSX2', 'pcsx2', 'PlayStation 2 emulator', 'PCSX2 Team', ARRAY['PlayStation 2']),
('Cemu', 'cemu', 'Wii U emulator', 'Cemu Team', ARRAY['Wii U']),
('mGBA', 'mgba', 'Game Boy Advance emulator', 'endrift', ARRAY['Game Boy', 'Game Boy Color', 'Game Boy Advance']);

-- Insert sample performance data
INSERT INTO handheld_emulation_performance (handheld_id, console_id, performance_rating, notes) VALUES
(1, 1, 5, 'Perfect emulation with no issues'),
(1, 2, 5, 'Excellent performance, all games playable'),
(1, 3, 4, 'Most games run well, some require tweaking'),
(2, 1, 5, 'Flawless NES emulation'),
(2, 2, 5, 'Perfect SNES performance'),
(3, 1, 5, 'Ideal for NES gaming'),
(3, 2, 4, 'Good SNES performance with minor slowdowns'),
(4, 1, 5, 'Excellent retro gaming performance');

-- Insert sample setups
INSERT INTO setups (title, slug, description, difficulty, estimated_time, category, target_device, requirements, steps) VALUES
('EmuDeck Setup for Steam Deck', 'emudeck-steam-deck-setup', 'Complete guide to setting up EmuDeck on Steam Deck', 'Beginner', '30-45 minutes', 'Emulation Setup', 'Steam Deck', ARRAY['Steam Deck', 'MicroSD card (optional)', 'ROMs'], '{"steps": [{"title": "Download EmuDeck", "description": "Visit emudeck.com and download the installer"}, {"title": "Run Installation", "description": "Execute the installer and follow prompts"}, {"title": "Configure Emulators", "description": "Set up individual emulator settings"}, {"title": "Add ROMs", "description": "Copy ROM files to designated folders"}]}'),
('RetroArch Configuration', 'retroarch-configuration', 'Optimize RetroArch settings for best performance', 'Intermediate', '20-30 minutes', 'Configuration', 'Any Device', ARRAY['RetroArch installed', 'Basic Linux knowledge'], '{"steps": [{"title": "Access Settings", "description": "Navigate to RetroArch settings menu"}, {"title": "Configure Video", "description": "Adjust video driver and resolution settings"}, {"title": "Setup Audio", "description": "Configure audio driver and latency"}, {"title": "Controller Setup", "description": "Map controller inputs for each system"}]}');

-- Insert sample presets
INSERT INTO presets (name, slug, description, target_device, category, created_by, is_featured) VALUES
('Essential Retro Pack', 'essential-retro-pack', 'Must-have emulators and tools for retro gaming', 'Steam Deck', 'Retro Gaming', 'Admin', true),
('Nintendo Complete', 'nintendo-complete', 'All Nintendo system emulators and tools', 'Any Device', 'Nintendo', 'Community', false),
('Handheld Optimization', 'handheld-optimization', 'Optimized emulators for handheld devices', 'Handheld Devices', 'Performance', 'Expert User', true);
