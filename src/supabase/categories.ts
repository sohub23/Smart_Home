import { supabase } from './client'
import { ProductCategory, ProductSubcategory } from './types'
import { validateId } from '../utils/sanitize'

export const categoryService = {
  async getCategories() {
    const { data, error } = await supabase
      .from('product_categories')
      .select('*')
      .eq('is_active', true)
      .order('position')
    
    if (error) throw error
    return data as ProductCategory[]
  },

  async createCategory(categoryData: Omit<ProductCategory, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('product_categories')
      .insert([categoryData])
      .select()
      .single()
    
    if (error) throw error
    return data as ProductCategory
  },

  async updateCategory(id: string, categoryData: Partial<ProductCategory>) {
    const validId = validateId(id)
    if (!validId) throw new Error('Invalid category ID')
    
    const { data, error } = await supabase
      .from('product_categories')
      .update({ ...categoryData, updated_at: new Date().toISOString() })
      .eq('id', validId)
      .select()
      .single()
    
    if (error) throw error
    return data as ProductCategory
  },

  async deleteCategory(id: string) {
    const validId = validateId(id)
    if (!validId) throw new Error('Invalid category ID')
    
    const { error } = await supabase
      .from('product_categories')
      .delete()
      .eq('id', validId)
    
    if (error) throw error
    return true
  },

  async getSubcategories(categoryId?: string) {
    let query = supabase
      .from('product_subcategories')
      .select('*')
      .eq('is_active', true)
      .order('position')
    
    const validCategoryId = validateId(categoryId)
    if (validCategoryId) {
      query = query.eq('category_id', validCategoryId)
    }
    
    const { data, error } = await query
    if (error) throw error
    return data as ProductSubcategory[]
  },

  async createSubcategory(subcategoryData: Omit<ProductSubcategory, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('product_subcategories')
      .insert([subcategoryData])
      .select()
      .single()
    
    if (error) throw error
    return data as ProductSubcategory
  },

  async updateSubcategory(id: string, subcategoryData: Partial<ProductSubcategory>) {
    const validId = validateId(id)
    if (!validId) throw new Error('Invalid subcategory ID')
    
    const { data, error } = await supabase
      .from('product_subcategories')
      .update({ ...subcategoryData, updated_at: new Date().toISOString() })
      .eq('id', validId)
      .select()
      .single()
    
    if (error) throw error
    return data as ProductSubcategory
  },

  async deleteSubcategory(id: string) {
    const validId = validateId(id)
    if (!validId) throw new Error('Invalid subcategory ID')
    
    const { error } = await supabase
      .from('product_subcategories')
      .delete()
      .eq('id', validId)
    
    if (error) throw error
    return true
  },

  // Category Images
  async getCategoryImages() {
    const { data, error } = await supabase
      .from('category_images')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async addCategoryImage(imageData: any) {
    const { data, error } = await supabase
      .from('category_images')
      .insert([imageData])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async deleteCategoryImage(id: string) {
    const validId = validateId(id)
    if (!validId) throw new Error('Invalid image ID')
    
    const { error } = await supabase
      .from('category_images')
      .delete()
      .eq('id', validId)
    
    if (error) throw error
    return true
  }
}