-- Create consoles table
CREATE TABLE consoles (
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
CREATE TABLE emulators (
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
CREATE TABLE games (
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
CREATE TABLE tools (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    image_url TEXT,
    developer TEXT,
    category TEXT[],
    description TEXT,
    requirements TEXT,
    urls JSONB DEFAULT '[]'::jsonb,
    supported_platforms TEXT[],
    console_id UUID REFERENCES consoles(id),
    features TEXT[],
    price TEXT DEFAULT 'Free',
    slug TEXT UNIQUE NOT NULL,
    last_updated DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create guides table (optional/future)
CREATE TABLE guides (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT,
    console_id UUID REFERENCES consoles(id),
    emulator_id UUID REFERENCES emulators(id),
    category TEXT,
    slug TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_consoles_slug ON consoles(slug);
CREATE INDEX idx_emulators_slug ON emulators(slug);
CREATE INDEX idx_games_slug ON games(slug);
CREATE INDEX idx_tools_slug ON tools(slug);
CREATE INDEX idx_guides_slug ON guides(slug);

-- Enable Row Level Security
ALTER TABLE consoles ENABLE ROW LEVEL SECURITY;
ALTER TABLE emulators ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE guides ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Public read access" ON consoles FOR SELECT USING (true);
CREATE POLICY "Public read access" ON emulators FOR SELECT USING (true);
CREATE POLICY "Public read access" ON games FOR SELECT USING (true);
CREATE POLICY "Public read access" ON tools FOR SELECT USING (true);
CREATE POLICY "Public read access" ON guides FOR SELECT USING (true);
