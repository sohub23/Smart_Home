import { supabase } from '@/supabase/client'

export const migrateOldProducts = async () => {
  try {
    console.log('Starting product migration...')
    
    // Get old products
    const { data: oldProducts, error: fetchError } = await supabase
      .from('products')
      .select('*')
    
    if (fetchError) {
      console.error('Error fetching old products:', fetchError)
      return
    }

    console.log(`Found ${oldProducts?.length || 0} old products to migrate`)

    // Get categories mapping
    const { data: categories } = await supabase
      .from('product_categories')
      .select('*')

    if (!oldProducts || oldProducts.length === 0) {
      console.log('No products to migrate')
      return
    }

    let migratedCount = 0
    
    for (const oldProduct of oldProducts) {
      try {
        // Find matching category
        const category = categories?.find(c => c.name === oldProduct.category)
        
        // Generate slug from name
        const slug = oldProduct.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
        
        // Create new product
        const newProduct = {
          category_id: category?.id || null,
          subcategory_id: null,
          title: oldProduct.name,
          display_name: oldProduct.name,
          slug: slug,
          product_overview: oldProduct.description || '',
          model: null,
          position: oldProduct.serial_order || 1,
          overview: oldProduct.detailed_description || '',
          technical_details: oldProduct.specifications || '',
          warranty: oldProduct.warranty || '',
          help_image: null,
          help_text: null,
          base_price: oldProduct.price || 0,
          discount_price: null,
          shipping_time: null,
          shipping_cost: 0,
          main_image: oldProduct.image || '',
          engraving_image: oldProduct.engraving_image || null,
          engraving_available: false,
          engraving_price: 0,
          engraving_text_color: oldProduct.engraving_text_color || '#000000',
          installation_included: oldProduct.installation_included || false,
          stock: oldProduct.stock || 0,
          status: oldProduct.status === 'Active' ? 'Active' : 'Inactive'
        }

        const { error: insertError } = await supabase
          .from('products_new')
          .insert([newProduct])

        if (insertError) {
          console.error(`Error migrating product ${oldProduct.name}:`, insertError)
        } else {
          migratedCount++
          console.log(`Migrated: ${oldProduct.name}`)
        }
      } catch (error) {
        console.error(`Error processing product ${oldProduct.name}:`, error)
      }
    }

    console.log(`Migration completed. ${migratedCount} products migrated successfully.`)
    return { success: true, migratedCount }
    
  } catch (error) {
    console.error('Migration failed:', error)
    return { success: false, error }
  }
}

export const checkMigrationStatus = async () => {
  try {
    const [oldCount, newCount, categoriesCount] = await Promise.all([
      supabase.from('products').select('id', { count: 'exact', head: true }),
      supabase.from('products_new').select('id', { count: 'exact', head: true }),
      supabase.from('product_categories').select('id', { count: 'exact', head: true })
    ])

    return {
      oldProducts: oldCount.count || 0,
      newProducts: newCount.count || 0,
      categories: categoriesCount.count || 0
    }
  } catch (error) {
    console.error('Error checking migration status:', error)
    return { oldProducts: 0, newProducts: 0, categories: 0 }
  }
}