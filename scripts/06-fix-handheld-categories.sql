-- Create handheld_categories table if it doesn't exist
CREATE TABLE IF NOT EXISTS handheld_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default categories
INSERT INTO handheld_categories (name, description) VALUES
  ('Budget', 'Affordable handheld gaming devices under $100'),
  ('Mid-range', 'Balanced performance and price handheld devices'),
  ('Premium', 'High-end handheld gaming devices with premium features'),
  ('Retro Gaming', 'Devices focused on classic and retro game emulation'),
  ('Modern Gaming', 'Devices capable of running modern games and emulators'),
  ('Portable', 'Ultra-portable and compact gaming devices'),
  ('Compact', 'Small form factor handheld devices')
ON CONFLICT (name) DO NOTHING;

-- Add foreign key constraint to handhelds table if column exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'handhelds' AND column_name = 'category_id'
  ) THEN
    -- Add foreign key constraint
    ALTER TABLE handhelds 
    ADD CONSTRAINT fk_handhelds_category 
    FOREIGN KEY (category_id) REFERENCES handheld_categories(id);
  END IF;
END $$;
