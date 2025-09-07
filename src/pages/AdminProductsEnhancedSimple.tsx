import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Plus, Package, X, Layers, Edit, Trash2, Image, Upload } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import AdminNavbar from '@/components/AdminNavbar';

const AdminProductsEnhancedSimple = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [productForm, setProductForm] = useState({
    title: '',
    display_name: '',
    product_overview: '',
    subcategory_id: '',
    models: [],
    price: 0,
    shipping_cost: 0,
    stock_quantity: 0
  });
  const [variants, setVariants] = useState([]);
  const [colors, setColors] = useState([]);
  const [mainImage, setMainImage] = useState(null);
  const [additionalImages, setAdditionalImages] = useState([]);
  const [dragActive, setDragActive] = useState({ main: false, additional: false });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { supabase } = await import('@/supabase/client');
      
      const [productsResult, categoriesResult, subcategoriesResult] = await Promise.all([
        supabase
          .from('products')
          .select(`
            *,
            product_variants(*),
            product_colors(*),
            product_subcategories(
              id,
              name,
              product_categories(id, name)
            )
          `)
          .eq('is_active', true)
          .order('position'),
        supabase.from('product_categories').select('*').eq('is_active', true).order('position'),
        supabase.from('product_subcategories').select('*').eq('is_active', true).order('position')
      ]);
      
      setProducts(productsResult.data || []);
      setCategories(categoriesResult.data || []);
      setSubcategories(subcategoriesResult.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({ title: "Error", description: "Failed to load data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const checkTableStructure = async () => {
    try {
      const { supabase } = await import('@/supabase/client');
      const { data, error } = await supabase.from('products').select('*').limit(1);
      console.log('Products table structure:', data);
      if (error) console.log('Table error:', error);
    } catch (error) {
      console.log('Check error:', error);
    }
  };

  const handleCreateProduct = async () => {
    const missingFields = [];
    
    if (!productForm.title) missingFields.push('Title');
    if (!productForm.display_name) missingFields.push('Display Name');
    if (!productForm.subcategory_id) missingFields.push('Subcategory');
    if (productForm.models.length === 0) missingFields.push('Connectivity Model');
    
    if (missingFields.length > 0) {
      toast({ 
        title: "Missing Required Fields", 
        description: `Please fill in: ${missingFields.join(', ')}`,
        variant: "destructive"
      });
      return;
    }

    try {
      const { supabase } = await import('@/supabase/client');
      
      // Get subcategory name for category field
      const selectedSubcategory = subcategories.find(sub => sub.id === productForm.subcategory_id);
      
      const { data: product, error: productError } = await supabase
        .from('products')
        .insert([{
          title: productForm.title,
          display_name: productForm.display_name,
          product_overview: productForm.product_overview,
          category: selectedSubcategory?.name || 'General',
          model: productForm.models.join(', '),
          price: productForm.price,
          stock_quantity: productForm.stock_quantity,
          shipping_cost: productForm.shipping_cost,
          image: mainImage,
          image2: additionalImages[0] || null,
          image3: additionalImages[1] || null,
          image4: additionalImages[2] || null,
          image5: additionalImages[3] || null,
          position: products.length + 1,
          is_active: true
        }])
        .select()
        .single();

      if (productError) {
        console.error('Product error details:', productError);
        throw new Error(`Product insert failed: ${productError.message}`);
      }

      // Save variants and colors as JSON in product record for simplicity
      if (variants.length > 0 || colors.length > 0) {
        const { error: updateError } = await supabase
          .from('products')
          .update({
            variants: variants.length > 0 ? JSON.stringify(variants) : null,
            colors: colors.length > 0 ? JSON.stringify(colors) : null
          })
          .eq('id', product.id);

        if (updateError) console.error('Update error:', updateError);
      }

      setIsDialogOpen(false);
      resetForm();
      loadData();
      
      toast({ 
        title: "Success", 
        description: "Product created successfully"
      });
    } catch (error) {
      console.error('Error saving product:', error);
      toast({ 
        title: "Error", 
        description: `Database error: ${error.message || 'Unknown error'}`,
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setProductForm({
      title: '',
      display_name: '',
      product_overview: '',
      subcategory_id: '',
      models: [],
      price: 0,
      shipping_cost: 0,
      stock_quantity: 0
    });
    setVariants([]);
    setColors([]);
    setMainImage(null);
    setAdditionalImages([]);
    setDragActive({ main: false, additional: false });
  };

  const getSubcategoriesForCategory = (categoryId) => {
    return subcategories.filter(sub => sub.category_id === categoryId);
  };

  const getProductsForSubcategory = (subcategoryId) => {
    return products.filter(product => product.subcategory_id === subcategoryId);
  };

  const getPlaceholderForSubcategory = (field) => {
    const selectedSubcategory = subcategories.find(sub => sub.id === productForm.subcategory_id);
    const selectedCategory = categories.find(cat => cat.id === selectedSubcategory?.category_id);
    
    if (!selectedSubcategory || !selectedCategory) {
      return {
        title: 'Enter product title',
        display_name: 'Enter display name',
        overview: 'Brief description of the product'
      }[field];
    }

    const placeholders = {
      // Smart Switches
      'Smart Switches': {
        title: `Smart ${selectedSubcategory.name}`,
        display_name: `${selectedSubcategory.name} Pro`,
        overview: `Professional ${selectedSubcategory.name.toLowerCase()} with smart home integration`
      },
      // Smart Curtains
      'Smart Curtains': {
        title: `Smart ${selectedSubcategory.name}`,
        display_name: `${selectedSubcategory.name} System`,
        overview: `Automated ${selectedSubcategory.name.toLowerCase()} with remote control and scheduling`
      },
      // Smart Sensors
      'Smart Sensors': {
        title: `Smart ${selectedSubcategory.name}`,
        display_name: `${selectedSubcategory.name} Sensor`,
        overview: `Advanced ${selectedSubcategory.name.toLowerCase()} with real-time monitoring`
      },
      // Smart Security
      'Smart Security': {
        title: `Smart ${selectedSubcategory.name}`,
        display_name: `${selectedSubcategory.name} Pro`,
        overview: `Professional ${selectedSubcategory.name.toLowerCase()} for home security`
      },
      // Default for any other category
      default: {
        title: `Smart ${selectedSubcategory.name}`,
        display_name: `${selectedSubcategory.name} Device`,
        overview: `Smart ${selectedSubcategory.name.toLowerCase()} for home automation`
      }
    };

    const categoryPlaceholders = placeholders[selectedCategory.name] || placeholders.default;
    return categoryPlaceholders[field];
  };

  const handleDrag = (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(prev => ({ ...prev, [type]: true }));
    } else if (e.type === "dragleave") {
      setDragActive(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleDrop = (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(prev => ({ ...prev, [type]: false }));
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files[0], type);
    }
  };

  const handleImageUpload = (file, type) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target.result;
        if (type === 'main') {
          setMainImage(imageUrl);
        } else {
          setAdditionalImages(prev => [...prev, imageUrl]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeMainImage = () => {
    setMainImage(null);
  };

  const removeAdditionalImage = (index) => {
    setAdditionalImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleModelChange = (model) => {
    setProductForm(prev => ({
      ...prev,
      models: prev.models.includes(model)
        ? prev.models.filter(m => m !== model)
        : [...prev.models, model]
    }));
  };

  const addVariant = () => {
    setVariants([...variants, {
      name: '',
      value: '',
      price: 0,
      stock: 0
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
      code: '#000000',
      price_adjustment: 0
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Product Management
            </h1>
            <p className="text-gray-600">Manage your smart home products</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
                onClick={() => resetForm()}
              >
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Product</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6 py-4">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Title *</Label>
                    <Input
                      value={productForm.title}
                      onChange={(e) => setProductForm({...productForm, title: e.target.value})}
                      placeholder={getPlaceholderForSubcategory('title')}
                    />
                  </div>
                  <div>
                    <Label>Display Name *</Label>
                    <Input
                      value={productForm.display_name}
                      onChange={(e) => setProductForm({...productForm, display_name: e.target.value})}
                      placeholder={getPlaceholderForSubcategory('display_name')}
                    />
                  </div>
                  <div>
                    <Label>Subcategory *</Label>
                    <Select value={productForm.subcategory_id} onValueChange={(value) => setProductForm({...productForm, subcategory_id: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select subcategory" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-200 shadow-lg">
                        {categories.map(category => (
                          <div key={category.id}>
                            <div className="px-3 py-2 text-sm font-semibold text-gray-600 bg-gray-100 border-b border-gray-200">
                              {category.name}
                            </div>
                            {getSubcategoriesForCategory(category.id).map(subcategory => (
                              <SelectItem key={subcategory.id} value={subcategory.id} className="bg-white hover:bg-gray-50">
                                <span className="ml-4 text-gray-700">{subcategory.name}</span>
                              </SelectItem>
                            ))}
                          </div>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Connectivity Models</Label>
                    <div className="space-y-3 mt-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="zigbee"
                          checked={productForm.models.includes('Zigbee')}
                          onChange={() => handleModelChange('Zigbee')}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="zigbee" className="text-sm font-medium text-gray-700 cursor-pointer">
                          Zigbee
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="wifi"
                          checked={productForm.models.includes('Wifi')}
                          onChange={() => handleModelChange('Wifi')}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="wifi" className="text-sm font-medium text-gray-700 cursor-pointer">
                          Wifi
                        </label>
                      </div>
                      {productForm.models.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {productForm.models.map(model => (
                            <Badge key={model} variant="secondary" className="text-xs">
                              {model}
                              <button
                                type="button"
                                onClick={() => handleModelChange(model)}
                                className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label>Price</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={productForm.price === 0 ? '' : productForm.price}
                      onChange={(e) => setProductForm({...productForm, price: e.target.value === '' ? 0 : parseFloat(e.target.value) || 0})}
                      placeholder="Enter price"
                    />
                  </div>
                  <div>
                    <Label>Stock Quantity</Label>
                    <Input
                      type="number"
                      min="0"
                      value={productForm.stock_quantity === 0 ? '' : productForm.stock_quantity}
                      onChange={(e) => setProductForm({...productForm, stock_quantity: e.target.value === '' ? 0 : parseInt(e.target.value) || 0})}
                      placeholder="Enter stock quantity"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Product Overview</Label>
                    <Textarea
                      value={productForm.product_overview}
                      onChange={(e) => setProductForm({...productForm, product_overview: e.target.value})}
                      placeholder={getPlaceholderForSubcategory('overview')}
                      rows={3}
                    />
                  </div>
                </div>

                {/* Image Upload Section */}
                <div className="space-y-6">
                  {/* Main Product Image */}
                  <div>
                    <Label className="text-base font-semibold">Main Product Image</Label>
                    <div className="mt-2">
                      {mainImage ? (
                        <div className="relative">
                          <div className="w-full h-48 bg-gray-100 rounded-lg overflow-hidden border-2 border-dashed border-gray-300">
                            <img 
                              src={mainImage} 
                              alt="Main product preview" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={removeMainImage}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div
                          className={`w-full h-48 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors ${
                            dragActive.main 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                          }`}
                          onDragEnter={(e) => handleDrag(e, 'main')}
                          onDragLeave={(e) => handleDrag(e, 'main')}
                          onDragOver={(e) => handleDrag(e, 'main')}
                          onDrop={(e) => handleDrop(e, 'main')}
                          onClick={() => document.getElementById('main-image-input').click()}
                        >
                          <Image className={`w-12 h-12 mb-3 ${
                            dragActive.main ? 'text-blue-500' : 'text-gray-400'
                          }`} />
                          <p className={`text-sm font-medium ${
                            dragActive.main ? 'text-blue-600' : 'text-gray-500'
                          }`}>
                            {dragActive.main ? 'Drop main image here' : 'Drag & drop main image or click to browse'}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF up to 10MB</p>
                        </div>
                      )}
                      <input
                        id="main-image-input"
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files[0] && handleImageUpload(e.target.files[0], 'main')}
                        className="hidden"
                      />
                    </div>
                  </div>

                  {/* Additional Images */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <Label className="text-base font-semibold">Additional Images</Label>
                      <span className="text-sm text-gray-500">{additionalImages.length}/4 images</span>
                    </div>
                    
                    {/* Additional Images Grid */}
                    {additionalImages.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                        {additionalImages.map((image, index) => (
                          <div key={index} className="relative">
                            <div className="w-full h-24 bg-gray-100 rounded-lg overflow-hidden border">
                              <img 
                                src={image} 
                                alt={`Additional ${index + 1}`} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => removeAdditionalImage(index)}
                              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Upload Area for Additional Images */}
                    {additionalImages.length < 4 && (
                      <div
                        className={`w-full h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors ${
                          dragActive.additional 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                        }`}
                        onDragEnter={(e) => handleDrag(e, 'additional')}
                        onDragLeave={(e) => handleDrag(e, 'additional')}
                        onDragOver={(e) => handleDrag(e, 'additional')}
                        onDrop={(e) => handleDrop(e, 'additional')}
                        onClick={() => document.getElementById('additional-images-input').click()}
                      >
                        <Plus className={`w-8 h-8 mb-2 ${
                          dragActive.additional ? 'text-blue-500' : 'text-gray-400'
                        }`} />
                        <p className={`text-sm ${
                          dragActive.additional ? 'text-blue-600' : 'text-gray-500'
                        }`}>
                          {dragActive.additional ? 'Drop additional images here' : 'Add more product images'}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">Up to {4 - additionalImages.length} more images</p>
                      </div>
                    )}
                    <input
                      id="additional-images-input"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => {
                        Array.from(e.target.files).forEach(file => {
                          if (additionalImages.length < 4) {
                            handleImageUpload(file, 'additional');
                          }
                        });
                      }}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Optional Variants and Colors */}
                <Accordion type="multiple" className="w-full">
                  {/* Variants */}
                  <AccordionItem value="variants">
                    <AccordionTrigger className="text-base font-semibold">
                      Variants (Optional)
                      {variants.length > 0 && (
                        <Badge variant="secondary" className="ml-2">
                          {variants.length}
                        </Badge>
                      )}
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <div className="flex justify-end">
                        <Button onClick={addVariant} variant="outline" size="sm">
                          <Plus className="w-4 h-4 mr-1" />
                          Add Variant
                        </Button>
                      </div>
                      {variants.map((variant, index) => (
                        <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 border rounded">
                          <Input
                            placeholder="Name (e.g., Size)"
                            value={variant.name}
                            onChange={(e) => updateVariant(index, 'name', e.target.value)}
                          />
                          <Input
                            placeholder="Value (e.g., Large)"
                            value={variant.value}
                            onChange={(e) => updateVariant(index, 'value', e.target.value)}
                          />
                          <Input
                            type="number"
                            placeholder="Price"
                            value={variant.price}
                            onChange={(e) => updateVariant(index, 'price', parseFloat(e.target.value) || 0)}
                          />
                          <div className="flex gap-2">
                            <Input
                              type="number"
                              placeholder="Stock"
                              value={variant.stock}
                              onChange={(e) => updateVariant(index, 'stock', parseInt(e.target.value) || 0)}
                            />
                            <Button onClick={() => removeVariant(index)} variant="outline" size="sm">
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      {variants.length === 0 && (
                        <p className="text-sm text-gray-500 text-center py-4">
                          No variants added. Click "Add Variant" to create size, type, or other product variations.
                        </p>
                      )}
                    </AccordionContent>
                  </AccordionItem>

                  {/* Colors */}
                  <AccordionItem value="colors">
                    <AccordionTrigger className="text-base font-semibold">
                      Colors (Optional)
                      {colors.length > 0 && (
                        <Badge variant="secondary" className="ml-2">
                          {colors.length}
                        </Badge>
                      )}
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <div className="flex justify-end">
                        <Button onClick={addColor} variant="outline" size="sm">
                          <Plus className="w-4 h-4 mr-1" />
                          Add Color
                        </Button>
                      </div>
                      {colors.map((color, index) => (
                        <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 border rounded">
                          <Input
                            placeholder="Color name"
                            value={color.name}
                            onChange={(e) => updateColor(index, 'name', e.target.value)}
                          />
                          <div className="flex gap-2">
                            <Input
                              type="color"
                              value={color.code}
                              onChange={(e) => updateColor(index, 'code', e.target.value)}
                              className="w-16"
                            />
                            <Input
                              placeholder="#000000"
                              value={color.code}
                              onChange={(e) => updateColor(index, 'code', e.target.value)}
                            />
                          </div>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="Price adjustment"
                            value={color.price_adjustment}
                            onChange={(e) => updateColor(index, 'price_adjustment', parseFloat(e.target.value) || 0)}
                          />
                          <Button onClick={() => removeColor(index)} variant="outline" size="sm">
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      {colors.length === 0 && (
                        <p className="text-sm text-gray-500 text-center py-4">
                          No colors added. Click "Add Color" to create color variations with different pricing.
                        </p>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={checkTableStructure} variant="outline" className="mr-2">
                  Check Table
                </Button>
                <Button onClick={handleCreateProduct} className="bg-blue-600 hover:bg-blue-700">
                  Create Product
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Products organized by Category and Subcategory */}
        <div className="space-y-8">
          {categories.length === 0 ? (
            <Card className="p-12 text-center">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No categories yet</h3>
              <p className="text-gray-600 mb-4">Create categories and subcategories first to organize your products</p>
              <Button variant="outline">
                Go to Category Management
              </Button>
            </Card>
          ) : (
            categories.map(category => {
              const categorySubcategories = getSubcategoriesForCategory(category.id);
              
              return (
                <Card key={category.id} className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      {category.image_url && (
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                          <img
                            src={category.image_url}
                            alt={category.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">{category.name}</h2>
                        <p className="text-gray-600">
                          {categorySubcategories.reduce((total, sub) => total + getProductsForSubcategory(sub.id).length, 0)} products
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Subcategories with Products */}
                  <div className="space-y-6">
                    {categorySubcategories.map(subcategory => {
                      const subcategoryProducts = getProductsForSubcategory(subcategory.id);
                      
                      return (
                        <div key={subcategory.id} className="border-l-4 border-blue-200 pl-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              {subcategory.image_url && (
                                <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100">
                                  <img
                                    src={subcategory.image_url}
                                    alt={subcategory.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              )}
                              <div>
                                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                                  <Layers className="w-5 h-5 mr-2 text-blue-600" />
                                  {subcategory.name}
                                </h3>
                                <p className="text-sm text-gray-500">{subcategoryProducts.length} products</p>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => {
                                setProductForm({...productForm, subcategory_id: subcategory.id});
                                setIsDialogOpen(true);
                              }}
                            >
                              <Plus className="w-4 h-4 mr-1" />
                              Add Product
                            </Button>
                          </div>

                          {/* Products Grid */}
                          {subcategoryProducts.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {subcategoryProducts.map((product) => (
                                <Card key={product.id} className="p-4 bg-gray-50 border-gray-200 hover:shadow-md transition-shadow">
                                  <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                      <h4 className="font-semibold text-gray-900 mb-1">{product.title}</h4>
                                      <p className="text-sm text-gray-600 mb-2">{product.display_name}</p>
                                      <div className="flex items-center space-x-2 mb-2">
                                        <div className="flex flex-wrap gap-1">
                                          {product.model && product.model.split(', ').map(model => (
                                            <Badge key={model} variant={model === 'Wifi' ? 'default' : 'secondary'} className="text-xs">
                                              {model}
                                            </Badge>
                                          ))}
                                        </div>
                                        <span className="text-sm text-gray-500">₹{product.price}</span>
                                      </div>
                                      <p className="text-xs text-gray-500">Stock: {product.stock_quantity}</p>
                                    </div>
                                  </div>
                                  
                                  <div className="flex space-x-2">
                                    <Button variant="ghost" size="sm" className="flex-1">
                                      <Edit className="w-3 h-3 mr-1" />
                                      Edit
                                    </Button>
                                    <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50">
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </Card>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
                              <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                              <p className="text-gray-500 mb-3">No products in this subcategory</p>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setProductForm({...productForm, subcategory_id: subcategory.id});
                                  setIsDialogOpen(true);
                                }}
                              >
                                <Plus className="w-4 h-4 mr-2" />
                                Add First Product
                              </Button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {categorySubcategories.length === 0 && (
                    <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                      <Layers className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500 mb-3">No subcategories in this category</p>
                      <p className="text-sm text-gray-400">Create subcategories first to add products</p>
                    </div>
                  )}
                </Card>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminProductsEnhancedSimple;