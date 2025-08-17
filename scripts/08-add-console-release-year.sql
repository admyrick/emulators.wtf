-- Add missing release_year column to consoles table
ALTER TABLE consoles ADD COLUMN IF NOT EXISTS release_year INTEGER;

-- Update existing consoles with release years
UPDATE consoles SET release_year = 1985 WHERE name ILIKE '%nintendo%' AND name ILIKE '%entertainment%';
UPDATE consoles SET release_year = 1990 WHERE name ILIKE '%super nintendo%' OR name ILIKE '%snes%';
UPDATE consoles SET release_year = 1996 WHERE name ILIKE '%nintendo 64%' OR name ILIKE '%n64%';
UPDATE consoles SET release_year = 2001 WHERE name ILIKE '%gamecube%';
UPDATE consoles SET release_year = 2006 WHERE name ILIKE '%wii%' AND NOT name ILIKE '%wii u%';
UPDATE consoles SET release_year = 2012 WHERE name ILIKE '%wii u%';
UPDATE consoles SET release_year = 2017 WHERE name ILIKE '%nintendo switch%' OR name ILIKE '%switch%';

UPDATE consoles SET release_year = 1989 WHERE name ILIKE '%genesis%' OR name ILIKE '%mega drive%';
UPDATE consoles SET release_year = 1994 WHERE name ILIKE '%saturn%';
UPDATE consoles SET release_year = 1998 WHERE name ILIKE '%dreamcast%';

UPDATE consoles SET release_year = 1995 WHERE name ILIKE '%playstation%' AND NOT name ILIKE '%playstation 2%' AND NOT name ILIKE '%playstation 3%' AND NOT name ILIKE '%playstation 4%' AND NOT name ILIKE '%playstation 5%';
UPDATE consoles SET release_year = 2000 WHERE name ILIKE '%playstation 2%' OR name ILIKE '%ps2%';
UPDATE consoles SET release_year = 2006 WHERE name ILIKE '%playstation 3%' OR name ILIKE '%ps3%';
UPDATE consoles SET release_year = 2013 WHERE name ILIKE '%playstation 4%' OR name ILIKE '%ps4%';
UPDATE consoles SET release_year = 2020 WHERE name ILIKE '%playstation 5%' OR name ILIKE '%ps5%';

UPDATE consoles SET release_year = 2001 WHERE name ILIKE '%xbox%' AND NOT name ILIKE '%xbox 360%' AND NOT name ILIKE '%xbox one%' AND NOT name ILIKE '%xbox series%';
UPDATE consoles SET release_year = 2005 WHERE name ILIKE '%xbox 360%';
UPDATE consoles SET release_year = 2013 WHERE name ILIKE '%xbox one%';
UPDATE consoles SET release_year = 2020 WHERE name ILIKE '%xbox series%';

-- Add index for better performance when ordering by release_year
CREATE INDEX IF NOT EXISTS idx_consoles_release_year ON consoles(release_year);

-- Insert sample consoles if table is empty
INSERT INTO consoles (name, manufacturer, release_year, description, slug, image_url) 
SELECT * FROM (VALUES
    ('Nintendo Entertainment System', 'Nintendo', 1985, 'The iconic 8-bit console that revitalized the video game industry in North America.', 'nintendo-entertainment-system', '/placeholder.svg?height=200&width=300'),
    ('Super Nintendo Entertainment System', 'Nintendo', 1990, 'Nintendo''s 16-bit powerhouse featuring advanced graphics and sound capabilities.', 'super-nintendo-entertainment-system', '/placeholder.svg?height=200&width=300'),
    ('Nintendo 64', 'Nintendo', 1996, 'Revolutionary 64-bit console with analog stick and 3D graphics capabilities.', 'nintendo-64', '/placeholder.svg?height=200&width=300'),
    ('PlayStation', 'Sony', 1995, 'Sony''s entry into gaming with CD-ROM technology and 3D graphics.', 'playstation', '/placeholder.svg?height=200&width=300'),
    ('PlayStation 2', 'Sony', 2000, 'The best-selling video game console of all time with DVD playback.', 'playstation-2', '/placeholder.svg?height=200&width=300'),
    ('Xbox', 'Microsoft', 2001, 'Microsoft''s first gaming console featuring built-in hard drive and Ethernet.', 'xbox', '/placeholder.svg?height=200&width=300')
) AS v(name, manufacturer, release_year, description, slug, image_url)
WHERE NOT EXISTS (SELECT 1 FROM consoles LIMIT 1);
