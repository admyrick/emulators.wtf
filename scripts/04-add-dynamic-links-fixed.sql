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
    c.id,
    COALESCE((url_item->>'name')::text, 'Link'),
    (url_item->>'url')::text,
    COALESCE((url_item->>'type')::text, 'general'),
    ROW_NUMBER() OVER (PARTITION BY c.id ORDER BY ordinality) - 1
FROM consoles c,
LATERAL jsonb_array_elements(COALESCE(c.urls, '[]'::jsonb)) WITH ORDINALITY AS url_data(url_item, ordinality)
WHERE (url_item->>'url') IS NOT NULL
ON CONFLICT DO NOTHING;

-- For emulators
INSERT INTO links (entity_type, entity_id, name, url, link_type, display_order)
SELECT 
    'emulator',
    e.id,
    COALESCE((url_item->>'name')::text, 'Link'),
    (url_item->>'url')::text,
    COALESCE((url_item->>'type')::text, 'general'),
    ROW_NUMBER() OVER (PARTITION BY e.id ORDER BY ordinality) - 1
FROM emulators e,
LATERAL jsonb_array_elements(COALESCE(e.urls, '[]'::jsonb)) WITH ORDINALITY AS url_data(url_item, ordinality)
WHERE (url_item->>'url') IS NOT NULL
ON CONFLICT DO NOTHING;

-- For games
INSERT INTO links (entity_type, entity_id, name, url, link_type, display_order)
SELECT 
    'game',
    g.id,
    COALESCE((url_item->>'name')::text, 'Link'),
    (url_item->>'url')::text,
    COALESCE((url_item->>'type')::text, 'general'),
    ROW_NUMBER() OVER (PARTITION BY g.id ORDER BY ordinality) - 1
FROM games g,
LATERAL jsonb_array_elements(COALESCE(g.urls, '[]'::jsonb)) WITH ORDINALITY AS url_data(url_item, ordinality)
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
LATERAL jsonb_array_elements(COALESCE(tools.urls, '[]'::jsonb)) WITH ORDINALITY AS url_data(url_item, ordinality)
WHERE (url_item->>'url') IS NOT NULL
ON CONFLICT DO NOTHING;
