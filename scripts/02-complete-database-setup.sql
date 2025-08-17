-- Complete database setup for emulation website
-- This script creates all required tables with proper relationships and sample data

-- Drop existing tables if they exist (in correct order to handle foreign keys)
DROP TABLE IF EXISTS handheld_emulation_performance CASCADE;
DROP TABLE IF EXISTS setup_components CASCADE;
DROP TABLE IF EXISTS preset_items CASCADE;
DROP TABLE IF EXISTS cfw_app_handheld_compatibility CASCADE;
DROP TABLE IF EXISTS setups CASCADE;
DROP TABLE IF EXISTS presets CASCADE;
DROP TABLE IF EXISTS guides CASCADE;
DROP TABLE IF EXISTS tools CASCADE;
DROP TABLE IF EXISTS games CASCADE;
DROP TABLE IF EXISTS emulators CASCADE;
DROP TABLE IF EXISTS cfw_apps CASCADE;
DROP TABLE IF EXISTS custom_firmware CASCADE;
DROP TABLE IF EXISTS handhelds CASCADE;
DROP TABLE IF EXISTS consoles CASCADE;

-- Create consoles table
CREATE TABLE consoles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    manufacturer VARCHAR(255),
    release_year INTEGER,
    description TEXT,
    urls JSONB DEFAULT '[]'::jsonb,
    image_url TEXT,
    slug VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create handhelds table
CREATE TABLE handhelds (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    manufacturer VARCHAR(255),
    description TEXT,
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
    operating_system VARCHAR(100),
    connectivity TEXT[],
    supported_formats TEXT[],
    official_website TEXT,
    image_url TEXT,
    slug VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create custom_firmware table
CREATE TABLE custom_firmware (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    developer VARCHAR(255),
    description TEXT,
    version VARCHAR(50),
    release_date DATE,
    supported_handhelds INTEGER[],
    features TEXT[],
    installation_difficulty VARCHAR(20) DEFAULT 'Medium',
    urls JSONB DEFAULT '[]'::jsonb,
    image_url TEXT,
    slug VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create emulators table
CREATE TABLE emulators (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    developer VARCHAR(255),
    description TEXT,
    supported_platforms TEXT[],
    console_ids INTEGER[],
    features TEXT[],
    urls JSONB DEFAULT '[]'::jsonb,
    image_url TEXT,
    slug VARCHAR(255) UNIQUE NOT NULL,
    recommended BOOLEAN DEFAULT false,
    last_updated DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create games table
CREATE TABLE games (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    emulator_ids INTEGER[],
    console_ids INTEGER[],
    description TEXT,
    release_year INTEGER,
    urls JSONB DEFAULT '[]'::jsonb,
    image_url TEXT,
    slug VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tools table
CREATE TABLE tools (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    image_url TEXT,
    developer VARCHAR(255),
    category TEXT[],
    description TEXT,
    requirements TEXT,
    urls JSONB DEFAULT '[]'::jsonb,
    supported_platforms TEXT[],
    console_id INTEGER REFERENCES consoles(id),
    features TEXT[],
    price VARCHAR(50) DEFAULT 'Free',
    slug VARCHAR(255) UNIQUE NOT NULL,
    last_updated DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cfw_apps table
CREATE TABLE cfw_apps (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    developer VARCHAR(255),
    description TEXT,
    category VARCHAR(100),
    version VARCHAR(50),
    file_size VARCHAR(50),
    urls JSONB DEFAULT '[]'::jsonb,
    image_url TEXT,
    slug VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create setups table
CREATE TABLE setups (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    difficulty VARCHAR(20) DEFAULT 'Medium',
    estimated_time VARCHAR(50),
    target_devices TEXT[],
    steps JSONB DEFAULT '[]'::jsonb,
    requirements TEXT[],
    image_url TEXT,
    slug VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create presets table
CREATE TABLE presets (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    target_device VARCHAR(255),
    created_by VARCHAR(255),
    downloads INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0.00,
    tags TEXT[],
    image_url TEXT,
    slug VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create relationship tables
CREATE TABLE handheld_emulation_performance (
    id SERIAL PRIMARY KEY,
    handheld_id INTEGER REFERENCES handhelds(id) ON DELETE CASCADE,
    console_id INTEGER REFERENCES consoles(id) ON DELETE CASCADE,
    performance_rating INTEGER CHECK (performance_rating >= 1 AND performance_rating <= 5),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE consoles ENABLE ROW LEVEL SECURITY;
ALTER TABLE handhelds ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_firmware ENABLE ROW LEVEL SECURITY;
ALTER TABLE emulators ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE cfw_apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE setups ENABLE ROW LEVEL SECURITY;
ALTER TABLE presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE handheld_emulation_performance ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Public read access" ON consoles FOR SELECT USING (true);
CREATE POLICY "Public read access" ON handhelds FOR SELECT USING (true);
CREATE POLICY "Public read access" ON custom_firmware FOR SELECT USING (true);
CREATE POLICY "Public read access" ON emulators FOR SELECT USING (true);
CREATE POLICY "Public read access" ON games FOR SELECT USING (true);
CREATE POLICY "Public read access" ON tools FOR SELECT USING (true);
CREATE POLICY "Public read access" ON cfw_apps FOR SELECT USING (true);
CREATE POLICY "Public read access" ON setups FOR SELECT USING (true);
CREATE POLICY "Public read access" ON presets FOR SELECT USING (true);
CREATE POLICY "Public read access" ON handheld_emulation_performance FOR SELECT USING (true);

-- Insert sample data
-- Sample consoles
INSERT INTO consoles (name, manufacturer, release_year, description, slug) VALUES
('Nintendo Switch', 'Nintendo', 2017, 'Hybrid gaming console', 'nintendo-switch'),
('PlayStation Portable', 'Sony', 2004, 'Handheld gaming console', 'psp'),
('Nintendo DS', 'Nintendo', 2004, 'Dual-screen handheld console', 'nintendo-ds'),
('Game Boy Advance', 'Nintendo', 2001, 'Portable gaming system', 'gba'),
('PlayStation 1', 'Sony', 1994, 'Classic gaming console', 'ps1');

-- Sample handhelds
INSERT INTO handhelds (name, manufacturer, description, price_range, release_date, screen_size, resolution, processor, ram, storage, battery_life, weight, dimensions, operating_system, connectivity, supported_formats, official_website, image_url, slug) VALUES
('Steam Deck OLED', 'Valve', 'Premium handheld gaming PC with OLED display', '$549-$649', '2023-11-16', '7.4"', '1280x800', 'AMD APU', '16GB LPDDR5', '512GB/1TB NVMe', '3-12 hours', '669g', '298×117×49mm', 'SteamOS 3.0', ARRAY['Wi-Fi 6E', 'Bluetooth 5.3', 'USB-C'], ARRAY['Steam', 'Epic', 'GOG', 'Emulation'], 'https://store.steampowered.com/steamdeck', '/placeholder.svg?height=200&width=300', 'steam-deck-oled'),
('ROG Ally', 'ASUS', 'Windows handheld gaming device', '$699', '2023-06-13', '7"', '1920x1080', 'AMD Z1 Extreme', '16GB LPDDR5', '512GB NVMe', '1-3 hours', '608g', '280×111×21.2mm', 'Windows 11', ARRAY['Wi-Fi 6E', 'Bluetooth 5.2', 'USB-C'], ARRAY['Steam', 'Epic', 'Xbox Game Pass', 'Emulation'], 'https://rog.asus.com/gaming-handhelds/rog-ally/', '/placeholder.svg?height=200&width=300', 'rog-ally'),
('Anbernic RG35XX SP', 'Anbernic', 'Retro gaming handheld with clamshell design', '$79', '2024-01-15', '3.5"', '640×480', 'Unisoc Tiger T606', '1GB', '64GB microSD', '4-6 hours', '340g', '155×81×20mm', 'Linux', ARRAY['Wi-Fi', 'Bluetooth'], ARRAY['Retro emulation', 'Homebrew'], 'https://anbernic.com', '/placeholder.svg?height=200&width=300', 'anbernic-rg35xx-sp');

-- Sample custom firmware
INSERT INTO custom_firmware (name, developer, description, version, release_date, supported_handhelds, features, installation_difficulty, urls, image_url, slug) VALUES
('EmuDeck', 'EmuDeck Team', 'All-in-one emulation setup for Steam Deck', '2.2.0', '2024-01-15', ARRAY[1], ARRAY['Automatic emulator installation', 'ROM management', 'Controller configuration', 'Steam integration'], 'Easy', '{"download": "https://www.emudeck.com/", "github": "https://github.com/dragoonDorise/EmuDeck"}', '/placeholder.svg?height=200&width=300', 'emudeck'),
('RetroDECK', 'RetroDECK Team', 'Flatpak-based retro gaming solution', '0.8.0b', '2024-02-01', ARRAY[1], ARRAY['Flatpak distribution', 'Sandboxed environment', 'Easy updates', 'Multiple emulators'], 'Medium', '{"download": "https://retrodeck.net/", "github": "https://github.com/XargonWan/RetroDECK"}', '/placeholder.svg?height=200&width=300', 'retrodeck'),
('Batocera', 'Batocera Team', 'Linux distribution for retro gaming', '39', '2024-01-20', ARRAY[1, 2], ARRAY['Boot from USB', 'Web interface', 'Netplay support', '50+ emulators'], 'Hard', '{"download": "https://batocera.org/", "wiki": "https://wiki.batocera.org/"}', '/placeholder.svg?height=200&width=300', 'batocera');

-- Sample tools
INSERT INTO tools (name, developer, description, category, price, supported_platforms, features, urls, image_url, slug) VALUES
('Decky Loader', 'SteamDeckHomebrew', 'Plugin loader for Steam Deck', ARRAY['Utility', 'Customization'], 'Free', ARRAY['Steam Deck'], ARRAY['Plugin management', 'System tweaks', 'Custom themes'], '{"github": "https://github.com/SteamDeckHomebrew/decky-loader", "install": "https://decky.xyz/"}', '/placeholder.svg?height=200&width=300', 'decky-loader'),
('Chiaki', 'Chiaki Team', 'PlayStation Remote Play client', ARRAY['Streaming', 'Remote Play'], 'Free', ARRAY['Steam Deck', 'Linux', 'Windows'], ARRAY['PS4/PS5 streaming', 'Low latency', 'Custom controls'], '{"github": "https://github.com/thestr4ng3r/chiaki", "website": "https://chiaki.app/"}', '/placeholder.svg?height=200&width=300', 'chiaki'),
('Moonlight', 'Moonlight Team', 'NVIDIA GameStream client', ARRAY['Streaming', 'Remote Play'], 'Free', ARRAY['Steam Deck', 'Android', 'iOS'], ARRAY['NVIDIA streaming', 'HDR support', '4K streaming'], '{"github": "https://github.com/moonlight-stream", "website": "https://moonlight-stream.org/"}', '/placeholder.svg?height=200&width=300', 'moonlight');

-- Create indexes for better performance
CREATE INDEX idx_consoles_slug ON consoles(slug);
CREATE INDEX idx_handhelds_slug ON handhelds(slug);
CREATE INDEX idx_custom_firmware_slug ON custom_firmware(slug);
CREATE INDEX idx_emulators_slug ON emulators(slug);
CREATE INDEX idx_games_slug ON games(slug);
CREATE INDEX idx_tools_slug ON tools(slug);
CREATE INDEX idx_cfw_apps_slug ON cfw_apps(slug);
CREATE INDEX idx_setups_slug ON setups(slug);
CREATE INDEX idx_presets_slug ON presets(slug);
