-- Fix Custom Firmware Schema - Add Missing Columns
-- This script adds all the missing columns to the custom_firmware table

DO $$
BEGIN
    RAISE NOTICE 'Checking and fixing custom_firmware table schema...';
    
    -- Add missing columns if they don't exist
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'custom_firmware' AND column_name = 'documentation_url') THEN
        ALTER TABLE custom_firmware ADD COLUMN documentation_url TEXT;
        RAISE NOTICE 'Added documentation_url column';
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'custom_firmware' AND column_name = 'source_code_url') THEN
        ALTER TABLE custom_firmware ADD COLUMN source_code_url TEXT;
        RAISE NOTICE 'Added source_code_url column';
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'custom_firmware' AND column_name = 'license') THEN
        ALTER TABLE custom_firmware ADD COLUMN license TEXT;
        RAISE NOTICE 'Added license column';
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'custom_firmware' AND column_name = 'installation_difficulty') THEN
        ALTER TABLE custom_firmware ADD COLUMN installation_difficulty TEXT DEFAULT 'intermediate';
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
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'custom_firmware' AND column_name = 'release_date') THEN
        ALTER TABLE custom_firmware ADD COLUMN release_date DATE;
        RAISE NOTICE 'Added release_date column';
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'custom_firmware' AND column_name = 'image_url') THEN
        ALTER TABLE custom_firmware ADD COLUMN image_url TEXT;
        RAISE NOTICE 'Added image_url column';
    END IF;
    
    -- Update the version column to be TEXT instead of character varying if needed
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'custom_firmware' AND column_name = 'version' AND data_type = 'character varying') THEN
        ALTER TABLE custom_firmware ALTER COLUMN version TYPE TEXT;
        RAISE NOTICE 'Updated version column to TEXT type';
    END IF;
    
    -- Update the name column to be TEXT instead of character varying if needed
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'custom_firmware' AND column_name = 'name' AND data_type = 'character varying') THEN
        ALTER TABLE custom_firmware ALTER COLUMN name TYPE TEXT;
        RAISE NOTICE 'Updated name column to TEXT type';
    END IF;
    
    RAISE NOTICE 'Custom firmware schema fix completed successfully!';
    
    -- Show current table structure
    RAISE NOTICE 'Current custom_firmware table columns:';
    FOR rec IN 
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'custom_firmware' 
        ORDER BY ordinal_position
    LOOP
        RAISE NOTICE '  - %: % (%)', rec.column_name, rec.data_type, CASE WHEN rec.is_nullable = 'YES' THEN 'nullable' ELSE 'not null' END;
    END LOOP;
    
END $$;
