import { supabase } from './client'
import { sanitizeLogInput } from '../utils/sanitize'

export const storageService = {
  async uploadProductImage(file: File, productId?: string): Promise<string> {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${productId || Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `products/${fileName}`

      console.log('Uploading file:', sanitizeLogInput(fileName), 'Size:', sanitizeLogInput(file.size))

      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (error) {
        console.error('Storage upload error:', sanitizeLogInput(error))
        throw new Error(`Upload failed: ${error.message}`)
      }

      console.log('Upload successful:', sanitizeLogInput(data))

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath)

      console.log('Public URL:', sanitizeLogInput(publicUrl))
      return publicUrl
    } catch (error) {
      console.error('Upload service error:', sanitizeLogInput(error))
      throw error
    }
  },

  async deleteProductImage(imageUrl: string) {
    const path = imageUrl.split('/').pop()
    if (!path) return

    // Validate path to prevent directory traversal
    const sanitizedPath = path.replace(/[^a-zA-Z0-9._-]/g, '')
    if (!sanitizedPath) return

    const { error } = await supabase.storage
      .from('product-images')
      .remove([`products/${sanitizedPath}`])

    if (error) throw error
  }
}