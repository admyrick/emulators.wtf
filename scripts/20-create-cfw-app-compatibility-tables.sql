-- Create CFW app compatibility tables

-- Create cfw_app_handheld_compatibility table
CREATE TABLE IF NOT EXISTS public.cfw_app_handheld_compatibility (
    id SERIAL PRIMARY KEY,
    cfw_app_id UUID NOT NULL REFERENCES public.cfw_apps(id) ON DELETE CASCADE,
    handheld_id INTEGER NOT NULL REFERENCES public.handhelds(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'compatible',
    compatibility_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(cfw_app_id, handheld_id)
);

-- Create cfw_app_firmware_compatibility table
CREATE TABLE IF NOT EXISTS public.cfw_app_firmware_compatibility (
    id SERIAL PRIMARY KEY,
    cfw_app_id UUID NOT NULL REFERENCES public.cfw_apps(id) ON DELETE CASCADE,
    custom_firmware_id UUID NOT NULL REFERENCES public.custom_firmware(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'compatible',
    compatibility_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(cfw_app_id, custom_firmware_id)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cfw_app_handheld_compatibility_cfw_app_id ON public.cfw_app_handheld_compatibility(cfw_app_id);
CREATE INDEX IF NOT EXISTS idx_cfw_app_handheld_compatibility_handheld_id ON public.cfw_app_handheld_compatibility(handheld_id);
CREATE INDEX IF NOT EXISTS idx_cfw_app_firmware_compatibility_cfw_app_id ON public.cfw_app_firmware_compatibility(cfw_app_id);
CREATE INDEX IF NOT EXISTS idx_cfw_app_firmware_compatibility_firmware_id ON public.cfw_app_firmware_compatibility(custom_firmware_id);

-- Enable RLS
ALTER TABLE public.cfw_app_handheld_compatibility ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cfw_app_firmware_compatibility ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public read access
CREATE POLICY "Allow public read access to cfw_app_handheld_compatibility" ON public.cfw_app_handheld_compatibility
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert to cfw_app_handheld_compatibility" ON public.cfw_app_handheld_compatibility
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update to cfw_app_handheld_compatibility" ON public.cfw_app_handheld_compatibility
    FOR UPDATE USING (true);

CREATE POLICY "Allow public delete from cfw_app_handheld_compatibility" ON public.cfw_app_handheld_compatibility
    FOR DELETE USING (true);

CREATE POLICY "Allow public read access to cfw_app_firmware_compatibility" ON public.cfw_app_firmware_compatibility
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert to cfw_app_firmware_compatibility" ON public.cfw_app_firmware_compatibility
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update to cfw_app_firmware_compatibility" ON public.cfw_app_firmware_compatibility
    FOR UPDATE USING (true);

CREATE POLICY "Allow public delete from cfw_app_firmware_compatibility" ON public.cfw_app_firmware_compatibility
    FOR DELETE USING (true);

-- Insert sample compatibility data
-- First, let's get some CFW app IDs and handheld IDs to create relationships

-- Sample compatibility data for EmuDeck (assuming it exists)
INSERT INTO public.cfw_app_handheld_compatibility (cfw_app_id, handheld_id, status, compatibility_notes)
SELECT 
    ca.id as cfw_app_id,
    h.id as handheld_id,
    'compatible' as status,
    'Fully supported with automatic installation' as compatibility_notes
FROM public.cfw_apps ca
CROSS JOIN public.handhelds h
WHERE ca.name = 'EmuDeck' 
AND h.name IN ('Steam Deck', 'ROG Ally', 'Legion Go')
ON CONFLICT (cfw_app_id, handheld_id) DO NOTHING;

-- Sample compatibility data for RetroDECK
INSERT INTO public.cfw_app_handheld_compatibility (cfw_app_id, handheld_id, status, compatibility_notes)
SELECT 
    ca.id as cfw_app_id,
    h.id as handheld_id,
    'compatible' as status,
    'Works well as Flatpak application' as compatibility_notes
FROM public.cfw_apps ca
CROSS JOIN public.handhelds h
WHERE ca.name = 'RetroDECK' 
AND h.name IN ('Steam Deck', 'ROG Ally')
ON CONFLICT (cfw_app_id, handheld_id) DO NOTHING;

-- Sample compatibility data for Decky Loader
INSERT INTO public.cfw_app_handheld_compatibility (cfw_app_id, handheld_id, status, compatibility_notes)
SELECT 
    ca.id as cfw_app_id,
    h.id as handheld_id,
    'compatible' as status,
    'Plugin loader for Steam Deck interface' as compatibility_notes
FROM public.cfw_apps ca
CROSS JOIN public.handhelds h
WHERE ca.name = 'Decky Loader' 
AND h.name = 'Steam Deck'
ON CONFLICT (cfw_app_id, handheld_id) DO NOTHING;

-- Sample firmware compatibility data
INSERT INTO public.cfw_app_firmware_compatibility (cfw_app_id, custom_firmware_id, status, compatibility_notes)
SELECT 
    ca.id as cfw_app_id,
    cf.id as custom_firmware_id,
    'compatible' as status,
    'Works with SteamOS-based systems' as compatibility_notes
FROM public.cfw_apps ca
CROSS JOIN public.custom_firmware cf
WHERE ca.name IN ('EmuDeck', 'RetroDECK', 'Decky Loader')
AND cf.name IN ('SteamOS', 'HoloISO')
ON CONFLICT (cfw_app_id, custom_firmware_id) DO NOTHING;

-- Add sample OS records first to satisfy foreign key constraints
-- Insert sample OS records that custom firmware can reference
INSERT INTO public.os (id, name, slug, vendor, website, arch)
VALUES 
    ('a9fc8d99-56a9-4816-b3bd-1e20834c9c4b', 'Arch Linux', 'arch-linux', 'Arch Linux', 'https://archlinux.org/', 'x86'),
    ('b8ed7a88-67b8-5927-c4ce-2f31945d0d5c', 'Ubuntu', 'ubuntu', 'Canonical', 'https://ubuntu.com/', 'x86'),
    ('c7de6b77-78c9-6a38-d5df-3e42a56e1e6d', 'SteamOS Base', 'steamos-base', 'Valve Corporation', 'https://store.steampowered.com/steamos', 'x86')
ON CONFLICT (id) DO NOTHING;

-- Add some sample handhelds if they don't exist
INSERT INTO public.handhelds (name, slug, manufacturer, description, processor, ram, storage, screen_size, resolution, operating_system, price_range, release_date, image_url, official_website)
VALUES 
    ('Steam Deck', 'steam-deck', 'Valve', 'Handheld gaming PC running SteamOS', 'AMD APU', '16GB LPDDR5', '64GB/256GB/512GB', '7 inches', '1280x800', 'SteamOS 3.0', '$399-$649', '2022-02-25', '/placeholder.svg?height=200&width=300', 'https://store.steampowered.com/steamdeck'),
    ('ROG Ally', 'rog-ally', 'ASUS', 'Windows-based handheld gaming device', 'AMD Ryzen Z1', '16GB LPDDR5', '512GB SSD', '7 inches', '1920x1080', 'Windows 11', '$599-$699', '2023-06-13', '/placeholder.svg?height=200&width=300', 'https://rog.asus.com/gaming-handhelds/rog-ally/'),
    ('Legion Go', 'legion-go', 'Lenovo', 'Large screen Windows handheld with detachable controllers', 'AMD Ryzen Z1', '16GB LPDDR5', '512GB SSD', '8.8 inches', '2560x1600', 'Windows 11', '$699-$799', '2023-10-31', '/placeholder.svg?height=200&width=300', 'https://www.lenovo.com/us/en/p/laptops/legion-laptops/legion-go-series/legion-go/len101g0001')
ON CONFLICT (slug) DO NOTHING;

-- Add some sample custom firmware if they don't exist
INSERT INTO public.custom_firmware (id, name, slug, description, developers, website, repo_url, version, features, stability, installer_type, base_os)
VALUES 
    (gen_random_uuid(), 'SteamOS', 'steamos', 'Valve''s Linux-based gaming operating system', 'Valve Corporation', 'https://store.steampowered.com/steamos', 'https://github.com/ValveSoftware/SteamOS', '3.5', 'Gaming-focused Linux distribution with Steam integration', 'stable', 'official', 'c7de6b77-78c9-6a38-d5df-3e42a56e1e6d'),
    (gen_random_uuid(), 'HoloISO', 'holoiso', 'Unofficial SteamOS 3 (Holo) archiso configuration', 'Community', 'https://github.com/HoloISO/holoiso', 'https://github.com/HoloISO/holoiso', '4.5.1', 'SteamOS-like experience for other devices', 'beta', 'iso', 'a9fc8d99-56a9-4816-b3bd-1e20834c9c4b'),
    (gen_random_uuid(), 'ChimeraOS', 'chimera-os', 'Gaming-focused Linux distribution for handheld PCs', 'ChimeraOS Team', 'https://chimeraos.org/', 'https://github.com/ChimeraOS/chimeraos', '44', 'Console-like experience for PC handhelds', 'stable', 'iso', 'a9fc8d99-56a9-4816-b3bd-1e20834c9c4b')
ON CONFLICT (slug) DO NOTHING;

COMMENT ON TABLE public.cfw_app_handheld_compatibility IS 'Links CFW apps to compatible handheld devices';
COMMENT ON TABLE public.cfw_app_firmware_compatibility IS 'Links CFW apps to compatible custom firmware';
