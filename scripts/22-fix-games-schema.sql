-- Fix games table schema and relationships
-- This script ensures proper foreign key relationships and adds missing columns

-- First, let's check if the games table exists and what columns it has
DO $$
BEGIN
    -- Add missing columns to games table if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'games' AND column_name = 'console_id') THEN
        ALTER TABLE games ADD COLUMN console_id UUID;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'games' AND column_name = 'developer') THEN
        ALTER TABLE games ADD COLUMN developer TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'games' AND column_name = 'publisher') THEN
        ALTER TABLE games ADD COLUMN publisher TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'games' AND column_name = 'genre') THEN
        ALTER TABLE games ADD COLUMN genre TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'games' AND column_name = 'release_year') THEN
        ALTER TABLE games ADD COLUMN release_year INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'games' AND column_name = 'rating') THEN
        ALTER TABLE games ADD COLUMN rating TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'games' AND column_name = 'multiplayer_support') THEN
        ALTER TABLE games ADD COLUMN multiplayer_support BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Add foreign key constraint for console_id if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'games_console_id_fkey' 
        AND table_name = 'games'
    ) THEN
        ALTER TABLE games 
        ADD CONSTRAINT games_console_id_fkey 
        FOREIGN KEY (console_id) REFERENCES consoles(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Create game_emulator_compatibility table if it doesn't exist
CREATE TABLE IF NOT EXISTS game_emulator_compatibility (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    emulator_id UUID NOT NULL REFERENCES emulators(id) ON DELETE CASCADE,
    compatibility_rating TEXT CHECK (compatibility_rating IN ('excellent', 'good', 'fair', 'poor', 'unplayable')),
    performance_notes TEXT,
    tested_version TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(game_id, emulator_id)
);

-- Enable RLS on the new table
ALTER TABLE game_emulator_compatibility ENABLE ROW LEVEL SECURITY;

-- Create policies for game_emulator_compatibility
CREATE POLICY "Allow public read access to game emulator compatibility" ON game_emulator_compatibility
    FOR SELECT USING (true);

CREATE POLICY "Allow admin full access to game emulator compatibility" ON game_emulator_compatibility
    FOR ALL USING (true);

-- Remove any problematic array columns that might cause issues
DO $$
BEGIN
    -- Remove platforms array if it exists (we use console_id instead)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'games' AND column_name = 'platforms') THEN
        ALTER TABLE games DROP COLUMN platforms;
    END IF;
    
    -- Remove emulator_ids array if it exists (we use junction table instead)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'games' AND column_name = 'emulator_ids') THEN
        ALTER TABLE games DROP COLUMN emulator_ids;
    END IF;
END $$;

-- Update existing games to have proper console relationships if needed
-- This is a placeholder - you might want to run specific updates based on your data

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_games_console_id ON games(console_id);
CREATE INDEX IF NOT EXISTS idx_games_genre ON games(genre);
CREATE INDEX IF NOT EXISTS idx_games_release_year ON games(release_year);
CREATE INDEX IF NOT EXISTS idx_game_emulator_compatibility_game_id ON game_emulator_compatibility(game_id);
CREATE INDEX IF NOT EXISTS idx_game_emulator_compatibility_emulator_id ON game_emulator_compatibility(emulator_id);
