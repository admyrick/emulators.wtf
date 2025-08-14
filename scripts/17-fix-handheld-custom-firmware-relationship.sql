-- Create handheld_custom_firmware junction table if it doesn't exist
CREATE TABLE IF NOT EXISTS handheld_custom_firmware (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    handheld_id UUID NOT NULL REFERENCES handhelds(id) ON DELETE CASCADE,
    custom_firmware_id UUID NOT NULL REFERENCES custom_firmware(id) ON DELETE CASCADE,
    compatibility_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(handheld_id, custom_firmware_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_handheld_custom_firmware_handheld_id ON handheld_custom_firmware(handheld_id);
CREATE INDEX IF NOT EXISTS idx_handheld_custom_firmware_custom_firmware_id ON handheld_custom_firmware(custom_firmware_id);

-- Enable RLS
ALTER TABLE handheld_custom_firmware ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "handheld_custom_firmware_select_policy" ON handheld_custom_firmware FOR SELECT USING (true);
CREATE POLICY "handheld_custom_firmware_insert_policy" ON handheld_custom_firmware FOR INSERT WITH CHECK (true);
CREATE POLICY "handheld_custom_firmware_update_policy" ON handheld_custom_firmware FOR UPDATE USING (true);
CREATE POLICY "handheld_custom_firmware_delete_policy" ON handheld_custom_firmware FOR DELETE USING (true);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_handheld_custom_firmware_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handheld_custom_firmware_updated_at
    BEFORE UPDATE ON handheld_custom_firmware
    FOR EACH ROW
    EXECUTE FUNCTION update_handheld_custom_firmware_updated_at();

-- Grant permissions
GRANT ALL ON handheld_custom_firmware TO authenticated;
GRANT ALL ON handheld_custom_firmware TO anon;
