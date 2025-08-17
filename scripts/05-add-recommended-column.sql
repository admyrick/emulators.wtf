-- Add missing 'recommended' column to emulators table
-- This fixes the error: column emulators.recommended does not exist

-- Add the recommended column as a boolean with default false
ALTER TABLE emulators 
ADD COLUMN recommended BOOLEAN DEFAULT false;

-- Update some popular emulators to be recommended
UPDATE emulators 
SET recommended = true 
WHERE name IN (
    'RetroArch',
    'Dolphin',
    'PCSX2', 
    'PPSSPP',
    'Citra',
    'Yuzu',
    'RPCS3',
    'Xenia',
    'MAME',
    'Nestopia'
);

-- Add an index for better query performance on recommended emulators
CREATE INDEX IF NOT EXISTS idx_emulators_recommended ON emulators(recommended);

-- Add a comment to document the column
COMMENT ON COLUMN emulators.recommended IS 'Boolean flag indicating if this emulator is recommended/featured';
