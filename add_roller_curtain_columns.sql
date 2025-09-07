-- Add missing columns to products table for roller curtain functionality
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS specifications TEXT,
ADD COLUMN IF NOT EXISTS warranty TEXT,
ADD COLUMN IF NOT EXISTS features TEXT,
ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 0;