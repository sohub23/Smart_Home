import { supabase } from './client'
import { Product, ProductVariant, ProductColor, ProductImage } from './types'

export const productService = {
  async getProducts(categoryId?: string, subcategoryId?: string) {
    let query = supabase
      .from('products')
      .select(`
        *,
        product_categories(name, slug, image),
        product_subcategories(name, slug, image),
        product_variants(*),
        product_colors(*)
      `)
      .order('position')
    
    if (categoryId) query = query.eq('category_id', categoryId)
    if (subcategoryId) query = query.eq('subcategory_id', subcategoryId)
    
    const { data, error } = await query
    if (error) throw error
    return data as Product[]
  },

  async getProduct(id: string) {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        product_categories(name, slug, image),
        product_subcategories(name, slug, image),
        product_variants(*),
        product_colors(*),
        product_images(*)
      `)
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  async createProduct(productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('products')
      .insert([productData])
      .select()
      .single()
    
    if (error) throw error
    return data as Product
  },

  async updateProduct(id: string, productData: Partial<Product>) {
    const { data, error } = await supabase
      .from('products')
      .update({ ...productData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data as Product
  },

  async deleteProduct(id: string) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return true
  },

  // Variants
  async getVariants(productId: string) {
    const { data, error } = await supabase
      .from('product_variants')
      .select('*')
      .eq('product_id', productId)
      .eq('is_active', true)
      .order('position')
    
    if (error) throw error
    return data as ProductVariant[]
  },

  async createVariant(variantData: Omit<ProductVariant, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('product_variants')
      .insert([variantData])
      .select()
      .single()
    
    if (error) throw error
    return data as ProductVariant
  },

  async updateVariant(id: string, variantData: Partial<ProductVariant>) {
    const { data, error } = await supabase
      .from('product_variants')
      .update({ ...variantData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data as ProductVariant
  },

  async deleteVariant(id: string) {
    const { error } = await supabase
      .from('product_variants')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return true
  },

  // Colors
  async getColors(productId: string) {
    const { data, error } = await supabase
      .from('product_colors')
      .select('*')
      .eq('product_id', productId)
      .eq('is_active', true)
      .order('position')
    
    if (error) throw error
    return data as ProductColor[]
  },

  async createColor(colorData: Omit<ProductColor, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('product_colors')
      .insert([colorData])
      .select()
      .single()
    
    if (error) throw error
    return data as ProductColor
  },

  async updateColor(id: string, colorData: Partial<ProductColor>) {
    const { data, error } = await supabase
      .from('product_colors')
      .update({ ...colorData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data as ProductColor
  },

  async deleteColor(id: string) {
    const { error } = await supabase
      .from('product_colors')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return true
  },

  // Images
  async getImages(productId?: string, variantId?: string, colorId?: string) {
    let query = supabase
      .from('product_images')
      .select('*')
      .order('position')
    
    if (productId) query = query.eq('product_id', productId)
    if (variantId) query = query.eq('variant_id', variantId)
    if (colorId) query = query.eq('color_id', colorId)
    
    const { data, error } = await query
    if (error) throw error
    return data as ProductImage[]
  },

  async createImage(imageData: Omit<ProductImage, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('product_images')
      .insert([imageData])
      .select()
      .single()
    
    if (error) throw error
    return data as ProductImage
  },

  async deleteImage(id: string) {
    const { error } = await supabase
      .from('product_images')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return true
  }
}