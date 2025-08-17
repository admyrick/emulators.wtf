-- Adding comprehensive sample data for handhelds and custom firmware

-- Insert sample handhelds
INSERT INTO handhelds (
  name, slug, manufacturer, description, price_range, release_date,
  screen_size, processor, ram, storage, battery_life, weight, dimensions,
  operating_system, connectivity, supported_formats, official_website, image_url
) VALUES 
(
  'Steam Deck OLED', 'steam-deck-oled', 'Valve',
  'Premium handheld gaming PC with OLED display and improved battery life',
  '$549-$649', '2023-11-16',
  '7.4" OLED', 'AMD APU', '16GB LPDDR5', '512GB/1TB NVMe SSD',
  '3-12 hours', '640g', '298 × 117 × 49mm',
  'SteamOS 3.0', ARRAY['Wi-Fi 6E', 'Bluetooth 5.3', 'USB-C'],
  ARRAY['Steam games', 'Windows games', 'Emulation'],
  'https://store.steampowered.com/steamdeck',
  '/placeholder.svg?height=300&width=400'
),
(
  'ASUS ROG Ally', 'asus-rog-ally', 'ASUS',
  'Windows-based handheld gaming device with high-performance AMD processor',
  '$599-$699', '2023-06-13',
  '7" IPS', 'AMD Ryzen Z1 Extreme', '16GB LPDDR5', '512GB NVMe SSD',
  '1-3 hours', '608g', '280 × 111 × 21.2mm',
  'Windows 11', ARRAY['Wi-Fi 6E', 'Bluetooth 5.2', 'USB-C', 'microSD'],
  ARRAY['Steam games', 'Xbox Game Pass', 'Epic Games', 'Emulation'],
  'https://rog.asus.com/gaming-handhelds/rog-ally/',
  '/placeholder.svg?height=300&width=400'
),
(
  'Anbernic RG35XX SP', 'anbernic-rg35xx-sp', 'Anbernic',
  'Retro gaming handheld with Game Boy SP form factor and excellent emulation',
  '$59-$79', '2024-01-15',
  '3.5" IPS', 'Unisoc Tiger T606', '1GB RAM', '64GB eMMC + microSD',
  '4-6 hours', '180g', '84 × 81 × 24mm',
  'Linux', ARRAY['Wi-Fi', 'Bluetooth', 'USB-C'],
  ARRAY['GB/GBC', 'GBA', 'NES', 'SNES', 'Genesis', 'PS1'],
  'https://anbernic.com/products/rg35xx-sp',
  '/placeholder.svg?height=300&width=400'
),
(
  'AYN Odin 2', 'ayn-odin-2', 'AYN',
  'High-end Android gaming handheld with flagship Snapdragon processor',
  '$399-$599', '2024-03-20',
  '6" AMOLED', 'Snapdragon 8 Gen 2', '8-12GB RAM', '128-512GB UFS',
  '4-8 hours', '420g', '225 × 89 × 15mm',
  'Android 13', ARRAY['Wi-Fi 6', 'Bluetooth 5.3', 'USB-C', '5G'],
  ARRAY['Android games', 'Steam Link', 'Emulation', 'Cloud gaming'],
  'https://www.ayn.hk/products/odin2',
  '/placeholder.svg?height=300&width=400'
)
ON CONFLICT (slug) DO NOTHING;

-- Insert sample custom firmware
INSERT INTO custom_firmware (
  name, slug, description, version, download_url, compatibility,
  documentation_url, source_code_url, license, installation_difficulty,
  features, requirements, release_date, image_url
) VALUES 
(
  'EmuDeck', 'emudeck', 'All-in-one emulation setup tool for Steam Deck and other handhelds',
  '2.3.0', 'https://www.emudeck.com/EmuDeck.desktop',
  ARRAY['Steam Deck', 'ROG Ally', 'Legion Go'],
  'https://emudeck.github.io/', 'https://github.com/dragoonDorise/EmuDeck',
  'GPL-3.0', 'Easy',
  ARRAY['Automatic emulator installation', 'ROM management', 'Controller configs', 'Bezels and shaders'],
  ARRAY['Steam Deck or compatible handheld', '64GB+ storage', 'Internet connection'],
  '2024-01-15',
  '/placeholder.svg?height=200&width=300'
),
(
  'RetroDECK', 'retrodeck', 'Flatpak-based retro gaming distribution for Steam Deck',
  '0.8.0b', 'https://flathub.org/apps/net.retrodeck.retrodeck',
  ARRAY['Steam Deck', 'Linux PC'],
  'https://retrodeck.readthedocs.io/', 'https://github.com/XargonWan/RetroDECK',
  'GPL-3.0', 'Medium',
  ARRAY['Flatpak distribution', 'Sandboxed emulation', 'Steam integration', 'Cloud saves'],
  ARRAY['Steam Deck', 'Flatpak support', '32GB+ storage'],
  '2024-02-10',
  '/placeholder.svg?height=200&width=300'
),
(
  'Batocera', 'batocera', 'Complete retro gaming OS for various handheld devices',
  '39', 'https://batocera.org/download',
  ARRAY['Steam Deck', 'ROG Ally', 'Generic x86'],
  'https://wiki.batocera.org/', 'https://github.com/batocera-linux/batocera.linux',
  'GPL-2.0', 'Hard',
  ARRAY['Complete OS replacement', '150+ emulators', 'Kodi integration', 'Netplay support'],
  ARRAY['Compatible handheld', 'USB drive for installation', 'Basic Linux knowledge'],
  '2024-01-28',
  '/placeholder.svg?height=200&width=300'
),
(
  'ChimeraOS', 'chimera-os', 'Gaming-focused Linux distribution for handheld PCs',
  '44', 'https://chimeraos.org/download',
  ARRAY['Steam Deck', 'ROG Ally', 'Legion Go', 'Generic x86'],
  'https://chimeraos.org/docs/', 'https://github.com/ChimeraOS/chimeraos',
  'MIT', 'Hard',
  ARRAY['Steam-like interface', 'Game mode optimization', 'Multiple store support', 'Remote play'],
  ARRAY['Compatible handheld PC', '64GB+ storage', 'Installation media'],
  '2024-02-05',
  '/placeholder.svg?height=200&width=300'
)
ON CONFLICT (slug) DO NOTHING;

-- Verify data was inserted
SELECT 'Handhelds inserted:' as info, COUNT(*) as count FROM handhelds;
SELECT 'Custom firmware inserted:' as info, COUNT(*) as count FROM custom_firmware;
