-- Add engraving_text_color column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS engraving_text_color VARCHAR(7) DEFAULT '#000000';

-- Add comment to describe the column
COMMENT ON COLUMN products.engraving_text_color IS 'Hex color code for engraving text (e.g., #000000 for black)';