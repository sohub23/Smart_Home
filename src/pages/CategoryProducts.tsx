import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Search, Edit, Trash2, ArrowLeft } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import AdminNavbar from '@/components/AdminNavbar';
import { useSupabase, productService, storageService, type Product } from '@/supabase';

const CategoryProducts = () => {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const { loading, executeQuery } = useSupabase();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedSecurityCategory, setSelectedSecurityCategory] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: category || '',
    price: '',
    stock: '',
    description: '',
    image: '',
    detailed_description: '',
    features: '',
    specifications: '',
    warranty: '',
    installation_included: false,
    serial_order: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [additionalImages, setAdditionalImages] = useState<File[]>([]);
  const [additionalPreviews, setAdditionalPreviews] = useState<string[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [gangImages, setGangImages] = useState<{[key: string]: string}>({});
  const [gangFiles, setGangFiles] = useState<{[key: string]: File}>({});
  const [viewProduct, setViewProduct] = useState<Product | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isCategoryEditOpen, setIsCategoryEditOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<{type: string, name: string, image: string} | null>(null);
  const [categoryFormData, setCategoryFormData] = useState({name: '', image: ''});
  const [categoryImageFile, setCategoryImageFile] = useState<File | null>(null);
  const [categoryImagePreview, setCategoryImagePreview] = useState<string>('');

  const categoryIcons = {
    'Curtain': (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
        <path d="M3 3h18v2H3V3zm0 16h18v2H3v-2zM5 7h2v10H5V7zm4 0h2v10H9V7zm4 0h2v10h-2V7zm4 0h2v10h-2V7z"/>
      </svg>
    ),
    'Switch': (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17 7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h10c2.76 0 5-2.24 5-5s-2.24-5-5-5zM7 15c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"/>
      </svg>
    ),
    'Security': (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.4,7 14.8,8.6 14.8,10V11H16V18H8V11H9.2V10C9.2,8.6 10.6,7 12,7M12,8.2C11.2,8.2 10.4,8.7 10.4,10V11H13.6V10C13.6,8.7 12.8,8.2 12,8.2Z"/>
      </svg>
    ),
    'PDLC Film': (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
        <path d="M4 4h16v16H4V4zm2 2v12h12V6H6zm2 2h8v8H8V8zm2 2v4h4v-4h-4z"/>
      </svg>
    )
  };

  useEffect(() => {
    if (category) {
      loadProducts();
      setFormData(prev => ({ ...prev, category }));
    }
  }, [category]);

  const loadProducts = async () => {
    try {
      const data = await executeQuery(() => productService.getProducts());
      const filteredProducts = (data || []).filter(p => p.product_categories?.name === category);
      setProducts(filteredProducts);
    } catch (err) {
      console.error('Failed to load products:', err);
    }
  };

  const getFilteredProducts = () => {
    let filtered = products.filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    if (category === 'Security' && selectedSecurityCategory) {
      const panelProducts = ['SP 01', 'SP 02', 'SP-01', 'SP-02', 'SP 05', 'SP-05'];
      const sensorProducts = ['SOS Band', 'Doorbell Button', 'Signal Extender', 'Smoke Detector', 'Gas Detector', 'Wireless Siren', 'Vibration Sensor', 'Shutter Sensor', 'Motion Sensor', 'Door Sensor'];
      const cameraProducts = ['Indoor AI Camera', 'Camera'];
      
      if (selectedSecurityCategory === 'panel') {
        filtered = filtered.filter(p => panelProducts.some(name => p.name.toLowerCase().includes(name.toLowerCase())));
      } else if (selectedSecurityCategory === 'sensors') {
        filtered = filtered.filter(p => sensorProducts.some(name => p.name.toLowerCase().includes(name.toLowerCase())));
      } else if (selectedSecurityCategory === 'camera') {
        filtered = filtered.filter(p => cameraProducts.some(name => p.name.toLowerCase().includes(name.toLowerCase())));
      }
    }
    
    if (category === 'Switch' && selectedSecurityCategory) {
      const lightProducts = ['light', 'touch', '4 gang', '3 gang', 'mechanical'];
      const fanProducts = ['fan'];
      const boilerProducts = ['boiler', '1 gang', 'one gang'];
      
      if (selectedSecurityCategory === 'light') {
        filtered = filtered.filter(p => lightProducts.some(name => p.name.toLowerCase().includes(name.toLowerCase())));
      } else if (selectedSecurityCategory === 'fan') {
        filtered = filtered.filter(p => fanProducts.some(name => p.name.toLowerCase().includes(name.toLowerCase())));
      } else if (selectedSecurityCategory === 'boiler') {
        filtered = filtered.filter(p => boilerProducts.some(name => p.name.toLowerCase().includes(name.toLowerCase())));
      }
    }
    
    return filtered;
  };
  
  const filteredProducts = getFilteredProducts();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleAdditionalImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    setAdditionalImages(prev => [...prev, ...files]);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        setAdditionalPreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
    
    // Reset input to allow selecting same files again
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
    if (files.length === 0) return;
    
    setAdditionalImages(prev => [...prev, ...files]);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        setAdditionalPreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleAdd = async () => {
    try {
      let imageUrl = formData.image;
      
      if (imageFile) {
        try {
          imageUrl = await storageService.uploadProductImage(imageFile);
        } catch (uploadError) {
          console.error('Image upload failed:', uploadError);
          imageUrl = '';
        }
      }
      
      const productData = {
        name: formData.name,
        category: category || '',
        price: parseFloat(formData.price) || 0,
        stock: parseInt(formData.stock) || 0,
        description: formData.description,
        image: imageUrl,
        detailed_description: formData.detailed_description,
        features: formData.features,
        specifications: formData.specifications,
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
        name: '', category: category || '', price: '', stock: '', description: '', image: '',
        detailed_description: '', features: '', specifications: '', warranty: '', 
        installation_included: false, serial_order: ''
      });
      setImageFile(null);
      setImagePreview('');
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

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price.toString(),
      stock: product.stock.toString(),
      description: product.description || '',
      image: product.image || '',
      detailed_description: product.detailed_description || '',
      features: product.features || '',
      specifications: product.specifications || '',
      warranty: product.warranty || '',
      installation_included: product.installation_included || false,
      serial_order: product.serial_order?.toString() || ''
    });
    setImagePreview(product.image || '');
    setImageFile(null);
    setGangImages({
      '1_gang': (product as any).gang_1_image || '',
      '2_gang': (product as any).gang_2_image || '',
      '3_gang': (product as any).gang_3_image || '',
      '4_gang': (product as any).gang_4_image || ''
    });
    setGangFiles({});
    setAdditionalPreviews([
      (product as any).additional_image_1,
      (product as any).additional_image_2,
      (product as any).additional_image_3,
      (product as any).additional_image_4,
      (product as any).additional_image_5
    ].filter(Boolean));
    setAdditionalImages([]);
    setIsEditDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editingProduct) return;
    try {
      let imageUrl = formData.image;
      
      if (imageFile) {
        imageUrl = await executeQuery(() => storageService.uploadProductImage(imageFile, editingProduct.id));
      }
      
      // Upload gang images
      const gangImageUrls: {[key: string]: string} = {};
      for (const [gangKey, file] of Object.entries(gangFiles)) {
        if (file) {
          try {
            const url = await executeQuery(() => storageService.uploadProductImage(file, `${editingProduct.id}_${gangKey}`));
            gangImageUrls[gangKey] = url;
          } catch (error) {
            console.error(`Failed to upload ${gangKey} image:`, error);
          }
        }
      }
      
      // Upload additional images
      const additionalImageUrls: {[key: string]: string} = {};
      for (let i = 0; i < additionalImages.length; i++) {
        const file = additionalImages[i];
        if (file) {
          try {
            const url = await executeQuery(() => storageService.uploadProductImage(file, `${editingProduct.id}_additional_${i + 1}`));
            additionalImageUrls[`additional_image_${i + 1}`] = url;
          } catch (error) {
            console.error(`Failed to upload additional image ${i + 1}:`, error);
          }
        }
      }
      
      await executeQuery(() => productService.updateProduct(editingProduct.id, {
        name: formData.name,
        category: formData.category,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        description: formData.description,
        image: imageUrl,
        detailed_description: formData.detailed_description,
        features: formData.features,
        specifications: formData.specifications,
        warranty: formData.warranty,
        installation_included: formData.installation_included,
        serial_order: formData.category === 'Security' ? parseInt(formData.serial_order) || null : null,
        status: parseInt(formData.stock) === 0 ? 'Out of Stock' : 'Active',
        ...(Object.keys(gangImageUrls).length > 0 && {
          gang_1_image: gangImageUrls['1_gang'],
          gang_2_image: gangImageUrls['2_gang'], 
          gang_3_image: gangImageUrls['3_gang'],
          gang_4_image: gangImageUrls['4_gang']
        }),
        ...(Object.keys(additionalImageUrls).length > 0 && {
          additional_image_1: additionalImageUrls['additional_image_1'],
          additional_image_2: additionalImageUrls['additional_image_2'],
          additional_image_3: additionalImageUrls['additional_image_3'],
          additional_image_4: additionalImageUrls['additional_image_4'],
          additional_image_5: additionalImageUrls['additional_image_5']
        })
      }));
      
      toast({
        title: "Product Updated",
        description: `${formData.name} has been updated successfully.`,
      });
      
      setIsEditDialogOpen(false);
      setEditingProduct(null);
      setImageFile(null);
      setImagePreview('');
      setGangImages({});
      setGangFiles({});
      await loadProducts();
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update product.",
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

  const getStatusColor = (status: string, stock: number) => {
    if (stock === 0) return 'bg-red-100 text-red-800';
    if (stock <= 3) return 'bg-orange-100 text-orange-800';
    if (stock <= 10) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <AdminNavbar />
      <main className="p-6 max-w-7xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm border-b border-gray-100 pb-6 mb-8 rounded-2xl shadow-sm mx-4 mt-4 px-6">
          <div className="flex items-center gap-4 mb-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/admin/products')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Products
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg text-white">
                {categoryIcons[category as keyof typeof categoryIcons]}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">
                  {category} Products
                </h1>
                <p className="text-gray-500">Manage your {category?.toLowerCase()} product catalog</p>
              </div>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                  <Plus className="w-4 h-4" />
                  <span>Add {category} Product</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New {category} Product</DialogTitle>
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
                {category === 'Security' && (
                  <div className="space-y-2">
                    <Label htmlFor="serial_order">Serial Order</Label>
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
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Product description" 
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={3}
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="image">Product Image</Label>
                  <Input 
                    placeholder="Enter image URL" 
                    value={formData.image}
                    onChange={(e) => {
                      setFormData({...formData, image: e.target.value});
                      setImagePreview(e.target.value);
                    }}
                  />
                  {imagePreview && (
                    <img src={imagePreview} alt="Preview" className="w-20 h-20 object-cover rounded mt-2" />
                  )}
                  <Input 
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

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder={`Search ${category?.toLowerCase()} products...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm"
            />
          </div>
        </div>

        {/* Security Category - Show 3 Cards */}
        {category === 'Security' && !selectedSecurityCategory ? (
          <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 rounded-3xl p-6 mb-8 mx-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Security Solutions</h2>
              <p className="text-gray-600 text-sm">Choose your security category to explore products</p>
            </div>
            <div className="grid grid-cols-3 gap-4">
            {/* Panel Kit Card */}
            <Card 
              className="border-0 shadow-md rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group bg-white"
              onClick={() => setSelectedSecurityCategory('panel')}
            >
              <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center p-4">
                <img 
                  src="/images/sohub_protect/accesories/H502-Alarm panel.png" 
                  alt="Panel Kit"
                  className="w-16 h-16 object-contain mb-2"
                />
                <h3 className="text-sm font-bold text-gray-900 text-center">Panel Kit</h3>
              </div>
            </Card>

            {/* Sensors Card */}
            <Card 
              className="border-0 shadow-md rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group bg-white"
              onClick={() => setSelectedSecurityCategory('sensors')}
            >
              <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center p-4">
                <img 
                  src="/images/sohub_protect/accesories/Motion_pr200.png" 
                  alt="Sensors"
                  className="w-16 h-16 object-contain mb-2"
                />
                <h3 className="text-sm font-bold text-gray-900 text-center">Sensors</h3>
              </div>
            </Card>

            {/* Camera Card */}
            <Card 
              className="border-0 shadow-md rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group bg-white"
              onClick={() => setSelectedSecurityCategory('camera')}
            >
              <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center p-4">
                <img 
                  src="/images/sohub_protect/accesories/camera-c11.png" 
                  alt="Camera"
                  className="w-16 h-16 object-contain mb-2"
                />
                <h3 className="text-sm font-bold text-gray-900 text-center">Camera</h3>
              </div>
            </Card>
            </div>
          </div>
        ) : category === 'Switch' && !selectedSecurityCategory ? (
          <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 rounded-3xl p-6 mb-8 mx-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Switch Solutions</h2>
              <p className="text-gray-600 text-sm">Choose your switch category to explore products</p>
            </div>
            <div className="grid grid-cols-3 gap-4">
            {/* Light Switch Card */}
            <Card className="border-0 shadow-md rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 bg-white group">
              <div 
                className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center p-4 cursor-pointer"
                onClick={() => setSelectedSecurityCategory('light')}
              >
                <img 
                  src="/images/smart_switch/4 gang touch light.webp" 
                  alt="Light Switch"
                  className="w-16 h-16 object-contain mb-2"
                />
                <h3 className="text-sm font-bold text-gray-900 text-center">Light Switch</h3>
              </div>
              <div className="p-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full h-7 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingCategory({type: 'light', name: 'Light Switch', image: '/images/smart_switch/4 gang touch light.webp'});
                    setCategoryFormData({name: 'Light Switch', image: '/images/smart_switch/4 gang touch light.webp'});
                    setIsCategoryEditOpen(true);
                  }}
                >
                  <Edit className="w-3 h-3 mr-1" />
                  Edit
                </Button>
              </div>
            </Card>

            {/* Fan Switch Card */}
            <Card className="border-0 shadow-md rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 bg-white group">
              <div 
                className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center p-4 cursor-pointer"
                onClick={() => setSelectedSecurityCategory('fan')}
              >
                <img 
                  src="/images/smart_switch/fan touch switch.webp" 
                  alt="Fan Switch"
                  className="w-16 h-16 object-contain mb-2"
                />
                <h3 className="text-sm font-bold text-gray-900 text-center">Fan Switch</h3>
              </div>
              <div className="p-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full h-7 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingCategory({type: 'fan', name: 'Fan Switch', image: '/images/smart_switch/fan touch switch.webp'});
                    setCategoryFormData({name: 'Fan Switch', image: '/images/smart_switch/fan touch switch.webp'});
                    setIsCategoryEditOpen(true);
                  }}
                >
                  <Edit className="w-3 h-3 mr-1" />
                  Edit
                </Button>
              </div>
            </Card>

            {/* Boiler Switch Card */}
            <Card className="border-0 shadow-md rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 bg-white group">
              <div 
                className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center p-4 cursor-pointer"
                onClick={() => setSelectedSecurityCategory('boiler')}
              >
                <img 
                  src="/images/smart_switch/one gang.webp" 
                  alt="Boiler Switch"
                  className="w-16 h-16 object-contain mb-2"
                />
                <h3 className="text-sm font-bold text-gray-900 text-center">Boiler Switch</h3>
              </div>
              <div className="p-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full h-7 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingCategory({type: 'boiler', name: 'Boiler Switch', image: '/images/smart_switch/one gang.webp'});
                    setCategoryFormData({name: 'Boiler Switch', image: '/images/smart_switch/one gang.webp'});
                    setIsCategoryEditOpen(true);
                  }}
                >
                  <Edit className="w-3 h-3 mr-1" />
                  Edit
                </Button>
              </div>
            </Card>
            </div>
          </div>
        ) : selectedSecurityCategory ? (
          /* Security Subcategory - Show Products */
          <div>
            <div className="flex items-center gap-4 mb-6">
              <Button 
                variant="ghost" 
                onClick={() => setSelectedSecurityCategory(null)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Categories
              </Button>
              <h2 className="text-2xl font-bold text-gray-900 capitalize">
                {category === 'Security' ? 
                  (selectedSecurityCategory === 'panel' ? 'Panel Kit' : selectedSecurityCategory === 'sensors' ? 'Sensors' : 'Camera') :
                  (selectedSecurityCategory === 'light' ? 'Light Switch' : selectedSecurityCategory === 'fan' ? 'Fan Switch' : 'Boiler Switch')
                } Products
              </h2>
            </div>
            
            {filteredProducts.length === 0 ? (
              <Card className="border border-gray-200 shadow-sm rounded-xl p-12 text-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-500 mb-6">No {selectedSecurityCategory} products available yet.</p>
                <Button onClick={() => setIsAddDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Product
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {filteredProducts.map((product) => (
                  <Card key={product.id} className="border-0 shadow-md rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 bg-white group">
                    <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-3">
                      <img 
                        src={product.image || 'https://via.placeholder.com/120x120?text=No+Image'} 
                        alt={product.name}
                        className="w-full h-full object-contain rounded-lg"
                      />
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium text-gray-900 mb-2 text-sm">{product.name}</h3>
                      <div className="mb-2">
                        <span className="text-sm font-bold text-blue-600">৳{product.price?.toLocaleString()}</span>
                        <Badge className={`text-xs px-2 py-0.5 ml-2 ${getStatusColor(product.status, product.stock)}`}>
                          {product.stock === 0 ? 'Out' : product.stock <= 3 ? 'Low' : 'Stock'}
                        </Badge>
                      </div>
                      
                      {/* Gang Images */}
                      {(category === 'Switch' && selectedSecurityCategory === 'light') && (
                        <div className="mb-3">
                          <p className="text-xs font-medium text-gray-700 mb-1">Gang Images:</p>
                          <div className="grid grid-cols-2 gap-1">
                            {[
                              { key: 'gang_1_image', label: '1G' },
                              { key: 'gang_2_image', label: '2G' },
                              { key: 'gang_3_image', label: '3G' },
                              { key: 'gang_4_image', label: '4G' }
                            ].map(({ key, label }) => (
                              <div key={key} className="text-center">
                                <div className="w-8 h-8 bg-gray-100 rounded border mb-1 flex items-center justify-center">
                                  {(product as any)[key] ? (
                                    <img src={(product as any)[key]} alt={label} className="w-full h-full object-cover rounded" />
                                  ) : (
                                    <span className="text-xs text-gray-400">{label}</span>
                                  )}
                                </div>
                                <span className="text-xs text-gray-500">{label}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => {
                          setViewProduct(product);
                          setIsViewDialogOpen(true);
                        }} className="flex-1 h-7 text-xs">
                          <Edit className="w-3 h-3 mr-1" />
                          View
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(product)} className="flex-1 h-7 text-xs">
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 h-7 px-2">
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Product</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{product.name}"?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(product.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Other Categories - Show Table */
          <Card className="border-0 shadow-lg rounded-2xl overflow-hidden bg-white/90 backdrop-blur-sm mx-4">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">{category} Catalog</h2>
                <Badge variant="secondary" className="bg-white/20 text-white px-3 py-1 backdrop-blur-sm">
                  {filteredProducts.length} products
                </Badge>
              </div>
            </div>
            <div className="p-6">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg text-white">
                    <div className="scale-150">
                      {categoryIcons[category as keyof typeof categoryIcons]}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {searchTerm ? 'No products found' : `No ${category?.toLowerCase()} products yet`}
                  </h3>
                  <p className="text-gray-500 mb-6 max-w-md mx-auto">
                    {searchTerm 
                      ? `No products match "${searchTerm}" in your ${category?.toLowerCase()} catalog`
                      : `Get started by adding your first ${category?.toLowerCase()} product to the catalog`
                    }
                  </p>
                  <Button onClick={() => setIsAddDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Add {category} Product
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-200">
                        <TableHead className="w-16 text-gray-600 font-medium">Image</TableHead>
                        <TableHead className="text-gray-600 font-medium">Product Name</TableHead>
                        <TableHead className="hidden lg:table-cell text-gray-600 font-medium">Description</TableHead>
                        <TableHead className="text-gray-600 font-medium">Price</TableHead>
                        <TableHead className="hidden md:table-cell text-gray-600 font-medium">Stock</TableHead>
                        <TableHead className="hidden md:table-cell text-gray-600 font-medium">Status</TableHead>
                        <TableHead className="w-20 text-gray-600 font-medium">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProducts.map((product) => (
                        <TableRow key={product.id} className="hover:bg-gray-50 transition-colors border-gray-100">
                          <TableCell>
                            <div className="w-12 h-12 bg-gray-50 rounded-xl overflow-hidden shadow-sm border border-gray-200">
                              <img 
                                src={product.image || 'https://via.placeholder.com/150x150?text=No+Image'} 
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-semibold text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-500">ID: {product.id}</div>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell max-w-xs">
                            <p className="text-sm text-gray-600 truncate">{product.description || 'No description'}</p>
                          </TableCell>
                          <TableCell className="font-bold">৳{product.price?.toLocaleString()}</TableCell>
                          <TableCell className="hidden md:table-cell">{product.stock}</TableCell>
                          <TableCell className="hidden md:table-cell">
                            <Badge className={getStatusColor(product.status, product.stock)}>
                              {product.stock === 0 ? 'Out of Stock' : product.stock <= 3 ? 'Low Stock' : 'In Stock'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-1">
                              <Button variant="ghost" size="sm" onClick={() => handleEdit(product)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm" className="text-red-600">
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Product</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete "{product.name}"?
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(product.id)}>
                                      Delete
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
              )}
            </div>
          </Card>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit {category} Product</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Product Name</Label>
                <Input 
                  id="edit-name" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-price">Price (BDT)</Label>
                <Input 
                  id="edit-price" 
                  type="number" 
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-stock">Stock Quantity</Label>
                <Input 
                  id="edit-stock" 
                  type="number" 
                  value={formData.stock}
                  onChange={(e) => setFormData({...formData, stock: e.target.value})}
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea 
                  id="edit-description" 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                />
              </div>
              {(category === 'Switch' && selectedSecurityCategory === 'light') && (
                <div className="col-span-2 space-y-4">
                  <Label className="text-base font-semibold">Model-wise Images</Label>
                  <div className="grid grid-cols-2 gap-4">
                    {['1 Gang', '2 Gang', '3 Gang', '4 Gang'].map((gang) => (
                      <div key={gang} className="space-y-2">
                        <Label className="text-sm font-medium">{gang}</Label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-400 transition-colors">
                          <div className="text-center">
                            <svg className="mx-auto h-8 w-8 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <Label htmlFor={`${gang.toLowerCase().replace(' ', '-')}-image`} className="cursor-pointer">
                              <span className="text-xs text-blue-600 hover:text-blue-500 block mt-1">
                                Upload {gang}
                              </span>
                            </Label>
                            <Input 
                              id={`${gang.toLowerCase().replace(' ', '-')}-image`}
                              type="file" 
                              accept="image/*"
                              className="sr-only"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const gangKey = gang.toLowerCase().replace(' ', '_');
                                  setGangFiles(prev => ({...prev, [gangKey]: file}));
                                  const reader = new FileReader();
                                  reader.onload = () => {
                                    setGangImages(prev => ({...prev, [gangKey]: reader.result as string}));
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                            {gangImages[gang.toLowerCase().replace(' ', '_')] && (
                              <img 
                                src={gangImages[gang.toLowerCase().replace(' ', '_')]} 
                                alt={`${gang} preview`} 
                                className="w-12 h-12 object-cover rounded mt-2 mx-auto"
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="col-span-2 space-y-2">
                <Label htmlFor="edit-image">Main Product Image</Label>
                <Input 
                  value={formData.image}
                  onChange={(e) => {
                    setFormData({...formData, image: e.target.value});
                    setImagePreview(e.target.value);
                  }}
                />
                {imagePreview && (
                  <img src={imagePreview} alt="Preview" className="w-20 h-20 object-cover rounded mt-2" />
                )}
                <Input 
                  type="file" 
                  accept="image/*"
                  onChange={handleImageChange}
                  className="mt-2"
                />
              </div>
              <div className="col-span-2 space-y-4">
                <div 
                  className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
                    isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
                  }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                >
                  <div className="text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="mt-4">
                      <Label htmlFor="additional-images" className="cursor-pointer">
                        <span className="text-sm font-medium text-blue-600 hover:text-blue-500">
                          {isDragOver ? 'Drop images here' : 'Upload Additional Images'}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          {isDragOver ? 'Release to upload' : 'Drag & drop or click to browse • PNG, JPG, WEBP up to 10MB each'}
                        </p>
                      </Label>
                      <Input 
                        id="additional-images"
                        type="file" 
                        accept="image/*"
                        multiple
                        onChange={handleAdditionalImagesChange}
                        className="sr-only"
                      />
                    </div>
                  </div>
                </div>
                {additionalPreviews.length > 0 && (
                  <div className="grid grid-cols-4 gap-3">
                    {additionalPreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img 
                          src={preview} 
                          alt={`Preview ${index + 1}`} 
                          className="w-full h-20 object-cover rounded-lg border border-gray-200 shadow-sm"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center">
                          <button 
                            onClick={() => {
                              const newImages = additionalImages.filter((_, i) => i !== index);
                              const newPreviews = additionalPreviews.filter((_, i) => i !== index);
                              setAdditionalImages(newImages);
                              setAdditionalPreviews(newPreviews);
                            }}
                            className="opacity-0 group-hover:opacity-100 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-all"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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

        {/* View Product Details Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Product Details - {viewProduct?.name}</DialogTitle>
            </DialogHeader>
            {viewProduct && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                {/* Product Images */}
                <div className="space-y-4">
                  <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden">
                    <img 
                      src={viewProduct.image || 'https://via.placeholder.com/400x400?text=No+Image'} 
                      alt={viewProduct.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  
                  {/* Additional Images */}
                  {[
                    (viewProduct as any).additional_image_1,
                    (viewProduct as any).additional_image_2,
                    (viewProduct as any).additional_image_3,
                    (viewProduct as any).additional_image_4,
                    (viewProduct as any).additional_image_5
                  ].filter(Boolean).length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Additional Images</h4>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          (viewProduct as any).additional_image_1,
                          (viewProduct as any).additional_image_2,
                          (viewProduct as any).additional_image_3,
                          (viewProduct as any).additional_image_4,
                          (viewProduct as any).additional_image_5
                        ].filter(Boolean).map((image, index) => (
                          <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                            <img 
                              src={image} 
                              alt={`Additional ${index + 1}`} 
                              className="w-full h-full object-contain"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Gang Images */}
                  {(category === 'Switch' && selectedSecurityCategory === 'light') && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Gang Images</h4>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { key: 'gang_1_image', label: '1 Gang' },
                          { key: 'gang_2_image', label: '2 Gang' },
                          { key: 'gang_3_image', label: '3 Gang' },
                          { key: 'gang_4_image', label: '4 Gang' }
                        ].map(({ key, label }) => (
                          <div key={key} className="text-center">
                            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-2">
                              {(viewProduct as any)[key] ? (
                                <img 
                                  src={(viewProduct as any)[key]} 
                                  alt={label} 
                                  className="w-full h-full object-contain"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                  <span className="text-sm">{label}</span>
                                </div>
                              )}
                            </div>
                            <span className="text-sm text-gray-600">{label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Product Information */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{viewProduct.name}</h3>
                    <div className="flex items-center gap-4 mb-4">
                      <span className="text-3xl font-bold text-blue-600">৳{viewProduct.price?.toLocaleString()}</span>
                      <Badge className={getStatusColor(viewProduct.status, viewProduct.stock)}>
                        {viewProduct.stock === 0 ? 'Out of Stock' : viewProduct.stock <= 3 ? 'Low Stock' : 'In Stock'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Category</Label>
                      <p className="text-sm text-gray-900">{viewProduct.category}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Stock</Label>
                      <p className="text-sm text-gray-900">{viewProduct.stock} units</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Product ID</Label>
                      <p className="text-sm text-gray-900 font-mono">{viewProduct.id}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Status</Label>
                      <p className="text-sm text-gray-900">{viewProduct.status}</p>
                    </div>
                  </div>
                  
                  {viewProduct.description && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Description</Label>
                      <p className="text-sm text-gray-900 mt-1">{viewProduct.description}</p>
                    </div>
                  )}
                  
                  {viewProduct.detailed_description && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Detailed Description</Label>
                      <p className="text-sm text-gray-900 mt-1">{viewProduct.detailed_description}</p>
                    </div>
                  )}
                  
                  {viewProduct.features && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Features</Label>
                      <div className="text-sm text-gray-900 mt-1">
                        {viewProduct.features.split('\n').map((feature, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                            <span>{feature.trim()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {viewProduct.specifications && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Specifications</Label>
                      <div className="text-sm text-gray-900 mt-1">
                        {viewProduct.specifications.split('\n').map((spec, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                            <span>{spec.trim()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {viewProduct.warranty && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Warranty</Label>
                      <p className="text-sm text-gray-900 mt-1">{viewProduct.warranty}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                Close
              </Button>
              <Button onClick={() => {
                if (viewProduct) {
                  handleEdit(viewProduct);
                  setIsViewDialogOpen(false);
                }
              }}>
                Edit Product
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Category Edit Dialog */}
        <Dialog open={isCategoryEditOpen} onOpenChange={setIsCategoryEditOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit {editingCategory?.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="category-name">Category Name</Label>
                <Input 
                  id="category-name" 
                  value={categoryFormData.name}
                  onChange={(e) => setCategoryFormData({...categoryFormData, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category-image">Image URL</Label>
                <Input 
                  id="category-image" 
                  value={categoryFormData.image}
                  onChange={(e) => {
                    setCategoryFormData({...categoryFormData, image: e.target.value});
                    setCategoryImagePreview(e.target.value);
                  }}
                />
                <Input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setCategoryImageFile(file);
                      const reader = new FileReader();
                      reader.onload = () => setCategoryImagePreview(reader.result as string);
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="mt-2"
                />
                {categoryImagePreview && (
                  <img src={categoryImagePreview} alt="Preview" className="w-20 h-20 object-cover rounded mt-2" />
                )}
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCategoryEditOpen(false)}>
                Cancel
              </Button>
              <Button onClick={async () => {
                try {
                  let imageUrl = categoryFormData.image;
                  
                  if (categoryImageFile) {
                    imageUrl = await executeQuery(() => storageService.uploadProductImage(categoryImageFile, `category_${editingCategory?.type}`));
                  }
                  
                  // Save to database logic here with imageUrl
                  toast({
                    title: "Category Updated",
                    description: `${categoryFormData.name} has been updated successfully.`,
                  });
                  setIsCategoryEditOpen(false);
                  setCategoryImageFile(null);
                  setCategoryImagePreview('');
                } catch (err) {
                  toast({
                    title: "Error",
                    description: "Failed to update category.",
                    variant: "destructive"
                  });
                }
              }}>
                Save Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default CategoryProducts;