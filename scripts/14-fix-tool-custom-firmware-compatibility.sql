-- Fix the tool_custom_firmware_compatibility table foreign key constraint
-- Drop the existing table with incorrect foreign key
DROP TABLE IF EXISTS tool_custom_firmware_compatibility CASCADE;

-- Recreate the table with correct foreign key references
CREATE TABLE tool_custom_firmware_compatibility (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
    custom_firmware_id UUID NOT NULL REFERENCES custom_firmware(id) ON DELETE CASCADE,
    compatibility_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tool_id, custom_firmware_id)
);

-- Create indexes for better performance
CREATE INDEX idx_tool_custom_firmware_compatibility_tool_id ON tool_custom_firmware_compatibility(tool_id);
CREATE INDEX idx_tool_custom_firmware_compatibility_custom_firmware_id ON tool_custom_firmware_compatibility(custom_firmware_id);

-- Enable RLS
ALTER TABLE tool_custom_firmware_compatibility ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow public read access" ON tool_custom_firmware_compatibility
    FOR SELECT USING (true);

CREATE POLICY "Allow authenticated insert" ON tool_custom_firmware_compatibility
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated update" ON tool_custom_firmware_compatibility
    FOR UPDATE USING (true);

CREATE POLICY "Allow authenticated delete" ON tool_custom_firmware_compatibility
    FOR DELETE USING (true);

-- Grant permissions
GRANT ALL ON tool_custom_firmware_compatibility TO authenticated;
GRANT SELECT ON tool_custom_firmware_compatibility TO anon;
