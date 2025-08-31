-- Add engraving_image column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS engraving_image TEXT;

-- Add comment to describe the column
COMMENT ON COLUMN products.engraving_image IS 'URL to the engraving preview image for this product';