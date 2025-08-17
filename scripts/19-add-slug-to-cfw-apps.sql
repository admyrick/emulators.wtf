-- Add slug column to cfw_apps table and populate with generated slugs

-- Add the slug column
ALTER TABLE cfw_apps ADD COLUMN IF NOT EXISTS slug text;

-- Create a function to generate slugs from names
CREATE OR REPLACE FUNCTION generate_slug(input_text text)
RETURNS text AS $$
BEGIN
  RETURN lower(
    regexp_replace(
      regexp_replace(
        regexp_replace(input_text, '[^a-zA-Z0-9\s-]', '', 'g'),
        '\s+', '-', 'g'
      ),
      '-+', '-', 'g'
    )
  );
END;
$$ LANGUAGE plpgsql;

-- Update existing records to have slugs based on their names
UPDATE cfw_apps 
SET slug = generate_slug(name) 
WHERE slug IS NULL AND name IS NOT NULL;

-- Add unique constraint to slug column
ALTER TABLE cfw_apps ADD CONSTRAINT cfw_apps_slug_unique UNIQUE (slug);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_cfw_apps_slug ON cfw_apps(slug);

-- Add some sample data if the table is empty
INSERT INTO cfw_apps (id, name, slug, description, website, repo_url, latest_version, cfw_id, created_at)
SELECT 
  gen_random_uuid(),
  'EmuDeck',
  'emudeck',
  'Complete emulation solution for Steam Deck',
  'https://www.emudeck.com',
  'https://github.com/dragoonDorise/EmuDeck',
  '2.1.1',
  (SELECT id FROM custom_firmware WHERE slug = 'steamos' LIMIT 1),
  now()
WHERE NOT EXISTS (SELECT 1 FROM cfw_apps WHERE slug = 'emudeck')
AND EXISTS (SELECT 1 FROM custom_firmware WHERE slug = 'steamos');

INSERT INTO cfw_apps (id, name, slug, description, website, repo_url, latest_version, cfw_id, created_at)
SELECT 
  gen_random_uuid(),
  'RetroDECK',
  'retrodeck',
  'All-in-one retro gaming application for Steam Deck',
  'https://retrodeck.net',
  'https://github.com/XargonWan/RetroDECK',
  '0.8.0b',
  (SELECT id FROM custom_firmware WHERE slug = 'steamos' LIMIT 1),
  now()
WHERE NOT EXISTS (SELECT 1 FROM cfw_apps WHERE slug = 'retrodeck')
AND EXISTS (SELECT 1 FROM custom_firmware WHERE slug = 'steamos');

INSERT INTO cfw_apps (id, name, slug, description, website, repo_url, latest_version, cfw_id, created_at)
SELECT 
  gen_random_uuid(),
  'Decky Loader',
  'decky-loader',
  'Plugin loader for Steam Deck',
  'https://decky.xyz',
  'https://github.com/SteamDeckHomebrew/decky-loader',
  '2.10.3',
  (SELECT id FROM custom_firmware WHERE slug = 'steamos' LIMIT 1),
  now()
WHERE NOT EXISTS (SELECT 1 FROM cfw_apps WHERE slug = 'decky-loader')
AND EXISTS (SELECT 1 FROM custom_firmware WHERE slug = 'steamos');

-- Drop the helper function
DROP FUNCTION IF EXISTS generate_slug(text);

-- Enable RLS and create policies for public access
ALTER TABLE cfw_apps ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "cfw_apps_select_policy" ON cfw_apps;
DROP POLICY IF EXISTS "cfw_apps_insert_policy" ON cfw_apps;
DROP POLICY IF EXISTS "cfw_apps_update_policy" ON cfw_apps;
DROP POLICY IF EXISTS "cfw_apps_delete_policy" ON cfw_apps;

-- Create permissive policies for all operations
CREATE POLICY "cfw_apps_select_policy" ON cfw_apps FOR SELECT USING (true);
CREATE POLICY "cfw_apps_insert_policy" ON cfw_apps FOR INSERT WITH CHECK (true);
CREATE POLICY "cfw_apps_update_policy" ON cfw_apps FOR UPDATE USING (true);
CREATE POLICY "cfw_apps_delete_policy" ON cfw_apps FOR DELETE USING (true);
