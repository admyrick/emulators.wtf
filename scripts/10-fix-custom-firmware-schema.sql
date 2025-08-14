-- Fix Custom Firmware Schema
-- This script ensures the custom_firmware table has all required columns

DO $$
BEGIN
    -- Check if custom_firmware table exists
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'custom_firmware') THEN
        RAISE NOTICE 'Creating custom_firmware table...';
        
        CREATE TABLE custom_firmware (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(255) NOT NULL,
            slug VARCHAR(255) NOT NULL UNIQUE,
            description TEXT,
            version VARCHAR(100),
            release_date DATE,
            download_url TEXT,
            documentation_url TEXT,
            source_code_url TEXT,
            license VARCHAR(100),
            installation_difficulty VARCHAR(50) DEFAULT 'intermediate',
            features TEXT[],
            requirements TEXT[],
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Create indexes
        CREATE INDEX idx_custom_firmware_slug ON custom_firmware(slug);
        CREATE INDEX idx_custom_firmware_name ON custom_firmware(name);
        
        RAISE NOTICE 'Custom firmware table created successfully';
    ELSE
        RAISE NOTICE 'Custom firmware table already exists, checking columns...';
        
        -- Add missing columns if they don't exist
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'custom_firmware' AND column_name = 'version') THEN
            ALTER TABLE custom_firmware ADD COLUMN version VARCHAR(100);
            RAISE NOTICE 'Added version column';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'custom_firmware' AND column_name = 'release_date') THEN
            ALTER TABLE custom_firmware ADD COLUMN release_date DATE;
            RAISE NOTICE 'Added release_date column';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'custom_firmware' AND column_name = 'download_url') THEN
            ALTER TABLE custom_firmware ADD COLUMN download_url TEXT;
            RAISE NOTICE 'Added download_url column';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'custom_firmware' AND column_name = 'documentation_url') THEN
            ALTER TABLE custom_firmware ADD COLUMN documentation_url TEXT;
            RAISE NOTICE 'Added documentation_url column';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'custom_firmware' AND column_name = 'source_code_url') THEN
            ALTER TABLE custom_firmware ADD COLUMN source_code_url TEXT;
            RAISE NOTICE 'Added source_code_url column';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'custom_firmware' AND column_name = 'license') THEN
            ALTER TABLE custom_firmware ADD COLUMN license VARCHAR(100);
            RAISE NOTICE 'Added license column';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'custom_firmware' AND column_name = 'installation_difficulty') THEN
            ALTER TABLE custom_firmware ADD COLUMN installation_difficulty VARCHAR(50) DEFAULT 'intermediate';
            RAISE NOTICE 'Added installation_difficulty column';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'custom_firmware' AND column_name = 'features') THEN
            ALTER TABLE custom_firmware ADD COLUMN features TEXT[];
            RAISE NOTICE 'Added features column';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'custom_firmware' AND column_name = 'requirements') THEN
            ALTER TABLE custom_firmware ADD COLUMN requirements TEXT[];
            RAISE NOTICE 'Added requirements column';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'custom_firmware' AND column_name = 'updated_at') THEN
            ALTER TABLE custom_firmware ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
            RAISE NOTICE 'Added updated_at column';
        END IF;
    END IF;
    
    -- Check if cfw_compatible_handhelds table exists
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'cfw_compatible_handhelds') THEN
        RAISE NOTICE 'Creating cfw_compatible_handhelds table...';
        
        CREATE TABLE cfw_compatible_handhelds (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            custom_firmware_id UUID NOT NULL REFERENCES custom_firmware(id) ON DELETE CASCADE,
            handheld_id UUID NOT NULL REFERENCES handhelds(id) ON DELETE CASCADE,
            compatibility_notes TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(custom_firmware_id, handheld_id)
        );
        
        -- Create indexes
        CREATE INDEX idx_cfw_compatible_handhelds_firmware ON cfw_compatible_handhelds(custom_firmware_id);
        CREATE INDEX idx_cfw_compatible_handhelds_handheld ON cfw_compatible_handhelds(handheld_id);
        
        RAISE NOTICE 'CFW compatible handhelds table created successfully';
    ELSE
        RAISE NOTICE 'CFW compatible handhelds table already exists';
    END IF;
    
    -- Enable Row Level Security
    ALTER TABLE custom_firmware ENABLE ROW LEVEL SECURITY;
    ALTER TABLE cfw_compatible_handhelds ENABLE ROW LEVEL SECURITY;

    -- Create RLS policies
    CREATE POLICY IF NOT EXISTS "Allow public read access to custom_firmware" ON custom_firmware
        FOR SELECT USING (true);

    CREATE POLICY IF NOT EXISTS "Allow authenticated users full access to custom_firmware" ON custom_firmware
        FOR ALL USING (auth.role() = 'authenticated');

    CREATE POLICY IF NOT EXISTS "Allow public read access to cfw_compatible_handhelds" ON cfw_compatible_handhelds
        FOR SELECT USING (true);

    CREATE POLICY IF NOT EXISTS "Allow authenticated users full access to cfw_compatible_handhelds" ON cfw_compatible_handhelds
        FOR ALL USING (auth.role() = 'authenticated');

    -- Insert sample data if table is empty
    IF NOT EXISTS (SELECT 1 FROM custom_firmware LIMIT 1) THEN
        RAISE NOTICE 'Inserting sample custom firmware data...';
        
        INSERT INTO custom_firmware (name, slug, description, version, installation_difficulty, features, requirements) VALUES
        ('ArkOS', 'arkos', 'A custom firmware for handheld gaming devices that provides enhanced emulation capabilities and a user-friendly interface.', '2.0-rc', 'Medium', ARRAY['Enhanced emulation', 'Custom UI', 'Save states', 'Cheats support'], ARRAY['Compatible handheld device', 'MicroSD card (32GB+)', 'Basic technical knowledge']),
        
        ('Batocera', 'batocera', 'A retro gaming distribution that turns your handheld into a powerful emulation station with support for dozens of systems.', '39', 'intermediate', ARRAY['Multi-system emulation', 'Web interface', 'Netplay support', 'Automatic updates'], ARRAY['Compatible device', 'MicroSD card (16GB+)', 'Internet connection for setup']),
        
        ('EmuELEC', 'emuelec', 'A Just Enough Linux Operating System for the sole purpose of running emulators on ARM devices.', '4.7', 'beginner', ARRAY['ARM optimization', 'RetroArch integration', 'Kodi support', 'SSH access'], ARRAY['ARM-based handheld', 'MicroSD card (8GB+)', 'Compatible bootloader']),
        
        ('TheRA', 'thera', 'A custom firmware focused on providing the best RetroArch experience with optimized cores and settings.', '1.5.2', 'Hard', ARRAY['Optimized RetroArch', 'Custom shaders', 'Performance tweaks', 'Advanced settings'], ARRAY['Advanced user knowledge', 'Backup of original firmware', 'Compatible device']);
        
        RAISE NOTICE 'Sample custom firmware data inserted';
    END IF;
    
    RAISE NOTICE 'Custom firmware schema setup completed successfully!';
    
    -- Show final table structure
    RAISE NOTICE 'Final custom_firmware table structure:';
    FOR rec IN 
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'custom_firmware' 
        ORDER BY ordinal_position
    LOOP
        RAISE NOTICE '  - %: % (%)', rec.column_name, rec.data_type, CASE WHEN rec.is_nullable = 'YES' THEN 'nullable' ELSE 'not null' END;
    END LOOP;
    
END $$;
