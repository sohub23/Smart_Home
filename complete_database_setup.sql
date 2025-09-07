-- COMPLETE DATABASE SETUP FOR FRESH SUPABASE INSTANCE
-- Execute this entire script in Supabase SQL Editor

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PRODUCT CATEGORIES TABLE
CREATE TABLE product_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    image TEXT,
    position INTEGER UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. PRODUCT SUBCATEGORIES TABLE
CREATE TABLE product_subcategories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES product_categories(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    image TEXT,
    position INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(category_id, position)
);

-- 3. PRODUCTS TABLE
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES product_categories(id) ON DELETE SET NULL,
    subcategory_id UUID REFERENCES product_subcategories(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    product_overview TEXT,
    model VARCHAR(10) CHECK (model IN ('Zigbee', 'Wifi')),
    position INTEGER DEFAULT 0,
    overview TEXT,
    technical_details TEXT,
    warranty TEXT,
    help_image TEXT,
    help_text TEXT,
    base_price DECIMAL(10,2) DEFAULT 0,
    discount_price DECIMAL(10,2),
    shipping_time VARCHAR(100),
    shipping_cost DECIMAL(10,2) DEFAULT 0,
    main_image TEXT,
    engraving_image TEXT,
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Draft')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. PRODUCT VARIANTS TABLE
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

-- 5. PRODUCT COLORS TABLE
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

-- 6. PRODUCT IMAGES TABLE
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

-- 7. ORDERS TABLE
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_address TEXT NOT NULL,
    items JSONB NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. QUOTES TABLE
CREATE TABLE quotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quote_number VARCHAR(50) UNIQUE NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_address TEXT,
    items JSONB NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    physical_visit_requested BOOLEAN DEFAULT false,
    need_expert_help BOOLEAN DEFAULT false,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. CUSTOMERS TABLE
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT,
    total_orders INTEGER DEFAULT 0,
    total_spent DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. USERS TABLE
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) DEFAULT 'customer' CHECK (role IN ('admin', 'manager', 'support', 'customer')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    department VARCHAR(100),
    permissions TEXT[],
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. CATEGORY IMAGES TABLE
CREATE TABLE category_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category VARCHAR(100) NOT NULL,
    image_url TEXT NOT NULL,
    title VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CREATE INDEXES
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_subcategory_id ON products(subcategory_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX idx_product_colors_product_id ON product_colors(product_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_customer_email ON orders(customer_email);
CREATE INDEX idx_customers_email ON customers(email);

-- CREATE UNIQUE CONSTRAINTS
ALTER TABLE product_variants ADD CONSTRAINT unique_variant_position UNIQUE (product_id, position);
ALTER TABLE product_colors ADD CONSTRAINT unique_color_position UNIQUE (product_id, position);

-- CREATE UPDATE TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- CREATE TRIGGERS
CREATE TRIGGER update_product_categories_updated_at BEFORE UPDATE ON product_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_subcategories_updated_at BEFORE UPDATE ON product_subcategories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_variants_updated_at BEFORE UPDATE ON product_variants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_colors_updated_at BEFORE UPDATE ON product_colors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quotes_updated_at BEFORE UPDATE ON quotes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_images ENABLE ROW LEVEL SECURITY;

-- CREATE RLS POLICIES
CREATE POLICY "Public read access" ON product_categories FOR SELECT USING (true);
CREATE POLICY "Authenticated write access" ON product_categories FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Public read access" ON product_subcategories FOR SELECT USING (true);
CREATE POLICY "Authenticated write access" ON product_subcategories FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Public read access" ON products FOR SELECT USING (true);
CREATE POLICY "Authenticated write access" ON products FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Public read access" ON product_variants FOR SELECT USING (true);
CREATE POLICY "Authenticated write access" ON product_variants FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Public read access" ON product_colors FOR SELECT USING (true);
CREATE POLICY "Authenticated write access" ON product_colors FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Public read access" ON product_images FOR SELECT USING (true);
CREATE POLICY "Authenticated write access" ON product_images FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Public read access" ON orders FOR SELECT USING (true);
CREATE POLICY "Authenticated write access" ON orders FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Public read access" ON quotes FOR SELECT USING (true);
CREATE POLICY "Authenticated write access" ON quotes FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Public read access" ON customers FOR SELECT USING (true);
CREATE POLICY "Authenticated write access" ON customers FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated access" ON users FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Public read access" ON category_images FOR SELECT USING (true);
CREATE POLICY "Authenticated write access" ON category_images FOR ALL USING (auth.role() = 'authenticated');

-- CREATE STORAGE BUCKET
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true) ON CONFLICT (id) DO NOTHING;

-- INSERT SAMPLE DATA
INSERT INTO product_categories (name, slug, image, position) VALUES
('Curtain', 'curtain', 'https://example.com/curtain.jpg', 1),
('Switch', 'switch', 'https://example.com/switch.jpg', 2),
('Security', 'security', 'https://example.com/security.jpg', 3),
('Lights', 'lights', 'https://example.com/lights.jpg', 4),
('PDLC', 'pdlc', 'https://example.com/pdlc.jpg', 5);

INSERT INTO users (name, email, role, status, department, permissions) VALUES
('Admin User', 'admin@smartcurtain.com', 'admin', 'active', 'Administration', ARRAY['all_access', 'user_management', 'product_management', 'order_management']);

-- Sample product
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

-- Sample variants
INSERT INTO product_variants (product_id, name, price, discount_price, stock, position) VALUES
((SELECT id FROM products WHERE slug = 'smart-wifi-switch-2-gang'), '2 Gang White', 2500.00, 2200.00, 50, 1),
((SELECT id FROM products WHERE slug = 'smart-wifi-switch-2-gang'), '2 Gang Black', 2500.00, 2200.00, 30, 2);

-- Sample colors
INSERT INTO product_colors (product_id, name, hex_code, position) VALUES
((SELECT id FROM products WHERE slug = 'smart-wifi-switch-2-gang'), 'White', '#FFFFFF', 1),
((SELECT id FROM products WHERE slug = 'smart-wifi-switch-2-gang'), 'Black', '#000000', 2);