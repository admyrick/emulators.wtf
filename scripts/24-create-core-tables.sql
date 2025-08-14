-- Create core tables for emulation database
-- This script creates the main tables needed for search functionality

-- Create consoles table
CREATE TABLE IF NOT EXISTS consoles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    manufacturer TEXT,
    release_year INTEGER,
    description TEXT,
    urls JSONB DEFAULT '[]'::jsonb,
    image_url TEXT,
    slug TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create emulators table
CREATE TABLE IF NOT EXISTS emulators (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    developer TEXT,
    description TEXT,
    supported_platforms TEXT[],
    console_ids UUID[],
    features TEXT[],
    urls JSONB DEFAULT '[]'::jsonb,
    image_url TEXT,
    slug TEXT UNIQUE NOT NULL,
    recommended BOOLEAN DEFAULT false,
    last_updated DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create games table
CREATE TABLE IF NOT EXISTS games (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    emulator_ids UUID[],
    console_ids UUID[],
    description TEXT,
    release_year INTEGER,
    urls JSONB DEFAULT '[]'::jsonb,
    image_url TEXT,
    slug TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tools table
CREATE TABLE IF NOT EXISTS tools (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    image_url TEXT,
    developer TEXT,
    category TEXT[],
    description TEXT,
    requirements TEXT,
    urls JSONB DEFAULT '[]'::jsonb,
    supported_platforms TEXT[],
    features TEXT[],
    price TEXT DEFAULT 'Free',
    slug TEXT UNIQUE NOT NULL,
    last_updated DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_consoles_slug ON consoles(slug);
CREATE INDEX IF NOT EXISTS idx_emulators_slug ON emulators(slug);
CREATE INDEX IF NOT EXISTS idx_games_slug ON games(slug);
CREATE INDEX IF NOT EXISTS idx_tools_slug ON tools(slug);

-- Create search indexes for better text search performance
CREATE INDEX IF NOT EXISTS idx_consoles_name_search ON consoles USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '') || ' ' || COALESCE(manufacturer, '')));
CREATE INDEX IF NOT EXISTS idx_emulators_name_search ON emulators USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '') || ' ' || COALESCE(developer, '')));
CREATE INDEX IF NOT EXISTS idx_games_name_search ON games USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- Enable Row Level Security
ALTER TABLE consoles ENABLE ROW LEVEL SECURITY;
ALTER TABLE emulators ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public read access" ON consoles;
DROP POLICY IF EXISTS "Public read access" ON emulators;
DROP POLICY IF EXISTS "Public read access" ON games;
DROP POLICY IF EXISTS "Public read access" ON tools;

-- Create policies for public read access
CREATE POLICY "Public read access" ON consoles FOR SELECT USING (true);
CREATE POLICY "Public read access" ON emulators FOR SELECT USING (true);
CREATE POLICY "Public read access" ON games FOR SELECT USING (true);
CREATE POLICY "Public read access" ON tools FOR SELECT USING (true);

-- Allow service role to manage all data
CREATE POLICY "Service role can manage consoles" ON consoles FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role can manage emulators" ON emulators FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role can manage games" ON games FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role can manage tools" ON tools FOR ALL USING (auth.role() = 'service_role');

-- Insert some sample data for testing search functionality
INSERT INTO consoles (name, manufacturer, release_year, description, slug) VALUES
('Nintendo Switch', 'Nintendo', 2017, 'Hybrid gaming console that can be used as both a home console and portable device', 'nintendo-switch'),
('PlayStation 5', 'Sony', 2020, 'Latest generation gaming console from Sony with advanced graphics and SSD storage', 'playstation-5'),
('Xbox Series X', 'Microsoft', 2020, 'Powerful gaming console with 4K gaming capabilities and backwards compatibility', 'xbox-series-x')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO emulators (name, developer, description, slug, recommended) VALUES
('Dolphin', 'Dolphin Team', 'GameCube and Wii emulator with high compatibility and performance', 'dolphin', true),
('PCSX2', 'PCSX2 Team', 'PlayStation 2 emulator for Windows, Linux and Mac', 'pcsx2', true),
('Cemu', 'Cemu Team', 'Wii U emulator with excellent game compatibility', 'cemu', true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO games (name, description, release_year, slug) VALUES
('Super Mario Odyssey', 'Platform adventure game featuring Mario exploring various kingdoms', 2017, 'super-mario-odyssey'),
('The Legend of Zelda: Breath of the Wild', 'Open-world action-adventure game set in Hyrule', 2017, 'zelda-breath-of-the-wild'),
('God of War', 'Action-adventure game following Kratos and his son Atreus', 2018, 'god-of-war')
ON CONFLICT (slug) DO NOTHING;
