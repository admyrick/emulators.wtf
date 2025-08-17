-- Add Row Level Security policies to allow public read access to custom firmware and other public data

-- Enable RLS on tables if not already enabled
ALTER TABLE custom_firmware ENABLE ROW LEVEL SECURITY;
ALTER TABLE handhelds ENABLE ROW LEVEL SECURITY;
ALTER TABLE emulators ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE consoles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE cfw_apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE setups ENABLE ROW LEVEL SECURITY;
ALTER TABLE presets ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access to custom_firmware" ON custom_firmware;
DROP POLICY IF EXISTS "Allow public read access to handhelds" ON handhelds;
DROP POLICY IF EXISTS "Allow public read access to emulators" ON emulators;
DROP POLICY IF EXISTS "Allow public read access to games" ON games;
DROP POLICY IF EXISTS "Allow public read access to consoles" ON consoles;
DROP POLICY IF EXISTS "Allow public read access to tools" ON tools;
DROP POLICY IF EXISTS "Allow public read access to cfw_apps" ON cfw_apps;
DROP POLICY IF EXISTS "Allow public read access to setups" ON setups;
DROP POLICY IF EXISTS "Allow public read access to presets" ON presets;

-- Create policies to allow public read access (anyone can read, but only authenticated users can write)
CREATE POLICY "Allow public read access to custom_firmware" ON custom_firmware
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access to handhelds" ON handhelds
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access to emulators" ON emulators
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access to games" ON games
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access to consoles" ON consoles
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access to tools" ON tools
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access to cfw_apps" ON cfw_apps
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access to setups" ON setups
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access to presets" ON presets
    FOR SELECT USING (true);

-- Allow authenticated users to insert/update/delete (for admin operations)
CREATE POLICY "Allow authenticated users to manage custom_firmware" ON custom_firmware
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage handhelds" ON handhelds
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage emulators" ON emulators
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage games" ON games
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage consoles" ON consoles
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage tools" ON tools
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage cfw_apps" ON cfw_apps
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage setups" ON setups
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage presets" ON presets
    FOR ALL USING (auth.role() = 'authenticated');

-- Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('custom_firmware', 'handhelds', 'emulators', 'games', 'consoles', 'tools', 'cfw_apps', 'setups', 'presets')
ORDER BY tablename, policyname;
