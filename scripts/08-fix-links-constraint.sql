-- Update the links table constraint to include 'handheld' as a valid entity type
ALTER TABLE links DROP CONSTRAINT IF EXISTS links_entity_type_check;

ALTER TABLE links ADD CONSTRAINT links_entity_type_check 
CHECK (entity_type IN ('console', 'emulator', 'game', 'tool', 'custom_firmware', 'handheld', 'cfw_app'));

-- Verify the constraint was updated
SELECT conname, consrc 
FROM pg_constraint 
WHERE conname = 'links_entity_type_check';
