-- Create game_emulator_compatibility table
CREATE TABLE IF NOT EXISTS game_emulator_compatibility (
    id SERIAL PRIMARY KEY,
    game_id INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    emulator_id INTEGER NOT NULL REFERENCES emulators(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'compatible',
    compatibility_notes TEXT,
    performance_rating VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(game_id, emulator_id)
);

-- Create game_handheld_compatibility table
CREATE TABLE IF NOT EXISTS game_handheld_compatibility (
    id SERIAL PRIMARY KEY,
    game_id INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    handheld_id INTEGER NOT NULL REFERENCES handhelds(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'compatible',
    compatibility_notes TEXT,
    performance_rating VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(game_id, handheld_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_game_emulator_compatibility_game_id ON game_emulator_compatibility(game_id);
CREATE INDEX IF NOT EXISTS idx_game_emulator_compatibility_emulator_id ON game_emulator_compatibility(emulator_id);
CREATE INDEX IF NOT EXISTS idx_game_handheld_compatibility_game_id ON game_handheld_compatibility(game_id);
CREATE INDEX IF NOT EXISTS idx_game_handheld_compatibility_handheld_id ON game_handheld_compatibility(handheld_id);

-- Enable RLS (Row Level Security) for public access
ALTER TABLE game_emulator_compatibility ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_handheld_compatibility ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public read access
CREATE POLICY "Allow public read access on game_emulator_compatibility" ON game_emulator_compatibility
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access on game_handheld_compatibility" ON game_handheld_compatibility
    FOR SELECT USING (true);

-- Insert sample compatibility data
-- First, let's get some game and emulator IDs to work with
INSERT INTO game_emulator_compatibility (game_id, emulator_id, status, compatibility_notes, performance_rating)
SELECT 
    g.id as game_id,
    e.id as emulator_id,
    'compatible' as status,
    'Runs well with default settings' as compatibility_notes,
    'excellent' as performance_rating
FROM games g
CROSS JOIN emulators e
WHERE g.slug IN ('god-of-war-2', 'final-fantasy-vii', 'super-mario-64')
  AND e.slug IN ('pcsx2', 'ppsspp', 'dolphin', 'retroarch')
LIMIT 20
ON CONFLICT (game_id, emulator_id) DO NOTHING;

-- Insert sample handheld compatibility data
INSERT INTO game_handheld_compatibility (game_id, handheld_id, status, compatibility_notes, performance_rating)
SELECT 
    g.id as game_id,
    h.id as handheld_id,
    'compatible' as status,
    'Playable with good performance' as compatibility_notes,
    'good' as performance_rating
FROM games g
CROSS JOIN handhelds h
WHERE g.slug IN ('god-of-war-2', 'final-fantasy-vii', 'super-mario-64')
  AND h.slug IN ('steam-deck', 'rog-ally', 'legion-go', 'ayn-odin')
LIMIT 15
ON CONFLICT (game_id, handheld_id) DO NOTHING;

-- Add some specific compatibility entries for God of War 2
INSERT INTO game_emulator_compatibility (game_id, emulator_id, status, compatibility_notes, performance_rating)
SELECT 
    g.id as game_id,
    e.id as emulator_id,
    'excellent' as status,
    'Perfect compatibility with enhanced graphics options' as compatibility_notes,
    'excellent' as performance_rating
FROM games g, emulators e
WHERE g.slug = 'god-of-war-2' AND e.name ILIKE '%pcsx2%'
ON CONFLICT (game_id, emulator_id) DO UPDATE SET
    status = EXCLUDED.status,
    compatibility_notes = EXCLUDED.compatibility_notes,
    performance_rating = EXCLUDED.performance_rating;

INSERT INTO game_handheld_compatibility (game_id, handheld_id, status, compatibility_notes, performance_rating)
SELECT 
    g.id as game_id,
    h.id as handheld_id,
    'excellent' as status,
    'Runs at full speed with enhanced settings' as compatibility_notes,
    'excellent' as performance_rating
FROM games g, handhelds h
WHERE g.slug = 'god-of-war-2' AND h.name ILIKE '%steam deck%'
ON CONFLICT (game_id, handheld_id) DO UPDATE SET
    status = EXCLUDED.status,
    compatibility_notes = EXCLUDED.compatibility_notes,
    performance_rating = EXCLUDED.performance_rating;
