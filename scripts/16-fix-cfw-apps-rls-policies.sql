-- Fix Row Level Security policies for cfw_apps table
-- This resolves the "permission denied for table cfw_apps" error

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "cfw_apps_select_policy" ON cfw_apps;
DROP POLICY IF EXISTS "cfw_apps_insert_policy" ON cfw_apps;
DROP POLICY IF EXISTS "cfw_apps_update_policy" ON cfw_apps;
DROP POLICY IF EXISTS "cfw_apps_delete_policy" ON cfw_apps;

-- Enable RLS on cfw_apps table
ALTER TABLE cfw_apps ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for public access
-- Adding public read access policy
CREATE POLICY "cfw_apps_select_policy" ON cfw_apps
    FOR SELECT USING (true);

-- Adding public insert access policy
CREATE POLICY "cfw_apps_insert_policy" ON cfw_apps
    FOR INSERT WITH CHECK (true);

-- Adding public update access policy
CREATE POLICY "cfw_apps_update_policy" ON cfw_apps
    FOR UPDATE USING (true);

-- Adding public delete access policy
CREATE POLICY "cfw_apps_delete_policy" ON cfw_apps
    FOR DELETE USING (true);

-- First create sample custom_firmware records that cfw_apps can reference
-- Create sample custom firmware records if they don't exist
INSERT INTO custom_firmware (id, name, description, website, repo_url, version, developers, created_at, updated_at)
SELECT 
    '06a64cc6-0d9a-4cb7-8b4f-536f4aede971'::uuid,
    'SteamOS',
    'Valve''s Linux-based operating system for Steam Deck',
    'https://store.steampowered.com/steamdeck',
    'https://gitlab.steamos.cloud/steamdeck/steamos',
    '3.5.7',
    'Valve Corporation',
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM custom_firmware WHERE id = '06a64cc6-0d9a-4cb7-8b4f-536f4aede971'::uuid);

INSERT INTO custom_firmware (id, name, description, website, repo_url, version, developers, created_at, updated_at)
SELECT 
    '12b34c56-7d8e-9f0a-1b2c-3d4e5f6a7b8c'::uuid,
    'EmuDeck OS',
    'Custom firmware optimized for emulation',
    'https://www.emudeck.com/',
    'https://github.com/dragoonDorise/EmuDeck',
    '2.1.1',
    'EmuDeck Team',
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM custom_firmware WHERE id = '12b34c56-7d8e-9f0a-1b2c-3d4e5f6a7b8c'::uuid);

INSERT INTO custom_firmware (id, name, description, website, repo_url, version, developers, created_at, updated_at)
SELECT 
    '98f76e54-3d2c-1b0a-9e8f-7d6c5b4a3f2e'::uuid,
    'RetroDECK OS',
    'All-in-one retro gaming solution',
    'https://retrodeck.net/',
    'https://github.com/XargonWan/RetroDECK',
    '0.7.1b',
    'RetroDECK Team',
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM custom_firmware WHERE id = '98f76e54-3d2c-1b0a-9e8f-7d6c5b4a3f2e'::uuid);

-- Now insert cfw_apps with proper foreign key references
-- Add some sample data if the table is empty
INSERT INTO cfw_apps (id, name, description, website, repo_url, latest_version, cfw_id, created_at)
SELECT 
    gen_random_uuid(),
    'RetroArch',
    'Cross-platform, sophisticated frontend for the libretro API',
    'https://www.retroarch.com/',
    'https://github.com/libretro/RetroArch',
    '1.16.0',
    '06a64cc6-0d9a-4cb7-8b4f-536f4aede971'::uuid,
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM cfw_apps WHERE name = 'RetroArch');

INSERT INTO cfw_apps (id, name, description, website, repo_url, latest_version, cfw_id, created_at)
SELECT 
    gen_random_uuid(),
    'EmuDeck',
    'Emulation configuration tool for Steam Deck',
    'https://www.emudeck.com/',
    'https://github.com/dragoonDorise/EmuDeck',
    '2.1.1',
    '12b34c56-7d8e-9f0a-1b2c-3d4e5f6a7b8c'::uuid,
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM cfw_apps WHERE name = 'EmuDeck');

INSERT INTO cfw_apps (id, name, description, website, repo_url, latest_version, cfw_id, created_at)
SELECT 
    gen_random_uuid(),
    'Decky Loader',
    'Plugin loader for Steam Deck',
    'https://decky.xyz/',
    'https://github.com/SteamDeckHomebrew/decky-loader',
    '2.10.3',
    '98f76e54-3d2c-1b0a-9e8f-7d6c5b4a3f2e'::uuid,
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM cfw_apps WHERE name = 'Decky Loader');

-- Add performance indexes
CREATE INDEX IF NOT EXISTS idx_cfw_apps_name ON cfw_apps(name);
CREATE INDEX IF NOT EXISTS idx_cfw_apps_created_at ON cfw_apps(created_at);
CREATE INDEX IF NOT EXISTS idx_cfw_apps_cfw_id ON cfw_apps(cfw_id);
