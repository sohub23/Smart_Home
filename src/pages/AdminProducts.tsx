import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Search, Edit, Trash2, Upload } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import AdminNavbar from '@/components/AdminNavbar';
import { useSupabase, productService, storageService, categoryService, supabase, type Product } from '@/supabase';

const AdminProducts = () => {
  const { loading, error, executeQuery } = useSupabase();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    stock: '',
    description: '',
    image: '',
    image2: '',
    image3: '',
    image4: '',
    image5: '',
    engraving_image: '',
    engraving_text_color: '#000000',
    detailed_description: '',
    features: '',
    specifications: '',
    engraving_available: false,
    engraving_price: '',
    warranty: '',
    installation_included: false,
    serial_order: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [imageFiles, setImageFiles] = useState<{[key: string]: File | null}>({
    image2: null,
    image3: null,
    image4: null,
    image5: null,
    engraving_image: null
  });
  const [imagePreviews, setImagePreviews] = useState<{[key: string]: string}>({
    image2: '',
    image3: '',
    image4: '',
    image5: '',
    engraving_image: ''
  });
  const [showCategoryImages, setShowCategoryImages] = useState(false);
  const [dbCategoryImages, setDbCategoryImages] = useState<any[]>([]);

  // Removed hardcoded category images - will use database images only

  const categories = ['All', 'Smart Switch', 'Smart Curtain', 'Security', 'PDLC Film'];

  useEffect(() => {
    loadProducts();
    loadCategoryImages();
  }, []);

  const loadCategoryImages = async () => {
    try {
      const data = await executeQuery(() => categoryService.getCategoryImages());
      setDbCategoryImages(data || []);
    } catch (err) {
      console.error('Failed to load category images:', err);
    }
  };

  const loadProducts = async () => {
    try {
      const data = await executeQuery(() => productService.getProducts());
      setProducts(data || []);
    } catch (err) {
      console.error('Failed to load products:', err);
    }
  };

  const getStatusColor = (status: string, stock: number) => {
    if (stock === 0) return 'bg-red-100 text-red-800';
    if (stock <= 3) return 'bg-orange-100 text-orange-800';
    if (stock <= 10) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price.toString(),
      stock: product.stock.toString(),
      description: product.description || '',
      image: product.image || '',
      image2: product.image2 || '',
      image3: product.image3 || '',
      image4: product.image4 || '',
      image5: product.image5 || '',
      engraving_image: product.engraving_image || '',
      engraving_text_color: product.engraving_text_color || '#000000',
      detailed_description: product.detailed_description || '',
      features: product.features || '',
      specifications: product.specifications || '',
      engraving_available: product.engraving_available || false,
      engraving_price: product.engraving_price?.toString() || '',
      warranty: product.warranty || '',
      installation_included: product.installation_included || false,
      serial_order: product.serial_order?.toString() || ''
    });
    setImagePreview(product.image || '');
    setImageFile(null);
    setImageFiles({
      image2: null,
      image3: null,
      image4: null,
      image5: null,
      engraving_image: null
    });
    setImagePreviews({
      image2: product.image2 || '',
      image3: product.image3 || '',
      image4: product.image4 || '',
      image5: product.image5 || '',
      engraving_image: product.engraving_image || ''
    });
    setIsEditDialogOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB.",
          variant: "destructive"
        });
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file.",
          variant: "destructive"
        });
        return;
      }
      
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleMultipleImageChange = (e: React.ChangeEvent<HTMLInputElement>, imageKey: string) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB.",
          variant: "destructive"
        });
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file.",
          variant: "destructive"
        });
        return;
      }
      
      setImageFiles(prev => ({ ...prev, [imageKey]: file }));
      const reader = new FileReader();
      reader.onload = () => setImagePreviews(prev => ({ ...prev, [imageKey]: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };



  const createStorageBucket = async () => {
    try {
      const { error } = await supabase.storage.createBucket('product-images', {
        public: true
      });
      if (error && !error.message.includes('already exists')) {
        throw error;
      }
      return true;
    } catch (error) {
      console.log('Bucket creation error (may already exist):', error);
      return true; // Continue anyway
    }
  };



  const getCategoryImagesByCategory = (category: string) => {
    return dbCategoryImages.filter(img => img.category === category);
  };

  const handleSave = async () => {
    if (!editingProduct) return;
    try {
      let imageUrl = formData.image;
      
      if (imageFile) {
        imageUrl = await executeQuery(() => storageService.uploadProductImage(imageFile, editingProduct.id));
      }
      
      // Upload additional images
      const additionalImageUrls: {[key: string]: string} = {};
      for (const [key, file] of Object.entries(imageFiles)) {
        if (file) {
          try {
            const url = await executeQuery(() => storageService.uploadProductImage(file, `${editingProduct.id}-${key}`));
            additionalImageUrls[key] = url;
          } catch (err) {
            console.error(`Failed to upload ${key}:`, err);
            additionalImageUrls[key] = formData[key as keyof typeof formData] as string;
          }
        } else {
          additionalImageUrls[key] = formData[key as keyof typeof formData] as string;
        }
      }
      
      await executeQuery(() => productService.updateProduct(editingProduct.id, {
        name: formData.name,
        category: formData.category,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        description: formData.description,
        image: imageUrl,
        image2: additionalImageUrls.image2,
        image3: additionalImageUrls.image3,
        image4: additionalImageUrls.image4,
        image5: additionalImageUrls.image5,
        engraving_image: additionalImageUrls.engraving_image,
        engraving_text_color: formData.engraving_text_color,
        detailed_description: formData.detailed_description,
        features: formData.features,
        specifications: formData.specifications,
        engraving_available: formData.engraving_available,
        engraving_price: formData.engraving_available ? parseFloat(formData.engraving_price) || 0 : null,
        warranty: formData.warranty,
        installation_included: formData.installation_included,
        serial_order: formData.category === 'Security' ? parseInt(formData.serial_order) || null : null,
        status: parseInt(formData.stock) === 0 ? 'Out of Stock' : 'Active'
      }));
      
      toast({
        title: "Product Updated",
        description: `${formData.name} has been updated successfully.`,
      });
      
      setIsEditDialogOpen(false);
      setEditingProduct(null);
      setImageFile(null);
      setImagePreview('');
      setImageFiles({
        image2: null,
        image3: null,
        image4: null,
        image5: null,
        engraving_image: null
      });
      setImagePreviews({
        image2: '',
        image3: '',
        image4: '',
        image5: '',
        engraving_image: ''
      });
      setShowCategoryImages(false);
      await loadProducts();
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update product.",
        variant: "destructive"
      });
    }
  };

  const handleAdd = async () => {
    try {
      let imageUrl = formData.image;
      
      if (imageFile) {
        try {
          console.log('Starting image upload...');
          imageUrl = await storageService.uploadProductImage(imageFile);
          console.log('Image uploaded successfully:', imageUrl);
        } catch (uploadError) {
          console.error('Image upload failed:', uploadError);
          toast({
            title: "Image Upload Failed",
            description: "Product will be saved without image. You can edit it later to add an image.",
            variant: "destructive"
          });
          imageUrl = '';
        }
      }
      
      // Upload additional images
      const additionalImageUrls: {[key: string]: string} = {};
      for (const [key, file] of Object.entries(imageFiles)) {
        if (file) {
          try {
            const url = await storageService.uploadProductImage(file, `new-${key}`);
            additionalImageUrls[key] = url;
          } catch (err) {
            console.error(`Failed to upload ${key}:`, err);
            additionalImageUrls[key] = '';
          }
        } else {
          additionalImageUrls[key] = '';
        }
      }
      
      const productData = {
        name: formData.name,
        category: formData.category,
        price: parseFloat(formData.price) || 0,
        stock: parseInt(formData.stock) || 0,
        description: formData.description,
        image: imageUrl,
        image2: additionalImageUrls.image2,
        image3: additionalImageUrls.image3,
        image4: additionalImageUrls.image4,
        image5: additionalImageUrls.image5,
        engraving_image: additionalImageUrls.engraving_image,
        engraving_text_color: formData.engraving_text_color,
        detailed_description: formData.detailed_description,
        features: formData.features,
        specifications: formData.specifications,
        engraving_available: formData.engraving_available,
        engraving_price: formData.engraving_available ? parseFloat(formData.engraving_price) || 0 : null,
        warranty: formData.warranty,
        installation_included: formData.installation_included,
        serial_order: formData.category === 'Security' ? parseInt(formData.serial_order) || null : null,
        status: parseInt(formData.stock) === 0 ? 'Out of Stock' : 'Active'
      };
      
      await executeQuery(() => productService.createProduct(productData));
      
      toast({
        title: "Product Added",
        description: `${formData.name} has been added successfully.`,
      });
      
      setIsAddDialogOpen(false);
      setFormData({ 
        name: '', category: '', price: '', stock: '', description: '', image: '', image2: '', image3: '', image4: '', image5: '', engraving_image: '',
        engraving_text_color: '#000000', detailed_description: '', features: '', specifications: '', engraving_available: false,
        engraving_price: '', warranty: '', installation_included: false, serial_order: ''
      });
      setImageFile(null);
      setImagePreview('');
      setImageFiles({
        image2: null,
        image3: null,
        image4: null,
        image5: null,
        engraving_image: null
      });
      setImagePreviews({
        image2: '',
        image3: '',
        image4: '',
        image5: '',
        engraving_image: ''
      });
      setShowCategoryImages(false);
      await loadProducts();
    } catch (err) {
      console.error('Add product error:', err);
      toast({
        title: "Error",
        description: `Failed to add product: ${err instanceof Error ? err.message : 'Unknown error'}`,
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (productId: string) => {
    try {
      await executeQuery(() => productService.deleteProduct(productId));
      toast({
        title: "Product Deleted",
        description: "Product has been deleted successfully.",
      });
      loadProducts();
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete product.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <AdminNavbar />
      <main className="p-4 md:p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2">
              Products Management
            </h1>
            <p className="text-gray-600">Manage your product catalog and inventory</p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" className="border-gray-200 hover:bg-gray-50">
              <Upload className="w-4 h-4 mr-2" />
              Bulk Import
            </Button>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Add Product</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Product</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name</Label>
                    <Input 
                      id="name" 
                      placeholder="Enter product name" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <select 
                      id="category" 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                    >
                      <option value="">Select category</option>
                      <option value="Smart Switch">Smart Switch</option>
                      <option value="Smart Curtain">Smart Curtain</option>
                      <option value="Security">Security</option>
                      <option value="PDLC Film">PDLC Film</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (BDT)</Label>
                    <Input 
                      id="price" 
                      type="number" 
                      placeholder="0" 
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stock">Stock Quantity</Label>
                    <Input 
                      id="stock" 
                      type="number" 
                      placeholder="0" 
                      value={formData.stock}
                      onChange={(e) => setFormData({...formData, stock: e.target.value})}
                    />
                  </div>
                  {formData.category === 'Security' && (
                    <div className="space-y-2">
                      <Label htmlFor="serial_order">Serial Order (Security Category)</Label>
                      <Input 
                        id="serial_order" 
                        type="number" 
                        placeholder="1" 
                        value={formData.serial_order}
                        onChange={(e) => setFormData({...formData, serial_order: e.target.value})}
                      />
                    </div>
                  )}
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="description">Short Description</Label>
                    <Textarea 
                      id="description" 
                      placeholder="Brief product description" 
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="image2">Image 2</Label>
                    <Input 
                      id="image2" 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => handleMultipleImageChange(e, 'image2')}
                    />
                    {imagePreviews.image2 && (
                      <img src={imagePreviews.image2} alt="Preview 2" className="w-20 h-20 object-cover rounded" />
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="image3">Image 3</Label>
                    <Input 
                      id="image3" 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => handleMultipleImageChange(e, 'image3')}
                    />
                    {imagePreviews.image3 && (
                      <img src={imagePreviews.image3} alt="Preview 3" className="w-20 h-20 object-cover rounded" />
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="image4">Image 4</Label>
                    <Input 
                      id="image4" 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => handleMultipleImageChange(e, 'image4')}
                    />
                    {imagePreviews.image4 && (
                      <img src={imagePreviews.image4} alt="Preview 4" className="w-20 h-20 object-cover rounded" />
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="image5">Image 5</Label>
                    <Input 
                      id="image5" 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => handleMultipleImageChange(e, 'image5')}
                    />
                    {imagePreviews.image5 && (
                      <img src={imagePreviews.image5} alt="Preview 5" className="w-20 h-20 object-cover rounded" />
                    )}
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="detailed_description">Detailed Description</Label>
                    <Textarea 
                      id="detailed_description" 
                      placeholder="Detailed product description for modal" 
                      value={formData.detailed_description}
                      onChange={(e) => setFormData({...formData, detailed_description: e.target.value})}
                      rows={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="features">Features</Label>
                    <Textarea 
                      id="features" 
                      placeholder="Key features (one per line)" 
                      value={formData.features}
                      onChange={(e) => setFormData({...formData, features: e.target.value})}
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="specifications">Specifications</Label>
                    <Textarea 
                      id="specifications" 
                      placeholder="Technical specifications" 
                      value={formData.specifications}
                      onChange={(e) => setFormData({...formData, specifications: e.target.value})}
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="warranty">Warranty</Label>
                    <Input 
                      id="warranty" 
                      placeholder="e.g., 1 Year Warranty" 
                      value={formData.warranty}
                      onChange={(e) => setFormData({...formData, warranty: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        id="installation_included"
                        checked={formData.installation_included}
                        onChange={(e) => setFormData({...formData, installation_included: e.target.checked})}
                      />
                      <Label htmlFor="installation_included">Installation Included</Label>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        id="engraving_available"
                        checked={formData.engraving_available}
                        onChange={(e) => setFormData({...formData, engraving_available: e.target.checked})}
                      />
                      <Label htmlFor="engraving_available">Engraving Available</Label>
                    </div>
                  </div>
                  {formData.engraving_available && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="engraving_price">Engraving Price (BDT)</Label>
                        <Input 
                          id="engraving_price" 
                          type="number" 
                          placeholder="0" 
                          value={formData.engraving_price}
                          onChange={(e) => setFormData({...formData, engraving_price: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="engraving_image">Engraving Preview Image</Label>
                        <Input 
                          id="engraving_image" 
                          type="file" 
                          accept="image/*"
                          onChange={(e) => handleMultipleImageChange(e, 'engraving_image')}
                        />
                        {imagePreviews.engraving_image && (
                          <img src={imagePreviews.engraving_image} alt="Engraving Preview" className="w-20 h-20 object-cover rounded" />
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="engraving_text_color">Engraving Text Color</Label>
                        <div className="flex items-center gap-2">
                          <Input 
                            id="engraving_text_color" 
                            type="color" 
                            value={formData.engraving_text_color}
                            onChange={(e) => setFormData({...formData, engraving_text_color: e.target.value})}
                            className="w-16 h-10 p-1 border rounded"
                          />
                          <Input 
                            type="text" 
                            value={formData.engraving_text_color}
                            onChange={(e) => setFormData({...formData, engraving_text_color: e.target.value})}
                            placeholder="#000000"
                            className="flex-1"
                          />
                        </div>
                      </div>
                    </>
                  )}
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="image">Product Image</Label>
                    <div className="flex gap-2">
                      <Input 
                        placeholder="Enter image URL here" 
                        value={formData.image}
                        onChange={(e) => {
                          setFormData({...formData, image: e.target.value});
                          setImagePreview(e.target.value);
                        }}
                        className="flex-1"
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => {
                          // Validate category before proceeding
                          if (formData.category && /^[a-zA-Z\s]+$/.test(formData.category)) {
                            setShowCategoryImages(!showCategoryImages);
                          }
                        }}
                        disabled={!formData.category || getCategoryImagesByCategory(formData.category).length === 0}
                      >
                        Gallery
                      </Button>
                    </div>
                    {showCategoryImages && formData.category && (
                      <div className="grid grid-cols-4 gap-2 p-2 border rounded max-h-48 overflow-y-auto">
                        {getCategoryImagesByCategory(formData.category).length > 0 ? (
                          getCategoryImagesByCategory(formData.category).map((img: any, index: number) => (
                            <img 
                              key={index}
                              src={img.image_url} 
                              alt={`${formData.category} ${index + 1}`}
                              className="w-16 h-16 object-cover rounded cursor-pointer hover:ring-2 hover:ring-blue-500"
                              onClick={() => {
                                setFormData({...formData, image: img.image_url});
                                setImagePreview(img.image_url);
                                setShowCategoryImages(false);
                              }}
                            />
                          ))
                        ) : (
                          <div className="col-span-4 text-center py-4 text-gray-500">
                            No images available for this category
                          </div>
                        )}
                      </div>
                    )}
                    {imagePreview && (
                      <div className="mt-2">
                        <img src={imagePreview} alt="Preview" className="w-20 h-20 object-cover rounded" onError={() => setImagePreview('')} />
                      </div>
                    )}
                    <Input 
                      id="image" 
                      type="file" 
                      accept="image/*"
                      onChange={handleImageChange}
                      className="mt-2"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAdd} disabled={loading}>
                    {loading ? 'Adding...' : 'Add Product'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        <div className="w-full">
          <div className="flex border-b mb-6">
            <button 
              className="px-4 py-2 border-b-2 border-blue-500 text-blue-600 font-medium"
              onClick={() => {}}
            >
              All Products
            </button>
            <button 
              className="px-4 py-2 text-gray-500 hover:text-gray-700"
              onClick={() => {
                const url = '/admin/categories';
                if (url.match(/^\/[a-zA-Z0-9\/_-]*$/)) {
                  window.location.href = url;
                }
              }}
            >
              Product Categories
            </button>
          </div>
          
          <div>
            {/* Search and Filter */}
            <Card className="border-0 shadow-lg mb-6">
              <div className="p-6">
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search products by name or category..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {categories.map((category) => (
                      <Button
                        key={category}
                        variant={selectedCategory === category ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedCategory(category)}
                        className={selectedCategory === category 
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg" 
                          : "border-gray-200 hover:bg-gray-50"
                        }
                      >
                        {category}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

        {/* Products Table */}
        <Card className="border-0 shadow-lg">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Product Catalog</h2>
              <Badge variant="outline" className="px-3 py-1">
                {products
                  .filter(product => {
                    if (selectedCategory === 'All') return true;
                    if (selectedCategory === 'PDLC Film') {
                      return product.category === 'Film' || product.category === 'PDLC Film';
                    }
                    return product.category === selectedCategory;
                  })
                  .filter(product => 
                    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    product.category.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .sort((a, b) => {
                    const priorityProducts = ['Smart Security Box Kit (SP-01)', 'Security Panel Kit (SP-05)'];
                    const aIsPriority = priorityProducts.includes(a.name);
                    const bIsPriority = priorityProducts.includes(b.name);
                    
                    if (aIsPriority && !bIsPriority) return -1;
                    if (!aIsPriority && bIsPriority) return 1;
                    
                    if (a.id && b.id) {
                      return b.id.localeCompare(a.id);
                    }
                    return 0;
                  }).length} products
              </Badge>
            </div>
            <div className="overflow-x-auto -mx-4 md:mx-0">
              <Table className="min-w-full">
              <TableHeader>
                <TableRow className="border-gray-200">
                  <TableHead className="font-semibold text-gray-900 w-16">Image</TableHead>
                  <TableHead className="font-semibold text-gray-900 min-w-[150px]">Product Name</TableHead>
                  <TableHead className="font-semibold text-gray-900 hidden sm:table-cell">Category</TableHead>
                  <TableHead className="font-semibold text-gray-900 hidden lg:table-cell">Description</TableHead>
                  <TableHead className="font-semibold text-gray-900">Price</TableHead>
                  <TableHead className="font-semibold text-gray-900 hidden md:table-cell">Stock</TableHead>
                  <TableHead className="font-semibold text-gray-900 hidden md:table-cell">Status</TableHead>
                  <TableHead className="font-semibold text-gray-900 w-20">Actions</TableHead>
                </TableRow>
              </TableHeader>
            <TableBody>
              {products
                .filter(product => {
                  if (selectedCategory === 'All') return true;
                  if (selectedCategory === 'PDLC Film') {
                    return product.category === 'Film' || product.category === 'PDLC Film';
                  }
                  return product.category === selectedCategory;
                })
                .filter(product => 
                  product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  product.category.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .sort((a, b) => {
                  // Prioritize specific products first
                  const priorityProducts = ['Smart Security Box Kit (SP-01)', 'Security Panel Kit (SP-05)'];
                  const aIsPriority = priorityProducts.includes(a.name);
                  const bIsPriority = priorityProducts.includes(b.name);
                  
                  if (aIsPriority && !bIsPriority) return -1;
                  if (!aIsPriority && bIsPriority) return 1;
                  
                  // If both or neither are priority, sort by ID descending
                  if (a.id && b.id) {
                    return b.id.localeCompare(a.id);
                  }
                  return 0;
                })
                .map((product) => (
                <TableRow key={product.id} className="hover:bg-gray-50 transition-colors">
                  <TableCell>
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-100 rounded-xl overflow-hidden shadow-sm">
                      <img 
                        src={product.image || 'https://via.placeholder.com/150x150?text=No+Image'} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://via.placeholder.com/150x150?text=No+Image';
                        }}
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-semibold text-gray-900 text-sm md:text-base">{product.name}</div>
                      <div className="text-xs md:text-sm text-gray-500">ID: {product.id}</div>
                      <div className="sm:hidden mt-1">
                        <Badge variant="outline" className="text-xs">
                          {product.category}
                        </Badge>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge variant="outline" className="font-medium">
                      {product.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell max-w-xs">
                    <p className="text-sm text-gray-600 truncate">{product.description || 'No description available'}</p>
                  </TableCell>
                  <TableCell className="font-bold text-gray-900 text-sm md:text-base">৳{product.price?.toLocaleString()}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{product.stock}</span>
                      <div className={`w-2 h-2 rounded-full ${
                        product.stock === 0 ? 'bg-red-500' : 
                        product.stock <= 3 ? 'bg-orange-500' : 
                        product.stock <= 10 ? 'bg-yellow-500' : 'bg-green-500'
                      }`} />
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge className={`${getStatusColor(product.status, product.stock)} border font-medium text-xs`}>
                      {product.stock === 0 ? 'Out of Stock' : product.stock <= 3 ? 'Low Stock' : product.stock <= 10 ? 'Medium' : 'In Stock'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col md:flex-row space-y-1 md:space-y-0 md:space-x-1">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(product)} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-1">
                        <Edit className="w-3 h-3 md:w-4 md:h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="border-0 shadow-2xl">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-xl font-bold text-gray-900">Delete Product</AlertDialogTitle>
                            <AlertDialogDescription className="text-gray-600">
                              Are you sure you want to delete "{product.name}"? This action cannot be undone and will remove the product from your catalog permanently.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="border-gray-200 hover:bg-gray-50">Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(product.id)} className="bg-red-600 hover:bg-red-700 text-white">
                              Delete Product
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
              </Table>
            </div>
          </div>
        </Card>



        {/* Edit Product Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Product</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Product Name</Label>
                <Input 
                  id="edit-name" 
                  placeholder="Enter product name" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-category">Category</Label>
                <select 
                  id="edit-category" 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                >
                  <option value="">Select category</option>
                  <option value="Smart Switch">Smart Switch</option>
                  <option value="Smart Curtain">Smart Curtain</option>
                  <option value="Security">Security</option>
                  <option value="PDLC Film">PDLC Film</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-price">Price (BDT)</Label>
                <Input 
                  id="edit-price" 
                  type="number" 
                  placeholder="0" 
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-stock">Stock Quantity</Label>
                <Input 
                  id="edit-stock" 
                  type="number" 
                  placeholder="0" 
                  value={formData.stock}
                  onChange={(e) => setFormData({...formData, stock: e.target.value})}
                />
              </div>
              {formData.category === 'Security' && (
                <div className="space-y-2">
                  <Label htmlFor="edit-serial_order">Serial Order (Security Category)</Label>
                  <Input 
                    id="edit-serial_order" 
                    type="number" 
                    placeholder="1" 
                    value={formData.serial_order}
                    onChange={(e) => setFormData({...formData, serial_order: e.target.value})}
                  />
                </div>
              )}
              <div className="col-span-2 space-y-2">
                <Label htmlFor="edit-description">Short Description</Label>
                <Textarea 
                  id="edit-description" 
                  placeholder="Brief product description" 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-image2">Image 2</Label>
                <Input 
                  id="edit-image2" 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => handleMultipleImageChange(e, 'image2')}
                />
                {(imagePreviews.image2 || formData.image2) && (
                  <img src={imagePreviews.image2 || formData.image2} alt="Preview 2" className="w-20 h-20 object-cover rounded" />
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-image3">Image 3</Label>
                <Input 
                  id="edit-image3" 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => handleMultipleImageChange(e, 'image3')}
                />
                {(imagePreviews.image3 || formData.image3) && (
                  <img src={imagePreviews.image3 || formData.image3} alt="Preview 3" className="w-20 h-20 object-cover rounded" />
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-image4">Image 4</Label>
                <Input 
                  id="edit-image4" 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => handleMultipleImageChange(e, 'image4')}
                />
                {(imagePreviews.image4 || formData.image4) && (
                  <img src={imagePreviews.image4 || formData.image4} alt="Preview 4" className="w-20 h-20 object-cover rounded" />
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-image5">Image 5</Label>
                <Input 
                  id="edit-image5" 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => handleMultipleImageChange(e, 'image5')}
                />
                {(imagePreviews.image5 || formData.image5) && (
                  <img src={imagePreviews.image5 || formData.image5} alt="Preview 5" className="w-20 h-20 object-cover rounded" />
                )}
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="edit-detailed_description">Detailed Description</Label>
                <Textarea 
                  id="edit-detailed_description" 
                  placeholder="Detailed product description for modal" 
                  value={formData.detailed_description}
                  onChange={(e) => setFormData({...formData, detailed_description: e.target.value})}
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-features">Features</Label>
                <Textarea 
                  id="edit-features" 
                  placeholder="Key features (one per line)" 
                  value={formData.features}
                  onChange={(e) => setFormData({...formData, features: e.target.value})}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-specifications">Specifications</Label>
                <Textarea 
                  id="edit-specifications" 
                  placeholder="Technical specifications" 
                  value={formData.specifications}
                  onChange={(e) => setFormData({...formData, specifications: e.target.value})}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-warranty">Warranty</Label>
                <Input 
                  id="edit-warranty" 
                  placeholder="e.g., 1 Year Warranty" 
                  value={formData.warranty}
                  onChange={(e) => setFormData({...formData, warranty: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="edit-installation_included"
                    checked={formData.installation_included}
                    onChange={(e) => setFormData({...formData, installation_included: e.target.checked})}
                  />
                  <Label htmlFor="edit-installation_included">Installation Included</Label>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="edit-engraving_available"
                    checked={formData.engraving_available}
                    onChange={(e) => setFormData({...formData, engraving_available: e.target.checked})}
                  />
                  <Label htmlFor="edit-engraving_available">Engraving Available</Label>
                </div>
              </div>
              {formData.engraving_available && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="edit-engraving_price">Engraving Price (BDT)</Label>
                    <Input 
                      id="edit-engraving_price" 
                      type="number" 
                      placeholder="0" 
                      value={formData.engraving_price}
                      onChange={(e) => setFormData({...formData, engraving_price: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-engraving_image">Engraving Preview Image</Label>
                    <Input 
                      id="edit-engraving_image" 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => handleMultipleImageChange(e, 'engraving_image')}
                    />
                    {(imagePreviews.engraving_image || formData.engraving_image) && (
                      <img src={imagePreviews.engraving_image || formData.engraving_image} alt="Engraving Preview" className="w-20 h-20 object-cover rounded" />
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-engraving_text_color">Engraving Text Color</Label>
                    <div className="flex items-center gap-2">
                      <Input 
                        id="edit-engraving_text_color" 
                        type="color" 
                        value={formData.engraving_text_color}
                        onChange={(e) => setFormData({...formData, engraving_text_color: e.target.value})}
                        className="w-16 h-10 p-1 border rounded"
                      />
                      <Input 
                        type="text" 
                        value={formData.engraving_text_color}
                        onChange={(e) => setFormData({...formData, engraving_text_color: e.target.value})}
                        placeholder="#000000"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </>
              )}
              <div className="col-span-2 space-y-2">
                <Label htmlFor="edit-image">Product Image</Label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Image URL" 
                    value={formData.image}
                    onChange={(e) => {
                      setFormData({...formData, image: e.target.value});
                      setImagePreview(e.target.value);
                    }}
                    className="flex-1"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowCategoryImages(!showCategoryImages)}
                    disabled={!formData.category}
                  >
                    Gallery
                  </Button>
                </div>
                {showCategoryImages && formData.category && categoryImages[formData.category as keyof typeof categoryImages] && (
                  <div className="grid grid-cols-4 gap-2 p-2 border rounded">
                    {categoryImages[formData.category as keyof typeof categoryImages].map((imgUrl, index) => (
                      <img 
                        key={index}
                        src={imgUrl} 
                        alt={`${formData.category} ${index + 1}`}
                        className="w-16 h-16 object-cover rounded cursor-pointer hover:ring-2 hover:ring-blue-500"
                        onClick={() => {
                          setFormData({...formData, image: imgUrl});
                          setImagePreview(imgUrl);
                          setShowCategoryImages(false);
                        }}
                      />
                    ))}
                  </div>
                )}
                {imagePreview && (
                  <div className="mt-2">
                    <img src={imagePreview} alt="Preview" className="w-20 h-20 object-cover rounded" />
                  </div>
                )}
                <Input 
                  id="edit-image" 
                  type="file" 
                  accept="image/*"
                  onChange={handleImageChange}
                  className="mt-2"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminProducts;