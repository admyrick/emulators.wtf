-- Enable public access to cfw_apps table by creating permissive RLS policies

-- Drop existing restrictive policies if they exist
DROP POLICY IF EXISTS "cfw_apps_select_policy" ON cfw_apps;
DROP POLICY IF EXISTS "cfw_apps_insert_policy" ON cfw_apps;
DROP POLICY IF EXISTS "cfw_apps_update_policy" ON cfw_apps;
DROP POLICY IF EXISTS "cfw_apps_delete_policy" ON cfw_apps;

-- Create permissive policies that allow all operations
CREATE POLICY "cfw_apps_select_policy" ON cfw_apps FOR SELECT USING (true);
CREATE POLICY "cfw_apps_insert_policy" ON cfw_apps FOR INSERT WITH CHECK (true);
CREATE POLICY "cfw_apps_update_policy" ON cfw_apps FOR UPDATE USING (true);
CREATE POLICY "cfw_apps_delete_policy" ON cfw_apps FOR DELETE USING (true);

-- Ensure RLS is enabled
ALTER TABLE cfw_apps ENABLE ROW LEVEL SECURITY;

-- Also ensure custom_firmware table has proper policies since cfw_apps references it
DROP POLICY IF EXISTS "custom_firmware_select_policy" ON custom_firmware;
DROP POLICY IF EXISTS "custom_firmware_insert_policy" ON custom_firmware;
DROP POLICY IF EXISTS "custom_firmware_update_policy" ON custom_firmware;
DROP POLICY IF EXISTS "custom_firmware_delete_policy" ON custom_firmware;

CREATE POLICY "custom_firmware_select_policy" ON custom_firmware FOR SELECT USING (true);
CREATE POLICY "custom_firmware_insert_policy" ON custom_firmware FOR INSERT WITH CHECK (true);
CREATE POLICY "custom_firmware_update_policy" ON custom_firmware FOR UPDATE USING (true);
CREATE POLICY "custom_firmware_delete_policy" ON custom_firmware FOR DELETE USING (true);

ALTER TABLE custom_firmware ENABLE ROW LEVEL SECURITY;

-- Add some sample custom_firmware records if the table is empty
INSERT INTO custom_firmware (id, name, description, slug, website, repo_url, developers, version, stability, features)
VALUES 
  ('06a64cc6-0d9a-4cb7-8b4f-536f4aede971', 'SteamOS', 'Valve''s gaming-focused Linux distribution', 'steamos', 'https://store.steampowered.com/steamos', 'https://github.com/ValveSoftware/SteamOS', 'Valve Corporation', '3.5', 'stable', 'Gaming optimized, Steam integration, Hardware acceleration'),
  ('12b74dd7-1e8b-5dc8-9c5f-647f5bfef082', 'EmuDeck', 'Emulation suite for Steam Deck and other devices', 'emudeck', 'https://www.emudeck.com', 'https://github.com/dragoonDorise/EmuDeck', 'EmuDeck Team', '2.1', 'stable', 'Multiple emulators, Easy setup, Steam integration'),
  ('23c85ee8-2f9c-6ed9-ad6f-758f6cgfg193', 'RetroDECK', 'All-in-one retro gaming application', 'retrodeck', 'https://retrodeck.net', 'https://github.com/XargonWan/RetroDECK', 'RetroDECK Team', '0.8', 'beta', 'Flatpak distribution, Multiple emulators, Portable')
ON CONFLICT (id) DO NOTHING;

-- Add some sample cfw_apps records
INSERT INTO cfw_apps (id, name, description, website, repo_url, latest_version, cfw_id)
VALUES 
  (gen_random_uuid(), 'Steam', 'Digital game distribution platform', 'https://store.steampowered.com', 'https://github.com/ValveSoftware/steam-for-linux', '1.0.0.78', '06a64cc6-0d9a-4cb7-8b4f-536f4aede971'),
  (gen_random_uuid(), 'RetroArch', 'Frontend for emulators and game engines', 'https://www.retroarch.com', 'https://github.com/libretro/RetroArch', '1.16.0', '12b74dd7-1e8b-5dc8-9c5f-647f5bfef082'),
  (gen_random_uuid(), 'PCSX2', 'PlayStation 2 emulator', 'https://pcsx2.net', 'https://github.com/PCSX2/pcsx2', '1.7.5', '23c85ee8-2f9c-6ed9-ad6f-758f6cgfg193')
ON CONFLICT (id) DO NOTHING;
