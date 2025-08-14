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
  console_id UUID REFERENCES consoles(id),
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

-- Enable Row Level Security
ALTER TABLE consoles ENABLE ROW LEVEL SECURITY;
ALTER TABLE emulators ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access and service role write access
DROP POLICY IF EXISTS "Public read access" ON consoles;
DROP POLICY IF EXISTS "Public read access" ON emulators;
DROP POLICY IF EXISTS "Public read access" ON games;
DROP POLICY IF EXISTS "Public read access" ON tools;

CREATE POLICY "Public read access" ON consoles FOR SELECT USING (true);
CREATE POLICY "Public read access" ON emulators FOR SELECT USING (true);
CREATE POLICY "Public read access" ON games FOR SELECT USING (true);
CREATE POLICY "Public read access" ON tools FOR SELECT USING (true);

-- Allow service role to manage all data
CREATE POLICY "Service role can manage consoles" ON consoles FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role can manage emulators" ON emulators FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role can manage games" ON games FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role can manage tools" ON tools FOR ALL USING (auth.role() = 'service_role');
