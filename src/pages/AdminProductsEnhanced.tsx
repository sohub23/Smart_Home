import { useState, useEffect, useMemo, useCallback, memo, lazy, Suspense } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, Package, Layers, Palette, DollarSign, Search, Filter, Eye, Settings, Grid3X3, List, MoreVertical, Star, Download } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';
import AdminNavbar from '@/components/AdminNavbar';
const LazyRichTextEditor = lazy(() => import('@/components/LazyRichTextEditor'));
import { enhancedProductService, supabase } from '@/supabase';
import { sanitizeString } from '@/utils/sanitize';
import type { Category, Subcategory, Product } from '@/types/product';

const AdminProductsEnhanced = memo(() => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState('all-products');
  const [detailsTab, setDetailsTab] = useState('overview');

  const [productForm, setProductForm] = useState({
    title: '',
    display_name: '',
    product_overview: '',
    model: [] as string[],
    category_id: '',
    subcategory_id: '',
    overview: '',
    technical_details: '',
    warranty: '',
    help_image_url: '',
    help_text: '',
    shipping_time: '',
    shipping_cost: 0,
    engraving_image_url: '',
    engraving_price: 0,
    image: ''
  });

  const [variants, setVariants] = useState<any[]>([]);
  const [colors, setColors] = useState<any[]>([]);
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Load minimal data first
      const productsData = await supabase
        .from('products')
        .select('id, title, category_id')
        .order('id', { ascending: false })
        .limit(10);
      
      setProducts(productsData.data || []);
      setLoading(false);
      
      // Load everything else after UI renders
      setTimeout(async () => {
        const [fullProducts, categories, subcategories] = await Promise.all([
          supabase.from('products').select('id, title, display_name, category_id, subcategory_id, model, image').order('id', { ascending: false }).limit(50),
          supabase.from('product_categories').select('id, name').eq('is_active', true),
          supabase.from('product_subcategories').select('id, name, category_id').eq('is_active', true)
        ]);
        
        setProducts(fullProducts.data || []);
        setCategories(categories.data || []);
        setSubcategories(subcategories.data || []);
      }, 100);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
    }
  }, []);

  const resetForm = useCallback(() => {
    setProductForm({
      title: '', display_name: '', product_overview: '', model: [],
      category_id: '', subcategory_id: '', overview: '', technical_details: '',
      warranty: '', help_image_url: '', help_text: '', shipping_time: '',
      shipping_cost: 0, engraving_image_url: '', engraving_price: 0, image: ''
    });
    setVariants([]);
    setColors([]);
    setAdditionalImages([]);
    setEditingProduct(null);
    setLoadingProduct(false);
  }, []);

  const handleCreateProduct = useCallback(async () => {
    if (!productForm.title || !productForm.category_id) {
      toast({ 
        title: "Missing Fields", 
        description: "Please fill in product name and category",
        variant: "destructive" 
      });
      return;
    }

    setSaving(true);
    try {
      const productData = {
        title: productForm.title,
        display_name: productForm.display_name || productForm.title,
        product_overview: productForm.product_overview,
        model: Array.isArray(productForm.model) ? productForm.model.join(',').substring(0, 20) : (productForm.model || 'Zigbee').substring(0, 20),
        category_id: productForm.category_id,
        subcategory_id: productForm.subcategory_id || null,
        overview: productForm.overview,
        technical_details: productForm.technical_details,
        warranty: productForm.warranty,
        help_image_url: productForm.help_image_url,
        help_text: productForm.help_text,
        shipping_time: productForm.shipping_time,
        shipping_cost: productForm.shipping_cost || 0,
        engraving_image_url: productForm.engraving_image_url,
        engraving_price: productForm.engraving_price || 0,
        image: productForm.image,
        additional_images: additionalImages.length > 0 ? JSON.stringify(additionalImages) : null,
        variants: variants.length > 0 ? variants : null,
        colors: colors.length > 0 ? colors : null,
        price: 0,
        stock_quantity: 0,
        is_active: true,
        status: 'active'
      };

      const { data, error } = await supabase
        .from('products')
        .insert(productData)
        .select('id, title, display_name, category_id, subcategory_id, model, image, engraving_image_url')
        .single();

      if (error) throw error;
      
      toast({ title: "Success", description: "Product created successfully" });
      setIsProductDialogOpen(false);
      resetForm();
      
      // Add new product to local state instead of full reload
      setProducts(prev => [data, ...prev]);
    } catch (error) {
      console.error('Product creation error:', error);
      toast({ title: "Error", description: String(error?.message || 'An error occurred').replace(/[<>&"']/g, ''), variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }, [productForm, variants, colors, additionalImages, resetForm]);

  const handleEditProduct = useCallback(async (productId) => {
    setIsProductDialogOpen(true);
    setEditingProduct({ id: productId });
    
    setTimeout(async () => {
      setLoadingProduct(true);
      try {
        const { data: basic } = await supabase
          .from('products')
          .select('title, display_name, category_id, subcategory_id, model, image')
          .eq('id', productId)
          .single();
        
        setProductForm({
          title: basic.title || '',
          display_name: basic.display_name || '',
          category_id: basic.category_id || '',
          subcategory_id: basic.subcategory_id || '',
          model: basic.model ? (typeof basic.model === 'string' ? basic.model.split(',') : basic.model) : [],
          image: basic.image || '',
          product_overview: '', overview: '', technical_details: '', warranty: '',
          help_image_url: '', help_text: '', shipping_time: '', shipping_cost: 0,
          engraving_image_url: '', engraving_price: 0
        });
        setLoadingProduct(false);
        
        const { data: full } = await supabase.from('products').select('*').eq('id', productId).single();
        if (full) {
          setEditingProduct(full);
          
          setTimeout(() => {
            setProductForm(prev => ({ ...prev, overview: full.overview || '', technical_details: full.technical_details || '' }));
          }, 200);
          
          setTimeout(() => {
            setProductForm(prev => ({ ...prev, warranty: full.warranty || '', help_text: full.help_text || '' }));
          }, 400);
          
          setTimeout(() => {
            setProductForm(prev => ({ ...prev, shipping_time: full.shipping_time || '', engraving_image_url: full.engraving_image_url || '' }));
            setVariants(full.variants || []);
            setColors(full.colors || []);
            setAdditionalImages(full.additional_images ? JSON.parse(full.additional_images) : []);
          }, 600);
        }
      } catch (error) {
        setLoadingProduct(false);
      }
    }, 50);
  }, []);

  const handleUpdateProduct = useCallback(async () => {
    if (!productForm.title || !productForm.category_id) {
      toast({ 
        title: "Missing Fields", 
        description: "Please fill in product name and category",
        variant: "destructive" 
      });
      return;
    }

    setSaving(true);
    try {
      const updateData = {
        title: productForm.title,
        display_name: productForm.display_name || productForm.title,
        product_overview: productForm.product_overview,
        model: Array.isArray(productForm.model) ? productForm.model.join(',').substring(0, 20) : (productForm.model || 'Zigbee').substring(0, 20),
        category_id: productForm.category_id,
        subcategory_id: productForm.subcategory_id || null,
        overview: productForm.overview,
        technical_details: productForm.technical_details,
        warranty: productForm.warranty,
        help_image_url: productForm.help_image_url,
        help_text: productForm.help_text,
        shipping_time: productForm.shipping_time,
        shipping_cost: productForm.shipping_cost || 0,
        engraving_image_url: productForm.engraving_image_url,
        engraving_price: productForm.engraving_price || 0,
        image: productForm.image,
        additional_images: additionalImages.length > 0 ? JSON.stringify(additionalImages) : null,
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
      
      // Update local state instead of full reload
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? 
        { ...p, title: updateData.title, display_name: updateData.display_name, image: updateData.image } : p
      ));
    } catch (error) {
      console.error('Product update error:', error);
      toast({ title: "Error", description: String(error?.message || 'Update failed').replace(/[<>&"']/g, ''), variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }, [productForm, variants, colors, additionalImages, editingProduct, resetForm]);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      if (!searchTerm) return true;
      return product.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
             product.display_name?.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [products, searchTerm]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminNavbar />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
            {/* Search and Export */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button 
              variant="outline" 
              onClick={() => {
                const csvContent = "data:text/csv;charset=utf-8," + 
                  "Title,Category,Subcategory,Model,Engraving\n" +
                  filteredProducts.map(product => {
                    const category = categories.find(cat => cat.id === product.category_id);
                    const subcategory = subcategories.find(sub => sub.id === product.subcategory_id);
                    return `"${sanitizeString(product.title)}","${sanitizeString(category?.name || '')}","${sanitizeString(subcategory?.name || '')}","${sanitizeString(product.model || '')}","${product.engraving_image_url ? 'Yes' : 'No'}"`;
                  }).join("\n");
                const encodedUri = encodeURI(csvContent);
                const link = document.createElement("a");
                link.setAttribute("href", encodedUri);
                link.setAttribute("download", "products.csv");
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
            >
              <Download className="w-4 h-4 mr-2" />
              Export All
            </Button>
          </div>
        </div>

            {/* Products List */}
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden w-full">
          {/* Header */}
          <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 border-b font-medium text-sm text-gray-700 w-full">
            <div className="col-span-1">Image</div>
            <div className="col-span-3">Title</div>
            <div className="col-span-2">Category</div>
            <div className="col-span-2">Subcategory</div>
            <div className="col-span-1">Model</div>
            <div className="col-span-1">Engraving</div>
            <div className="col-span-2">Actions</div>
          </div>
          
          {/* Products */}
          {filteredProducts.map((product) => {
            const category = categories.find(cat => cat.id === product.category_id);
            const subcategory = subcategories.find(sub => sub.id === product.subcategory_id);
            
            return (
              <div key={product.id} className="grid grid-cols-12 gap-4 p-4 border-b hover:bg-gray-50 transition-colors w-full">
                <div className="col-span-1">
                  {product.image ? (
                    <img 
                      src={product.image} 
                      alt={product.title} 
                      className="w-12 h-12 object-cover rounded" 
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                      <Package className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                </div>
                
                <div className="col-span-3">
                  <h3 className="font-medium text-gray-900">{product.title}</h3>
                  <p className="text-sm text-gray-500">{product.display_name}</p>
                </div>
                
                <div className="col-span-2">
                  <span className="text-sm text-gray-700">{category?.name || '-'}</span>
                </div>
                
                <div className="col-span-2">
                  <span className="text-sm text-gray-700">{subcategory?.name || '-'}</span>
                </div>
                
                <div className="col-span-1">
                  {product.model && (
                    <Badge variant="secondary" className="text-xs">{product.model}</Badge>
                  )}
                </div>
                
                <div className="col-span-1">
                  <Badge variant={product.engraving_image_url ? 'default' : 'secondary'} className="text-xs">
                    {product.engraving_image_url ? 'Yes' : 'No'}
                  </Badge>
                </div>
                
                <div className="col-span-2">
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0"
                      onClick={() => handleEditProduct(product.id)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                      onClick={() => {
                        setProductToDelete(product);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
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
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {categories.map(category => {
                const categoryProducts = products.filter(p => p.category_id === category.id);
                const categorySubcategories = subcategories.filter(sub => sub.category_id === category.id);
                
                return (
                  <Card key={category.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 border-0 shadow-md">
                    <div className="bg-gradient-to-r from-primary to-primary/80 p-6 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-xl font-bold mb-1">{category.name}</h2>
                          <div className="flex items-center gap-4 text-blue-100 text-sm">
                            <span className="flex items-center gap-1">
                              <Package className="w-4 h-4" />
                              {categoryProducts.length} products
                            </span>
                            <span className="flex items-center gap-1">
                              <Layers className="w-4 h-4" />
                              {categorySubcategories.length} subcategories
                            </span>
                          </div>
                        </div>
                        <Button 
                          onClick={() => {
                            resetForm();
                            setProductForm(prev => ({...prev, category_id: category.id}));
                            setIsProductDialogOpen(true);
                          }}
                          className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                          size="sm"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add
                        </Button>
                      </div>
                    </div>
                    <div className="p-6">
                      {categorySubcategories.length > 0 ? (
                        <div className="space-y-4">
                          {categorySubcategories.map(subcategory => {
                            const subcategoryProducts = products.filter(p => p.subcategory_id === subcategory.id);
                            return (
                              <div key={subcategory.id} className="border rounded-lg p-4 bg-gray-50/50 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                                      <Layers className="w-4 h-4 text-primary" />
                                    </div>
                                    <div>
                                      <h3 className="font-semibold text-gray-900">{subcategory.name}</h3>
                                      <p className="text-xs text-gray-500">{subcategoryProducts.length} products</p>
                                    </div>
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
                                  <div className="space-y-2">
                                    {subcategoryProducts.slice(0, 3).map((product) => (
                                      <div key={product.id} className="flex items-center justify-between p-2 bg-white rounded border">
                                        <div className="flex items-center gap-3">
                                          {product.image ? (
                                            <img 
                                              src={product.image} 
                                              alt={product.title} 
                                              className="w-8 h-8 object-cover rounded" 
                                              loading="lazy"
                                            />
                                          ) : (
                                            <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                                              <Package className="w-4 h-4 text-gray-400" />
                                            </div>
                                          )}
                                          <div>
                                            <h4 className="font-medium text-sm text-gray-900">{product.title}</h4>
                                            <p className="text-xs text-gray-500">{product.display_name}</p>
                                          </div>
                                        </div>
                                        <div className="flex gap-1">
                                          <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            className="h-7 w-7 p-0"
                                            onClick={() => handleEditProduct(product.id)}
                                          >
                                            <Edit className="w-3 h-3" />
                                          </Button>
                                          <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            className="h-7 w-7 p-0 text-red-500"
                                            onClick={() => {
                                              setProductToDelete(product);
                                              setDeleteDialogOpen(true);
                                            }}
                                          >
                                            <Trash2 className="w-3 h-3" />
                                          </Button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="text-center py-4 text-gray-500">
                                    <Package className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                    <p className="text-xs">No products yet</p>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Layers className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500 text-sm mb-3">No subcategories</p>
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>

        {/* Product Dialog */}
        <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto" aria-describedby="product-dialog-description">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </DialogTitle>
              <div id="product-dialog-description" className="sr-only">
                {editingProduct ? 'Edit product details and information' : 'Create a new product with details and information'}
              </div>
            </DialogHeader>
            
            <div className="space-y-6 py-4 relative">
            {loadingProduct && (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}
              {/* Basic Information */}
              <Card className="p-6">
                <h3 className="font-semibold mb-4 flex items-center text-lg">
                  <Package className="w-5 h-5 mr-2 text-blue-600" />
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Title *</Label>
                    <Input
                      value={productForm.title}
                      onChange={(e) => setProductForm({...productForm, title: e.target.value})}
                      placeholder="Product title"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Display Name</Label>
                    <Input
                      value={productForm.display_name}
                      onChange={(e) => setProductForm({...productForm, display_name: e.target.value})}
                      placeholder="Display name"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Category *</Label>
                    <Select 
                      value={productForm.category_id} 
                      onValueChange={(value) => setProductForm({...productForm, category_id: value, subcategory_id: ''})}
                    >
                      <SelectTrigger className="mt-1 bg-white">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {categories.map(cat => (
                          <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Subcategory</Label>
                    <Select value={productForm.subcategory_id || 'none'} onValueChange={(value) => setProductForm({...productForm, subcategory_id: value === 'none' ? '' : value})}>
                      <SelectTrigger className="mt-1 bg-white">
                        <SelectValue placeholder="Select subcategory" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="none">No Subcategory</SelectItem>
                        {subcategories.filter(sub => sub.category_id === productForm.category_id).map(subcat => (
                          <SelectItem key={subcat.id} value={subcat.id}>{subcat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Model</Label>
                    <div className="mt-1 space-y-2">
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
                </div>
              </Card>

              {/* Product Images */}
              <Card className="p-6">
                <h3 className="font-semibold mb-4 flex items-center text-lg">
                  <Package className="w-5 h-5 mr-2 text-orange-600" />
                  Product Images
                </h3>
                
                {/* Main Image */}
                <div className="mb-6">
                  <Label className="text-sm font-medium mb-2 block">Main Image *</Label>
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const file = e.dataTransfer.files[0];
                      if (file && file.type.startsWith('image/')) {
                        const reader = new FileReader();
                        reader.onload = (e) => setProductForm({...productForm, image: e.target?.result as string});
                        reader.readAsDataURL(file);
                      }
                    }}
                    onClick={() => document.getElementById('main-image-input').click()}
                  >
                    {productForm.image ? (
                      <div className="relative">
                        <img src={productForm.image} alt="Main" className="max-h-32 mx-auto rounded" />
                        <Button 
                          type="button"
                          variant="outline" 
                          size="sm" 
                          className="mt-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            setProductForm({...productForm, image: ''});
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <Package className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600">Drag & drop main image or click to browse</p>
                        <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 10MB</p>
                      </div>
                    )}
                  </div>
                  <input
                    id="main-image-input"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (e) => setProductForm({...productForm, image: e.target?.result as string});
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </div>

                {/* Additional Images */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm font-medium">Additional Images</Label>
                    <Button 
                      type="button"
                      variant="outline" 
                      size="sm"
                      onClick={() => setAdditionalImages([...additionalImages, ''])}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Image
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {additionalImages.map((image, index) => (
                      <div key={index}>
                        <div
                          className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors cursor-pointer h-32"
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => {
                            e.preventDefault();
                            const file = e.dataTransfer.files[0];
                            if (file && file.type.startsWith('image/')) {
                              const reader = new FileReader();
                              reader.onload = (e) => {
                                const updated = [...additionalImages];
                                updated[index] = e.target?.result as string;
                                setAdditionalImages(updated);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          onClick={() => document.getElementById(`additional-image-${index}`).click()}
                        >
                          {image ? (
                            <div className="relative h-full">
                              <img src={image} alt={`Additional ${index + 1}`} className="h-full w-full object-cover rounded" />
                              <Button 
                                type="button"
                                variant="outline" 
                                size="sm" 
                                className="absolute top-1 right-1 h-6 w-6 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const updated = additionalImages.filter((_, i) => i !== index);
                                  setAdditionalImages(updated);
                                }}
                              >
                                ×
                              </Button>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center h-full">
                              <Plus className="w-6 h-6 text-gray-400 mb-1" />
                              <p className="text-xs text-gray-500">Image {index + 1}</p>
                            </div>
                          )}
                        </div>
                        <input
                          id={`additional-image-${index}`}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (e) => {
                                const updated = [...additionalImages];
                                updated[index] = e.target?.result as string;
                                setAdditionalImages(updated);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Product Details */}
              <Card className="p-6">
                <h3 className="font-semibold mb-4 flex items-center text-lg">
                  <Settings className="w-5 h-5 mr-2 text-green-600" />
                  Product Details
                </h3>
                
                <Tabs value={detailsTab} onValueChange={setDetailsTab} className="space-y-4">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="technical-details">Technical Details</TabsTrigger>
                    <TabsTrigger value="warranty">Warranty Information</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-2">
                    <Label className="text-sm font-medium">Overview</Label>
                    <Suspense fallback={<div className="h-48 bg-gray-50 rounded animate-pulse" />}>
                      <LazyRichTextEditor
                        value={productForm.overview}
                        onChange={(value) => setProductForm({...productForm, overview: value})}
                        placeholder="Write detailed product description with rich formatting..."
                      />
                    </Suspense>
                  </TabsContent>

                  <TabsContent value="technical-details" className="space-y-2">
                    <Label className="text-sm font-medium">Technical Details</Label>
                    <Suspense fallback={<div className="h-48 bg-gray-50 rounded animate-pulse" />}>
                      <LazyRichTextEditor
                        value={productForm.technical_details}
                        onChange={(value) => setProductForm({...productForm, technical_details: value})}
                        placeholder="Write technical specifications with rich formatting..."
                      />
                    </Suspense>
                  </TabsContent>

                  <TabsContent value="warranty" className="space-y-2">
                    <Label className="text-sm font-medium">Warranty Information</Label>
                    <Suspense fallback={<div className="h-48 bg-gray-50 rounded animate-pulse" />}>
                      <LazyRichTextEditor
                        value={productForm.warranty}
                        onChange={(value) => setProductForm({...productForm, warranty: value})}
                        placeholder="Write warranty terms with rich formatting..."
                      />
                    </Suspense>
                  </TabsContent>
                </Tabs>
              </Card>

              {/* Variants */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold flex items-center text-lg">
                    <Layers className="w-5 h-5 mr-2 text-purple-600" />
                    Product Variants
                  </h3>
                  <Button onClick={() => setVariants([...variants, {name: '', price: 0, discount_price: 0, stock: 0, is_default: false, is_active: true}])} variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-1" />
                    Add Variant
                  </Button>
                </div>
                {variants.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No variants added yet</p>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3 p-3 bg-gray-100 rounded-lg font-medium text-sm text-gray-700">
                      <div>Name</div>
                      <div>Price (BDT)</div>
                      <div>Discount Price (BDT)</div>
                      <div>Stock Quantity</div>
                      <div>Action</div>
                    </div>
                    {variants.map((variant, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-3 p-4 border rounded-lg bg-gray-50">
                        <Input
                          placeholder="Variant Name"
                          value={variant.name}
                          onChange={(e) => {
                            const updated = [...variants];
                            updated[index] = { ...updated[index], name: e.target.value };
                            setVariants(updated);
                          }}
                        />
                        <Input
                          type="number"
                          placeholder="Price"
                          value={variant.price}
                          onChange={(e) => {
                            const updated = [...variants];
                            updated[index] = { ...updated[index], price: parseFloat(e.target.value) || 0 };
                            setVariants(updated);
                          }}
                        />
                        <Input
                          type="number"
                          placeholder="Discount Price"
                          value={variant.discount_price}
                          onChange={(e) => {
                            const updated = [...variants];
                            updated[index] = { ...updated[index], discount_price: parseFloat(e.target.value) || 0 };
                            setVariants(updated);
                          }}
                        />
                        <Input
                          type="number"
                          placeholder="Stock"
                          value={variant.stock}
                          onChange={(e) => {
                            const updated = [...variants];
                            updated[index] = { ...updated[index], stock: parseInt(e.target.value) || 0 };
                            setVariants(updated);
                          }}
                        />
                        <Button onClick={() => setVariants(variants.filter((_, i) => i !== index))} variant="outline" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Colors */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold flex items-center text-lg">
                    <Palette className="w-5 h-5 mr-2 text-pink-600" />
                    Product Colors
                  </h3>
                  <Button onClick={() => setColors([...colors, {name: '', hex_code: '#000000', is_active: true}])} variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-1" />
                    Add Color
                  </Button>
                </div>
                {colors.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No colors added yet</p>
                ) : (
                  <div className="space-y-3">
                    {colors.map((color, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 border rounded-lg bg-gray-50">
                        <Input
                          placeholder="Color name"
                          value={color.name}
                          onChange={(e) => {
                            const updated = [...colors];
                            updated[index] = { ...updated[index], name: e.target.value };
                            setColors(updated);
                          }}
                        />
                        <div className="flex items-center space-x-2">
                          <Input
                            type="color"
                            value={color.hex_code}
                            onChange={(e) => {
                              const updated = [...colors];
                              updated[index] = { ...updated[index], hex_code: e.target.value };
                              setColors(updated);
                            }}
                            className="w-16 h-10 p-1"
                          />
                          <Input
                            placeholder="#FFFFFF"
                            value={color.hex_code}
                            onChange={(e) => {
                              const updated = [...colors];
                              updated[index] = { ...updated[index], hex_code: e.target.value };
                              setColors(updated);
                            }}
                          />
                        </div>
                        <Button onClick={() => setColors(colors.filter((_, i) => i !== index))} variant="outline" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Help Section */}
              <Card className="p-6">
                <h3 className="font-semibold mb-4 flex items-center text-lg">
                  <Settings className="w-5 h-5 mr-2 text-orange-600" />
                  Need Help Deciding Section
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Help Image</Label>
                    <div
                      className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const file = e.dataTransfer.files[0];
                        if (file && file.type.startsWith('image/')) {
                          const reader = new FileReader();
                          reader.onload = (e) => setProductForm({...productForm, help_image_url: e.target?.result as string});
                          reader.readAsDataURL(file);
                        }
                      }}
                      onClick={() => document.getElementById('help-image-input').click()}
                    >
                      {productForm.help_image_url ? (
                        <div className="relative">
                          <img src={productForm.help_image_url} alt="Help" className="max-h-32 mx-auto rounded" />
                          <Button 
                            type="button"
                            variant="outline" 
                            size="sm" 
                            className="mt-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              setProductForm({...productForm, help_image_url: ''});
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                      ) : (
                        <div>
                          <Package className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-600">Drag & drop help image or click to browse</p>
                        </div>
                      )}
                    </div>
                    <input
                      id="help-image-input"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (e) => setProductForm({...productForm, help_image_url: e.target?.result as string});
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Help Text</Label>
                    <Suspense fallback={<div className="h-48 bg-gray-50 rounded animate-pulse" />}>
                      <LazyRichTextEditor
                        value={productForm.help_text}
                        onChange={(value) => setProductForm({...productForm, help_text: value})}
                        placeholder="Write helpful information with rich formatting..."
                      />
                    </Suspense>
                  </div>
                </div>
              </Card>

              {/* Engraving */}
              <Card className="p-6">
                <h3 className="font-semibold mb-4 flex items-center text-lg">
                  <Settings className="w-5 h-5 mr-2 text-indigo-600" />
                  Engraving Options
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Engraving Image</Label>
                    <div
                      className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const file = e.dataTransfer.files[0];
                        if (file && file.type.startsWith('image/')) {
                          const reader = new FileReader();
                          reader.onload = (e) => setProductForm({...productForm, engraving_image_url: e.target?.result as string});
                          reader.readAsDataURL(file);
                        }
                      }}
                      onClick={() => document.getElementById('engraving-image-input').click()}
                    >
                      {productForm.engraving_image_url ? (
                        <div className="relative">
                          <img src={productForm.engraving_image_url} alt="Engraving" className="max-h-32 mx-auto rounded" />
                          <Button 
                            type="button"
                            variant="outline" 
                            size="sm" 
                            className="mt-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              setProductForm({...productForm, engraving_image_url: ''});
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                      ) : (
                        <div>
                          <Package className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-600">Drag & drop engraving template or click to browse</p>
                        </div>
                      )}
                    </div>
                    <input
                      id="engraving-image-input"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (e) => setProductForm({...productForm, engraving_image_url: e.target?.result as string});
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Engraving Price (BDT)</Label>
                    <Input
                      type="number"
                      value={productForm.engraving_price}
                      onChange={(e) => setProductForm({...productForm, engraving_price: parseFloat(e.target.value) || 0})}
                      placeholder="500"
                      className="mt-1"
                    />
                  </div>
                </div>
              </Card>
              
              <div className="flex justify-end space-x-3 pt-6 border-t">
                <Button variant="outline" onClick={() => setIsProductDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={editingProduct ? handleUpdateProduct : handleCreateProduct}
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={saving || loadingProduct}
                >
                  {saving ? 'Saving...' : (editingProduct ? 'Update Product' : 'Create Product')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-red-600">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                Delete Product
              </DialogTitle>
            </DialogHeader>
            
            <div className="py-4">
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete <span className="font-semibold text-gray-900">{String(productToDelete?.title || '').replace(/[<>&"']/g, '')}</span>?
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800">
                  <strong>Warning:</strong> This action cannot be undone. The product will be permanently removed from your catalog.
                </p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => {
                  setDeleteDialogOpen(false);
                  setProductToDelete(null);
                }}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive"
                onClick={async () => {
                  try {
                    const { error } = await supabase
                      .from('products')
                      .delete()
                      .eq('id', productToDelete.id);
                    
                    if (error) throw error;
                    
                    toast({ title: "Success", description: "Product deleted successfully" });
                    setDeleteDialogOpen(false);
                    setProductToDelete(null);
                    loadData();
                  } catch (error) {
                    toast({ title: "Error", description: String(error?.message || 'An error occurred').replace(/[<>&"']/g, ''), variant: "destructive" });
                  }
                }}
                className="bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Product
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
});

export default AdminProductsEnhanced;