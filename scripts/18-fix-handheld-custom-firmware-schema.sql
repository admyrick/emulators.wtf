-- Fix the handheld_custom_firmware table to reference the correct custom_firmware table
-- Drop the existing table if it exists
DROP TABLE IF EXISTS handheld_custom_firmware CASCADE;

-- Create the correct handheld_custom_firmware junction table
CREATE TABLE handheld_custom_firmware (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    handheld_id UUID NOT NULL REFERENCES handhelds(id) ON DELETE CASCADE,
    custom_firmware_id UUID NOT NULL REFERENCES custom_firmware(id) ON DELETE CASCADE,
    compatibility_notes TEXT,
    installation_difficulty TEXT CHECK (installation_difficulty IN ('easy', 'medium', 'hard', 'expert')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(handheld_id, custom_firmware_id)
);

-- Create indexes for better performance
CREATE INDEX idx_handheld_custom_firmware_handheld_id ON handheld_custom_firmware(handheld_id);
CREATE INDEX idx_handheld_custom_firmware_custom_firmware_id ON handheld_custom_firmware(custom_firmware_id);

-- Enable RLS
ALTER TABLE handheld_custom_firmware ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "handheld_custom_firmware_select_policy" ON handheld_custom_firmware
    FOR SELECT USING (true);

CREATE POLICY "handheld_custom_firmware_insert_policy" ON handheld_custom_firmware
    FOR INSERT WITH CHECK (true);

CREATE POLICY "handheld_custom_firmware_update_policy" ON handheld_custom_firmware
    FOR UPDATE USING (true);

CREATE POLICY "handheld_custom_firmware_delete_policy" ON handheld_custom_firmware
    FOR DELETE USING (true);

-- Grant permissions
GRANT ALL ON handheld_custom_firmware TO anon;
GRANT ALL ON handheld_custom_firmware TO authenticated;

-- Create handheld_retailers table if it doesn't exist
CREATE TABLE IF NOT EXISTS handheld_retailers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    handheld_id UUID NOT NULL REFERENCES handhelds(id) ON DELETE CASCADE,
    retailer_id UUID NOT NULL REFERENCES retailers(id) ON DELETE CASCADE,
    price TEXT,
    availability TEXT,
    product_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(handheld_id, retailer_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_handheld_retailers_handheld_id ON handheld_retailers(handheld_id);
CREATE INDEX IF NOT EXISTS idx_handheld_retailers_retailer_id ON handheld_retailers(retailer_id);

-- Enable RLS
ALTER TABLE handheld_retailers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for handheld_retailers
DROP POLICY IF EXISTS "handheld_retailers_select_policy" ON handheld_retailers;
DROP POLICY IF EXISTS "handheld_retailers_insert_policy" ON handheld_retailers;
DROP POLICY IF EXISTS "handheld_retailers_update_policy" ON handheld_retailers;
DROP POLICY IF EXISTS "handheld_retailers_delete_policy" ON handheld_retailers;

CREATE POLICY "handheld_retailers_select_policy" ON handheld_retailers
    FOR SELECT USING (true);

CREATE POLICY "handheld_retailers_insert_policy" ON handheld_retailers
    FOR INSERT WITH CHECK (true);

CREATE POLICY "handheld_retailers_update_policy" ON handheld_retailers
    FOR UPDATE USING (true);

CREATE POLICY "handheld_retailers_delete_policy" ON handheld_retailers
    FOR DELETE USING (true);

-- Grant permissions
GRANT ALL ON handheld_retailers TO anon;
GRANT ALL ON handheld_retailers TO authenticated;

-- Create handheld_device_categories table if it doesn't exist
CREATE TABLE IF NOT EXISTS handheld_device_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    handheld_id UUID NOT NULL REFERENCES handhelds(id) ON DELETE CASCADE,
    device_category_id UUID NOT NULL REFERENCES device_categories(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(handheld_id, device_category_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_handheld_device_categories_handheld_id ON handheld_device_categories(handheld_id);
CREATE INDEX IF NOT EXISTS idx_handheld_device_categories_device_category_id ON handheld_device_categories(device_category_id);

-- Enable RLS
ALTER TABLE handheld_device_categories ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for handheld_device_categories
DROP POLICY IF EXISTS "handheld_device_categories_select_policy" ON handheld_device_categories;
DROP POLICY IF EXISTS "handheld_device_categories_insert_policy" ON handheld_device_categories;
DROP POLICY IF EXISTS "handheld_device_categories_update_policy" ON handheld_device_categories;
DROP POLICY IF EXISTS "handheld_device_categories_delete_policy" ON handheld_device_categories;

CREATE POLICY "handheld_device_categories_select_policy" ON handheld_device_categories
    FOR SELECT USING (true);

CREATE POLICY "handheld_device_categories_insert_policy" ON handheld_device_categories
    FOR INSERT WITH CHECK (true);

CREATE POLICY "handheld_device_categories_update_policy" ON handheld_device_categories
    FOR UPDATE USING (true);

CREATE POLICY "handheld_device_categories_delete_policy" ON handheld_device_categories
    FOR DELETE USING (true);

-- Grant permissions
GRANT ALL ON handheld_device_categories TO anon;
GRANT ALL ON handheld_device_categories TO authenticated;

-- Verify the tables exist and have correct structure
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('handheld_custom_firmware', 'handheld_retailers', 'handheld_device_categories')
ORDER BY table_name, ordinal_position;
