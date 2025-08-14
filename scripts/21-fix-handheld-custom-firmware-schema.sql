-- Fix handheld_custom_firmware table schema
-- Add missing columns if they don't exist

-- Check if the table exists, if not create it
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'handheld_custom_firmware') THEN
        CREATE TABLE handheld_custom_firmware (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            handheld_id UUID NOT NULL REFERENCES handhelds(id) ON DELETE CASCADE,
            custom_firmware_id UUID NOT NULL REFERENCES custom_firmware(id) ON DELETE CASCADE,
            installation_difficulty TEXT CHECK (installation_difficulty IN ('easy', 'medium', 'hard', 'expert')),
            compatibility_notes TEXT,
            installation_guide_url TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(handheld_id, custom_firmware_id)
        );
    END IF;
END $$;

-- Add missing columns if they don't exist
DO $$ 
BEGIN
    -- Add installation_difficulty column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'handheld_custom_firmware' AND column_name = 'installation_difficulty') THEN
        ALTER TABLE handheld_custom_firmware ADD COLUMN installation_difficulty TEXT CHECK (installation_difficulty IN ('easy', 'medium', 'hard', 'expert'));
    END IF;
    
    -- Add compatibility_notes column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'handheld_custom_firmware' AND column_name = 'compatibility_notes') THEN
        ALTER TABLE handheld_custom_firmware ADD COLUMN compatibility_notes TEXT;
    END IF;
    
    -- Add installation_guide_url column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'handheld_custom_firmware' AND column_name = 'installation_guide_url') THEN
        ALTER TABLE handheld_custom_firmware ADD COLUMN installation_guide_url TEXT;
    END IF;
    
    -- Add created_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'handheld_custom_firmware' AND column_name = 'created_at') THEN
        ALTER TABLE handheld_custom_firmware ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'handheld_custom_firmware' AND column_name = 'updated_at') THEN
        ALTER TABLE handheld_custom_firmware ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Create or replace the trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS update_handheld_custom_firmware_updated_at ON handheld_custom_firmware;
CREATE TRIGGER update_handheld_custom_firmware_updated_at
    BEFORE UPDATE ON handheld_custom_firmware
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE handheld_custom_firmware ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Enable read access for all users" ON handheld_custom_firmware;
CREATE POLICY "Enable read access for all users" ON handheld_custom_firmware FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON handheld_custom_firmware;
CREATE POLICY "Enable insert for authenticated users only" ON handheld_custom_firmware FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update for authenticated users only" ON handheld_custom_firmware;
CREATE POLICY "Enable update for authenticated users only" ON handheld_custom_firmware FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON handheld_custom_firmware;
CREATE POLICY "Enable delete for authenticated users only" ON handheld_custom_firmware FOR DELETE USING (true);
