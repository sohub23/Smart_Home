import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, Package, Search } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import AdminNavbar from '@/components/AdminNavbar';
import { enhancedProductService, supabase } from '@/supabase';

const AdminProductsMinimal = () => {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [activeTab, setActiveTab] = useState('all-products');

  const [productForm, setProductForm] = useState({
    title: '',
    display_name: '',
    category_id: '',
    subcategory_id: '',
    overview: '',
    technical_details: '',
    model: [],
    image: ''
  });

  const [variants, setVariants] = useState([]);
  const [colors, setColors] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsData, categoriesData, subcategoriesData] = await Promise.all([
        enhancedProductService.getProducts(),
        enhancedProductService.getCategories(),
        enhancedProductService.getSubcategories()
      ]);
      
      setProducts(productsData || []);
      setCategories(categoriesData || []);
      setSubcategories(subcategoriesData || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({ 
        title: "Error", 
        description: "Failed to load data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async () => {
    if (!productForm.title || !productForm.category_id) {
      toast({ 
        title: "Missing Fields", 
        description: "Please fill in product name and category",
        variant: "destructive" 
      });
      return;
    }

    try {
      const productData = {
        title: productForm.title,
        display_name: productForm.display_name || productForm.title,
        category_id: productForm.category_id,
        subcategory_id: productForm.subcategory_id || null,
        overview: productForm.overview,
        technical_details: productForm.technical_details,
        model: Array.isArray(productForm.model) ? productForm.model.join(',') : 'Zigbee',
        image: productForm.image,
        variants: variants.length > 0 ? variants : null,
        colors: colors.length > 0 ? colors : null,
        price: 0,
        stock_quantity: 0,
        is_active: true,
        status: 'active'
      };

      const { error } = await supabase
        .from('products')
        .insert(productData);

      if (error) throw error;
      
      toast({ title: "Success", description: "Product created successfully" });
      setIsProductDialogOpen(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Product creation error:', error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleUpdateProduct = async () => {
    if (!productForm.title || !productForm.category_id) {
      toast({ 
        title: "Missing Fields", 
        description: "Please fill in product name and category",
        variant: "destructive" 
      });
      return;
    }

    try {
      const updateData = {
        title: productForm.title,
        display_name: productForm.display_name || productForm.title,
        category_id: productForm.category_id,
        subcategory_id: productForm.subcategory_id || null,
        overview: productForm.overview,
        technical_details: productForm.technical_details,
        model: Array.isArray(productForm.model) ? productForm.model.join(',') : productForm.model,
        image: productForm.image,
        variants: variants.length > 0 ? variants : null,
        colors: colors.length > 0 ? colors : null
      };

      const { error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', editingProduct.id);

      if (error) throw error;
      
      toast({ title: "Success", description: "Product updated successfully" });
      setIsProductDialogOpen(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Product update error:', error);
      toast({ title: "Error", description: error?.message || 'Update failed', variant: "destructive" });
    }
  };

  const handleDeleteProduct = async (product) => {
    if (!confirm(`Delete ${product.title}?`)) return;
    
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', product.id);
      
      if (error) throw error;
      
      toast({ title: "Success", description: "Product deleted successfully" });
      loadData();
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const resetForm = () => {
    setProductForm({
      title: '',
      display_name: '',
      category_id: '',
      subcategory_id: '',
      overview: '',
      technical_details: '',
      model: [],
      image: ''
    });
    setVariants([]);
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
      is_default: false,
      is_active: true
    }]);
  };

  const updateVariant = (index, field, value) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    setVariants(updated);
  };

  const removeVariant = (index) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const addColor = () => {
    setColors([...colors, {
      name: '',
      hex_code: '#000000',
      is_active: true
    }]);
  };

  const updateColor = (index, field, value) => {
    const updated = [...colors];
    updated[index] = { ...updated[index], [field]: value };
    setColors(updated);
  };

  const removeColor = (index) => {
    setColors(colors.filter((_, i) => i !== index));
  };

  const filteredProducts = products.filter(product => 
    !searchTerm || 
    product.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.display_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminNavbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading products...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />
      <main className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
              <p className="text-gray-600 mt-1">{products.length} products • {categories.length} categories</p>
            </div>
            <Button 
              onClick={() => {
                resetForm();
                setIsProductDialogOpen(true);
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="all-products">All Products</TabsTrigger>
            <TabsTrigger value="categories">Product Categories</TabsTrigger>
          </TabsList>

          {/* All Products Tab */}
          <TabsContent value="all-products" className="space-y-6">
            {/* Search */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 line-clamp-1">{product.title}</h3>
                      <p className="text-sm text-gray-500 line-clamp-1">{product.display_name}</p>
                    </div>
                    
                    {product.image && (
                      <img src={product.image} alt={product.title} className="w-full h-32 object-cover rounded" />
                    )}
                    
                    <div className="flex items-center gap-2">
                      {product.model && (
                        <Badge variant="secondary" className="text-xs">{product.model}</Badge>
                      )}
                      <Badge variant={product.is_active ? 'default' : 'secondary'} className="text-xs">
                        {product.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => {
                          setEditingProduct(product);
                          setProductForm({
                            title: product.title || '',
                            display_name: product.display_name || '',
                            category_id: product.category_id || '',
                            subcategory_id: product.subcategory_id || '',
                            overview: product.overview || '',
                            technical_details: product.technical_details || '',
                            model: product.model ? (typeof product.model === 'string' ? product.model.split(',') : product.model) : [],
                            image: product.image || ''
                          });
                          setVariants(product.variants || []);
                          setColors(product.colors || []);
                          setIsProductDialogOpen(true);
                        }}
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-red-500 hover:text-red-600"
                        onClick={() => handleDeleteProduct(product)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600 mb-4">
                  {products.length === 0 ? 'Create your first product' : 'Try adjusting your search'}
                </p>
                {products.length === 0 && (
                  <Button onClick={() => setIsProductDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Product
                  </Button>
                )}
              </div>
            )}
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-6">
            {categories.map(category => {
              const categoryProducts = products.filter(p => p.category_id === category.id);
              const categorySubcategories = subcategories.filter(sub => sub.category_id === category.id);
              
              return (
                <Card key={category.id} className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{category.name}</h2>
                      <p className="text-gray-600">{categoryProducts.length} products • {categorySubcategories.length} subcategories</p>
                    </div>
                    <Button 
                      onClick={() => {
                        resetForm();
                        setProductForm(prev => ({...prev, category_id: category.id}));
                        setIsProductDialogOpen(true);
                      }}
                      variant="outline"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Product
                    </Button>
                  </div>

                  {categorySubcategories.length > 0 ? (
                    <div className="space-y-4">
                      {categorySubcategories.map(subcategory => {
                        const subcategoryProducts = products.filter(p => p.subcategory_id === subcategory.id);
                        
                        return (
                          <div key={subcategory.id} className="border-l-4 border-blue-200 pl-4">
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <h3 className="font-semibold text-gray-900">{subcategory.name}</h3>
                                <p className="text-sm text-gray-500">{subcategoryProducts.length} products</p>
                              </div>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => {
                                  resetForm();
                                  setProductForm(prev => ({...prev, category_id: category.id, subcategory_id: subcategory.id}));
                                  setIsProductDialogOpen(true);
                                }}
                              >
                                <Plus className="w-3 h-3 mr-1" />
                                Add
                              </Button>
                            </div>

                            {subcategoryProducts.length > 0 ? (
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {subcategoryProducts.map((product) => (
                                  <div key={product.id} className="bg-gray-50 rounded p-3">
                                    <div className="flex items-center justify-between">
                                      <div className="flex-1">
                                        <h4 className="font-medium text-sm text-gray-900 line-clamp-1">{product.title}</h4>
                                        <p className="text-xs text-gray-500 line-clamp-1">{product.display_name}</p>
                                      </div>
                                      <div className="flex gap-1 ml-2">
                                        <Button 
                                          variant="ghost" 
                                          size="sm" 
                                          className="h-6 w-6 p-0"
                                          onClick={() => {
                                            setEditingProduct(product);
                                            setProductForm({
                                              title: product.title || '',
                                              display_name: product.display_name || '',
                                              category_id: product.category_id || '',
                                              subcategory_id: product.subcategory_id || '',
                                              overview: product.overview || '',
                                              technical_details: product.technical_details || '',
                                              model: product.model ? (typeof product.model === 'string' ? product.model.split(',') : product.model) : [],
                                              image: product.image || ''
                                            });
                                            setVariants(product.variants || []);
                                            setColors(product.colors || []);
                                            setIsProductDialogOpen(true);
                                          }}
                                        >
                                          <Edit className="w-3 h-3" />
                                        </Button>
                                        <Button 
                                          variant="ghost" 
                                          size="sm" 
                                          className="h-6 w-6 p-0 text-red-500"
                                          onClick={() => handleDeleteProduct(product)}
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="bg-gray-50 rounded p-4 text-center">
                                <p className="text-sm text-gray-500">No products in {subcategory.name}</p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No subcategories in {category.name}</p>
                    </div>
                  )}
                </Card>
              );
            })}
          </TabsContent>
        </Tabs>

        {/* Product Dialog */}
        <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Title *</Label>
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
                  <Label>Category *</Label>
                  <Select 
                    value={productForm.category_id} 
                    onValueChange={(value) => setProductForm({...productForm, category_id: value, subcategory_id: ''})}
                  >
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
                <div>
                  <Label>Subcategory</Label>
                  <Select 
                    value={productForm.subcategory_id || 'none'} 
                    onValueChange={(value) => setProductForm({...productForm, subcategory_id: value === 'none' ? '' : value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select subcategory" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Subcategory</SelectItem>
                      {subcategories.filter(sub => sub.category_id === productForm.category_id).map(subcat => (
                        <SelectItem key={subcat.id} value={subcat.id}>{subcat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Model Selection */}
              <div>
                <Label>Model</Label>
                <div className="flex gap-4 mt-2">
                  {['Zigbee', 'Wifi'].map((modelOption) => (
                    <div key={modelOption} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`model-${modelOption}`}
                        checked={productForm.model.includes(modelOption)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setProductForm({...productForm, model: [...productForm.model, modelOption]});
                          } else {
                            setProductForm({...productForm, model: productForm.model.filter(m => m !== modelOption)});
                          }
                        }}
                      />
                      <label htmlFor={`model-${modelOption}`}>{modelOption}</label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <Label>Overview</Label>
                <Textarea
                  value={productForm.overview}
                  onChange={(e) => setProductForm({...productForm, overview: e.target.value})}
                  placeholder="Product overview"
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

              {/* Image */}
              <div>
                <Label>Product Image</Label>
                <Input
                  value={productForm.image}
                  onChange={(e) => setProductForm({...productForm, image: e.target.value})}
                  placeholder="Image URL"
                />
              </div>

              {/* Variants */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label>Product Variants</Label>
                  <Button onClick={addVariant} variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-1" />
                    Add Variant
                  </Button>
                </div>
                {variants.length > 0 && (
                  <div className="space-y-2">
                    {variants.map((variant, index) => (
                      <div key={index} className="grid grid-cols-5 gap-2 p-3 border rounded">
                        <Input
                          placeholder="Name"
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
                          onChange={(e) => updateVariant(index, 'price', parseFloat(e.target.value) || 0)}
                        />
                        <Input
                          type="number"
                          placeholder="Stock"
                          value={variant.stock}
                          onChange={(e) => updateVariant(index, 'stock', parseInt(e.target.value) || 0)}
                        />
                        <Button onClick={() => removeVariant(index)} variant="outline" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Colors */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label>Product Colors</Label>
                  <Button onClick={addColor} variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-1" />
                    Add Color
                  </Button>
                </div>
                {colors.length > 0 && (
                  <div className="space-y-2">
                    {colors.map((color, index) => (
                      <div key={index} className="grid grid-cols-3 gap-2 p-3 border rounded">
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
                            className="w-12 h-10 p-1"
                          />
                          <Input
                            placeholder="#FFFFFF"
                            value={color.hex_code}
                            onChange={(e) => updateColor(index, 'hex_code', e.target.value)}
                          />
                        </div>
                        <Button onClick={() => removeColor(index)} variant="outline" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-6 border-t">
              <Button variant="outline" onClick={() => setIsProductDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={editingProduct ? handleUpdateProduct : handleCreateProduct}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {editingProduct ? 'Update Product' : 'Create Product'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default AdminProductsMinimal;