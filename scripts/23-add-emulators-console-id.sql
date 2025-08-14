-- 23-add-emulators-console-id.sql
-- Adds a single-console foreign key column to emulators for fast filtering.
-- Safe to run multiple times.

-- 1) Add the column if it does not exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'emulators'
      AND column_name = 'console_id'
  ) THEN
    ALTER TABLE emulators ADD COLUMN console_id UUID;
  END IF;
END
$$;

-- 2) Add the foreign key constraint if it does not exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE table_name = 'emulators'
      AND constraint_type = 'FOREIGN KEY'
      AND constraint_name = 'emulators_console_id_fkey'
  ) THEN
    ALTER TABLE emulators
      ADD CONSTRAINT emulators_console_id_fkey
      FOREIGN KEY (console_id)
      REFERENCES consoles(id)
      ON DELETE SET NULL;
  END IF;
END
$$;

-- 3) Create an index for faster filtering
CREATE INDEX IF NOT EXISTS idx_emulators_console_id ON emulators(console_id);

-- 4) Backfill console_id from the existing console_ids array (first element)
UPDATE emulators
SET console_id = console_ids[1]
WHERE console_id IS NULL
  AND console_ids IS NOT NULL
  AND array_length(console_ids, 1) >= 1;

-- Note:
-- New inserts/updates should also populate console_id going forward.
