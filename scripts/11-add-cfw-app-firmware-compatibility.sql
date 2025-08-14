-- Create table for CFW App to Custom Firmware compatibility
CREATE TABLE IF NOT EXISTS cfw_app_firmware_compatibility (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cfw_app_id UUID NOT NULL REFERENCES cfw_apps(id) ON DELETE CASCADE,
    custom_firmware_id UUID NOT NULL REFERENCES custom_firmware(id) ON DELETE CASCADE,
    compatibility_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(cfw_app_id, custom_firmware_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cfw_app_firmware_compatibility_app_id ON cfw_app_firmware_compatibility(cfw_app_id);
CREATE INDEX IF NOT EXISTS idx_cfw_app_firmware_compatibility_firmware_id ON cfw_app_firmware_compatibility(custom_firmware_id);

-- Enable Row Level Security
ALTER TABLE cfw_app_firmware_compatibility ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Public read access" ON cfw_app_firmware_compatibility FOR SELECT USING (true);

-- Update the cfw_apps table to ensure it has all necessary columns
DO $$ 
BEGIN
    -- Add app_name column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cfw_apps' AND column_name = 'app_name') THEN
        ALTER TABLE cfw_apps ADD COLUMN app_name TEXT;
        UPDATE cfw_apps SET app_name = name WHERE app_name IS NULL;
        ALTER TABLE cfw_apps ALTER COLUMN app_name SET NOT NULL;
    END IF;

    -- Add app_url column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cfw_apps' AND column_name = 'app_url') THEN
        ALTER TABLE cfw_apps ADD COLUMN app_url TEXT;
    END IF;

    -- Add app_type column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cfw_apps' AND column_name = 'app_type') THEN
        ALTER TABLE cfw_apps ADD COLUMN app_type TEXT;
    END IF;

    -- Add category column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cfw_apps' AND column_name = 'category') THEN
        ALTER TABLE cfw_apps ADD COLUMN category TEXT;
    END IF;

    -- Add image_url column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cfw_apps' AND column_name = 'image_url') THEN
        ALTER TABLE cfw_apps ADD COLUMN image_url TEXT;
    END IF;

    -- Add last_updated column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cfw_apps' AND column_name = 'last_updated') THEN
        ALTER TABLE cfw_apps ADD COLUMN last_updated DATE;
    END IF;

    -- Add requirements column if it doesn't exist and it's not an array
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cfw_apps' AND column_name = 'requirements' AND data_type = 'ARRAY') THEN
        -- Drop the old requirements column if it exists as text
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cfw_apps' AND column_name = 'requirements' AND data_type = 'text') THEN
            ALTER TABLE cfw_apps DROP COLUMN requirements;
        END IF;
        ALTER TABLE cfw_apps ADD COLUMN requirements TEXT;
    END IF;
END $$;

-- Create tables for CFW app developers, features, and links if they don't exist
CREATE TABLE IF NOT EXISTS cfw_app_developers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cfw_app_id UUID NOT NULL REFERENCES cfw_apps(id) ON DELETE CASCADE,
    developer_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cfw_app_features (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cfw_app_id UUID NOT NULL REFERENCES cfw_apps(id) ON DELETE CASCADE,
    feature_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cfw_app_links (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cfw_app_id UUID NOT NULL REFERENCES cfw_apps(id) ON DELETE CASCADE,
    link_name TEXT NOT NULL,
    url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cfw_app_handheld_compatibility (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cfw_app_id UUID NOT NULL REFERENCES cfw_apps(id) ON DELETE CASCADE,
    handheld_id UUID NOT NULL REFERENCES handhelds(id) ON DELETE CASCADE,
    compatibility_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(cfw_app_id, handheld_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_cfw_app_developers_app_id ON cfw_app_developers(cfw_app_id);
CREATE INDEX IF NOT EXISTS idx_cfw_app_features_app_id ON cfw_app_features(cfw_app_id);
CREATE INDEX IF NOT EXISTS idx_cfw_app_links_app_id ON cfw_app_links(cfw_app_id);
CREATE INDEX IF NOT EXISTS idx_cfw_app_handheld_compatibility_app_id ON cfw_app_handheld_compatibility(cfw_app_id);
CREATE INDEX IF NOT EXISTS idx_cfw_app_handheld_compatibility_handheld_id ON cfw_app_handheld_compatibility(handheld_id);

-- Enable RLS
ALTER TABLE cfw_app_developers ENABLE ROW LEVEL SECURITY;
ALTER TABLE cfw_app_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE cfw_app_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE cfw_app_handheld_compatibility ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public read access" ON cfw_app_developers FOR SELECT USING (true);
CREATE POLICY "Public read access" ON cfw_app_features FOR SELECT USING (true);
CREATE POLICY "Public read access" ON cfw_app_links FOR SELECT USING (true);
CREATE POLICY "Public read access" ON cfw_app_handheld_compatibility FOR SELECT USING (true);

-- Insert some sample data
INSERT INTO cfw_app_firmware_compatibility (cfw_app_id, custom_firmware_id, compatibility_notes)
SELECT 
    ca.id,
    cf.id,
    'Compatible with latest version'
FROM cfw_apps ca
CROSS JOIN custom_firmware cf
WHERE NOT EXISTS (
    SELECT 1 FROM cfw_app_firmware_compatibility cafc 
    WHERE cafc.cfw_app_id = ca.id AND cafc.custom_firmware_id = cf.id
)
LIMIT 5;

SELECT 'CFW App to Custom Firmware compatibility tables created successfully!' as result;
