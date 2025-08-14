-- Add a dedicated links table for better structure and flexibility
CREATE TABLE IF NOT EXISTS links (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    entity_type TEXT NOT NULL CHECK (entity_type IN ('console', 'emulator', 'game', 'tool')),
    entity_id UUID NOT NULL,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    description TEXT,
    link_type TEXT DEFAULT 'general' CHECK (link_type IN ('download', 'official', 'documentation', 'forum', 'wiki', 'source', 'general')),
    is_primary BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_links_entity ON links(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_links_type ON links(link_type);
CREATE INDEX IF NOT EXISTS idx_links_primary ON links(is_primary) WHERE is_primary = true;

-- Enable Row Level Security
ALTER TABLE links ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public read access" ON links FOR SELECT USING (true);
CREATE POLICY "Service role can manage links" ON links FOR ALL USING (auth.role() = 'service_role');

-- Migrate existing URLs from JSONB to links table
-- For consoles
INSERT INTO links (entity_type, entity_id, name, url, link_type, display_order)
SELECT 
    'console',
    consoles.id,
    COALESCE((url_item->>'name')::text, 'Link'),
    (url_item->>'url')::text,
    COALESCE((url_item->>'type')::text, 'general'),
    ROW_NUMBER() OVER (PARTITION BY consoles.id ORDER BY ordinality) - 1
FROM consoles,
LATERAL jsonb_array_elements(COALESCE(consoles.urls, '[]'::jsonb)) WITH ORDINALITY AS console_urls(url_item, ordinality)
WHERE (url_item->>'url') IS NOT NULL
ON CONFLICT DO NOTHING;

-- For emulators
INSERT INTO links (entity_type, entity_id, name, url, link_type, display_order)
SELECT 
    'emulator',
    emulators.id,
    COALESCE((url_item->>'name')::text, 'Link'),
    (url_item->>'url')::text,
    COALESCE((url_item->>'type')::text, 'general'),
    ROW_NUMBER() OVER (PARTITION BY emulators.id ORDER BY ordinality) - 1
FROM emulators,
LATERAL jsonb_array_elements(COALESCE(emulators.urls, '[]'::jsonb)) WITH ORDINALITY AS emulator_urls(url_item, ordinality)
WHERE (url_item->>'url') IS NOT NULL
ON CONFLICT DO NOTHING;

-- For games
INSERT INTO links (entity_type, entity_id, name, url, link_type, display_order)
SELECT 
    'game',
    games.id,
    COALESCE((url_item->>'name')::text, 'Link'),
    (url_item->>'url')::text,
    COALESCE((url_item->>'type')::text, 'general'),
    ROW_NUMBER() OVER (PARTITION BY games.id ORDER BY ordinality) - 1
FROM games,
LATERAL jsonb_array_elements(COALESCE(games.urls, '[]'::jsonb)) WITH ORDINALITY AS game_urls(url_item, ordinality)
WHERE (url_item->>'url') IS NOT NULL
ON CONFLICT DO NOTHING;

-- For tools
INSERT INTO links (entity_type, entity_id, name, url, link_type, display_order)
SELECT 
    'tool',
    tools.id,
    COALESCE((url_item->>'name')::text, 'Link'),
    (url_item->>'url')::text,
    COALESCE((url_item->>'type')::text, 'general'),
    ROW_NUMBER() OVER (PARTITION BY tools.id ORDER BY ordinality) - 1
FROM tools,
LATERAL jsonb_array_elements(COALESCE(tools.urls, '[]'::jsonb)) WITH ORDINALITY AS tool_urls(url_item, ordinality)
WHERE (url_item->>'url') IS NOT NULL
ON CONFLICT DO NOTHING;
