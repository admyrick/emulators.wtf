-- Create tool_handheld_compatibility table for tool-handheld relationships
CREATE TABLE IF NOT EXISTS tool_handheld_compatibility (
  id SERIAL PRIMARY KEY,
  tool_id INTEGER NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  handheld_id INTEGER NOT NULL REFERENCES handhelds(id) ON DELETE CASCADE,
  compatibility_notes TEXT,
  status VARCHAR(20) DEFAULT 'compatible' CHECK (status IN ('compatible', 'partial', 'incompatible')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tool_id, handheld_id)
);

-- Add missing display_order column to links table
ALTER TABLE links ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Add missing columns to links table for better functionality
ALTER TABLE links ADD COLUMN IF NOT EXISTS is_primary BOOLEAN DEFAULT FALSE;
ALTER TABLE links ADD COLUMN IF NOT EXISTS name VARCHAR(255);

-- Update existing links to have proper names and display order
UPDATE links SET 
  name = COALESCE(title, 'Link'),
  display_order = id,
  is_primary = (link_type = 'download' OR link_type = 'official')
WHERE name IS NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tool_handheld_compatibility_tool_id ON tool_handheld_compatibility(tool_id);
CREATE INDEX IF NOT EXISTS idx_tool_handheld_compatibility_handheld_id ON tool_handheld_compatibility(handheld_id);
CREATE INDEX IF NOT EXISTS idx_links_display_order ON links(display_order);
CREATE INDEX IF NOT EXISTS idx_links_entity ON links(entity_type, entity_id);

-- Insert sample tool-handheld compatibility data
INSERT INTO tool_handheld_compatibility (tool_id, handheld_id, compatibility_notes, status) VALUES
-- Assuming some tools and handhelds exist, we'll add compatibility relationships
(1, 1, 'Works perfectly with default settings', 'compatible'),
(1, 2, 'Requires custom configuration', 'partial'),
(2, 1, 'Full compatibility with all features', 'compatible'),
(2, 3, 'Limited functionality due to hardware constraints', 'partial')
ON CONFLICT (tool_id, handheld_id) DO NOTHING;

-- Enable RLS for public read access
ALTER TABLE tool_handheld_compatibility ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Allow public read access to tool_handheld_compatibility" ON tool_handheld_compatibility
  FOR SELECT USING (true);

-- Grant necessary permissions
GRANT SELECT ON tool_handheld_compatibility TO anon, authenticated;
GRANT ALL ON tool_handheld_compatibility TO service_role;
