-- Create device categories table
CREATE TABLE IF NOT EXISTS device_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create custom firmware options table
CREATE TABLE IF NOT EXISTS custom_firmware_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    website_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create retailers table
CREATE TABLE IF NOT EXISTS retailers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    website_url VARCHAR(500),
    logo_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create handhelds table with comprehensive specifications
CREATE TABLE IF NOT EXISTS handhelds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    manufacturer VARCHAR(100),
    price_range VARCHAR(50),
    release_date DATE,
    image_url VARCHAR(500),
    description TEXT,
    slug VARCHAR(200) NOT NULL UNIQUE,
    
    -- Display specifications
    screen_size VARCHAR(50),
    screen_type VARCHAR(100),
    resolution VARCHAR(50),
    refresh_rate VARCHAR(50),
    ppi INTEGER,
    aspect_ratio VARCHAR(20),
    
    -- Hardware specifications
    form_factor VARCHAR(100),
    cpu VARCHAR(200),
    cpu_clock_speed VARCHAR(50),
    cpu_cores INTEGER,
    gpu VARCHAR(200),
    ram VARCHAR(50),
    internal_storage VARCHAR(100),
    external_storage VARCHAR(200),
    os VARCHAR(100),
    cooling_system VARCHAR(200),
    
    -- Physical specifications
    build_material VARCHAR(200),
    dimensions VARCHAR(100),
    weight VARCHAR(50),
    battery_life VARCHAR(100),
    
    -- Controls and connectivity
    controls TEXT,
    joystick_layout VARCHAR(100),
    dpad_layout VARCHAR(100),
    shoulder_button_layout VARCHAR(100),
    ports TEXT[],
    charging VARCHAR(100),
    audio VARCHAR(200),
    connectivity_options TEXT[],
    
    -- Features
    key_features TEXT[],
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create junction table for handheld categories
CREATE TABLE IF NOT EXISTS handheld_device_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    handheld_id UUID NOT NULL REFERENCES handhelds(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES device_categories(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(handheld_id, category_id)
);

-- Create junction table for handheld custom firmware compatibility
CREATE TABLE IF NOT EXISTS handheld_custom_firmware (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    handheld_id UUID NOT NULL REFERENCES handhelds(id) ON DELETE CASCADE,
    firmware_id UUID NOT NULL REFERENCES custom_firmware_options(id) ON DELETE CASCADE,
    compatibility_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(handheld_id, firmware_id)
);

-- Create table for handheld emulation performance ratings
CREATE TABLE IF NOT EXISTS handheld_emulation_performance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    handheld_id UUID NOT NULL REFERENCES handhelds(id) ON DELETE CASCADE,
    console_id UUID NOT NULL REFERENCES consoles(id) ON DELETE CASCADE,
    performance_rating VARCHAR(20) CHECK (performance_rating IN ('excellent', 'good', 'fair', 'poor', 'unsupported')) DEFAULT 'fair',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(handheld_id, console_id)
);

-- Create table for handheld retailer information
CREATE TABLE IF NOT EXISTS handheld_retailers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    handheld_id UUID NOT NULL REFERENCES handhelds(id) ON DELETE CASCADE,
    retailer_id UUID NOT NULL REFERENCES retailers(id) ON DELETE CASCADE,
    product_url VARCHAR(500) NOT NULL,
    price VARCHAR(50),
    availability VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(handheld_id, retailer_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_handhelds_slug ON handhelds(slug);
CREATE INDEX IF NOT EXISTS idx_handhelds_manufacturer ON handhelds(manufacturer);
CREATE INDEX IF NOT EXISTS idx_handhelds_price_range ON handhelds(price_range);
CREATE INDEX IF NOT EXISTS idx_handheld_categories_handheld_id ON handheld_device_categories(handheld_id);
CREATE INDEX IF NOT EXISTS idx_handheld_categories_category_id ON handheld_device_categories(category_id);
CREATE INDEX IF NOT EXISTS idx_handheld_firmware_handheld_id ON handheld_custom_firmware(handheld_id);
CREATE INDEX IF NOT EXISTS idx_handheld_performance_handheld_id ON handheld_emulation_performance(handheld_id);
CREATE INDEX IF NOT EXISTS idx_handheld_performance_console_id ON handheld_emulation_performance(console_id);
CREATE INDEX IF NOT EXISTS idx_handheld_retailers_handheld_id ON handheld_retailers(handheld_id);

-- Insert sample device categories
INSERT INTO device_categories (name, description) VALUES
('Gaming Handheld', 'Dedicated portable gaming devices'),
('Steam Deck Compatible', 'Devices that can run Steam games natively'),
('Windows Handheld', 'Handhelds running Windows OS'),
('Linux Handheld', 'Handhelds running Linux-based OS'),
('High Performance', 'Premium gaming handhelds with powerful hardware'),
('Budget Friendly', 'Affordable gaming handheld options'),
('Retro Gaming', 'Devices optimized for retro game emulation')
ON CONFLICT (name) DO NOTHING;

-- Insert sample custom firmware options
INSERT INTO custom_firmware_options (name, description, website_url) VALUES
('SteamOS', 'Valve''s official gaming-focused Linux distribution', 'https://store.steampowered.com/steamos'),
('Bazzite', 'Fedora-based gaming OS with Steam Deck optimizations', 'https://bazzite.gg/'),
('ChimeraOS', 'Linux distribution for couch gaming', 'https://chimeraos.org/'),
('HoloISO', 'Unofficial SteamOS 3 for other devices', 'https://github.com/HoloISO/holoiso'),
('Batocera', 'Retro gaming focused Linux distribution', 'https://batocera.org/'),
('EmuDeck', 'Emulation setup tool for Steam Deck and other devices', 'https://www.emudeck.com/'),
('RetroDECK', 'All-in-one retro gaming solution', 'https://retrodeck.net/')
ON CONFLICT (name) DO NOTHING;

-- Insert sample retailers
INSERT INTO retailers (name, website_url, logo_url) VALUES
('Steam', 'https://store.steampowered.com/', '/placeholder.svg?height=40&width=120&text=Steam'),
('Amazon', 'https://amazon.com/', '/placeholder.svg?height=40&width=120&text=Amazon'),
('Best Buy', 'https://bestbuy.com/', '/placeholder.svg?height=40&width=120&text=Best+Buy'),
('Newegg', 'https://newegg.com/', '/placeholder.svg?height=40&width=120&text=Newegg'),
('GameStop', 'https://gamestop.com/', '/placeholder.svg?height=40&width=120&text=GameStop'),
('ASUS Store', 'https://store.asus.com/', '/placeholder.svg?height=40&width=120&text=ASUS'),
('Lenovo', 'https://lenovo.com/', '/placeholder.svg?height=40&width=120&text=Lenovo'),
('Ayaneo', 'https://ayaneo.com/', '/placeholder.svg?height=40&width=120&text=Ayaneo')
ON CONFLICT (name) DO NOTHING;

-- Insert sample handhelds with comprehensive specifications
INSERT INTO handhelds (
    name, manufacturer, price_range, release_date, image_url, description, slug,
    screen_size, screen_type, resolution, refresh_rate, ppi, aspect_ratio,
    form_factor, cpu, cpu_clock_speed, cpu_cores, gpu, ram, internal_storage, external_storage, os, cooling_system,
    build_material, dimensions, weight, battery_life,
    controls, joystick_layout, dpad_layout, shoulder_button_layout, ports, charging, audio, connectivity_options,
    key_features
) VALUES
(
    'Steam Deck', 'Valve', '$399-$649', '2022-02-25', '/placeholder.svg?height=300&width=400&text=Steam+Deck',
    'Valve''s powerful handheld gaming PC designed to run your Steam library on the go.',
    'steam-deck',
    '7"', 'LCD', '1280x800', '60Hz', 216, '16:10',
    'Handheld Gaming PC', 'AMD Zen 2 4c/8t', '2.4-3.5GHz', 4, 'AMD RDNA 2', '16GB LPDDR5', '64GB eMMC / 256GB NVMe / 512GB NVMe', 'MicroSD (up to 2TB)', 'SteamOS 3.0 (Arch Linux)', 'Active cooling with fan',
    'Polycarbonate body with anti-slip grips', '298mm x 117mm x 49mm', '669g', '2-8 hours',
    'Dual analog sticks, D-pad, ABXY buttons, dual trackpads, gyroscope', 'Asymmetrical', 'Traditional cross', 'L1/L2, R1/R2 with haptic feedback', ARRAY['USB-C', '3.5mm headphone jack', 'MicroSD slot'], 'USB-C PD', 'Stereo speakers, 3.5mm jack, Bluetooth audio', ARRAY['Wi-Fi 5', 'Bluetooth 5.0'],
    ARRAY['Trackpads for mouse control', 'Gyroscope for motion controls', 'Haptic feedback', 'Suspend/Resume', 'Desktop mode', 'Docked gaming support']
),
(
    'ASUS ROG Ally', 'ASUS', '$599-$699', '2023-06-13', '/placeholder.svg?height=300&width=400&text=ROG+Ally',
    'Windows-based gaming handheld with high-performance AMD Ryzen Z1 processor.',
    'asus-rog-ally',
    '7"', 'IPS LCD', '1920x1080', '120Hz', 314, '16:9',
    'Gaming Handheld', 'AMD Ryzen Z1 Extreme', '3.3-5.1GHz', 8, 'AMD RDNA 3', '16GB LPDDR5', '512GB PCIe 4.0 NVMe SSD', 'MicroSD (up to 2TB)', 'Windows 11 Home', 'Active cooling with dual fans',
    'Plastic construction with ergonomic grips', '280mm x 111mm x 21-32mm', '608g', '1.5-3 hours',
    'Dual analog sticks, D-pad, ABXY buttons, macro keys', 'Symmetrical', 'Traditional cross', 'L1/L2, R1/R2', ARRAY['USB-C', '3.5mm headphone jack', 'MicroSD slot', 'ROG XG Mobile port'], 'USB-C PD 65W', 'Dual speakers, 3.5mm jack, Bluetooth audio', ARRAY['Wi-Fi 6E', 'Bluetooth 5.2'],
    ARRAY['120Hz display', 'Windows compatibility', 'ROG XG Mobile eGPU support', 'Armoury Crate software', 'Variable refresh rate', 'AMD FreeSync Premium']
),
(
    'Lenovo Legion Go', 'Lenovo', '$699-$749', '2023-10-31', '/placeholder.svg?height=300&width=400&text=Legion+Go',
    'Large-screen Windows gaming handheld with detachable controllers.',
    'lenovo-legion-go',
    '8.8"', 'IPS LCD', '2560x1600', '144Hz', 342, '16:10',
    'Gaming Handheld with Detachable Controllers', 'AMD Ryzen Z1 Extreme', '3.3-5.1GHz', 8, 'AMD RDNA 3', '16GB LPDDR5X', '512GB PCIe 4.0 NVMe SSD', 'MicroSD (up to 2TB)', 'Windows 11 Home', 'Active cooling with dual fans',
    'Magnesium alloy frame with detachable controllers', '299mm x 131mm x 41mm', '854g', '1.5-2.5 hours',
    'Detachable controllers, dual analog sticks, D-pad, ABXY buttons', 'Asymmetrical (detachable)', 'Traditional cross', 'L1/L2, R1/R2', ARRAY['USB-C x2', '3.5mm headphone jack', 'MicroSD slot'], 'USB-C PD 65W', 'Dual 2W speakers, 3.5mm jack, Bluetooth audio', ARRAY['Wi-Fi 6E', 'Bluetooth 5.1'],
    ARRAY['Largest screen in category', 'Detachable controllers', '144Hz high refresh rate', 'Mouse mode for right controller', 'Kickstand included', 'Legion Space software']
),
(
    'Ayaneo 2S', 'Ayaneo', '$1049-$1399', '2023-03-01', '/placeholder.svg?height=300&width=400&text=Ayaneo+2S',
    'Premium Windows gaming handheld with flagship AMD Ryzen 7000 series processor.',
    'ayaneo-2s',
    '7"', 'IPS LCD', '1920x1200', '60Hz', 323, '16:10',
    'Premium Gaming Handheld', 'AMD Ryzen 7 7840U', '3.3-5.1GHz', 8, 'AMD Radeon 780M', '16GB/32GB LPDDR5', '512GB/1TB/2TB PCIe 4.0 NVMe SSD', 'MicroSD (up to 2TB)', 'Windows 11 Home', 'Active cooling with large fan',
    'CNC aluminum alloy body', '264mm x 105mm x 22mm', '680g', '2-4 hours',
    'Hall effect analog sticks, D-pad, ABXY buttons, RGB lighting', 'Asymmetrical', 'Traditional cross', 'L1/L2, R1/R2 with linear triggers', ARRAY['USB-C x2', '3.5mm headphone jack', 'MicroSD slot'], 'USB-C PD 65W', 'Dual speakers with DTS, 3.5mm jack, Bluetooth audio', ARRAY['Wi-Fi 6E', 'Bluetooth 5.2'],
    ARRAY['Hall effect sticks (no drift)', 'RGB lighting system', 'Premium build quality', 'High-end Ryzen 7000 series CPU', 'AyaSpace software', 'Multiple storage options']
)
ON CONFLICT (slug) DO NOTHING;

-- Get IDs for relationships (using CTEs for cleaner code)
WITH handheld_ids AS (
    SELECT id, slug FROM handhelds WHERE slug IN ('steam-deck', 'asus-rog-ally', 'lenovo-legion-go', 'ayaneo-2s')
),
category_ids AS (
    SELECT id, name FROM device_categories WHERE name IN ('Gaming Handheld', 'High Performance', 'Windows Handheld', 'Linux Handheld', 'Steam Deck Compatible')
),
firmware_ids AS (
    SELECT id, name FROM custom_firmware_options WHERE name IN ('SteamOS', 'Bazzite', 'ChimeraOS', 'EmuDeck')
),
retailer_ids AS (
    SELECT id, name FROM retailers WHERE name IN ('Steam', 'Amazon', 'Best Buy', 'ASUS Store', 'Lenovo', 'Ayaneo')
),
console_ids AS (
    SELECT id, slug FROM consoles WHERE slug IN ('nintendo-switch', 'playstation-4', 'xbox-one', 'nintendo-3ds', 'playstation-portable')
)

-- Insert handheld categories
INSERT INTO handheld_device_categories (handheld_id, category_id)
SELECT h.id, c.id FROM handheld_ids h, category_ids c
WHERE (h.slug = 'steam-deck' AND c.name IN ('Gaming Handheld', 'Linux Handheld', 'Steam Deck Compatible'))
   OR (h.slug = 'asus-rog-ally' AND c.name IN ('Gaming Handheld', 'High Performance', 'Windows Handheld'))
   OR (h.slug = 'lenovo-legion-go' AND c.name IN ('Gaming Handheld', 'High Performance', 'Windows Handheld'))
   OR (h.slug = 'ayaneo-2s' AND c.name IN ('Gaming Handheld', 'High Performance', 'Windows Handheld'))
ON CONFLICT (handheld_id, category_id) DO NOTHING;

-- Insert custom firmware compatibility
WITH handheld_ids AS (SELECT id, slug FROM handhelds),
     firmware_ids AS (SELECT id, name FROM custom_firmware_options)
INSERT INTO handheld_custom_firmware (handheld_id, firmware_id, compatibility_notes)
SELECT h.id, f.id, 
    CASE 
        WHEN h.slug = 'steam-deck' AND f.name = 'SteamOS' THEN 'Native OS - fully supported'
        WHEN h.slug = 'steam-deck' AND f.name = 'Bazzite' THEN 'Excellent compatibility with additional features'
        WHEN h.slug = 'steam-deck' AND f.name = 'ChimeraOS' THEN 'Good compatibility, alternative to SteamOS'
        WHEN h.slug = 'steam-deck' AND f.name = 'EmuDeck' THEN 'Perfect compatibility for retro gaming'
        WHEN h.slug IN ('asus-rog-ally', 'lenovo-legion-go', 'ayaneo-2s') AND f.name = 'Bazzite' THEN 'Good compatibility with some hardware-specific tweaks needed'
        WHEN h.slug IN ('asus-rog-ally', 'lenovo-legion-go', 'ayaneo-2s') AND f.name = 'ChimeraOS' THEN 'Basic compatibility, may require manual configuration'
        ELSE 'Compatibility varies, community support available'
    END
FROM handheld_ids h, firmware_ids f
WHERE (h.slug = 'steam-deck' AND f.name IN ('SteamOS', 'Bazzite', 'ChimeraOS', 'EmuDeck'))
   OR (h.slug IN ('asus-rog-ally', 'lenovo-legion-go', 'ayaneo-2s') AND f.name IN ('Bazzite', 'ChimeraOS'))
ON CONFLICT (handheld_id, firmware_id) DO NOTHING;

-- Insert emulation performance ratings
WITH handheld_ids AS (SELECT id, slug FROM handhelds),
     console_ids AS (SELECT id, slug FROM consoles)
INSERT INTO handheld_emulation_performance (handheld_id, console_id, performance_rating, notes)
SELECT h.id, c.id,
    CASE 
        WHEN h.slug = 'steam-deck' AND c.slug = 'nintendo-switch' THEN 'good'
        WHEN h.slug = 'steam-deck' AND c.slug = 'playstation-4' THEN 'fair'
        WHEN h.slug = 'steam-deck' AND c.slug = 'xbox-one' THEN 'fair'
        WHEN h.slug = 'steam-deck' AND c.slug = 'nintendo-3ds' THEN 'excellent'
        WHEN h.slug = 'steam-deck' AND c.slug = 'playstation-portable' THEN 'excellent'
        WHEN h.slug IN ('asus-rog-ally', 'lenovo-legion-go') AND c.slug = 'nintendo-switch' THEN 'excellent'
        WHEN h.slug IN ('asus-rog-ally', 'lenovo-legion-go') AND c.slug = 'playstation-4' THEN 'good'
        WHEN h.slug IN ('asus-rog-ally', 'lenovo-legion-go') AND c.slug = 'xbox-one' THEN 'good'
        WHEN h.slug IN ('asus-rog-ally', 'lenovo-legion-go') AND c.slug = 'nintendo-3ds' THEN 'excellent'
        WHEN h.slug IN ('asus-rog-ally', 'lenovo-legion-go') AND c.slug = 'playstation-portable' THEN 'excellent'
        WHEN h.slug = 'ayaneo-2s' AND c.slug = 'nintendo-switch' THEN 'excellent'
        WHEN h.slug = 'ayaneo-2s' AND c.slug = 'playstation-4' THEN 'excellent'
        WHEN h.slug = 'ayaneo-2s' AND c.slug = 'xbox-one' THEN 'good'
        WHEN h.slug = 'ayaneo-2s' AND c.slug = 'nintendo-3ds' THEN 'excellent'
        WHEN h.slug = 'ayaneo-2s' AND c.slug = 'playstation-portable' THEN 'excellent'
        ELSE 'fair'
    END,
    CASE 
        WHEN h.slug = 'steam-deck' THEN 'Performance varies by game complexity and optimization'
        WHEN h.slug IN ('asus-rog-ally', 'lenovo-legion-go') THEN 'Strong performance with Z1 Extreme processor'
        WHEN h.slug = 'ayaneo-2s' THEN 'Excellent performance with Ryzen 7000 series'
        ELSE 'Standard emulation performance'
    END
FROM handheld_ids h, console_ids c
ON CONFLICT (handheld_id, console_id) DO NOTHING;

-- Insert retailer information
WITH handheld_ids AS (SELECT id, slug FROM handhelds),
     retailer_ids AS (SELECT id, name FROM retailers)
INSERT INTO handheld_retailers (handheld_id, retailer_id, product_url, price, availability)
SELECT h.id, r.id,
    CASE 
        WHEN h.slug = 'steam-deck' AND r.name = 'Steam' THEN 'https://store.steampowered.com/steamdeck'
        WHEN h.slug = 'steam-deck' AND r.name = 'Amazon' THEN 'https://amazon.com/dp/steamdeck'
        WHEN h.slug = 'asus-rog-ally' AND r.name = 'ASUS Store' THEN 'https://store.asus.com/rog-ally'
        WHEN h.slug = 'asus-rog-ally' AND r.name = 'Best Buy' THEN 'https://bestbuy.com/asus-rog-ally'
        WHEN h.slug = 'lenovo-legion-go' AND r.name = 'Lenovo' THEN 'https://lenovo.com/legion-go'
        WHEN h.slug = 'lenovo-legion-go' AND r.name = 'Amazon' THEN 'https://amazon.com/dp/legion-go'
        WHEN h.slug = 'ayaneo-2s' AND r.name = 'Ayaneo' THEN 'https://ayaneo.com/ayaneo-2s'
        ELSE 'https://example.com/product'
    END,
    CASE 
        WHEN h.slug = 'steam-deck' AND r.name = 'Steam' THEN '$399'
        WHEN h.slug = 'steam-deck' AND r.name = 'Amazon' THEN '$449'
        WHEN h.slug = 'asus-rog-ally' AND r.name = 'ASUS Store' THEN '$599'
        WHEN h.slug = 'asus-rog-ally' AND r.name = 'Best Buy' THEN '$629'
        WHEN h.slug = 'lenovo-legion-go' AND r.name = 'Lenovo' THEN '$699'
        WHEN h.slug = 'lenovo-legion-go' AND r.name = 'Amazon' THEN '$729'
        WHEN h.slug = 'ayaneo-2s' AND r.name = 'Ayaneo' THEN '$1049'
        ELSE '$999'
    END,
    CASE 
        WHEN h.slug = 'steam-deck' THEN 'In Stock'
        WHEN h.slug = 'asus-rog-ally' THEN 'In Stock'
        WHEN h.slug = 'lenovo-legion-go' THEN 'Limited Stock'
        WHEN h.slug = 'ayaneo-2s' THEN 'Pre-order'
        ELSE 'Check Availability'
    END
FROM handheld_ids h, retailer_ids r
WHERE (h.slug = 'steam-deck' AND r.name IN ('Steam', 'Amazon'))
   OR (h.slug = 'asus-rog-ally' AND r.name IN ('ASUS Store', 'Best Buy'))
   OR (h.slug = 'lenovo-legion-go' AND r.name IN ('Lenovo', 'Amazon'))
   OR (h.slug = 'ayaneo-2s' AND r.name IN ('Ayaneo'))
ON CONFLICT (handheld_id, retailer_id) DO NOTHING;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_handhelds_updated_at BEFORE UPDATE ON handhelds
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
