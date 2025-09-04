import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, X, Upload } from 'lucide-react'
import { categoryService, productService } from '@/supabase'
import { ProductCategory, ProductSubcategory, Product, ProductVariant, ProductColor } from '@/supabase/types'

interface AdminProductFormProps {
  product?: Product
  onSave: (product: Product) => void
  onCancel: () => void
}

export default function AdminProductForm({ product, onSave, onCancel }: AdminProductFormProps) {
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [subcategories, setSubcategories] = useState<ProductSubcategory[]>([])
  const [variants, setVariants] = useState<Omit<ProductVariant, 'id' | 'product_id' | 'created_at' | 'updated_at'>[]>([])
  const [colors, setColors] = useState<Omit<ProductColor, 'id' | 'product_id' | 'created_at' | 'updated_at'>[]>([])
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    title: '',
    display_name: '',
    slug: '',
    product_overview: '',
    model: '' as 'Zigbee' | 'Wifi' | '',
    category_id: '',
    subcategory_id: '',
    position: 1,
    overview: '',
    technical_details: '',
    warranty: '',
    help_image: '',
    help_text: '',
    base_price: 0,
    discount_price: 0,
    shipping_time: '',
    shipping_cost: 0,
    main_image: '',
    engraving_image: '',
    engraving_available: false,
    engraving_price: 0,
    engraving_text_color: '#000000',
    installation_included: false,
    stock: 0,
    status: 'Active' as 'Active' | 'Inactive' | 'Draft'
  })

  useEffect(() => {
    loadCategories()
    if (product) {
      setFormData({
        title: product.title,
        display_name: product.display_name,
        slug: product.slug,
        product_overview: product.product_overview || '',
        model: product.model || '',
        category_id: product.category_id || '',
        subcategory_id: product.subcategory_id || '',
        position: product.position,
        overview: product.overview || '',
        technical_details: product.technical_details || '',
        warranty: product.warranty || '',
        help_image: product.help_image || '',
        help_text: product.help_text || '',
        base_price: product.base_price,
        discount_price: product.discount_price || 0,
        shipping_time: product.shipping_time || '',
        shipping_cost: product.shipping_cost,
        main_image: product.main_image,
        engraving_image: product.engraving_image || '',
        engraving_available: product.engraving_available,
        engraving_price: product.engraving_price,
        engraving_text_color: product.engraving_text_color,
        installation_included: product.installation_included,
        stock: product.stock,
        status: product.status
      })
    }
  }, [product])

  useEffect(() => {
    if (formData.category_id) {
      loadSubcategories(formData.category_id)
    }
  }, [formData.category_id])

  const loadCategories = async () => {
    try {
      const data = await categoryService.getCategories()
      setCategories(data)
    } catch (error) {
      console.error('Failed to load categories:', error)
    }
  }

  const loadSubcategories = async (categoryId: string) => {
    try {
      const data = await categoryService.getSubcategories(categoryId)
      setSubcategories(data)
    } catch (error) {
      console.error('Failed to load subcategories:', error)
    }
  }

  const generateSlug = (title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  }

  const addVariant = () => {
    setVariants([...variants, {
      name: '',
      sku: '',
      price: 0,
      discount_price: 0,
      stock: 0,
      image: '',
      specifications: {},
      position: variants.length + 1,
      is_active: true
    }])
  }

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index))
  }

  const updateVariant = (index: number, field: string, value: any) => {
    const updated = [...variants]
    updated[index] = { ...updated[index], [field]: value }
    setVariants(updated)
  }

  const addColor = () => {
    setColors([...colors, {
      name: '',
      hex_code: '#000000',
      image: '',
      position: colors.length + 1,
      is_active: true
    }])
  }

  const removeColor = (index: number) => {
    setColors(colors.filter((_, i) => i !== index))
  }

  const updateColor = (index: number, field: string, value: any) => {
    const updated = [...colors]
    updated[index] = { ...updated[index], [field]: value }
    setColors(updated)
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const productData = {
        ...formData,
        slug: generateSlug(formData.title)
      }

      let savedProduct: Product
      if (product) {
        savedProduct = await productService.updateProduct(product.id, productData)
      } else {
        savedProduct = await productService.createProduct(productData)
      }

      // Save variants
      for (const variant of variants) {
        if (variant.name) {
          await productService.createVariant({
            ...variant,
            product_id: savedProduct.id
          })
        }
      }

      // Save colors
      for (const color of colors) {
        if (color.name) {
          await productService.createColor({
            ...color,
            product_id: savedProduct.id
          })
        }
      }

      onSave(savedProduct)
    } catch (error) {
      console.error('Failed to save product:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Product title"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="display_name">Display Name</Label>
          <Input
            id="display_name"
            value={formData.display_name}
            onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
            placeholder="Display name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select value={formData.category_id} onValueChange={(value) => setFormData({ ...formData, category_id: value, subcategory_id: '' })}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="subcategory">Subcategory (Optional)</Label>
          <Select value={formData.subcategory_id} onValueChange={(value) => setFormData({ ...formData, subcategory_id: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select subcategory" />
            </SelectTrigger>
            <SelectContent>
              {subcategories.map((subcategory) => (
                <SelectItem key={subcategory.id} value={subcategory.id}>
                  {subcategory.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="model">Model</Label>
          <Select value={formData.model} onValueChange={(value) => setFormData({ ...formData, model: value as 'Zigbee' | 'Wifi' })}>
            <SelectTrigger>
              <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Zigbee">Zigbee</SelectItem>
              <SelectItem value="Wifi">Wifi</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="position">Position</Label>
          <Input
            id="position"
            type="number"
            value={formData.position}
            onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value) || 1 })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="base_price">Base Price</Label>
          <Input
            id="base_price"
            type="number"
            value={formData.base_price}
            onChange={(e) => setFormData({ ...formData, base_price: parseInt(e.target.value) || 0 })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="discount_price">Discount Price</Label>
          <Input
            id="discount_price"
            type="number"
            value={formData.discount_price}
            onChange={(e) => setFormData({ ...formData, discount_price: parseInt(e.target.value) || 0 })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="stock">Stock</Label>
          <Input
            id="stock"
            type="number"
            value={formData.stock}
            onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="shipping_cost">Shipping Cost</Label>
          <Input
            id="shipping_cost"
            type="number"
            value={formData.shipping_cost}
            onChange={(e) => setFormData({ ...formData, shipping_cost: parseInt(e.target.value) || 0 })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="product_overview">Product Overview</Label>
        <Textarea
          id="product_overview"
          value={formData.product_overview}
          onChange={(e) => setFormData({ ...formData, product_overview: e.target.value })}
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="overview">Overview</Label>
          <Textarea
            id="overview"
            value={formData.overview}
            onChange={(e) => setFormData({ ...formData, overview: e.target.value })}
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="technical_details">Technical Details</Label>
          <Textarea
            id="technical_details"
            value={formData.technical_details}
            onChange={(e) => setFormData({ ...formData, technical_details: e.target.value })}
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="warranty">Warranty</Label>
          <Textarea
            id="warranty"
            value={formData.warranty}
            onChange={(e) => setFormData({ ...formData, warranty: e.target.value })}
            rows={4}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="main_image">Main Image URL</Label>
        <Input
          id="main_image"
          value={formData.main_image}
          onChange={(e) => setFormData({ ...formData, main_image: e.target.value })}
          placeholder="https://example.com/image.jpg"
        />
      </div>

      {/* Variants Section */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Variants</h3>
          <Button onClick={addVariant} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Variant
          </Button>
        </div>
        
        {variants.map((variant, index) => (
          <div key={index} className="border rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">Variant {index + 1}</h4>
              <Button onClick={() => removeVariant(index)} variant="ghost" size="sm">
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                placeholder="Variant name"
                value={variant.name}
                onChange={(e) => updateVariant(index, 'name', e.target.value)}
              />
              <Input
                placeholder="SKU"
                value={variant.sku}
                onChange={(e) => updateVariant(index, 'sku', e.target.value)}
              />
              <Input
                type="number"
                placeholder="Price"
                value={variant.price}
                onChange={(e) => updateVariant(index, 'price', parseInt(e.target.value) || 0)}
              />
            </div>
          </div>
        ))}
      </Card>

      {/* Colors Section */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Colors</h3>
          <Button onClick={addColor} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Color
          </Button>
        </div>
        
        {colors.map((color, index) => (
          <div key={index} className="border rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">Color {index + 1}</h4>
              <Button onClick={() => removeColor(index)} variant="ghost" size="sm">
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                placeholder="Color name"
                value={color.name}
                onChange={(e) => updateColor(index, 'name', e.target.value)}
              />
              <div className="flex items-center space-x-2">
                <Input
                  type="color"
                  value={color.hex_code}
                  onChange={(e) => updateColor(index, 'hex_code', e.target.value)}
                  className="w-16"
                />
                <Input
                  placeholder="#000000"
                  value={color.hex_code}
                  onChange={(e) => updateColor(index, 'hex_code', e.target.value)}
                />
              </div>
              <Input
                placeholder="Color image URL"
                value={color.image}
                onChange={(e) => updateColor(index, 'image', e.target.value)}
              />
            </div>
          </div>
        ))}
      </Card>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={loading}>
          {loading ? 'Saving...' : 'Save Product'}
        </Button>
      </div>
    </div>
  )
}