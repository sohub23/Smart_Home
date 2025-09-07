-- PROFESSIONAL PRODUCT MANAGEMENT SYSTEM UPDATE
-- Execute these queries in your Supabase SQL Editor

-- 1. UPDATE PRODUCT CATEGORIES TABLE
-- Add unique position constraint
ALTER TABLE product_categories 
ADD CONSTRAINT unique_category_position UNIQUE (position);

-- Update existing categories with proper positions
UPDATE product_categories SET position = 1 WHERE name = 'Curtain';
UPDATE product_categories SET position = 2 WHERE name = 'Switch';  
UPDATE product_categories SET position = 3 WHERE name = 'Security';
UPDATE product_categories SET position = 4 WHERE name = 'Lights';
UPDATE product_categories SET position = 5 WHERE name = 'PDLC';

-- 2. UPDATE PRODUCT SUBCATEGORIES TABLE  
-- Add unique position constraint within category
ALTER TABLE product_subcategories 
ADD CONSTRAINT unique_subcategory_position UNIQUE (category_id, position);

-- 3. UPDATE PRODUCTS TABLE STRUCTURE
-- Drop and recreate products table with professional structure
DROP TABLE IF EXISTS products CASCADE;

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES product_categories(id) ON DELETE SET NULL,
    subcategory_id UUID REFERENCES product_subcategories(id) ON DELETE SET NULL,
    
    -- Basic Information
    title VARCHAR(255) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    product_overview TEXT,
    model VARCHAR(10) CHECK (model IN ('Zigbee', 'Wifi')),
    position INTEGER DEFAULT 0,
    
    -- Product Details
    overview TEXT,
    technical_details TEXT,
    warranty TEXT,
    
    -- Need Help Section
    help_image TEXT,
    help_text TEXT,
    
    -- Pricing & Shipping
    base_price DECIMAL(10,2) DEFAULT 0,
    discount_price DECIMAL(10,2),
    shipping_time VARCHAR(100),
    shipping_cost DECIMAL(10,2) DEFAULT 0,
    
    -- Images
    main_image TEXT,
    engraving_image TEXT,
    
    -- Status & Timestamps
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Draft')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. CREATE PRODUCT VARIANTS TABLE
DROP TABLE IF EXISTS product_variants CASCADE;

CREATE TABLE product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100),
    price DECIMAL(10,2) NOT NULL,
    discount_price DECIMAL(10,2),
    stock INTEGER DEFAULT 0,
    image TEXT,
    specifications JSONB DEFAULT '{}',
    position INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. CREATE PRODUCT COLORS TABLE  
DROP TABLE IF EXISTS product_colors CASCADE;

CREATE TABLE product_colors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    hex_code VARCHAR(7) NOT NULL,
    image TEXT,
    position INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. CREATE PRODUCT IMAGES TABLE
DROP TABLE IF EXISTS product_images CASCADE;

CREATE TABLE product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
    color_id UUID REFERENCES product_colors(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    alt_text VARCHAR(255),
    position INTEGER DEFAULT 0,
    image_type VARCHAR(20) DEFAULT 'gallery' CHECK (image_type IN ('gallery', 'variant', 'color', 'main')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. CREATE INDEXES FOR PERFORMANCE
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_subcategory_id ON products(subcategory_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_position ON products(position);
CREATE INDEX idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX idx_product_colors_product_id ON product_colors(product_id);
CREATE INDEX idx_product_images_product_id ON product_images(product_id);

-- 8. CREATE UNIQUE CONSTRAINTS
ALTER TABLE products ADD CONSTRAINT unique_product_position UNIQUE (category_id, subcategory_id, position);
ALTER TABLE product_variants ADD CONSTRAINT unique_variant_position UNIQUE (product_id, position);
ALTER TABLE product_colors ADD CONSTRAINT unique_color_position UNIQUE (product_id, position);

-- 9. CREATE TRIGGERS FOR AUTO-UPDATE
CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON products 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_variants_updated_at 
    BEFORE UPDATE ON product_variants 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_colors_updated_at 
    BEFORE UPDATE ON product_colors 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 10. SET UP ROW LEVEL SECURITY
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public read access" ON products FOR SELECT USING (true);
CREATE POLICY "Authenticated write access" ON products FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Public read access" ON product_variants FOR SELECT USING (true);
CREATE POLICY "Authenticated write access" ON product_variants FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Public read access" ON product_colors FOR SELECT USING (true);
CREATE POLICY "Authenticated write access" ON product_colors FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Public read access" ON product_images FOR SELECT USING (true);
CREATE POLICY "Authenticated write access" ON product_images FOR ALL USING (auth.role() = 'authenticated');

-- 11. INSERT SAMPLE DATA
-- Categories
INSERT INTO product_categories (name, slug, image, position) VALUES
('Curtain', 'curtain', 'https://example.com/curtain.jpg', 1),
('Switch', 'switch', 'https://example.com/switch.jpg', 2),
('Security', 'security', 'https://example.com/security.jpg', 3),
('Lights', 'lights', 'https://example.com/lights.jpg', 4),
('PDLC', 'pdlc', 'https://example.com/pdlc.jpg', 5)
ON CONFLICT (slug) DO UPDATE SET 
    position = EXCLUDED.position,
    image = EXCLUDED.image;

-- Sample Product
INSERT INTO products (
    category_id, title, display_name, slug, product_overview, model, position,
    overview, technical_details, warranty, help_image, help_text,
    base_price, shipping_time, shipping_cost, main_image, status
) VALUES (
    (SELECT id FROM product_categories WHERE slug = 'switch'),
    'Smart WiFi Switch 2 Gang',
    'Smart WiFi Switch (2 Gang)',
    'smart-wifi-switch-2-gang',
    'Professional grade smart switch with WiFi connectivity',
    'Wifi',
    1,
    'This smart switch offers seamless control of your lighting with WiFi connectivity.',
    'Voltage: 220V AC, Current: 10A, Frequency: 50Hz, Protocol: WiFi 2.4GHz',
    '2 Years Manufacturer Warranty',
    'https://example.com/help-switch.jpg',
    'Need help choosing the right switch? Our experts can guide you through the selection process.',
    2500.00,
    '3-5 Business Days',
    100.00,
    'https://example.com/switch-main.jpg',
    'Active'
);

-- Sample Variants
INSERT INTO product_variants (product_id, name, price, discount_price, stock, position) VALUES
((SELECT id FROM products WHERE slug = 'smart-wifi-switch-2-gang'), '2 Gang White', 2500.00, 2200.00, 50, 1),
((SELECT id FROM products WHERE slug = 'smart-wifi-switch-2-gang'), '2 Gang Black', 2500.00, 2200.00, 30, 2),
((SELECT id FROM products WHERE slug = 'smart-wifi-switch-2-gang'), '2 Gang Gold', 2800.00, 2500.00, 20, 3);

-- Sample Colors  
INSERT INTO product_colors (product_id, name, hex_code, position) VALUES
((SELECT id FROM products WHERE slug = 'smart-wifi-switch-2-gang'), 'White', '#FFFFFF', 1),
((SELECT id FROM products WHERE slug = 'smart-wifi-switch-2-gang'), 'Black', '#000000', 2),
((SELECT id FROM products WHERE slug = 'smart-wifi-switch-2-gang'), 'Gold', '#FFD700', 3);