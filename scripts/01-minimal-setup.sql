-- Create essential tables for emulation website
-- This script creates only the core tables needed to get the application running

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create handhelds table
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
    processor VARCHAR(255),
    ram VARCHAR(100),
    storage VARCHAR(100),
    battery_life VARCHAR(100),
    weight VARCHAR(50),
    dimensions VARCHAR(100),
    operating_system VARCHAR(100),
    resolution VARCHAR(100),
    connectivity TEXT[],
    supported_formats TEXT[],
    official_website TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create custom_firmware table
CREATE TABLE IF NOT EXISTS custom_firmware (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    version VARCHAR(100),
    developer VARCHAR(255),
    image_url TEXT,
    download_url TEXT,
    github_url TEXT,
    website_url TEXT,
    installation_guide TEXT,
    features TEXT[],
    supported_devices TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE handhelds ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_firmware ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access on handhelds" ON handhelds FOR SELECT USING (true);
CREATE POLICY "Allow public read access on custom_firmware" ON custom_firmware FOR SELECT USING (true);

-- Insert sample data
INSERT INTO handhelds (name, slug, manufacturer, description, price_range, release_date, screen_size, processor, ram, storage, battery_life, weight, dimensions, operating_system, resolution, connectivity, supported_formats, official_website) VALUES
('Steam Deck OLED', 'steam-deck-oled', 'Valve', 'Premium handheld gaming PC with OLED display', '$549-$649', '2023-11-16', '7.4"', 'AMD APU', '16GB LPDDR5', '512GB/1TB NVMe', '3-12 hours', '669g', '298×117×49mm', 'SteamOS 3.0', '1280×800 OLED', ARRAY['Wi-Fi 6E', 'Bluetooth 5.3', 'USB-C'], ARRAY['Steam', 'Epic', 'GOG', 'Emulation'], 'https://store.steampowered.com/steamdeck'),
('ASUS ROG Ally', 'asus-rog-ally', 'ASUS', 'Windows handheld with 120Hz display', '$599-$699', '2023-06-13', '7"', 'AMD Z1 Extreme', '16GB LPDDR5', '512GB NVMe', '1-3 hours', '608g', '280×111×21-32mm', 'Windows 11', '1920×1080 120Hz', ARRAY['Wi-Fi 6E', 'Bluetooth 5.2', 'USB-C'], ARRAY['Steam', 'Epic', 'Xbox Game Pass', 'Emulation'], 'https://rog.asus.com/gaming-handhelds/rog-ally/'),
('Anbernic RG35XX SP', 'anbernic-rg35xx-sp', 'Anbernic', 'Retro gaming handheld with clamshell design', '$89-$109', '2024-01-15', '3.5"', 'Unisoc Tiger T606', '1GB RAM', '64GB eMMC', '4-6 hours', '340g', '140×90×20mm', 'Linux', '640×480', ARRAY['Wi-Fi', 'Bluetooth'], ARRAY['Retro Emulation', 'Homebrew'], 'https://anbernic.com');

INSERT INTO custom_firmware (name, slug, description, version, developer, download_url, github_url, website_url, installation_guide, features, supported_devices) VALUES
('EmuDeck', 'emudeck', 'All-in-one emulation setup for Steam Deck', '2.2.1', 'EmuDeck Team', 'https://www.emudeck.com/EmuDeck.desktop', 'https://github.com/dragoonDorise/EmuDeck', 'https://www.emudeck.com', 'Automated installation via desktop mode', ARRAY['RetroArch', 'Standalone Emulators', 'ROM Management', 'Steam Integration'], ARRAY['Steam Deck', 'Linux PC']),
('RetroDECK', 'retrodeck', 'Flatpak emulation suite for Steam Deck', '0.8.4b', 'RetroDECK Team', 'https://flathub.org/apps/net.retrodeck.retrodeck', 'https://github.com/XargonWan/RetroDECK', 'https://retrodeck.net', 'Install via Discover store in desktop mode', ARRAY['Flatpak Distribution', 'Sandboxed Environment', 'Easy Updates'], ARRAY['Steam Deck', 'Linux']),
('Batocera', 'batocera', 'Retro gaming distribution', '39', 'Batocera Team', 'https://batocera.org/download', 'https://github.com/batocera-linux/batocera.linux', 'https://batocera.org', 'Flash to SD card or USB drive', ARRAY['Plug and Play', 'Web Interface', 'Netplay Support'], ARRAY['PC', 'Raspberry Pi', 'Handhelds']);
