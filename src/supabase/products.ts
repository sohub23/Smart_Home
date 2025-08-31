import { supabase } from './client'

export interface Product {
  id: string
  name: string
  category: string
  price: number
  stock: number
  description?: string
  image?: string
  engraving_image?: string
  engraving_text_color?: string
  status: string
  created_at?: string
  updated_at?: string
}

export const productService = {
  async getProducts() {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
    
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
    return data
  },

  async updateProduct(id: string, productData: Partial<Product>) {
    // Sanitize ID to prevent injection
    const sanitizedId = id.replace(/[^a-zA-Z0-9-]/g, '');
    const { data, error } = await supabase
      .from('products')
      .update({ ...productData, updated_at: new Date().toISOString() })
      .eq('id', sanitizedId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async deleteProduct(id: string) {
    // Sanitize ID to prevent injection
    const sanitizedId = id.replace(/[^a-zA-Z0-9-]/g, '');
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', sanitizedId)
    
    if (error) throw error
    return true
  }
}