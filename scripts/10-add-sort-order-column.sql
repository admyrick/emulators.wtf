-- Add sort_order column to setup_components table
-- This column controls the display order of components within a setup

-- Add the sort_order column
ALTER TABLE setup_components 
ADD COLUMN sort_order INTEGER DEFAULT 0;

-- Update existing records with incremental sort_order values
-- Group by setup_id and assign sequential numbers
WITH numbered_components AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (PARTITION BY setup_id ORDER BY created_at) as row_num
  FROM setup_components
)
UPDATE setup_components 
SET sort_order = numbered_components.row_num
FROM numbered_components 
WHERE setup_components.id = numbered_components.id;

-- Add index for better performance when ordering by sort_order
CREATE INDEX IF NOT EXISTS idx_setup_components_sort_order 
ON setup_components(setup_id, sort_order);

-- Add comment to document the column purpose
COMMENT ON COLUMN setup_components.sort_order IS 'Controls the display order of components within a setup (lower numbers appear first)';
