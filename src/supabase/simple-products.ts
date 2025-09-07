// Simple wrapper functions for the AdminProductsEnhanced component
import { supabase } from './client';

export const getProducts = async () => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        product_categories(name),
        product_subcategories(name)
      `)
      .eq('is_active', true)
      .order('position');
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};

export const getCategories = async () => {
  try {
    const { data, error } = await supabase
      .from('product_categories')
      .select('*')
      .eq('is_active', true)
      .order('position');
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
};

export const getSubcategories = async (categoryId?: string) => {
  try {
    let query = supabase
      .from('product_subcategories')
      .select('*')
      .eq('is_active', true)
      .order('position');
    
    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    return [];
  }
};