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
    detailed_description: '',
    features: '',
    specifications: '',
    warranty: '',
    installation_included: false,
    serial_order: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  const categories = ['All', 'Curtain', 'Switch', 'Light Switch', 'Fan Switch', 'Boiler Switch', 'Security', 'PDLC Film', 'Services'];

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await executeQuery(() => productService.getProducts());
      setProducts(data || []);
    } catch (err) {
      console.error('Failed to load products:', err);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
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
        category: formData.category,
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
        name: '', category: '', price: '', stock: '', description: '', image: '',
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
    setIsEditDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editingProduct) return;
    try {
      let imageUrl = formData.image;
      
      if (imageFile) {
        imageUrl = await executeQuery(() => storageService.uploadProductImage(imageFile, editingProduct.id));
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
                      <option value="Curtain">Curtain</option>
                      <option value="Switch">Switch</option>
                      <option value="Light Switch">Light Switch</option>
                      <option value="Fan Switch">Fan Switch</option>
                      <option value="Boiler Switch">Boiler Switch</option>
                      <option value="Security">Security</option>
                      <option value="PDLC Film">PDLC Film</option>
                      <option value="Services">Services</option>
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
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="image">Product Image</Label>
                    <Input 
                      placeholder="Enter image URL here" 
                      value={formData.image}
                      onChange={(e) => {
                        setFormData({...formData, image: e.target.value});
                        setImagePreview(e.target.value);
                      }}
                      className="flex-1"
                    />
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
        
        {/* Category Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { name: 'Curtain', icon: '🪟', color: 'bg-blue-500', bgColor: 'bg-blue-50' },
            { name: 'Switch', icon: '🔌', color: 'bg-green-500', bgColor: 'bg-green-50' },
            { name: 'Security', icon: '🛡️', color: 'bg-red-500', bgColor: 'bg-red-50' },
            { name: 'PDLC Film', icon: '🔳', color: 'bg-purple-500', bgColor: 'bg-purple-50' }
          ].map((category) => {
            const productCount = products.filter(p => p.category === category.name).length;
            const isSelected = selectedCategory === category.name;
            
            return (
              <Card 
                key={category.name}
                className={`cursor-pointer transition-all duration-300 hover:shadow-lg border-2 ${
                  isSelected ? 'border-blue-500 shadow-lg' : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => window.location.href = `/admin/products/${category.name}`}
              >
                <div className="p-6">
                  <div className={`w-12 h-12 rounded-lg ${category.bgColor} flex items-center justify-center mb-4`}>
                    <span className="text-2xl">{category.icon}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{category.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-gray-900">{productCount}</span>
                    <span className="text-sm text-gray-500">Products</span>
                  </div>
                  <div className={`mt-3 h-1 rounded-full ${category.color} opacity-20`}></div>
                </div>
              </Card>
            );
          })}
        </div>





        {/* Products Table - Hidden on main page */}
        {false && <Card className="border-0 shadow-lg">
          <div className="p-6">
            {products
              .filter(product => {
                if (selectedCategory === 'All') return true;
                return product.category === selectedCategory;
              })
              .filter(product => 
                product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.category.toLowerCase().includes(searchTerm.toLowerCase())
              ).length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ? 'No products found' : `No ${selectedCategory.toLowerCase()} products`}
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm 
                    ? `No products match "${searchTerm}" in ${selectedCategory === 'All' ? 'any category' : selectedCategory}`
                    : `Start by adding your first ${selectedCategory.toLowerCase()} product`
                  }
                </p>
                <Button onClick={() => setIsAddDialogOpen(true)} className="inline-flex items-center">
                  <Plus className="w-4 h-4 mr-2" />
                  Add {selectedCategory === 'All' ? 'Product' : selectedCategory + ' Product'}
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-4 md:mx-0">
                <Table className="min-w-full">
                  <TableHeader>
                    <TableRow className="border-gray-200">
                      <TableHead className="font-semibold text-gray-900 w-16">Image</TableHead>
                      <TableHead className="font-semibold text-gray-900 min-w-[150px]">Product Name</TableHead>
                      {selectedCategory === 'All' && (
                        <TableHead className="font-semibold text-gray-900 hidden sm:table-cell">Category</TableHead>
                      )}
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
                      return product.category === selectedCategory;
                    })
                    .filter(product => 
                      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      product.category.toLowerCase().includes(searchTerm.toLowerCase())
                    )
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
                      {selectedCategory === 'All' && (
                        <TableCell className="hidden sm:table-cell">
                          <Badge variant="outline" className="font-medium">
                            {product.category}
                          </Badge>
                        </TableCell>
                      )}
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
            )}
          </div>
        </Card>}

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
                  <option value="Curtain">Curtain</option>
                  <option value="Switch">Switch</option>
                  <option value="Light Switch">Light Switch</option>
                  <option value="Fan Switch">Fan Switch</option>
                  <option value="Boiler Switch">Boiler Switch</option>
                  <option value="Security">Security</option>
                  <option value="PDLC Film">PDLC Film</option>
                  <option value="Services">Services</option>
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
              <div className="col-span-2 space-y-2">
                <Label htmlFor="edit-image">Product Image</Label>
                <Input 
                  placeholder="Image URL" 
                  value={formData.image}
                  onChange={(e) => {
                    setFormData({...formData, image: e.target.value});
                    setImagePreview(e.target.value);
                  }}
                  className="flex-1"
                />
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
      </main>
    </div>
  );
};

export default AdminProducts;