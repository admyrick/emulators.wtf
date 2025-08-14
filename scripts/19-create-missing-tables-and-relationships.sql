-- First, let's check what tables exist and add missing columns

-- Create device_categories table if it doesn't exist
CREATE TABLE IF NOT EXISTS device_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns to retailers table if they don't exist
DO $$ 
BEGIN
    -- Add description column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'retailers' AND column_name = 'description') THEN
        ALTER TABLE retailers ADD COLUMN description TEXT;
    END IF;
    
    -- Add created_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'retailers' AND column_name = 'created_at') THEN
        ALTER TABLE retailers ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'retailers' AND column_name = 'updated_at') THEN
        ALTER TABLE retailers ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Enable RLS on base tables
ALTER TABLE device_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE retailers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for device_categories
DROP POLICY IF EXISTS "device_categories_select_policy" ON device_categories;
DROP POLICY IF EXISTS "device_categories_insert_policy" ON device_categories;
DROP POLICY IF EXISTS "device_categories_update_policy" ON device_categories;
DROP POLICY IF EXISTS "device_categories_delete_policy" ON device_categories;

CREATE POLICY "device_categories_select_policy" ON device_categories FOR SELECT USING (true);
CREATE POLICY "device_categories_insert_policy" ON device_categories FOR INSERT WITH CHECK (true);
CREATE POLICY "device_categories_update_policy" ON device_categories FOR UPDATE USING (true);
CREATE POLICY "device_categories_delete_policy" ON device_categories FOR DELETE USING (true);

-- Create RLS policies for retailers (drop existing ones first)
DROP POLICY IF EXISTS "retailers_select_policy" ON retailers;
DROP POLICY IF EXISTS "retailers_insert_policy" ON retailers;
DROP POLICY IF EXISTS "retailers_update_policy" ON retailers;
DROP POLICY IF EXISTS "retailers_delete_policy" ON retailers;

CREATE POLICY "retailers_select_policy" ON retailers FOR SELECT USING (true);
CREATE POLICY "retailers_insert_policy" ON retailers FOR INSERT WITH CHECK (true);
CREATE POLICY "retailers_update_policy" ON retailers FOR UPDATE USING (true);
CREATE POLICY "retailers_delete_policy" ON retailers FOR DELETE USING (true);

-- Grant permissions
GRANT ALL ON device_categories TO anon;
GRANT ALL ON device_categories TO authenticated;
GRANT ALL ON retailers TO anon;
GRANT ALL ON retailers TO authenticated;

-- Insert sample device categories (only if they don't exist)
INSERT INTO device_categories (name, description) VALUES
    ('Gaming Handheld', 'Portable gaming devices designed for gaming'),
    ('Steam Deck Compatible', 'Devices that work well with Steam and PC games'),
    ('Retro Gaming', 'Devices focused on retro/classic gaming'),
    ('Premium', 'High-end gaming handhelds with premium features'),
    ('Budget', 'Affordable gaming handhelds'),
    ('Android Based', 'Handhelds running Android OS'),
    ('Linux Based', 'Handhelds running Linux-based OS'),
    ('Windows Based', 'Handhelds running Windows OS')
ON CONFLICT (name) DO NOTHING;

-- Update existing retailers with descriptions (only if description is null)
UPDATE retailers SET description = 'Valve''s official Steam store' WHERE name = 'Steam' AND description IS NULL;
UPDATE retailers SET description = 'Online marketplace' WHERE name = 'Amazon' AND description IS NULL;
UPDATE retailers SET description = 'Electronics retailer' WHERE name = 'Best Buy' AND description IS NULL;
UPDATE retailers SET description = 'Video game retailer' WHERE name = 'GameStop' AND description IS NULL;
UPDATE retailers SET description = 'Computer hardware retailer' WHERE name = 'Newegg' AND description IS NULL;

-- Insert additional retailers if they don't exist
INSERT INTO retailers (name, website_url, description) VALUES
    ('Micro Center', 'https://microcenter.com', 'Computer and electronics retailer'),
    ('B&H Photo', 'https://bhphotovideo.com', 'Electronics and photography retailer'),
    ('Target', 'https://target.com', 'General merchandise retailer'),
    ('Walmart', 'https://walmart.com', 'General merchandise retailer'),
    ('ASUS Store', 'https://store.asus.com', 'Official ASUS store'),
    ('Lenovo', 'https://lenovo.com', 'Official Lenovo store'),
    ('AliExpress', 'https://aliexpress.com', 'International online marketplace'),
    ('eBay', 'https://ebay.com', 'Online auction and marketplace')
ON CONFLICT (name) DO NOTHING;

-- Now create the junction tables (drop and recreate to ensure correct structure)
DROP TABLE IF EXISTS handheld_custom_firmware CASCADE;
DROP TABLE IF EXISTS handheld_retailers CASCADE;
DROP TABLE IF EXISTS handheld_device_categories CASCADE;

-- Create handheld_custom_firmware junction table
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

-- Create handheld_retailers junction table
CREATE TABLE handheld_retailers (
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

-- Create handheld_device_categories junction table
CREATE TABLE handheld_device_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    handheld_id UUID NOT NULL REFERENCES handhelds(id) ON DELETE CASCADE,
    device_category_id UUID NOT NULL REFERENCES device_categories(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(handheld_id, device_category_id)
);

-- Create indexes for better performance
CREATE INDEX idx_handheld_custom_firmware_handheld_id ON handheld_custom_firmware(handheld_id);
CREATE INDEX idx_handheld_custom_firmware_custom_firmware_id ON handheld_custom_firmware(custom_firmware_id);
CREATE INDEX idx_handheld_retailers_handheld_id ON handheld_retailers(handheld_id);
CREATE INDEX idx_handheld_retailers_retailer_id ON handheld_retailers(retailer_id);
CREATE INDEX idx_handheld_device_categories_handheld_id ON handheld_device_categories(handheld_id);
CREATE INDEX idx_handheld_device_categories_device_category_id ON handheld_device_categories(device_category_id);

-- Enable RLS on junction tables
ALTER TABLE handheld_custom_firmware ENABLE ROW LEVEL SECURITY;
ALTER TABLE handheld_retailers ENABLE ROW LEVEL SECURITY;
ALTER TABLE handheld_device_categories ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for handheld_custom_firmware
CREATE POLICY "handheld_custom_firmware_select_policy" ON handheld_custom_firmware FOR SELECT USING (true);
CREATE POLICY "handheld_custom_firmware_insert_policy" ON handheld_custom_firmware FOR INSERT WITH CHECK (true);
CREATE POLICY "handheld_custom_firmware_update_policy" ON handheld_custom_firmware FOR UPDATE USING (true);
CREATE POLICY "handheld_custom_firmware_delete_policy" ON handheld_custom_firmware FOR DELETE USING (true);

-- Create RLS policies for handheld_retailers
CREATE POLICY "handheld_retailers_select_policy" ON handheld_retailers FOR SELECT USING (true);
CREATE POLICY "handheld_retailers_insert_policy" ON handheld_retailers FOR INSERT WITH CHECK (true);
CREATE POLICY "handheld_retailers_update_policy" ON handheld_retailers FOR UPDATE USING (true);
CREATE POLICY "handheld_retailers_delete_policy" ON handheld_retailers FOR DELETE USING (true);

-- Create RLS policies for handheld_device_categories
CREATE POLICY "handheld_device_categories_select_policy" ON handheld_device_categories FOR SELECT USING (true);
CREATE POLICY "handheld_device_categories_insert_policy" ON handheld_device_categories FOR INSERT WITH CHECK (true);
CREATE POLICY "handheld_device_categories_update_policy" ON handheld_device_categories FOR UPDATE USING (true);
CREATE POLICY "handheld_device_categories_delete_policy" ON handheld_device_categories FOR DELETE USING (true);

-- Grant permissions on junction tables
GRANT ALL ON handheld_custom_firmware TO anon;
GRANT ALL ON handheld_custom_firmware TO authenticated;
GRANT ALL ON handheld_retailers TO anon;
GRANT ALL ON handheld_retailers TO authenticated;
GRANT ALL ON handheld_device_categories TO anon;
GRANT ALL ON handheld_device_categories TO authenticated;

-- Create triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
DROP TRIGGER IF EXISTS update_handheld_custom_firmware_updated_at ON handheld_custom_firmware;
CREATE TRIGGER update_handheld_custom_firmware_updated_at
    BEFORE UPDATE ON handheld_custom_firmware
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_handheld_retailers_updated_at ON handheld_retailers;
CREATE TRIGGER update_handheld_retailers_updated_at
    BEFORE UPDATE ON handheld_retailers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_device_categories_updated_at ON device_categories;
CREATE TRIGGER update_device_categories_updated_at
    BEFORE UPDATE ON device_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_retailers_updated_at ON retailers;
CREATE TRIGGER update_retailers_updated_at
    BEFORE UPDATE ON retailers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample relationships if handhelds exist
INSERT INTO handheld_custom_firmware (handheld_id, custom_firmware_id, compatibility_notes, installation_difficulty)
SELECT 
    h.id as handheld_id,
    cf.id as custom_firmware_id,
    CASE 
        WHEN h.slug = 'steam-deck' AND cf.slug = 'batocera-linux' THEN 'Excellent compatibility with Steam Deck hardware'
        WHEN h.slug = 'steam-deck' AND cf.slug = 'emudeck' THEN 'Native Steam Deck support with easy installation'
        WHEN h.slug = 'asus-rog-ally' AND cf.slug = 'batocera-linux' THEN 'Good compatibility with some hardware-specific tweaks needed'
        WHEN h.slug = 'lenovo-legion-go' AND cf.slug = 'batocera-linux' THEN 'Community support available with manual configuration'
        ELSE 'Community supported with varying compatibility'
    END as compatibility_notes,
    CASE 
        WHEN h.slug = 'steam-deck' THEN 'easy'
        WHEN h.slug = 'asus-rog-ally' THEN 'medium'
        ELSE 'hard'
    END as installation_difficulty
FROM handhelds h
CROSS JOIN custom_firmware cf
WHERE h.slug IN ('steam-deck', 'asus-rog-ally', 'lenovo-legion-go', 'ayaneo-2s')
AND cf.slug IN ('batocera-linux', 'emudeck', 'retropie')
LIMIT 10
ON CONFLICT (handheld_id, custom_firmware_id) DO NOTHING;

-- Insert sample retailer relationships
INSERT INTO handheld_retailers (handheld_id, retailer_id, price, availability, product_url)
SELECT 
    h.id as handheld_id,
    r.id as retailer_id,
    CASE 
        WHEN h.slug = 'steam-deck' AND r.name = 'Steam' THEN '$399 - $649'
        WHEN h.slug = 'asus-rog-ally' AND r.name = 'ASUS Store' THEN '$699'
        WHEN h.slug = 'lenovo-legion-go' AND r.name = 'Lenovo' THEN '$799'
        WHEN r.name = 'Amazon' THEN 'Varies'
        ELSE 'Check website'
    END as price,
    CASE 
        WHEN h.slug = 'steam-deck' THEN 'Available'
        WHEN h.slug = 'asus-rog-ally' THEN 'In Stock'
        ELSE 'Check availability'
    END as availability,
    CASE 
        WHEN h.slug = 'steam-deck' AND r.name = 'Steam' THEN 'https://store.steampowered.com/steamdeck'
        ELSE NULL
    END as product_url
FROM handhelds h
CROSS JOIN retailers r
WHERE h.slug IN ('steam-deck', 'asus-rog-ally', 'lenovo-legion-go')
AND r.name IN ('Steam', 'Amazon', 'ASUS Store', 'Lenovo', 'Best Buy')
LIMIT 15
ON CONFLICT (handheld_id, retailer_id) DO NOTHING;

-- Insert sample category relationships
INSERT INTO handheld_device_categories (handheld_id, device_category_id)
SELECT 
    h.id as handheld_id,
    dc.id as device_category_id
FROM handhelds h
CROSS JOIN device_categories dc
WHERE h.slug IN ('steam-deck', 'asus-rog-ally', 'lenovo-legion-go', 'ayaneo-2s')
AND dc.name IN ('Gaming Handheld', 'Steam Deck Compatible', 'Premium', 'Windows Based')
LIMIT 20
ON CONFLICT (handheld_id, device_category_id) DO NOTHING;

-- Verify the tables were created successfully
SELECT 'Tables created successfully!' as status;

-- Show table structures
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('device_categories', 'retailers', 'handheld_custom_firmware', 'handheld_retailers', 'handheld_device_categories')
ORDER BY table_name, ordinal_position;

-- Show sample data counts
SELECT 
    'device_categories' as table_name,
    COUNT(*) as row_count
FROM device_categories
UNION ALL
SELECT 
    'retailers' as table_name,
    COUNT(*) as row_count
FROM retailers
UNION ALL
SELECT 
    'handheld_custom_firmware' as table_name,
    COUNT(*) as row_count
FROM handheld_custom_firmware
UNION ALL
SELECT 
    'handheld_retailers' as table_name,
    COUNT(*) as row_count
FROM handheld_retailers
UNION ALL
SELECT 
    'handheld_device_categories' as table_name,
    COUNT(*) as row_count
FROM handheld_device_categories;
