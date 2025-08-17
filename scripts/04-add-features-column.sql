-- Add missing features column to emulators table
-- This fixes the error: column emulators.features does not exist

-- Add features column as TEXT array to store emulator features
ALTER TABLE emulators 
ADD COLUMN IF NOT EXISTS features TEXT[];

-- Add some sample features to existing emulators
UPDATE emulators SET features = ARRAY['High Accuracy', 'Save States', 'Cheats Support'] WHERE name = 'PCSX2';
UPDATE emulators SET features = ARRAY['Netplay', 'Shaders', 'Rewind'] WHERE name = 'RetroArch';
UPDATE emulators SET features = ARRAY['High Compatibility', 'Custom Controls', 'HD Graphics'] WHERE name = 'Dolphin';
UPDATE emulators SET features = ARRAY['Cycle Accurate', 'MSU-1 Support', 'Widescreen'] WHERE name = 'bsnes';
UPDATE emulators SET features = ARRAY['Link Cable Support', 'Custom Palettes', 'Fast Forward'] WHERE name = 'mGBA';
UPDATE emulators SET features = ARRAY['Texture Packs', 'Widescreen Hacks', 'Anti-Aliasing'] WHERE name = 'Mupen64Plus';
UPDATE emulators SET features = ARRAY['High Performance', 'Vulkan Support', 'Custom Shaders'] WHERE name = 'RPCS3';
UPDATE emulators SET features = ARRAY['Accurate Emulation', 'Debug Tools', 'Custom Audio'] WHERE name = 'Mednafen';

-- Set default empty array for any emulators without features
UPDATE emulators SET features = ARRAY[]::TEXT[] WHERE features IS NULL;

-- Add index for better query performance on features
CREATE INDEX IF NOT EXISTS idx_emulators_features ON emulators USING GIN (features);

-- Add comment to document the column
COMMENT ON COLUMN emulators.features IS 'Array of emulator features and capabilities';
