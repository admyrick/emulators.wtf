-- Fix the handheld_device_categories table structure
-- First, check the current structure and fix any issues

-- Drop the existing table if it has the wrong structure
DROP TABLE IF EXISTS handheld_device_categories CASCADE;

-- Create device_categories table if it doesn't exist
CREATE TABLE IF NOT EXISTS device_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recreate the table with the correct structure
CREATE TABLE handheld_device_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    handheld_id UUID NOT NULL REFERENCES handhelds(id) ON DELETE CASCADE,
    device_category_id UUID NOT NULL REFERENCES device_categories(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(handheld_id, device_category_id)
);

-- Insert some default device categories
INSERT INTO device_categories (name, description) VALUES
  ('Portable Gaming', 'Handheld gaming devices designed for portability'),
  ('Retro Gaming', 'Devices focused on playing classic/retro games'),
  ('Modern Gaming', 'Contemporary handheld gaming systems'),
  ('Emulation Device', 'Devices specifically designed for emulation'),
  ('Multi-Platform', 'Devices that support multiple gaming platforms')
ON CONFLICT (name) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_handheld_device_categories_handheld_id ON handheld_device_categories(handheld_id);
CREATE INDEX IF NOT EXISTS idx_handheld_device_categories_device_category_id ON handheld_device_categories(device_category_id);

-- Enable RLS
ALTER TABLE device_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE handheld_device_categories ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow read access to device_categories" ON device_categories FOR SELECT USING (true);
CREATE POLICY "Allow read access to handheld_device_categories" ON handheld_device_categories FOR SELECT USING (true);

-- Admin policies (you may need to adjust based on your auth setup)
CREATE POLICY "Allow admin full access to device_categories" ON device_categories FOR ALL USING (true);
CREATE POLICY "Allow admin full access to handheld_device_categories" ON handheld_device_categories FOR ALL USING (true);

-- Grant permissions
GRANT ALL ON handheld_device_categories TO anon;
GRANT ALL ON handheld_device_categories TO authenticated;

-- Insert some sample relationships if handhelds and categories exist
INSERT INTO handheld_device_categories (handheld_id, device_category_id)
SELECT 
    h.id as handheld_id,
    dc.id as device_category_id
FROM handhelds h
CROSS JOIN device_categories dc
WHERE h.slug IN ('steam-deck', 'asus-rog-ally', 'lenovo-legion-go', 'ayaneo-2s')
AND dc.name IN ('Portable Gaming', 'Retro Gaming', 'Modern Gaming', 'Emulation Device', 'Multi-Platform')
LIMIT 20
ON CONFLICT (handheld_id, device_category_id) DO NOTHING;

-- Verify the table structure
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('handheld_device_categories', 'device_categories')
ORDER BY ordinal_position;
