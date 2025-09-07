// Professional Product Management API Functions

import { supabase } from './supabase';
import type {
  Product,
  ProductCategory,
  ProductSubcategory,
  ProductVariant,
  ProductColor,
  ProductImage,
  ProductFormData,
  CategoryFormData,
  SubcategoryFormData,
  ProductFilters,
  ApiResponse,
  PaginatedResponse
} from '../types/product-types';

// ============ CATEGORY MANAGEMENT ============

export const categoryAPI = {
  // Get all categories with product count
  async getAll(): Promise<ApiResponse<ProductCategory[]>> {
    try {
      const { data, error } = await supabase
        .from('product_categories')
        .select(`
          *,
          products!inner(count)
        `)
        .eq('is_active', true)
        .order('position');

      if (error) throw error;
      return { data: data || [] };
    } catch (error) {
      return { error: (error as Error).message };
    }
  },

  // Create new category
  async create(categoryData: CategoryFormData): Promise<ApiResponse<ProductCategory>> {
    try {
      // Get next position if not provided
      if (!categoryData.position) {
        const { data: maxPos } = await supabase
          .from('product_categories')
          .select('position')
          .order('position', { ascending: false })
          .limit(1);
        
        categoryData.position = (maxPos?.[0]?.position || 0) + 1;
      }

      const { data, error } = await supabase
        .from('product_categories')
        .insert([categoryData])
        .select()
        .single();

      if (error) throw error;
      return { data };
    } catch (error) {
      return { error: (error as Error).message };
    }
  },

  // Update category
  async update(id: string, categoryData: Partial<CategoryFormData>): Promise<ApiResponse<ProductCategory>> {
    try {
      const { data, error } = await supabase
        .from('product_categories')
        .update({ ...categoryData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data };
    } catch (error) {
      return { error: (error as Error).message };
    }
  },

  // Delete category
  async delete(id: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('product_categories')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
      return { data: true };
    } catch (error) {
      return { error: (error as Error).message };
    }
  },

  // Reorder categories
  async reorder(categoryId: string, newPosition: number): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase.rpc('swap_category_positions', {
        category_id: categoryId,
        new_position: newPosition
      });

      if (error) throw error;
      return { data: true };
    } catch (error) {
      return { error: (error as Error).message };
    }
  }
};

// ============ SUBCATEGORY MANAGEMENT ============

export const subcategoryAPI = {
  // Get subcategories by category
  async getByCategoryId(categoryId: string): Promise<ApiResponse<ProductSubcategory[]>> {
    try {
      const { data, error } = await supabase
        .from('product_subcategories')
        .select(`
          *,
          products!inner(count)
        `)
        .eq('category_id', categoryId)
        .eq('is_active', true)
        .order('position');

      if (error) throw error;
      return { data: data || [] };
    } catch (error) {
      return { error: (error as Error).message };
    }
  },

  // Create subcategory
  async create(subcategoryData: SubcategoryFormData): Promise<ApiResponse<ProductSubcategory>> {
    try {
      // Get next position if not provided
      if (!subcategoryData.position) {
        const { data: maxPos } = await supabase
          .from('product_subcategories')
          .select('position')
          .eq('category_id', subcategoryData.category_id)
          .order('position', { ascending: false })
          .limit(1);
        
        subcategoryData.position = (maxPos?.[0]?.position || 0) + 1;
      }

      const { data, error } = await supabase
        .from('product_subcategories')
        .insert([subcategoryData])
        .select()
        .single();

      if (error) throw error;
      return { data };
    } catch (error) {
      return { error: (error as Error).message };
    }
  },

  // Update subcategory
  async update(id: string, subcategoryData: Partial<SubcategoryFormData>): Promise<ApiResponse<ProductSubcategory>> {
    try {
      const { data, error } = await supabase
        .from('product_subcategories')
        .update({ ...subcategoryData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data };
    } catch (error) {
      return { error: (error as Error).message };
    }
  },

  // Delete subcategory
  async delete(id: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('product_subcategories')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
      return { data: true };
    } catch (error) {
      return { error: (error as Error).message };
    }
  }
};

// ============ PRODUCT MANAGEMENT ============

export const productAPI = {
  // Get products with filters and pagination
  async getAll(filters: ProductFilters = {}, page = 1, limit = 20): Promise<ApiResponse<PaginatedResponse<Product>>> {
    try {
      let query = supabase
        .from('products_full_view')
        .select('*', { count: 'exact' });

      // Apply filters
      if (filters.category_id) {
        query = query.eq('category_id', filters.category_id);
      }
      if (filters.subcategory_id) {
        query = query.eq('subcategory_id', filters.subcategory_id);
      }
      if (filters.model) {
        query = query.eq('model', filters.model);
      }
      if (filters.search_term) {
        query = query.or(`title.ilike.%${filters.search_term}%,display_name.ilike.%${filters.search_term}%`);
      }
      if (filters.is_active !== undefined) {
        query = query.eq('is_active', filters.is_active);
      }

      // Apply pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      
      const { data, error, count } = await query
        .range(from, to)
        .order('position');

      if (error) throw error;

      return {
        data: {
          data: data || [],
          count: count || 0,
          page,
          limit,
          total_pages: Math.ceil((count || 0) / limit)
        }
      };
    } catch (error) {
      return { error: (error as Error).message };
    }
  },

  // Get single product with all related data
  async getById(id: string): Promise<ApiResponse<Product>> {
    try {
      const { data: product, error: productError } = await supabase
        .from('products_full_view')
        .select('*')
        .eq('id', id)
        .single();

      if (productError) throw productError;

      // Get variants
      const { data: variants } = await supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', id)
        .eq('is_active', true);

      // Get colors
      const { data: colors } = await supabase
        .from('product_colors')
        .select('*')
        .eq('product_id', id)
        .eq('is_active', true);

      // Get images
      const { data: images } = await supabase
        .from('product_images')
        .select('*')
        .eq('product_id', id)
        .order('display_order');

      return {
        data: {
          ...product,
          variants: variants || [],
          colors: colors || [],
          images: images || []
        }
      };
    } catch (error) {
      return { error: (error as Error).message };
    }
  },

  // Create new product with variants and colors
  async create(productData: ProductFormData): Promise<ApiResponse<Product>> {
    try {
      // Get next position
      const { data: maxPos } = await supabase.rpc('get_next_position', {
        cat_id: productData.category_id,
        subcat_id: productData.subcategory_id || null
      });

      const position = maxPos || 1;

      // Create product
      const { data: product, error: productError } = await supabase
        .from('products')
        .insert([{
          ...productData,
          position,
          variants: undefined,
          colors: undefined,
          images: undefined
        }])
        .select()
        .single();

      if (productError) throw productError;

      // Create variants
      if (productData.variants.length > 0) {
        const variantsToInsert = productData.variants.map(variant => ({
          ...variant,
          product_id: product.id
        }));

        const { error: variantsError } = await supabase
          .from('product_variants')
          .insert(variantsToInsert);

        if (variantsError) throw variantsError;
      }

      // Create colors
      if (productData.colors.length > 0) {
        const colorsToInsert = productData.colors.map(color => ({
          ...color,
          product_id: product.id
        }));

        const { error: colorsError } = await supabase
          .from('product_colors')
          .insert(colorsToInsert);

        if (colorsError) throw colorsError;
      }

      // Create images
      if (productData.images.length > 0) {
        const imagesToInsert = productData.images.map(image => ({
          ...image,
          product_id: product.id
        }));

        const { error: imagesError } = await supabase
          .from('product_images')
          .insert(imagesToInsert);

        if (imagesError) throw imagesError;
      }

      return { data: product };
    } catch (error) {
      return { error: (error as Error).message };
    }
  },

  // Update product
  async update(id: string, productData: Partial<ProductFormData>): Promise<ApiResponse<Product>> {
    try {
      const { variants, colors, images, ...productFields } = productData;

      // Update product
      const { data: product, error: productError } = await supabase
        .from('products')
        .update({ ...productFields, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (productError) throw productError;

      return { data: product };
    } catch (error) {
      return { error: (error as Error).message };
    }
  },

  // Delete product (soft delete)
  async delete(id: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
      return { data: true };
    } catch (error) {
      return { error: (error as Error).message };
    }
  },

  // Search products
  async search(searchTerm: string): Promise<ApiResponse<Product[]>> {
    try {
      const { data, error } = await supabase.rpc('search_products', {
        search_term: searchTerm
      });

      if (error) throw error;
      return { data: data || [] };
    } catch (error) {
      return { error: (error as Error).message };
    }
  }
};

// ============ VARIANT MANAGEMENT ============

export const variantAPI = {
  async create(variant: Omit<ProductVariant, 'id' | 'created_at'>): Promise<ApiResponse<ProductVariant>> {
    try {
      const { data, error } = await supabase
        .from('product_variants')
        .insert([variant])
        .select()
        .single();

      if (error) throw error;
      return { data };
    } catch (error) {
      return { error: (error as Error).message };
    }
  },

  async update(id: string, variant: Partial<ProductVariant>): Promise<ApiResponse<ProductVariant>> {
    try {
      const { data, error } = await supabase
        .from('product_variants')
        .update(variant)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data };
    } catch (error) {
      return { error: (error as Error).message };
    }
  },

  async delete(id: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('product_variants')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
      return { data: true };
    } catch (error) {
      return { error: (error as Error).message };
    }
  }
};

// ============ COLOR MANAGEMENT ============

export const colorAPI = {
  async create(color: Omit<ProductColor, 'id' | 'created_at'>): Promise<ApiResponse<ProductColor>> {
    try {
      const { data, error } = await supabase
        .from('product_colors')
        .insert([color])
        .select()
        .single();

      if (error) throw error;
      return { data };
    } catch (error) {
      return { error: (error as Error).message };
    }
  },

  async update(id: string, color: Partial<ProductColor>): Promise<ApiResponse<ProductColor>> {
    try {
      const { data, error } = await supabase
        .from('product_colors')
        .update(color)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data };
    } catch (error) {
      return { error: (error as Error).message };
    }
  },

  async delete(id: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('product_colors')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
      return { data: true };
    } catch (error) {
      return { error: (error as Error).message };
    }
  }
};