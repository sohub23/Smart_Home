import { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Package, Layers, Palette, DollarSign, Search, Filter, Eye, Settings, Grid3X3, List, MoreVertical, Star } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';
import AdminNavbar from '@/components/AdminNavbar';
import { enhancedProductService, supabase } from '@/supabase';
import type { Category, Subcategory, Product, ProductVariant, ProductColor } from '@/types/product';

const AdminProductsEnhanced = () => {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  const [productForm, setProductForm] = useState({
    title: '',
    display_name: '',
    product_overview: '',
    model: [],
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
    image: '',
    image2: '',
    image3: '',
    image4: '',
    image5: '',
    gang_1_image: '',
    gang_2_image: '',
    gang_3_image: '',
    gang_4_image: ''
  });

  const [rollerCurtainForm, setRollerCurtainForm] = useState({
    title: '',
    display_name: '',
    product_overview: '',
    model: 'Zigbee',
    category_id: '',
    subcategory_id: '',
    price: 0,
    stock: 0,
    specifications: '',
    warranty: '',
    image: '',
    image2: '',
    image3: '',
    image4: '',
    image5: '',
    gang_1_image: '',
    gang_2_image: '',
    gang_3_image: '',
    gang_4_image: ''
  });

  const [isRollerCurtainModal, setIsRollerCurtainModal] = useState(false);

  const [variants, setVariants] = useState([]);
  const [colors, setColors] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  // Remove the useEffect that was clearing subcategories
  // Subcategories are now loaded once in loadData()

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Test all possible product tables
      const tables = ['products', 'simple_products', 'enhanced_products'];
      for (const table of tables) {
        const { data, error } = await supabase.from(table).select('*').limit(5);
        console.log(`Table ${table}:`, { data, error, count: data?.length });
      }
      
      // Try multiple product sources
      let productsData = [];
      try {
        productsData = await enhancedProductService.getProducts();
      } catch (error) {
        console.log('Enhanced service failed, trying direct query');
        const { data } = await supabase.from('products').select('*');
        productsData = data || [];
      }
      
      const [categoriesData, subcategoriesData] = await Promise.all([
        enhancedProductService.getCategories(),
        enhancedProductService.getSubcategories()
      ]);
      console.log('Setting state with:', { 
        categories: categoriesData?.length, 
        subcategories: subcategoriesData?.length, 
        products: productsData?.length,
        productsData 
      });
      
      setCategories(categoriesData || []);
      setSubcategories(subcategoriesData || []);
      setProducts(productsData || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({ 
        title: "Error", 
        description: `Failed to load data: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSubcategories = async (categoryId) => {
    try {
      // Load all subcategories, not filtered by category
      const allSubcategories = await enhancedProductService.getSubcategories();
      setSubcategories(allSubcategories || []);
    } catch (error) {
      console.error('Error loading subcategories:', error);
      toast({ 
        title: "Error", 
        description: "Failed to load subcategories",
        variant: "destructive"
      });
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
        product_overview: productForm.product_overview,
        model: productForm.model.join(','),
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
        is_active: true,
        status: 'active',
        position: products.length + 1
      };

      const { data, error } = await supabase
        .from('products')
        .insert(productData)
        .select()
        .single();

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

  const resetForm = () => {
    setProductForm({
      title: '', display_name: '', product_overview: '', model: 'Zigbee',
      category_id: '', subcategory_id: '', overview: '', technical_details: '',
      warranty: '', help_image_url: '', help_text: '', shipping_time: '',
      shipping_cost: 0, engraving_image_url: '', engraving_price: 0, image: '', image2: '', image3: '', image4: '', image5: '',
      gang_1_image: '', gang_2_image: '', gang_3_image: '', gang_4_image: ''
    });
    setRollerCurtainForm({
      title: '', display_name: '', product_overview: '',
      model: 'Zigbee', category_id: '', subcategory_id: '', price: 0, stock: 0,
      specifications: '', warranty: '', image: '', image2: '', image3: '', image4: '', image5: '',
      gang_1_image: '', gang_2_image: '', gang_3_image: '', gang_4_image: ''
    });
    setVariants([]);
    setColors([]);
    setEditingProduct(null);
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
        product_overview: productForm.product_overview,
        model: productForm.model,
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
        image: productForm.image,
        image2: productForm.image2,
        image3: productForm.image3,
        image4: productForm.image4,
        image5: productForm.image5,
        gang_1_image: productForm.gang_1_image,
        gang_2_image: productForm.gang_2_image,
        gang_3_image: productForm.gang_3_image,
        gang_4_image: productForm.gang_4_image
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

  const addVariant = () => {
    const selectedSubcategory = subcategories.find(sub => sub.id === productForm.subcategory_id);
    const subcategoryName = selectedSubcategory?.name?.toLowerCase() || '';
    
    let newVariant = {
      name: '',
      sku: '',
      price: 0,
      discount_price: 0,
      stock: 0,
      is_default: false,
      is_active: true
    };
    
    // Set default name based on subcategory
    if (subcategoryName.includes('switch') || subcategoryName.includes('light')) {
      newVariant.name = '1 Gang';
    } else if (subcategoryName.includes('curtain')) {
      newVariant.name = 'Standard Size';
    } else if (subcategoryName.includes('panel')) {
      newVariant.name = 'Standard Panel';
    }
    
    setVariants([...variants, newVariant]);
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

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Show all products if no filters are selected
      if (!selectedCategory && !selectedSubcategory && !searchTerm) return true;
      
      // Filter by search term if provided
      if (searchTerm && !(
        product.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.display_name?.toLowerCase().includes(searchTerm.toLowerCase())
      )) return false;
      
      return true;
    });
  }, [products, selectedCategory, selectedSubcategory, searchTerm]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
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
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Product Management
              </h1>
              <p className="text-gray-600">Manage your smart home products efficiently</p>
              <div className="mt-4 flex gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Products: <span className="font-semibold text-gray-900">{products.length}</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Categories: <span className="font-semibold text-gray-900">{categories.length}</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Subcategories: <span className="font-semibold text-gray-900">{subcategories.length}</span></span>
                </div>
              </div>
            </div>
            <Button 
              onClick={() => {
                resetForm();
                setIsProductDialogOpen(true);
              }}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </Button>
          </div>
        </div>

        <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
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
                      placeholder="Smart Security Camera Pro"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Display Name *</Label>
                    <Input
                      value={productForm.display_name}
                      onChange={(e) => setProductForm({...productForm, display_name: e.target.value})}
                      placeholder="SecureCam Pro"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Category *</Label>
                    <Select 
                      value={productForm.category_id} 
                      onValueChange={(value) => {
                        setProductForm({...productForm, category_id: value, subcategory_id: ''});
                      }}
                    >
                      <SelectTrigger className="mt-1 bg-white">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {categories.map(cat => (
                          <SelectItem key={cat.id} value={cat.id} className="hover:bg-gray-100">{cat.name}</SelectItem>
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
                        <SelectItem value="none" className="hover:bg-gray-100">No Subcategory</SelectItem>
                        {subcategories.filter(sub => sub.category_id === productForm.category_id).map(subcat => (
                          <SelectItem key={subcat.id} value={subcat.id} className="hover:bg-gray-100">{subcat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Model *</Label>
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
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <label htmlFor={`model-${modelOption}`} className="text-sm text-gray-700">
                            {modelOption}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Shipping Time</Label>
                    <Input
                      value={productForm.shipping_time}
                      onChange={(e) => setProductForm({...productForm, shipping_time: e.target.value})}
                      placeholder="3-7 business days"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Shipping Cost (BDT)</Label>
                    <Input
                      type="number"
                      value={productForm.shipping_cost}
                      onChange={(e) => setProductForm({...productForm, shipping_cost: parseFloat(e.target.value) || 0})}
                      placeholder="0"
                      className="mt-1"
                    />
                  </div>

                </div>
              </Card>

              {/* Product Details */}
              <Card className="p-6">
                <h3 className="font-semibold mb-4 flex items-center text-lg">
                  <Settings className="w-5 h-5 mr-2 text-green-600" />
                  Product Details
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Overview</Label>
                    <Textarea
                      value={productForm.overview}
                      onChange={(e) => setProductForm({...productForm, overview: e.target.value})}
                      placeholder="Detailed product overview and description"
                      rows={4}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Technical Details</Label>
                    <Textarea
                      value={productForm.technical_details}
                      onChange={(e) => setProductForm({...productForm, technical_details: e.target.value})}
                      placeholder="Technical specifications and details"
                      rows={4}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Warranty Information</Label>
                    <Textarea
                      value={productForm.warranty}
                      onChange={(e) => setProductForm({...productForm, warranty: e.target.value})}
                      placeholder="Warranty terms and conditions"
                      rows={3}
                      className="mt-1"
                    />
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
                        reader.onload = (e) => setProductForm({...productForm, image: e.target.result});
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
                        reader.onload = (e) => setProductForm({...productForm, image: e.target.result});
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </div>

                {/* Additional Images */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Additional Images</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {['image2', 'image3', 'image4', 'image5'].map((imageKey, index) => (
                      <div key={imageKey}>
                        <div
                          className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors cursor-pointer h-32"
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => {
                            e.preventDefault();
                            const file = e.dataTransfer.files[0];
                            if (file && file.type.startsWith('image/')) {
                              const reader = new FileReader();
                              reader.onload = (e) => setProductForm({...productForm, [imageKey]: e.target.result});
                              reader.readAsDataURL(file);
                            }
                          }}
                          onClick={() => document.getElementById(`${imageKey}-input`).click()}
                        >
                          {productForm[imageKey] ? (
                            <div className="relative h-full">
                              <img src={productForm[imageKey]} alt={`Image ${index + 2}`} className="h-full w-full object-cover rounded" />
                              <Button 
                                type="button"
                                variant="outline" 
                                size="sm" 
                                className="absolute top-1 right-1 h-6 w-6 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setProductForm({...productForm, [imageKey]: ''});
                                }}
                              >
                                ×
                              </Button>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center h-full">
                              <Plus className="w-6 h-6 text-gray-400 mb-1" />
                              <p className="text-xs text-gray-500">Image {index + 2}</p>
                            </div>
                          )}
                        </div>
                        <input
                          id={`${imageKey}-input`}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (e) => setProductForm({...productForm, [imageKey]: e.target.result});
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Gang-specific Images for Light Switch */}
                {productForm.subcategory_id && subcategories.find(sub => sub.id === productForm.subcategory_id)?.name?.toLowerCase().includes('switch') && (
                  <div className="mt-6">
                    <Label className="text-sm font-medium mb-2 block">Gang Images (Light Switch)</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {['gang_1_image', 'gang_2_image', 'gang_3_image', 'gang_4_image'].map((gangKey, index) => (
                        <div key={gangKey}>
                          <Label className="text-xs text-gray-600 mb-1 block">{index + 1} Gang</Label>
                          <div
                            className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors cursor-pointer h-32"
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                              e.preventDefault();
                              const file = e.dataTransfer.files[0];
                              if (file && file.type.startsWith('image/')) {
                                const reader = new FileReader();
                                reader.onload = (e) => setProductForm({...productForm, [gangKey]: e.target.result});
                                reader.readAsDataURL(file);
                              }
                            }}
                            onClick={() => document.getElementById(`${gangKey}-input`).click()}
                          >
                            {productForm[gangKey] ? (
                              <div className="relative h-full">
                                <img src={productForm[gangKey]} alt={`${index + 1} Gang`} className="h-full w-full object-cover rounded" />
                                <Button 
                                  type="button"
                                  variant="outline" 
                                  size="sm" 
                                  className="absolute top-1 right-1 h-6 w-6 p-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setProductForm({...productForm, [gangKey]: ''});
                                  }}
                                >
                                  ×
                                </Button>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center h-full">
                                <Plus className="w-6 h-6 text-gray-400 mb-1" />
                                <p className="text-xs text-gray-500">{index + 1}G</p>
                              </div>
                            )}
                          </div>
                          <input
                            id={`${gangKey}-input`}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (e) => setProductForm({...productForm, [gangKey]: e.target.result});
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>

              {/* Variants */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold flex items-center text-lg">
                    <Layers className="w-5 h-5 mr-2 text-purple-600" />
                    Product Variants
                  </h3>
                  <Button onClick={addVariant} variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-1" />
                    Add Variant
                  </Button>
                </div>
                {variants.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No variants added yet</p>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-3 p-3 bg-gray-100 rounded-lg font-medium text-sm text-gray-700">
                      <div>{(() => {
                        const selectedSubcategory = subcategories.find(sub => sub.id === productForm.subcategory_id);
                        const subcategoryName = selectedSubcategory?.name?.toLowerCase() || '';
                        if (subcategoryName.includes('curtain')) return 'Size';
                        return 'Name';
                      })()}</div>
                      <div>SKU</div>
                      <div>Price</div>
                      <div>Discount Price</div>
                      <div>Stock Qty</div>
                      <div>Action</div>
                    </div>
                    {variants.map((variant, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-3 p-4 border rounded-lg bg-gray-50">
                        <Input
                          placeholder={(() => {
                            const selectedSubcategory = subcategories.find(sub => sub.id === productForm.subcategory_id);
                            const subcategoryName = selectedSubcategory?.name?.toLowerCase() || '';
                            if (subcategoryName.includes('switch') || subcategoryName.includes('light')) {
                              return '1 Gang, 2 Gang, 3 Gang';
                            } else if (subcategoryName.includes('curtain')) {
                              return 'Standard, Large, Custom';
                            } else if (subcategoryName.includes('panel')) {
                              return 'Panel Kit Name';
                            }
                            return 'Variant Name';
                          })()}
                          value={variant.name}
                          onChange={(e) => updateVariant(index, 'name', e.target.value)}
                        />
                        <Input
                          placeholder="SKU (e.g., SC-PRO-001)"
                          value={variant.sku}
                          onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                        />
                        <Input
                          type="number"
                          placeholder="Price (e.g., 25000)"
                          value={variant.price}
                          onChange={(e) => updateVariant(index, 'price', parseFloat(e.target.value) || 0)}
                        />
                        <Input
                          type="number"
                          placeholder="Discount (e.g., 22000)"
                          value={variant.discount_price}
                          onChange={(e) => updateVariant(index, 'discount_price', parseFloat(e.target.value) || 0)}
                        />
                        <Input
                          type="number"
                          placeholder="Stock (e.g., 50)"
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
              </Card>

              {/* Colors */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold flex items-center text-lg">
                    <Palette className="w-5 h-5 mr-2 text-pink-600" />
                    Product Colors
                  </h3>
                  <Button onClick={addColor} variant="outline" size="sm">
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
                          placeholder="Color name (e.g., White)"
                          value={color.name}
                          onChange={(e) => updateColor(index, 'name', e.target.value)}
                        />
                        <div className="flex items-center space-x-2">
                          <Input
                            type="color"
                            value={color.hex_code}
                            onChange={(e) => updateColor(index, 'hex_code', e.target.value)}
                            className="w-16 h-10 p-1"
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
                          reader.onload = (e) => setProductForm({...productForm, help_image_url: e.target.result});
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
                          <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 10MB</p>
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
                          reader.onload = (e) => setProductForm({...productForm, help_image_url: e.target.result});
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Help Text</Label>
                    <Textarea
                      value={productForm.help_text}
                      onChange={(e) => setProductForm({...productForm, help_text: e.target.value})}
                      placeholder="Helpful information to assist customers in making decisions"
                      rows={3}
                      className="mt-1"
                    />
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
                          reader.onload = (e) => setProductForm({...productForm, engraving_image_url: e.target.result});
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
                          <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 10MB</p>
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
                          reader.onload = (e) => setProductForm({...productForm, engraving_image_url: e.target.result});
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

        {/* Roller Curtain Product Modal */}
        <Dialog open={isRollerCurtainModal} onOpenChange={setIsRollerCurtainModal}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">
                {editingProduct ? 'Edit Roller Curtain Product' : 'Add Roller Curtain Product'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              {/* Basic Information */}
              <Card className="p-6">
                <h3 className="font-semibold mb-4 flex items-center text-lg">
                  <Package className="w-5 h-5 mr-2 text-blue-600" />
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Product Name *</Label>
                    <Input
                      value={rollerCurtainForm.title}
                      onChange={(e) => setRollerCurtainForm({...rollerCurtainForm, title: e.target.value})}
                      placeholder="Smart Roller Curtain Pro"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Product Price (BDT) *</Label>
                    <Input
                      type="number"
                      value={rollerCurtainForm.price}
                      onChange={(e) => setRollerCurtainForm({...rollerCurtainForm, price: parseFloat(e.target.value) || 0})}
                      placeholder="25000"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Stock Quantity *</Label>
                    <Input
                      type="number"
                      value={rollerCurtainForm.stock}
                      onChange={(e) => setRollerCurtainForm({...rollerCurtainForm, stock: parseInt(e.target.value) || 0})}
                      placeholder="50"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Category *</Label>
                    <Select 
                      value={rollerCurtainForm.category_id} 
                      onValueChange={(value) => {
                        setRollerCurtainForm({...rollerCurtainForm, category_id: value, subcategory_id: ''});
                      }}
                    >
                      <SelectTrigger className="mt-1 bg-white">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {categories.map(cat => (
                          <SelectItem key={cat.id} value={cat.id} className="hover:bg-gray-100">{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Subcategory</Label>
                    <Select value={rollerCurtainForm.subcategory_id || 'none'} onValueChange={(value) => setRollerCurtainForm({...rollerCurtainForm, subcategory_id: value === 'none' ? '' : value})}>
                      <SelectTrigger className="mt-1 bg-white">
                        <SelectValue placeholder="Select subcategory" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="none" className="hover:bg-gray-100">No Subcategory</SelectItem>
                        {subcategories.filter(sub => sub.category_id === rollerCurtainForm.category_id).map(subcat => (
                          <SelectItem key={subcat.id} value={subcat.id} className="hover:bg-gray-100">{subcat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="md:col-span-2">
                    <Label className="text-sm font-medium">Product Description (Overview) *</Label>
                    <Textarea
                      value={rollerCurtainForm.product_overview}
                      onChange={(e) => setRollerCurtainForm({...rollerCurtainForm, product_overview: e.target.value})}
                      placeholder="Smart motorized roller curtain with app control and voice command integration for enhanced privacy and comfort"
                      rows={4}
                      className="mt-1"
                    />
                  </div>
                </div>
              </Card>

              {/* Product Details */}
              <Card className="p-6">
                <h3 className="font-semibold mb-4 flex items-center text-lg">
                  <Settings className="w-5 h-5 mr-2 text-green-600" />
                  Product Details
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Technical Details (one per line) *</Label>
                    <Textarea
                      value={rollerCurtainForm.specifications}
                      onChange={(e) => setRollerCurtainForm({...rollerCurtainForm, specifications: e.target.value})}
                      placeholder="DC 12V brushless motor with max load 15kg and noise level below 35dB\nZigbee 3.0/WiFi connectivity with 30m range and voice control support\n32mm tube diameter, max 3m width/drop with AC power and battery backup"
                      rows={5}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Warranty Information (one per line) *</Label>
                    <Textarea
                      value={rollerCurtainForm.warranty}
                      onChange={(e) => setRollerCurtainForm({...rollerCurtainForm, warranty: e.target.value})}
                      placeholder="1 Year Service Warranty\n24/7 customer support\nFree replacement within warranty period"
                      rows={3}
                      className="mt-1"
                    />
                  </div>
                </div>
              </Card>

              {/* Size Options */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold flex items-center text-lg">
                    <Settings className="w-5 h-5 mr-2 text-purple-600" />
                    Available Size Options
                  </h3>
                  <Button 
                    type="button"
                    onClick={() => {
                      const newOption = "New Size Option|Description for new size option";
                      const current = rollerCurtainForm.size_options;
                      const updated = current ? `${current}\n${newOption}` : newOption;
                      setRollerCurtainForm({...rollerCurtainForm, size_options: updated});
                    }}
                    variant="outline" 
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Option
                  </Button>
                </div>
                <div>
                  <Label className="text-sm font-medium">Size Options (format: Title|Description)</Label>
                  <Textarea
                    value={rollerCurtainForm.size_options}
                    onChange={(e) => setRollerCurtainForm({...rollerCurtainForm, size_options: e.target.value})}
                    placeholder="Standard (up to 8 feet)|Perfect for standard windows and doors\nLarge (8-12 feet) - Requires 2 motors|For larger windows requiring dual motor setup\nExtra Large (12+ feet) - Custom quote|Custom solutions for oversized installations"
                    rows={3}
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">Each line: Title|Description</p>
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
                        reader.onload = (e) => setRollerCurtainForm({...rollerCurtainForm, image: e.target.result});
                        reader.readAsDataURL(file);
                      }
                    }}
                    onClick={() => document.getElementById('main-image-input').click()}
                  >
                    {rollerCurtainForm.image ? (
                      <div className="relative">
                        <img src={rollerCurtainForm.image} alt="Main" className="max-h-32 mx-auto rounded" />
                        <Button 
                          type="button"
                          variant="outline" 
                          size="sm" 
                          className="mt-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            setRollerCurtainForm({...rollerCurtainForm, image: ''});
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
                        reader.onload = (e) => setRollerCurtainForm({...rollerCurtainForm, image: e.target.result});
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </div>

                {/* Additional Images */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Additional Images</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {['image2', 'image3', 'image4', 'image5'].map((imageKey, index) => (
                      <div key={imageKey}>
                        <div
                          className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors cursor-pointer h-32"
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => {
                            e.preventDefault();
                            const file = e.dataTransfer.files[0];
                            if (file && file.type.startsWith('image/')) {
                              const reader = new FileReader();
                              reader.onload = (e) => setRollerCurtainForm({...rollerCurtainForm, [imageKey]: e.target.result});
                              reader.readAsDataURL(file);
                            }
                          }}
                          onClick={() => document.getElementById(`${imageKey}-input`).click()}
                        >
                          {rollerCurtainForm[imageKey] ? (
                            <div className="relative h-full">
                              <img src={rollerCurtainForm[imageKey]} alt={`Image ${index + 2}`} className="h-full w-full object-cover rounded" />
                              <Button 
                                type="button"
                                variant="outline" 
                                size="sm" 
                                className="absolute top-1 right-1 h-6 w-6 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setRollerCurtainForm({...rollerCurtainForm, [imageKey]: ''});
                                }}
                              >
                                ×
                              </Button>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center h-full">
                              <Plus className="w-6 h-6 text-gray-400 mb-1" />
                              <p className="text-xs text-gray-500">Image {index + 2}</p>
                            </div>
                          )}
                        </div>
                        <input
                          id={`${imageKey}-input`}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (e) => setRollerCurtainForm({...rollerCurtainForm, [imageKey]: e.target.result});
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
            
            <div className="flex justify-end space-x-3 pt-6 border-t">
              <Button variant="outline" onClick={() => setIsRollerCurtainModal(false)}>
                Cancel
              </Button>
              <Button 
                onClick={async () => {
                  if (!rollerCurtainForm.title || !rollerCurtainForm.price || !rollerCurtainForm.category_id) {
                    toast({ 
                      title: "Missing Fields", 
                      description: "Please fill in product name, price, and category",
                      variant: "destructive" 
                    });
                    return;
                  }

                  try {
                    const productData = {
                      title: rollerCurtainForm.title,
                      display_name: rollerCurtainForm.display_name || rollerCurtainForm.title,
                      product_overview: rollerCurtainForm.product_overview,
                      model: rollerCurtainForm.model,
                      price: rollerCurtainForm.price || 0,
                      stock: rollerCurtainForm.stock || 0,
                      specifications: rollerCurtainForm.specifications,
                      warranty: rollerCurtainForm.warranty,
                      category_id: rollerCurtainForm.category_id,
                      subcategory_id: rollerCurtainForm.subcategory_id || null,
                      image: rollerCurtainForm.image,
                      image2: rollerCurtainForm.image2,
                      image3: rollerCurtainForm.image3,
                      image4: rollerCurtainForm.image4,
                      image5: rollerCurtainForm.image5,
                      gang_1_image: rollerCurtainForm.gang_1_image,
                      gang_2_image: rollerCurtainForm.gang_2_image,
                      gang_3_image: rollerCurtainForm.gang_3_image,
                      gang_4_image: rollerCurtainForm.gang_4_image
                    };

                    if (editingProduct) {
                      const { error } = await supabase
                        .from('products')
                        .update(productData)
                        .eq('id', editingProduct.id);

                      if (error) throw error;
                      toast({ title: "Success", description: "Roller curtain product updated successfully" });
                    } else {
                      const { error } = await supabase
                        .from('products')
                        .insert({
                          ...productData,
                          is_active: true,
                          position: products.length + 1
                        });

                      if (error) throw error;
                      toast({ title: "Success", description: "Roller curtain product created successfully" });
                    }
                    setIsRollerCurtainModal(false);
                    setRollerCurtainForm({
                      title: '', display_name: '', product_overview: '',
                      model: 'Zigbee', category_id: '', subcategory_id: '', price: 0, stock: 0,
                      specifications: '', warranty: '', image: '', image2: '', image3: '', image4: '', image5: '',
                      gang_1_image: '', gang_2_image: '', gang_3_image: '', gang_4_image: ''
                    });
                    setEditingProduct(null);
                    loadData();
                  } catch (error) {
                    toast({ title: "Error", description: error.message, variant: "destructive" });
                  }
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
{editingProduct ? 'Update Roller Curtain Product' : 'Create Roller Curtain Product'}
              </Button>
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
                Are you sure you want to delete <span className="font-semibold text-gray-900">{productToDelete?.title}</span>?
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
                    toast({ title: "Error", description: error.message, variant: "destructive" });
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

        {/* Filters & Actions */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-80 border-gray-200 focus:border-blue-500"
                />
              </div>
              <Select value={selectedCategory || "all"} onValueChange={(value) => setSelectedCategory(value === "all" ? "" : value)}>
                <SelectTrigger className="w-48 border-gray-200">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedCategory && subcategories.length > 0 && (
                <Select value={selectedSubcategory || "all"} onValueChange={(value) => setSelectedSubcategory(value === "all" ? "" : value)}>
                  <SelectTrigger className="w-48 border-gray-200">
                    <SelectValue placeholder="All Subcategories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subcategories</SelectItem>
                    {subcategories.map(subcat => (
                      <SelectItem key={subcat.id} value={subcat.id}>{subcat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="px-3 py-1">
                {filteredProducts.length} products found
              </Badge>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                More Filters
              </Button>
            </div>
          </div>
        </div>





        {/* Category and Subcategory Display */}
        <div className="space-y-8">
          {categories.map(category => {
            const categorySubcategories = subcategories.filter(sub => sub.category_id === category.id);
            const categoryProducts = filteredProducts.filter(p => p.category_id === category.id);
            
            return (
              <div key={category.id} className="bg-white rounded-xl shadow-sm border overflow-hidden">
                {/* Category Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                        <Layers className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white">{category.name}</h2>
                        <p className="text-blue-100">{categoryProducts.length} products • {categorySubcategories.length} subcategories</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => {
                          resetForm();
                          setProductForm(prev => ({...prev, category_id: category.id, subcategory_id: ''}));
                          setIsProductDialogOpen(true);
                        }}
                        className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Product
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Subcategories */}
                <div className="p-6 space-y-6">
                  {categorySubcategories.length > 0 ? (
                    categorySubcategories.map(subcategory => {
                      const subcategoryProducts = filteredProducts.filter(p => p.subcategory_id === subcategory.id);
                      
                      return (
                        <div key={subcategory.id} className="border-l-4 border-blue-200 pl-6">
                          {/* Subcategory Header */}
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Package className="w-4 h-4 text-blue-600" />
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900">{subcategory.name}</h3>
                                <p className="text-sm text-gray-500">{subcategoryProducts.length} products</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                {subcategoryProducts.length}
                              </Badge>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => {
                                  resetForm();
                                  setProductForm(prev => ({...prev, category_id: category.id, subcategory_id: subcategory.id}));
                                  setIsProductDialogOpen(true);
                                }}
                                className="border-blue-200 text-blue-600 hover:bg-blue-50"
                              >
                                <Plus className="w-3 h-3 mr-1" />
                                Add
                              </Button>
                            </div>
                          </div>

                          {/* Products Grid */}
                          {subcategoryProducts.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                              {subcategoryProducts.map((product) => (
                                <Card key={product.id} className="group hover:shadow-lg transition-all duration-300 border-gray-200 hover:border-blue-300 hover:-translate-y-1">
                                  <div className="p-4">
                                    <div className="flex items-start justify-between mb-3">
                                      <div className="flex-1">
                                        <h4 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors line-clamp-1">
                                          {product.title}
                                        </h4>
                                        <p className="text-sm text-gray-500 mb-2 line-clamp-1">{product.display_name}</p>
                                      </div>
                                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <MoreVertical className="w-3 h-3" />
                                      </Button>
                                    </div>
                                    
                                    {product.product_overview && (
                                      <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                                        {product.product_overview}
                                      </p>
                                    )}
                                    
                                    <div className="flex items-center gap-2 mb-3">
                                      {product.model && (
                                        <Badge variant={product.model === 'Wifi' ? 'default' : 'secondary'} className="text-xs">
                                          {product.model}
                                        </Badge>
                                      )}
                                      <Badge variant={product.is_active ? 'default' : 'secondary'} className="text-xs">
                                        {product.is_active ? 'Active' : 'Inactive'}
                                      </Badge>
                                    </div>
                                    
                                    <Separator className="mb-3" />
                                    
                                    <div className="flex gap-1">
                                      <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="flex-1 h-7 text-xs"
                                        onClick={() => {
                                          setEditingProduct(product);
                                          setProductForm({
                                            title: product.title || '',
                                            display_name: product.display_name || '',
                                            product_overview: product.product_overview || '',
                                            model: product.model || 'Zigbee',
                                            category_id: product.category_id || '',
                                            subcategory_id: product.subcategory_id || '',
                                            overview: product.overview || '',
                                            technical_details: product.technical_details || '',
                                            warranty: product.warranty || '',
                                            help_image_url: product.help_image_url || '',
                                            help_text: product.help_text || '',
                                            shipping_time: product.shipping_time || '',
                                            shipping_cost: product.shipping_cost || 0,
                                            engraving_image_url: product.engraving_image_url || '',
                                            engraving_price: product.engraving_price || 0,
                                            image: product.image || '',
                                            image2: product.image2 || '',
                                            image3: product.image3 || '',
                                            image4: product.image4 || '',
                                            image5: product.image5 || '',
                                            gang_1_image: product.gang_1_image || '',
                                            gang_2_image: product.gang_2_image || '',
                                            gang_3_image: product.gang_3_image || '',
                                            gang_4_image: product.gang_4_image || ''
                                          });
                                          setIsProductDialogOpen(true);
                                        }}
                                      >
                                        <Edit className="w-3 h-3 mr-1" />
                                        Edit
                                      </Button>
                                      <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                                        onClick={() => {
                                          setProductToDelete(product);
                                          setDeleteDialogOpen(true);
                                        }}
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  </div>
                                </Card>
                              ))}
                            </div>
                          ) : (
                            <div className="bg-gray-50 rounded-lg p-8 text-center border-2 border-dashed border-gray-200">
                              <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                              <p className="text-gray-500 mb-3">No products in {subcategory.name}</p>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => {
                                  resetForm();
                                  setProductForm(prev => ({...prev, category_id: category.id, subcategory_id: subcategory.id}));
                                  setIsProductDialogOpen(true);
                                }}
                              >
                                <Plus className="w-4 h-4 mr-2" />
                                Add First Product
                              </Button>
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8">
                      <Layers className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 mb-4">No subcategories in {category.name}</p>
                      <p className="text-sm text-gray-400">Create subcategories to organize products better</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          
          {filteredProducts.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {products.length === 0 ? 'No products yet' : 'No products match your filters'}
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {products.length === 0 
                  ? 'Start building your product catalog by creating your first product' 
                  : 'Try adjusting your search criteria or filters to find what you\'re looking for'
                }
              </p>
              {products.length === 0 && (
                <Button onClick={() => setIsProductDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Product
                </Button>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminProductsEnhanced;