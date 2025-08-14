-- Fix the cfw_app_firmware_compatibility table schema
-- Add missing compatibility_notes column and ensure proper structure

-- First, check if the table exists and what columns it has
DO $$
BEGIN
    -- Add compatibility_notes column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'cfw_app_firmware_compatibility' 
        AND column_name = 'compatibility_notes'
    ) THEN
        ALTER TABLE cfw_app_firmware_compatibility 
        ADD COLUMN compatibility_notes TEXT;
    END IF;

    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'cfw_app_firmware_compatibility' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE cfw_app_firmware_compatibility 
        ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
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
DROP TRIGGER IF EXISTS update_cfw_app_firmware_compatibility_updated_at ON cfw_app_firmware_compatibility;
CREATE TRIGGER update_cfw_app_firmware_compatibility_updated_at
    BEFORE UPDATE ON cfw_app_firmware_compatibility
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Ensure RLS is enabled
ALTER TABLE cfw_app_firmware_compatibility ENABLE ROW LEVEL SECURITY;

-- Drop existing policies and recreate them
DROP POLICY IF EXISTS "Allow public read access" ON cfw_app_firmware_compatibility;
DROP POLICY IF EXISTS "Allow authenticated users to insert" ON cfw_app_firmware_compatibility;
DROP POLICY IF EXISTS "Allow authenticated users to update" ON cfw_app_firmware_compatibility;
DROP POLICY IF EXISTS "Allow authenticated users to delete" ON cfw_app_firmware_compatibility;

-- Create RLS policies
CREATE POLICY "Allow public read access" ON cfw_app_firmware_compatibility
    FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to insert" ON cfw_app_firmware_compatibility
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update" ON cfw_app_firmware_compatibility
    FOR UPDATE USING (true);

CREATE POLICY "Allow authenticated users to delete" ON cfw_app_firmware_compatibility
    FOR DELETE USING (true);

-- Grant permissions
GRANT ALL ON cfw_app_firmware_compatibility TO authenticated;
GRANT SELECT ON cfw_app_firmware_compatibility TO anon;

-- Verify the table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'cfw_app_firmware_compatibility'
ORDER BY ordinal_position;
