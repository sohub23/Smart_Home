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

  const categoryIcons = {
    'Curtain': '🪟',
    'Switch': '🔌',
    'Security': '🛡️',
    'PDLC Film': '🔳'
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
      console.log('All products:', data);
      console.log('Category from URL:', category);
      const filteredProducts = (data || []).filter(p => {
        console.log('Product category:', p.category, 'URL category:', category);
        return p.category === category;
      });
      console.log('Filtered products:', filteredProducts);
      setProducts(filteredProducts);
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

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white">
      <AdminNavbar />
      <main className="p-6 max-w-7xl mx-auto">
        <div className="bg-white border-b border-gray-100 pb-6 mb-8">
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
              <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl flex items-center justify-center shadow-sm">
                <span className="text-2xl">{categoryIcons[category as keyof typeof categoryIcons]}</span>
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

        {/* Products Table */}
        <Card className="border border-gray-200 shadow-sm rounded-xl overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">{category} Catalog</h2>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700 px-3 py-1">
                {filteredProducts.length} products
              </Badge>
            </div>
          </div>
          <div className="p-6">
            
            {filteredProducts.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl flex items-center justify-center shadow-sm">
                  <span className="text-3xl">{categoryIcons[category as keyof typeof categoryIcons]}</span>
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
              <div className="col-span-2 space-y-2">
                <Label htmlFor="edit-image">Product Image</Label>
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

export default CategoryProducts;