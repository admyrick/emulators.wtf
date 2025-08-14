-- Add sample handheld data to resolve "Not found" errors
-- This script adds popular handheld gaming devices with realistic specifications

INSERT INTO handhelds (
    name, manufacturer, slug, description, image_url, price_range, screen_size, 
    cpu, ram, internal_storage, weight, dimensions, battery_life, os, 
    key_features, connectivity_options, form_factor, release_year, created_at, updated_at
) VALUES 
(
    'RG35XX SP', 'Anbernic', 'anbernic-rg35xx-sp',
    'A compact handheld gaming device with excellent build quality and retro gaming capabilities.',
    '/placeholder.svg?height=400&width=600',
    '$60-80', '3.5"', 'ARM Cortex-A53', '256MB', '64GB', '180g', '140×81×18mm',
    '4-6 hours', 'Linux', 
    ARRAY['Retro Gaming', 'Compact Design', 'Good Battery Life', 'Affordable'],
    ARRAY['USB-C', 'MicroSD', 'Headphone Jack'],
    'Clamshell', 2024, NOW(), NOW()
),
(
    '2S', 'Ayaneo', 'ayaneo-2s',
    'High-performance handheld PC with AMD Ryzen 7 processor and premium build quality.',
    '/placeholder.svg?height=400&width=600',
    '$800-1200', '7"', 'AMD Ryzen 7 7840U', '16GB-32GB', '512GB-2TB SSD', '720g', '264×105×40mm',
    '2-4 hours', 'Windows 11', 
    ARRAY['High Performance', 'Premium Build', 'Windows Gaming', 'RGB Lighting'],
    ARRAY['USB-C', 'USB-A', 'MicroSD', 'WiFi 6', 'Bluetooth 5.2'],
    'Handheld', 2023, NOW(), NOW()
),
(
    'Steam Deck OLED', 'Valve', 'steam-deck-oled',
    'Premium Steam Deck with OLED display, improved battery life, and enhanced performance.',
    '/placeholder.svg?height=400&width=600',
    '$549-649', '7.4" OLED', 'AMD APU', '16GB', '512GB-1TB SSD', '640g', '298×117×49mm',
    '3-12 hours', 'SteamOS', 
    ARRAY['OLED Display', 'Steam Library', 'Trackpads', 'Excellent Software'],
    ARRAY['USB-C', 'MicroSD', 'WiFi 6E', 'Bluetooth 5.3'],
    'Handheld', 2023, NOW(), NOW()
),
(
    'ROG Ally', 'ASUS', 'asus-rog-ally',
    'Windows-based handheld gaming PC with high refresh rate display and powerful AMD processor.',
    '/placeholder.svg?height=400&width=600',
    '$699-799', '7" 120Hz', 'AMD Ryzen Z1 Extreme', '16GB', '512GB SSD', '608g', '280×111×21mm',
    '1.5-2.5 hours', 'Windows 11', 
    ARRAY['120Hz Display', 'Windows Gaming', 'High Performance', 'Armoury Crate'],
    ARRAY['USB-C', 'MicroSD', 'WiFi 6E', 'Bluetooth 5.1'],
    'Handheld', 2023, NOW(), NOW()
),
(
    'Legion Go', 'Lenovo', 'lenovo-legion-go',
    'Large-screen handheld gaming PC with detachable controllers and versatile design.',
    '/placeholder.svg?height=400&width=600',
    '$699-799', '8.8" 144Hz', 'AMD Ryzen Z1 Extreme', '16GB', '512GB-1TB SSD', '854g', '299×131×41mm',
    '1.5-2.5 hours', 'Windows 11', 
    ARRAY['Large Display', 'Detachable Controllers', '144Hz Screen', 'FPS Mode'],
    ARRAY['USB-C', 'USB-A', 'MicroSD', 'WiFi 6E', 'Bluetooth 5.1'],
    'Handheld', 2023, NOW(), NOW()
)
ON CONFLICT (slug) DO NOTHING;

-- Verify the data was inserted
SELECT name, slug, manufacturer, price_range FROM handhelds ORDER BY created_at DESC LIMIT 10;
