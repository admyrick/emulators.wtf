-- Insert sample consoles
INSERT INTO consoles (name, manufacturer, release_year, description, slug, image_url) VALUES
('Nintendo Entertainment System', 'Nintendo', 1985, 'The Nintendo Entertainment System (NES) is an 8-bit third-generation home video game console produced by Nintendo.', 'nes', '/placeholder.svg?height=200&width=300'),
('Super Nintendo Entertainment System', 'Nintendo', 1990, 'The Super Nintendo Entertainment System (SNES) is a 16-bit home video game console developed by Nintendo.', 'snes', '/placeholder.svg?height=200&width=300'),
('Sega Genesis', 'Sega', 1988, 'The Sega Genesis is a 16-bit fourth-generation home video game console developed and sold by Sega.', 'genesis', '/placeholder.svg?height=200&width=300')
ON CONFLICT (slug) DO NOTHING;

-- Insert sample emulators
INSERT INTO emulators (name, developer, description, supported_platforms, console_ids, features, slug, recommended, image_url) VALUES
('Nestopia', 'Martin Freij', 'A portable NES/Famicom emulator written in C++.', ARRAY['Windows', 'macOS', 'Linux'], ARRAY[(SELECT id FROM consoles WHERE slug = 'nes')], ARRAY['Save States', 'Netplay', 'Video Recording'], 'nestopia', true, '/placeholder.svg?height=200&width=300'),
('Snes9x', 'Snes9x Team', 'A portable Super Nintendo Entertainment System emulator.', ARRAY['Windows', 'macOS', 'Linux', 'Android'], ARRAY[(SELECT id FROM consoles WHERE slug = 'snes')], ARRAY['Save States', 'Cheats', 'Netplay'], 'snes9x', true, '/placeholder.svg?height=200&width=300')
ON CONFLICT (slug) DO NOTHING;
