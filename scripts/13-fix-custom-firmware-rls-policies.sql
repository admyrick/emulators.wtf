-- Fix RLS policies for custom firmware tables
-- This script creates permissive policies to allow all operations

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable all operations for custom_firmware" ON custom_firmware;
DROP POLICY IF EXISTS "Enable all operations for cfw_compatible_handhelds" ON cfw_compatible_handhelds;
DROP POLICY IF EXISTS "Enable all operations for custom_firmware_features" ON custom_firmware_features;
DROP POLICY IF EXISTS "Enable all operations for custom_firmware_requirements" ON custom_firmware_requirements;

-- Enable RLS on tables (if not already enabled)
ALTER TABLE custom_firmware ENABLE ROW LEVEL SECURITY;
ALTER TABLE cfw_compatible_handhelds ENABLE ROW LEVEL SECURITY;

-- Check if tables exist before enabling RLS
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'custom_firmware_features') THEN
        ALTER TABLE custom_firmware_features ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'custom_firmware_requirements') THEN
        ALTER TABLE custom_firmware_requirements ENABLE ROW LEVEL SECURITY;
    END IF;
END
$$;

-- Create permissive policies for all operations
CREATE POLICY "Enable all operations for custom_firmware" ON custom_firmware
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all operations for cfw_compatible_handhelds" ON cfw_compatible_handhelds
    FOR ALL USING (true) WITH CHECK (true);

-- Create policies for feature/requirement tables if they exist
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'custom_firmware_features') THEN
        EXECUTE 'CREATE POLICY "Enable all operations for custom_firmware_features" ON custom_firmware_features FOR ALL USING (true) WITH CHECK (true)';
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'custom_firmware_requirements') THEN
        EXECUTE 'CREATE POLICY "Enable all operations for custom_firmware_requirements" ON custom_firmware_requirements FOR ALL USING (true) WITH CHECK (true)';
    END IF;
END
$$;

-- Grant necessary permissions
GRANT ALL ON custom_firmware TO anon, authenticated;
GRANT ALL ON cfw_compatible_handhelds TO anon, authenticated;

-- Grant permissions on feature/requirement tables if they exist
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'custom_firmware_features') THEN
        EXECUTE 'GRANT ALL ON custom_firmware_features TO anon, authenticated';
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'custom_firmware_requirements') THEN
        EXECUTE 'GRANT ALL ON custom_firmware_requirements TO anon, authenticated';
    END IF;
END
$$;
