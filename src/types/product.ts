export interface Category {
  id: string;
  name: string;
  slug: string;
  image_url?: string;
  description?: string;
  position: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Subcategory {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  image_url?: string;
  description?: string;
  position: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  category?: Category;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  name: string;
  sku?: string;
  price: number;
  discount_price?: number;
  stock: number;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductColor {
  id: string;
  product_id: string;
  name: string;
  hex_code?: string;
  image_url?: string;
  is_active: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  title: string;
  display_name: string;
  slug: string;
  product_overview?: string;
  model?: 'Zigbee' | 'Wifi';
  
  // Category assignment
  category_id?: string;
  subcategory_id?: string;
  position: number;
  
  // Product details
  overview?: string;
  technical_details?: string;
  warranty?: string;
  
  // Help section
  help_image_url?: string;
  help_text?: string;
  
  // Shipping
  shipping_time?: string;
  shipping_cost: number;
  
  // Engraving
  engraving_image_url?: string;
  
  // Status
  status: 'active' | 'inactive' | 'draft';
  is_active: boolean;
  
  created_at: string;
  updated_at: string;
  
  // Relations
  category?: Category;
  subcategory?: Subcategory;
  variants?: ProductVariant[];
  colors?: ProductColor[];
}

export interface CreateProductData {
  title: string;
  display_name: string;
  product_overview?: string;
  model?: 'Zigbee' | 'Wifi';
  category_id?: string;
  subcategory_id?: string;
  position: number;
  overview?: string;
  technical_details?: string;
  warranty?: string;
  help_image_url?: string;
  help_text?: string;
  shipping_time?: string;
  shipping_cost?: number;
  engraving_image_url?: string;
  variants?: Omit<ProductVariant, 'id' | 'product_id' | 'created_at' | 'updated_at'>[];
  colors?: Omit<ProductColor, 'id' | 'product_id' | 'created_at'>[];
}