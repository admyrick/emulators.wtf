-- Add tool compatibility relationships
-- This script creates tables to link tools with consoles, emulators, games, handhelds, and custom firmware

-- Tool-Console compatibility
CREATE TABLE IF NOT EXISTS tool_console_compatibility (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
    console_id UUID NOT NULL REFERENCES consoles(id) ON DELETE CASCADE,
    compatibility_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tool_id, console_id)
);

-- Tool-Emulator compatibility
CREATE TABLE IF NOT EXISTS tool_emulator_compatibility (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
    emulator_id UUID NOT NULL REFERENCES emulators(id) ON DELETE CASCADE,
    compatibility_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tool_id, emulator_id)
);

-- Tool-Game compatibility
CREATE TABLE IF NOT EXISTS tool_game_compatibility (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
    game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    compatibility_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tool_id, game_id)
);

-- Tool-Handheld compatibility
CREATE TABLE IF NOT EXISTS tool_handheld_compatibility (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
    handheld_id UUID NOT NULL REFERENCES handhelds(id) ON DELETE CASCADE,
    compatibility_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tool_id, handheld_id)
);

-- Tool-Custom Firmware compatibility
CREATE TABLE IF NOT EXISTS tool_custom_firmware_compatibility (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tool_id UUID NOT NULL REFERENCES custom_firmware(id) ON DELETE CASCADE,
    custom_firmware_id UUID NOT NULL REFERENCES custom_firmware(id) ON DELETE CASCADE,
    compatibility_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tool_id, custom_firmware_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tool_console_compatibility_tool_id ON tool_console_compatibility(tool_id);
CREATE INDEX IF NOT EXISTS idx_tool_console_compatibility_console_id ON tool_console_compatibility(console_id);
CREATE INDEX IF NOT EXISTS idx_tool_emulator_compatibility_tool_id ON tool_emulator_compatibility(tool_id);
CREATE INDEX IF NOT EXISTS idx_tool_emulator_compatibility_emulator_id ON tool_emulator_compatibility(emulator_id);
CREATE INDEX IF NOT EXISTS idx_tool_game_compatibility_tool_id ON tool_game_compatibility(tool_id);
CREATE INDEX IF NOT EXISTS idx_tool_game_compatibility_game_id ON tool_game_compatibility(game_id);
CREATE INDEX IF NOT EXISTS idx_tool_handheld_compatibility_tool_id ON tool_handheld_compatibility(tool_id);
CREATE INDEX IF NOT EXISTS idx_tool_handheld_compatibility_handheld_id ON tool_handheld_compatibility(handheld_id);
CREATE INDEX IF NOT EXISTS idx_tool_custom_firmware_compatibility_tool_id ON tool_custom_firmware_compatibility(tool_id);
CREATE INDEX IF NOT EXISTS idx_tool_custom_firmware_compatibility_custom_firmware_id ON tool_custom_firmware_compatibility(custom_firmware_id);

-- Enable RLS
ALTER TABLE tool_console_compatibility ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_emulator_compatibility ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_game_compatibility ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_handheld_compatibility ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_custom_firmware_compatibility ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allow all operations for now, can be restricted later)
CREATE POLICY "Allow all operations on tool_console_compatibility" ON tool_console_compatibility FOR ALL USING (true);
CREATE POLICY "Allow all operations on tool_emulator_compatibility" ON tool_emulator_compatibility FOR ALL USING (true);
CREATE POLICY "Allow all operations on tool_game_compatibility" ON tool_game_compatibility FOR ALL USING (true);
CREATE POLICY "Allow all operations on tool_handheld_compatibility" ON tool_handheld_compatibility FOR ALL USING (true);
CREATE POLICY "Allow all operations on tool_custom_firmware_compatibility" ON tool_custom_firmware_compatibility FOR ALL USING (true);
