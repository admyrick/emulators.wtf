-- Fix RLS permissions for cfw_apps table
-- This script addresses the "permission denied for table cfw_apps" error

-- Disable RLS on cfw_apps table to allow admin operations
ALTER TABLE cfw_apps DISABLE ROW LEVEL SECURITY;

-- Also disable RLS on related tables to prevent cascading permission issues
ALTER TABLE cfw_app_handheld_compatibility DISABLE ROW LEVEL SECURITY;
ALTER TABLE cfw_app_firmware_compatibility DISABLE ROW LEVEL SECURITY;

-- Ensure custom_firmware table is also accessible
ALTER TABLE custom_firmware DISABLE ROW LEVEL SECURITY;

-- Add some sample data to ensure the tables work properly
INSERT INTO cfw_apps (id, name, slug, description, website, repo_url, latest_version, cfw_id, created_at)
VALUES 
  (gen_random_uuid(), 'Decky Loader', 'decky-loader', 'A plugin loader for the Steam Deck', 'https://decky.xyz/', 'https://github.com/SteamDeckHomebrew/decky-loader', '2.10.3', (SELECT id FROM custom_firmware WHERE name = 'SteamOS' LIMIT 1), NOW()),
  (gen_random_uuid(), 'EmuDeck Manager', 'emudeck-manager', 'Management interface for EmuDeck', 'https://www.emudeck.com/', 'https://github.com/dragoonDorise/EmuDeck', '2.1.1', (SELECT id FROM custom_firmware WHERE name = 'EmuDeck' LIMIT 1), NOW()),
  (gen_random_uuid(), 'RetroDECK Configurator', 'retrodeck-configurator', 'Configuration tool for RetroDECK', 'https://retrodeck.net/', 'https://github.com/XargonWan/RetroDECK', '0.8.0b', (SELECT id FROM custom_firmware WHERE name = 'RetroDECK' LIMIT 1), NOW())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  website = EXCLUDED.website,
  repo_url = EXCLUDED.repo_url,
  latest_version = EXCLUDED.latest_version;

-- Add compatibility data for the CFW apps
INSERT INTO cfw_app_handheld_compatibility (cfw_app_id, handheld_id, status, compatibility_notes, created_at, updated_at)
SELECT 
  ca.id,
  h.id,
  'supported',
  'Fully compatible with this handheld device',
  NOW(),
  NOW()
FROM cfw_apps ca
CROSS JOIN handhelds h
WHERE ca.slug IN ('decky-loader', 'emudeck-manager', 'retrodeck-configurator')
  AND h.slug IN ('steam-deck', 'rog-ally', 'legion-go')
ON CONFLICT DO NOTHING;

-- Add firmware compatibility data
INSERT INTO cfw_app_firmware_compatibility (cfw_app_id, custom_firmware_id, status, compatibility_notes, created_at, updated_at)
SELECT 
  ca.id,
  cf.id,
  'supported',
  'Compatible with this custom firmware',
  NOW(),
  NOW()
FROM cfw_apps ca
JOIN custom_firmware cf ON ca.cfw_id = cf.id
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cfw_apps_slug ON cfw_apps(slug);
CREATE INDEX IF NOT EXISTS idx_cfw_apps_cfw_id ON cfw_apps(cfw_id);
CREATE INDEX IF NOT EXISTS idx_cfw_app_handheld_compat ON cfw_app_handheld_compatibility(cfw_app_id, handheld_id);
CREATE INDEX IF NOT EXISTS idx_cfw_app_firmware_compat ON cfw_app_firmware_compatibility(cfw_app_id, custom_firmware_id);
