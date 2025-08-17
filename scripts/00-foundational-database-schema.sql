-- Foundational Database Schema for Emulators.wtf
-- This script creates all required tables for the emulation website

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create core tables
CREATE TABLE IF NOT EXISTS public.handhelds (
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

CREATE TABLE IF NOT EXISTS public.tools (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    category VARCHAR(100),
    download_url TEXT,
    official_website TEXT,
    supported_platforms TEXT[],
    features TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.custom_firmware (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    version VARCHAR(50),
    download_url TEXT,
    installation_guide_url TEXT,
    supported_devices TEXT[],
    features TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.emulators (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    emulated_system VARCHAR(255),
    supported_platforms TEXT[],
    download_url TEXT,
    official_website TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.games (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    console VARCHAR(255),
    genre VARCHAR(100),
    release_year INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.consoles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    manufacturer VARCHAR(255),
    release_year INTEGER,
    generation INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.handhelds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_firmware ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emulators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consoles ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access on handhelds" ON public.handhelds FOR SELECT USING (true);
CREATE POLICY "Allow public read access on tools" ON public.tools FOR SELECT USING (true);
CREATE POLICY "Allow public read access on custom_firmware" ON public.custom_firmware FOR SELECT USING (true);
CREATE POLICY "Allow public read access on emulators" ON public.emulators FOR SELECT USING (true);
CREATE POLICY "Allow public read access on games" ON public.games FOR SELECT USING (true);
CREATE POLICY "Allow public read access on consoles" ON public.consoles FOR SELECT USING (true);

-- Insert sample data for handhelds
INSERT INTO public.handhelds (name, slug, manufacturer, description, image_url, price_range, release_date, screen_size, resolution, processor, ram, storage, battery_life, weight, dimensions, operating_system, connectivity, supported_formats, official_website) VALUES
('Steam Deck OLED', 'steam-deck-oled', 'Valve', 'Premium handheld gaming PC with OLED display and improved battery life', '/placeholder.svg?height=300&width=400', '$549-$649', '2023-11-16', '7.4"', '1280x800 OLED', 'AMD APU', '16GB LPDDR5', '512GB-1TB NVMe', '3-12 hours', '640g', '298×117×49mm', 'SteamOS 3.0', ARRAY['Wi-Fi 6E', 'Bluetooth 5.3', 'USB-C'], ARRAY['Steam', 'Epic Games', 'GOG', 'Emulation'], 'https://store.steampowered.com/steamdeck'),
('ASUS ROG Ally', 'asus-rog-ally', 'ASUS', 'Windows-based handheld gaming device with high-performance AMD processor', '/placeholder.svg?height=300&width=400', '$599-$699', '2023-06-13', '7"', '1920x1080 IPS', 'AMD Ryzen Z1 Extreme', '16GB LPDDR5', '512GB NVMe', '1-3 hours', '608g', '280×111×21-32mm', 'Windows 11', ARRAY['Wi-Fi 6E', 'Bluetooth 5.2', 'USB-C'], ARRAY['Steam', 'Xbox Game Pass', 'Epic Games', 'Windows Games'], 'https://rog.asus.com/gaming-handhelds/rog-ally/'),
('Anbernic RG35XX SP', 'anbernic-rg35xx-sp', 'Anbernic', 'Affordable retro gaming handheld with excellent emulation capabilities', '/placeholder.svg?height=300&width=400', '$60-$80', '2024-01-15', '3.5"', '640×480 IPS', 'Unisoc Tiger T606', '1GB DDR4', '64GB eMMC', '4-6 hours', '180g', '140×82×18mm', 'Linux', ARRAY['Wi-Fi', 'Bluetooth'], ARRAY['Retro Emulation', 'PSP', 'PS1', 'N64'], 'https://anbernic.com');

-- Insert sample data for tools
INSERT INTO public.tools (name, slug, description, image_url, category, download_url, official_website, supported_platforms, features) VALUES
('EmuDeck', 'emudeck', 'All-in-one emulation setup tool for Steam Deck and other devices', '/placeholder.svg?height=200&width=300', 'Setup Tool', 'https://www.emudeck.com/#download', 'https://www.emudeck.com', ARRAY['Steam Deck', 'Linux', 'Windows'], ARRAY['Automated Setup', 'Multiple Emulators', 'ROM Management']),
('RetroDECK', 'retrodeck', 'Flatpak application that bundles various emulators and tools', '/placeholder.svg?height=200&width=300', 'Emulation Suite', 'https://retrodeck.net/download', 'https://retrodeck.net', ARRAY['Steam Deck', 'Linux'], ARRAY['Flatpak Distribution', 'Sandboxed', 'Easy Updates']),
('Decky Loader', 'decky-loader', 'Plugin loader for Steam Deck that enables custom functionality', '/placeholder.svg?height=200&width=300', 'Plugin System', 'https://github.com/SteamDeckHomebrew/decky-loader', 'https://deckbrew.xyz', ARRAY['Steam Deck'], ARRAY['Plugin Support', 'Custom Themes', 'System Tweaks']);

-- Insert sample data for custom firmware
INSERT INTO public.custom_firmware (name, slug, description, image_url, version, download_url, installation_guide_url, supported_devices, features) VALUES
('Batocera', 'batocera', 'Linux distribution for retro gaming that turns any computer into a gaming console', '/placeholder.svg?height=200&width=300', '39', 'https://batocera.org/download', 'https://wiki.batocera.org', ARRAY['PC', 'Raspberry Pi', 'Handheld Devices'], ARRAY['Plug and Play', 'Web Interface', 'Netplay']),
('ChimeraOS', 'chimera-os', 'Gaming-focused Linux distribution designed for handheld and console-like experiences', '/placeholder.svg?height=200&width=300', '44', 'https://chimeraos.org/download', 'https://chimeraos.org/installation', ARRAY['Steam Deck', 'PC', 'Handheld Devices'], ARRAY['Steam Big Picture', 'Game Mode', 'Automatic Updates']);

-- Insert sample data for emulators
INSERT INTO public.emulators (name, slug, description, image_url, emulated_system, supported_platforms, download_url, official_website) VALUES
('PCSX2', 'pcsx2', 'PlayStation 2 emulator with high compatibility and performance', '/placeholder.svg?height=200&width=300', 'PlayStation 2', ARRAY['Windows', 'Linux', 'macOS'], 'https://pcsx2.net/downloads/', 'https://pcsx2.net'),
('Dolphin', 'dolphin', 'GameCube and Wii emulator with excellent compatibility', '/placeholder.svg?height=200&width=300', 'GameCube/Wii', ARRAY['Windows', 'Linux', 'macOS', 'Android'], 'https://dolphin-emu.org/download/', 'https://dolphin-emu.org'),
('RetroArch', 'retroarch', 'Frontend for emulators, game engines and media players', '/placeholder.svg?height=200&width=300', 'Multi-System', ARRAY['Windows', 'Linux', 'macOS', 'Android', 'iOS'], 'https://www.retroarch.com/?page=platforms', 'https://www.retroarch.com');

-- Insert sample data for consoles
INSERT INTO public.consoles (name, slug, description, image_url, manufacturer, release_year, generation) VALUES
('PlayStation 2', 'playstation-2', 'Best-selling video game console of all time', '/placeholder.svg?height=200&width=300', 'Sony', 2000, 6),
('Nintendo GameCube', 'nintendo-gamecube', 'Nintendo''s sixth-generation home video game console', '/placeholder.svg?height=200&width=300', 'Nintendo', 2001, 6),
('Nintendo Wii', 'nintendo-wii', 'Revolutionary motion-controlled gaming console', '/placeholder.svg?height=200&width=300', 'Nintendo', 2006, 7);

-- Insert sample data for games
INSERT INTO public.games (name, slug, description, image_url, console, genre, release_year) VALUES
('Super Mario Sunshine', 'super-mario-sunshine', 'Mario''s tropical adventure with FLUDD water pack', '/placeholder.svg?height=200&width=300', 'Nintendo GameCube', 'Platformer', 2002),
('The Legend of Zelda: Wind Waker', 'zelda-wind-waker', 'Cel-shaded adventure on the high seas', '/placeholder.svg?height=200&width=300', 'Nintendo GameCube', 'Action-Adventure', 2002),
('God of War II', 'god-of-war-2', 'Epic conclusion to Kratos'' journey in Greek mythology', '/placeholder.svg?height=200&width=300', 'PlayStation 2', 'Action', 2007);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_handhelds_slug ON public.handhelds(slug);
CREATE INDEX IF NOT EXISTS idx_tools_slug ON public.tools(slug);
CREATE INDEX IF NOT EXISTS idx_custom_firmware_slug ON public.custom_firmware(slug);
CREATE INDEX IF NOT EXISTS idx_emulators_slug ON public.emulators(slug);
CREATE INDEX IF NOT EXISTS idx_games_slug ON public.games(slug);
CREATE INDEX IF NOT EXISTS idx_consoles_slug ON public.consoles(slug);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
