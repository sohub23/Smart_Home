// Professional Product Management Types

export interface ProductCategory {
  id: string;
  name: string;
  image_url?: string;
  position: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  product_count?: number;
}

export interface ProductSubcategory {
  id: string;
  category_id: string;
  name: string;
  image_url?: string;
  position: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  product_count?: number;
}

export interface Product {
  id: string;
  category_id: string;
  subcategory_id?: string;
  
  // Basic Info
  title: string;
  display_name: string;
  product_overview?: string;
  model: 'Zigbee' | 'Wifi';
  
  // Product Details
  overview_details?: string;
  technical_details?: string;
  warranty_info?: string;
  
  // Help Section
  help_image_url?: string;
  help_text?: string;
  
  // Shipping & Pricing
  shipping_time?: string;
  shipping_cost: number;
  engraving_image_url?: string;
  
  // System Fields
  position: number;
  is_active: boolean;
  stock_quantity: number;
  created_at: string;
  updated_at: string;
  
  // Related Data (populated via joins)
  category_name?: string;
  subcategory_name?: string;
  variants?: ProductVariant[];
  colors?: ProductColor[];
  images?: ProductImage[];
}

export interface ProductVariant {
  id: string;
  product_id: string;
  variant_name: string;
  variant_value: string;
  price: number;
  discount_price?: number;
  stock_quantity: number;
  is_active: boolean;
  created_at: string;
}

export interface ProductColor {
  id: string;
  product_id: string;
  color_name: string;
  color_code?: string;
  color_image_url?: string;
  price_adjustment: number;
  is_active: boolean;
  created_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  alt_text?: string;
  display_order: number;
  is_primary: boolean;
  created_at: string;
}

// Form Types for Admin
export interface ProductFormData {
  title: string;
  display_name: string;
  product_overview: string;
  model: 'Zigbee' | 'Wifi';
  category_id: string;
  subcategory_id?: string;
  overview_details: string;
  technical_details: string;
  warranty_info: string;
  help_image_url: string;
  help_text: string;
  shipping_time: string;
  shipping_cost: number;
  engraving_image_url: string;
  variants: Omit<ProductVariant, 'id' | 'product_id' | 'created_at'>[];
  colors: Omit<ProductColor, 'id' | 'product_id' | 'created_at'>[];
  images: Omit<ProductImage, 'id' | 'product_id' | 'created_at'>[];
}

export interface CategoryFormData {
  name: string;
  image_url?: string;
  position?: number;
}

export interface SubcategoryFormData {
  category_id: string;
  name: string;
  image_url?: string;
  position?: number;
}

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  limit: number;
  total_pages: number;
}

// Search and Filter Types
export interface ProductFilters {
  category_id?: string;
  subcategory_id?: string;
  model?: 'Zigbee' | 'Wifi';
  min_price?: number;
  max_price?: number;
  search_term?: string;
  is_active?: boolean;
}

export interface ProductSearchResult {
  id: string;
  title: string;
  display_name: string;
  category_name: string;
  subcategory_name?: string;
  rank: number;
}