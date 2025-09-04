export interface ProductCategory {
  id: string
  name: string
  slug: string
  image?: string
  position: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ProductSubcategory {
  id: string
  category_id: string
  name: string
  slug: string
  image?: string
  position: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  category_id?: string
  subcategory_id?: string
  title: string
  display_name: string
  slug: string
  product_overview?: string
  model?: 'Zigbee' | 'Wifi'
  position: number
  overview?: string
  technical_details?: string
  warranty?: string
  help_image?: string
  help_text?: string
  base_price: number
  discount_price?: number
  shipping_time?: string
  shipping_cost: number
  main_image: string
  engraving_image?: string
  engraving_available: boolean
  engraving_price: number
  engraving_text_color: string
  installation_included: boolean
  stock: number
  status: 'Active' | 'Inactive' | 'Draft'
  created_at: string
  updated_at: string
}

export interface ProductVariant {
  id: string
  product_id: string
  name: string
  sku?: string
  price: number
  discount_price?: number
  stock: number
  image?: string
  specifications?: Record<string, any>
  position: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ProductColor {
  id: string
  product_id: string
  name: string
  hex_code: string
  image?: string
  position: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ProductImage {
  id: string
  product_id?: string
  variant_id?: string
  color_id?: string
  image_url: string
  alt_text?: string
  position: number
  image_type: 'gallery' | 'variant' | 'color' | 'gang'
  created_at: string
}