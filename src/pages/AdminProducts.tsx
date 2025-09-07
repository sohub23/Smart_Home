import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Package, Layers, Palette, DollarSign } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import AdminNavbar from '@/components/AdminNavbar';
import { enhancedProductService } from '@/supabase';
import type { Category, Subcategory, Product, ProductVariant, ProductColor } from '@/types/product';

const AdminProducts = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [productForm, setProductForm] = useState({
    title: '',
    display_name: '',
    product_overview: '',
    model: '', // Optional field
    category_id: '',
    subcategory_id: '',
    position: 1,
    overview: '',
    technical_details: '',
    warranty: '',
    help_image_url: '',
    help_text: '',
    shipping_time: '',
    shipping_cost: 0,
    engraving_image_url: ''
  });

  const [variants, setVariants] = useState<Omit<ProductVariant, 'id' | 'product_id' | 'created_at' | 'updated_at'>[]>([{
    name: 'Default',
    sku: '',
    price: 0,
    discount_price: 0,
    stock: 0,
    is_default: true,
    is_active: true
  }]);
  const [colors, setColors] = useState<Omit<ProductColor, 'id' | 'product_id' | 'created_at'>[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [categoriesData, subcategoriesData, productsData] = await Promise.all([
        enhancedProductService.getCategories(),
        enhancedProductService.getSubcategories(),
        enhancedProductService.getProducts()
      ]);
      setCategories(categoriesData);
      setSubcategories(subcategoriesData);
      setProducts(productsData);
    } catch (error) {
      toast({ title: "Error", description: "Failed to load data", variant: "destructive" });
    }
  };

  const handleCreateProduct = async () => {
    try {
      if (editingProduct) {
        // Update existing product
        const productData = {
          ...productForm,
          subcategory_id: productForm.subcategory_id || null,
          model: productForm.model || null,
          is_active: true
        };
        
        await enhancedProductService.updateProduct(editingProduct.id, productData);
        toast({ title: "Success", description: "Product updated successfully" });
      } else {
        // Create new product
        if (productForm.model === 'Both') {
          const zigbeeData = {
            ...productForm,
            title: `${productForm.title} (Zigbee)`,
            display_name: `${productForm.display_name || productForm.title} (Zigbee)`,
            subcategory_id: productForm.subcategory_id || null,
            model: 'Zigbee',
            is_active: true,
            variants,
            colors
          };
          
          const wifiData = {
            ...productForm,
            title: `${productForm.title} (Wifi)`,
            display_name: `${productForm.display_name || productForm.title} (Wifi)`,
            subcategory_id: productForm.subcategory_id || null,
            model: 'Wifi',
            is_active: true,
            variants,
            colors
          };
          
          await enhancedProductService.createProduct(zigbeeData);
          await enhancedProductService.createProduct(wifiData);
          toast({ title: "Success", description: "Two products created successfully (Zigbee & Wifi)" });
        } else {
          const productData = {
            ...productForm,
            subcategory_id: productForm.subcategory_id || null,
            model: productForm.model || null,
            is_active: true,
            variants,
            colors
          };
          
          await enhancedProductService.createProduct(productData);
          toast({ title: "Success", description: "Product created successfully" });
        }
      }
      
      setIsProductDialogOpen(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Product operation error:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to save product";
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      title: product.title || '',
      display_name: product.display_name || '',
      product_overview: product.product_overview || '',
      model: product.model || '',
      category_id: product.category_id || '',
      subcategory_id: product.subcategory_id || '',
      position: product.position || 1,
      overview: product.overview || '',
      technical_details: product.technical_details || '',
      warranty: product.warranty || '',
      help_image_url: product.help_image_url || '',
      help_text: product.help_text || '',
      shipping_time: product.shipping_time || '',
      shipping_cost: product.shipping_cost || 0,
      engraving_image_url: product.engraving_image_url || ''
    });
    setVariants(product.variants || [{
      name: 'Default',
      sku: '',
      price: 0,
      discount_price: 0,
      stock: 0,
      is_default: true,
      is_active: true
    }]);
    setColors(product.colors || []);
    setIsProductDialogOpen(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await enhancedProductService.updateProduct(productId, { is_active: false });
        toast({ title: "Success", description: "Product deleted successfully" });
        loadData();
      } catch (error) {
        toast({ title: "Error", description: "Failed to delete product", variant: "destructive" });
      }
    }
  };

  const resetForm = () => {
    setProductForm({
      title: '', display_name: '', product_overview: '', model: '',
      category_id: '', subcategory_id: '', position: 1, overview: '',
      technical_details: '', warranty: '', help_image_url: '', help_text: '',
      shipping_time: '', shipping_cost: 0, engraving_image_url: ''
    });
    setVariants([{
      name: 'Default',
      sku: '',
      price: 0,
      discount_price: 0,
      stock: 0,
      is_default: true,
      is_active: true
    }]);
    setColors([]);
    setEditingProduct(null);
  };

  const addVariant = () => {
    setVariants([...variants, {
      name: '',
      sku: '',
      price: 0,
      discount_price: 0,
      stock: 0,
      is_default: variants.length === 0,
      is_active: true
    }]);
  };

  const updateVariant = (index: number, field: string, value: any) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    setVariants(updated);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const addColor = () => {
    setColors([...colors, {
      name: '',
      hex_code: '#000000',
      image_url: '',
      is_active: true
    }]);
  };

  const updateColor = (index: number, field: string, value: any) => {
    const updated = [...colors];
    updated[index] = { ...updated[index], [field]: value };
    setColors(updated);
  };

  const removeColor = (index: number) => {
    setColors(colors.filter((_, i) => i !== index));
  };

  const filteredProducts = products.filter(product => {
    // Show all products if no filters are selected
    if (!selectedCategory && !selectedSubcategory) return true;
    
    // Filter by category if selected
    if (selectedCategory && product.category_id !== selectedCategory) return false;
    
    // Filter by subcategory if selected
    if (selectedSubcategory && product.subcategory_id !== selectedSubcategory) return false;
    
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <AdminNavbar />
      <main className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2">
              Enhanced Product Management
            </h1>
            <p className="text-gray-600">Manage categories, subcategories, and products with variants</p>
          </div>
          <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingProduct ? 'Edit Product' : 'Create New Product'}</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 py-4">
                {/* Basic Info */}
                <Card className="p-4">
                  <h3 className="font-semibold mb-4 flex items-center">
                    <Package className="w-4 h-4 mr-2" />
                    Basic Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <Label>Title</Label>
                      <Input
                        value={productForm.title}
                        onChange={(e) => setProductForm({...productForm, title: e.target.value})}
                        placeholder="Product title"
                      />
                    </div>
                    <div>
                      <Label>Display Name</Label>
                      <Input
                        value={productForm.display_name}
                        onChange={(e) => setProductForm({...productForm, display_name: e.target.value})}
                        placeholder="Display name"
                      />
                    </div>
                    <div>
                      <Label>Model</Label>
                      <Select value={productForm.model} onValueChange={(value) => setProductForm({...productForm, model: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select model" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Zigbee">Zigbee</SelectItem>
                          <SelectItem value="Wifi">Wifi</SelectItem>
                          <SelectItem value="Both">Both (Creates 2 products)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Category</Label>
                      <Select value={productForm.category_id} onValueChange={(value) => setProductForm({...productForm, category_id: value, subcategory_id: ''})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(cat => (
                            <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {productForm.category_id && (
                      <div>
                        <Label>Subcategory (Optional)</Label>
                        <Select value={productForm.subcategory_id} onValueChange={(value) => setProductForm({...productForm, subcategory_id: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select subcategory" />
                          </SelectTrigger>
                          <SelectContent>
                            {subcategories.filter(sub => sub.category_id === productForm.category_id).map(sub => (
                              <SelectItem key={sub.id} value={sub.id}>{sub.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    <div>
                      <Label>Position</Label>
                      <Input
                        type="number"
                        value={productForm.position}
                        onChange={(e) => setProductForm({...productForm, position: parseInt(e.target.value)})}
                        min="1"
                      />
                    </div>
                  </div>
                </Card>

                {/* Product Details */}
                <Card className="p-4">
                  <h3 className="font-semibold mb-4">Product Details</h3>
                  <div className="space-y-4">
                    <div>
                      <Label>Product Overview</Label>
                      <Textarea
                        value={productForm.product_overview}
                        onChange={(e) => setProductForm({...productForm, product_overview: e.target.value})}
                        placeholder="Brief overview"
                        rows={2}
                      />
                    </div>
                    <div>
                      <Label>Overview</Label>
                      <Textarea
                        value={productForm.overview}
                        onChange={(e) => setProductForm({...productForm, overview: e.target.value})}
                        placeholder="Detailed overview"
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label>Technical Details</Label>
                      <Textarea
                        value={productForm.technical_details}
                        onChange={(e) => setProductForm({...productForm, technical_details: e.target.value})}
                        placeholder="Technical specifications"
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label>Warranty</Label>
                      <Input
                        value={productForm.warranty}
                        onChange={(e) => setProductForm({...productForm, warranty: e.target.value})}
                        placeholder="e.g., 1 Year Warranty"
                      />
                    </div>
                  </div>
                </Card>

                {/* Variants */}
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold flex items-center">
                      <DollarSign className="w-4 h-4 mr-2" />
                      Variants
                    </h3>
                    <Button onClick={addVariant} size="sm">
                      <Plus className="w-4 h-4 mr-1" />
                      Add Variant
                    </Button>
                  </div>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {variants.map((variant, index) => (
                      <div key={index} className="border rounded p-3 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Variant {index + 1}</span>
                          <Button onClick={() => removeVariant(index)} size="sm" variant="destructive">
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
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
                            onChange={(e) => updateVariant(index, 'price', parseFloat(e.target.value))}
                          />
                          <Input
                            type="number"
                            placeholder="Stock Quantity"
                            value={variant.stock}
                            onChange={(e) => updateVariant(index, 'stock', parseInt(e.target.value))}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Colors */}
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold flex items-center">
                      <Palette className="w-4 h-4 mr-2" />
                      Colors
                    </h3>
                    <Button onClick={addColor} size="sm">
                      <Plus className="w-4 h-4 mr-1" />
                      Add Color
                    </Button>
                  </div>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {colors.map((color, index) => (
                      <div key={index} className="border rounded p-3 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Color {index + 1}</span>
                          <Button onClick={() => removeColor(index)} size="sm" variant="destructive">
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <Input
                            placeholder="Color name"
                            value={color.name}
                            onChange={(e) => updateColor(index, 'name', e.target.value)}
                          />
                          <Input
                            type="color"
                            value={color.hex_code}
                            onChange={(e) => updateColor(index, 'hex_code', e.target.value)}
                          />
                          <Input
                            placeholder="Image URL"
                            value={color.image_url}
                            onChange={(e) => updateColor(index, 'image_url', e.target.value)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Additional Fields */}
                <Card className="p-4 lg:col-span-2">
                  <h3 className="font-semibold mb-4">Additional Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Help Image URL</Label>
                      <Input
                        value={productForm.help_image_url}
                        onChange={(e) => setProductForm({...productForm, help_image_url: e.target.value})}
                        placeholder="Help section image"
                      />
                    </div>
                    <div>
                      <Label>Engraving Image URL</Label>
                      <Input
                        value={productForm.engraving_image_url}
                        onChange={(e) => setProductForm({...productForm, engraving_image_url: e.target.value})}
                        placeholder="Engraving image"
                      />
                    </div>
                    <div>
                      <Label>Shipping Time</Label>
                      <Input
                        value={productForm.shipping_time}
                        onChange={(e) => setProductForm({...productForm, shipping_time: e.target.value})}
                        placeholder="e.g., 3-5 Business Days"
                      />
                    </div>
                    <div>
                      <Label>Shipping Cost</Label>
                      <Input
                        type="number"
                        value={productForm.shipping_cost}
                        onChange={(e) => setProductForm({...productForm, shipping_cost: parseFloat(e.target.value)})}
                        placeholder="0"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label>Help Text</Label>
                      <Textarea
                        value={productForm.help_text}
                        onChange={(e) => setProductForm({...productForm, help_text: e.target.value})}
                        placeholder="Help text for customers"
                        rows={2}
                      />
                    </div>
                  </div>
                </Card>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => {
                  setIsProductDialogOpen(false);
                  resetForm();
                }}>
                  Cancel
                </Button>
                <Button onClick={handleCreateProduct}>
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="flex space-x-4">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedCategory && (
              <Select value={selectedSubcategory} onValueChange={setSelectedSubcategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by subcategory" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Subcategories</SelectItem>
                  {subcategories.filter(sub => sub.category_id === selectedCategory).map(sub => (
                    <SelectItem key={sub.id} value={sub.id}>{sub.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </Card>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.length === 0 && (
            <div className="col-span-full text-center py-8 text-gray-500">
              <p>No products found. Try creating a new product.</p>
            </div>
          )}
          {filteredProducts.map(product => (
            <Card key={product.id} className="p-4 hover:shadow-lg transition-shadow">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{product.display_name}</h3>
                    <p className="text-sm text-gray-600">{product.title}</p>
                  </div>
                  <Badge variant="outline">#{product.position}</Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Layers className="w-4 h-4 text-blue-500" />
                    <span className="text-sm">
                      {product.category?.name}
                      {product.subcategory && ` → ${product.subcategory.name}`}
                    </span>
                  </div>
                  
                  {product.model && (
                    <div className="flex items-center space-x-2">
                      <Package className="w-4 h-4 text-green-500" />
                      <span className="text-sm">{product.model}</span>
                    </div>
                  )}
                  
                  {product.variants && product.variants.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-purple-500" />
                      <span className="text-sm">{product.variants.length} variants</span>
                    </div>
                  )}
                  
                  {product.colors && product.colors.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <Palette className="w-4 h-4 text-orange-500" />
                      <div className="flex space-x-1">
                        {product.colors.slice(0, 3).map(color => (
                          <div
                            key={color.id}
                            className="w-4 h-4 rounded-full border"
                            style={{ backgroundColor: color.hex_code }}
                            title={color.name}
                          />
                        ))}
                        {product.colors.length > 3 && (
                          <span className="text-xs text-gray-500">+{product.colors.length - 3}</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end space-x-2 pt-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleEditProduct(product)}
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={() => handleDeleteProduct(product.id)}
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default AdminProducts;