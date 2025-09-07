-- Update products table to add category_id and subcategory_id columns if they don't exist
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES product_categories(id),
ADD COLUMN IF NOT EXISTS subcategory_id UUID REFERENCES product_subcategories(id);

-- Update existing products to assign them to categories (example assignments)
-- You can modify these based on your actual categories and subcategories

-- Get category and subcategory IDs first
-- SELECT id, name FROM product_categories;
-- SELECT id, name, category_id FROM product_subcategories;

-- Example: Assign products to Smart Curtains category
UPDATE products 
SET category_id = (SELECT id FROM product_categories WHERE name ILIKE '%curtain%' LIMIT 1),
    subcategory_id = (SELECT id FROM product_subcategories WHERE name ILIKE '%roller%' LIMIT 1)
WHERE title ILIKE '%curtain%' OR title ILIKE '%roller%';

-- Example: Assign remaining products to first available category/subcategory
UPDATE products 
SET category_id = (SELECT id FROM product_categories ORDER BY created_at LIMIT 1),
    subcategory_id = (SELECT id FROM product_subcategories ORDER BY created_at LIMIT 1)
WHERE category_id IS NULL;