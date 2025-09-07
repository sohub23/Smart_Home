import { supabase } from './index';
import type { Category, Subcategory, Product, ProductVariant, ProductColor, CreateProductData } from '@/types/product';

export const enhancedProductService = {
  // Categories
  async getCategories(): Promise<Category[]> {
    const { data, error } = await supabase
      .from('product_categories')
      .select('*')
      .eq('is_active', true)
      .order('position');
    
    if (error) throw error;
    return data || [];
  },

  async createCategory(category: Omit<Category, 'id' | 'created_at' | 'updated_at'>) {
    const slug = category.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const { data, error } = await supabase
      .from('product_categories')
      .insert({ ...category, slug })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateCategory(id: string, updates: Partial<Category>) {
    const { data, error } = await supabase
      .from('product_categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Subcategories
  async getSubcategories(categoryId?: string): Promise<Subcategory[]> {
    let query = supabase
      .from('product_subcategories')
      .select(`
        *,
        category:product_categories(*)
      `)
      .eq('is_active', true)
      .order('position');

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async createSubcategory(subcategory: Omit<Subcategory, 'id' | 'created_at' | 'updated_at'>) {
    const slug = subcategory.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const { data, error } = await supabase
      .from('product_subcategories')
      .insert({ ...subcategory, slug })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Products
  async getProducts(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    console.log('Raw query result:', { data, error, dataLength: data?.length });
    
    if (error) {
      console.error('Products query error:', error);
      return [];
    }
    
    return data || [];
  },

  async getProductsByCategory(categoryId: string): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:product_categories(*),
        variants:product_variants(*),
        colors:product_colors(*)
      `)
      .eq('category_id', categoryId)
      .eq('is_active', true)
      .order('position');
    
    if (error) throw error;
    return data || [];
  },

  async getProductsBySubcategory(subcategoryId: string): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        subcategory:product_subcategories(*),
        variants:product_variants(*),
        colors:product_colors(*)
      `)
      .eq('subcategory_id', subcategoryId)
      .eq('is_active', true)
      .order('position');
    
    if (error) throw error;
    return data || [];
  },

  async createProduct(productData: CreateProductData): Promise<Product> {
    const slug = productData.title ? productData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'product';
    
    // Clean data for database constraints
    const cleanProductData: any = {
      title: productData.title || 'Untitled Product',
      display_name: productData.display_name || productData.title || 'Untitled Product',
      product_overview: productData.product_overview || '',
      overview: productData.overview || '',
      technical_details: productData.technical_details || '',
      warranty: productData.warranty || '',
      help_text: productData.help_text || '',
      shipping_time: productData.shipping_time || '',
      shipping_cost: productData.shipping_cost || 0,
      position: productData.position || 1,
      category_id: productData.category_id,
      subcategory_id: productData.subcategory_id || null,
      help_image_url: productData.help_image_url || null,
      engraving_image_url: productData.engraving_image_url || null,
      is_active: true,
      slug
    };
    
    // Skip model field entirely to avoid constraint issues
    
    // Create product
    const { data: product, error: productError } = await supabase
      .from('products')
      .insert(cleanProductData)
      .select()
      .single();

    if (productError) throw productError;

    // Create variants if provided
    if (productData.variants?.length) {
      const { error: variantsError } = await supabase
        .from('product_variants')
        .insert(
          productData.variants.map(variant => ({
            ...variant,
            product_id: product.id
          }))
        );
      
      if (variantsError) throw variantsError;
    }

    // Create colors if provided
    if (productData.colors?.length) {
      const { error: colorsError } = await supabase
        .from('product_colors')
        .insert(
          productData.colors.map(color => ({
            ...color,
            product_id: product.id
          }))
        );
      
      if (colorsError) throw colorsError;
    }

    return this.getProduct(product.id);
  },

  async getProduct(id: string): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:product_categories(*),
        subcategory:product_subcategories(*),
        variants:product_variants(*),
        colors:product_colors(*)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Product Variants
  async addVariant(productId: string, variant: Omit<ProductVariant, 'id' | 'product_id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('product_variants')
      .insert({ ...variant, product_id: productId })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateVariant(id: string, updates: Partial<ProductVariant>) {
    const { data, error } = await supabase
      .from('product_variants')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteVariant(id: string) {
    const { error } = await supabase
      .from('product_variants')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Product Colors
  async addColor(productId: string, color: Omit<ProductColor, 'id' | 'product_id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('product_colors')
      .insert({ ...color, product_id: productId })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateColor(id: string, updates: Partial<ProductColor>) {
    const { data, error } = await supabase
      .from('product_colors')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteColor(id: string) {
    const { error } = await supabase
      .from('product_colors')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Position management
  async updateProductPosition(id: string, newPosition: number, categoryId?: string, subcategoryId?: string) {
    // Get current product
    const { data: currentProduct } = await supabase
      .from('products')
      .select('position, category_id, subcategory_id')
      .eq('id', id)
      .single();

    if (!currentProduct) throw new Error('Product not found');

    const oldPosition = currentProduct.position;
    const targetCategoryId = categoryId || currentProduct.category_id;
    const targetSubcategoryId = subcategoryId || currentProduct.subcategory_id;

    // Update positions of other products
    if (oldPosition < newPosition) {
      // Moving down: shift products up
      let query = supabase
        .from('products')
        .update({ position: supabase.raw('position - 1') })
        .gt('position', oldPosition)
        .lte('position', newPosition)
        .neq('id', id);

      if (targetCategoryId) {
        query = query.eq('category_id', targetCategoryId);
      } else if (targetSubcategoryId) {
        query = query.eq('subcategory_id', targetSubcategoryId);
      }

      await query;
    } else if (oldPosition > newPosition) {
      // Moving up: shift products down
      let query = supabase
        .from('products')
        .update({ position: supabase.raw('position + 1') })
        .gte('position', newPosition)
        .lt('position', oldPosition)
        .neq('id', id);

      if (targetCategoryId) {
        query = query.eq('category_id', targetCategoryId);
      } else if (targetSubcategoryId) {
        query = query.eq('subcategory_id', targetSubcategoryId);
      }

      await query;
    }

    // Update the product's position
    const { data, error } = await supabase
      .from('products')
      .update({ 
        position: newPosition,
        category_id: targetCategoryId,
        subcategory_id: targetSubcategoryId
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};