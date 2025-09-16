import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Upload, Download, Edit, Trash2, Search, FileSpreadsheet, Save, X, ImageIcon } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import AdminNavbar from '@/components/AdminNavbar';
import { supabase } from '@/supabase';

interface PriceListItem {
  id: string;
  product_name: string;
  variant: string;
  price: number;
  category: string;
  protocol: string;
  image: string;
  details: string;
  created_at: string;
}

const AdminPriceList = () => {
  const [products, setProducts] = useState<PriceListItem[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<PriceListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<PriceListItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [formData, setFormData] = useState({
    product_name: '',
    variant: '',
    price: '',
    category: '',
    protocol: '',
    image: '',
    details: ''
  });

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    const filtered = products.filter(product =>
      product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.variant.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [products, searchTerm]);

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('price_list')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      const productsWithImages = data?.filter(p => p.image && p.image.length > 0) || [];
      console.log('Products with images:', productsWithImages.length, 'out of', data?.length);
      if (productsWithImages.length > 0) {
        console.log('First product with image:', productsWithImages[0].product_name, 'Image starts with:', productsWithImages[0].image?.substring(0, 50));
      }
      setProducts(data || []);
    } catch (error) {
      console.error('Load products error:', error);
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.product_name || !formData.price) {
      toast({
        title: "Error",
        description: "Product name and price are required",
        variant: "destructive"
      });
      return;
    }

    try {
      const productData = {
        product_name: formData.product_name,
        variant: formData.variant || null,
        price: parseInt(formData.price),
        category: formData.category || null,
        protocol: formData.protocol || null,
        image: formData.image || null,
        details: formData.details || null
      };
      
      console.log('Submitting product data:', productData);

      if (editingProduct) {
        const { error } = await supabase
          .from('price_list')
          .update(productData)
          .eq('id', editingProduct.id);
        
        if (error) throw error;
        toast({ title: "Success", description: "Product updated successfully" });
      } else {
        const { error } = await supabase
          .from('price_list')
          .insert([productData]);
        
        if (error) throw error;
        toast({ title: "Success", description: "Product added successfully" });
      }

      setIsDialogOpen(false);
      resetForm();
      await loadProducts();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save product",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (product: PriceListItem) => {
    setEditingProduct(product);
    setFormData({
      product_name: product.product_name,
      variant: product.variant || '',
      price: product.price.toString(),
      category: product.category || '',
      protocol: product.protocol || '',
      image: product.image || '',
      details: product.details || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('price_list')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: "Success", description: "Product deleted successfully" });
      loadProducts();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      product_name: '',
      variant: '',
      price: '',
      category: '',
      protocol: '',
      image: '',
      details: ''
    });
    setEditingProduct(null);
    // Reset file input
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  const uploadImageFromUrl = async (imageUrl: string, productName: string) => {
    try {
      if (!imageUrl || !imageUrl.startsWith('http')) return null;
      
      const response = await fetch(imageUrl);
      if (!response.ok) return null;
      
      const blob = await response.blob();
      const fileExt = imageUrl.split('.').pop()?.split('?')[0] || 'jpg';
      const fileName = `${productName.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.${fileExt}`;
      const filePath = `product-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, blob);

      if (uploadError) return null;

      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      return null;
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = e.target?.result;
        let parsedData: any[][] = [];
        
        if (file.name.endsWith('.csv')) {
          // Handle CSV files
          const text = data as string;
          const lines = text.split('\n');
          parsedData = lines.map(line => line.split(',').map(cell => cell.trim()));
        } else {
          // Handle Excel files - convert to CSV format
          const text = data as string;
          const lines = text.split('\n');
          parsedData = lines.map(line => {
            // Simple tab/comma separation for basic Excel support
            return line.split(/[\t,]/).map(cell => cell.trim().replace(/"/g, ''));
          });
        }
        
        if (parsedData.length < 2) {
          throw new Error('File must have at least a header row and one data row');
        }
        
        const headers = parsedData[0].map(h => h.toLowerCase().replace(/\s+/g, '_'));
        console.log('Headers found:', headers);
        
        const importData = [];
        let uploadedCount = 0;
        
        for (let i = 1; i < parsedData.length; i++) {
          const row = parsedData[i];
          if (row && row.some(cell => cell && cell.trim())) {
            const item: any = {};
            headers.forEach((header, index) => {
              item[header] = row[index] || '';
            });
            
            console.log('Processing row:', item);
            
            // Check for common header variations
            const productName = item.product_name || item.productname || item.name || item.product;
            const price = item.price || item.cost || item.amount;
            
            if (productName && productName.trim() && price && price.trim()) {
              let uploadedImageUrl = null;
              
              // Upload image if URL provided
              if (item.image && item.image.startsWith('http')) {
                uploadedImageUrl = await uploadImageFromUrl(item.image, productName);
                if (uploadedImageUrl) uploadedCount++;
              }
              
              importData.push({
                product_name: productName.trim(),
                variant: item.variant?.trim() || null,
                price: parseInt(price) || 0,
                category: item.category?.trim() || null,
                protocol: item.protocol?.trim() || null,
                image: uploadedImageUrl || item.image?.trim() || null,
                details: item.details?.trim() || null
              });
            }
          }
        }

        if (importData.length > 0) {
          const { error } = await supabase
            .from('price_list')
            .insert(importData);

          if (error) throw error;
          toast({
            title: "Success",
            description: `Imported ${importData.length} products successfully. ${uploadedCount} images uploaded.`
          });
          loadProducts();
        } else {
          toast({
            title: "Warning",
            description: "No valid data found. Please check your file format and required fields.",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Import error:', error);
        toast({
          title: "Error",
          description: "Failed to import data. Please save Excel as CSV format and try again.",
          variant: "destructive"
        });
      }
    };
    
    // Read as text for both CSV and Excel
    reader.readAsText(file);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Image size must be less than 5MB",
        variant: "destructive"
      });
      return;
    }

    setUploadingImage(true);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      console.log('Base64 result:', base64?.substring(0, 100) + '...');
      setFormData(prev => {
        const newData = {...prev, image: base64};
        console.log('Updated form data:', newData);
        return newData;
      });
      toast({
        title: "Success",
        description: "Image uploaded successfully"
      });
      setUploadingImage(false);
    };
    reader.onerror = () => {
      toast({
        title: "Error",
        description: "Failed to process image",
        variant: "destructive"
      });
      setUploadingImage(false);
    };
    reader.readAsDataURL(file);
  };

  const handleExport = () => {
    const headers = ['Product Name', 'Variant', 'Price', 'Category', 'Protocol', 'Image', 'Details'];
    const csvContent = [
      headers.join(','),
      ...products.map(product => [
        product.product_name,
        product.variant || '',
        product.price,
        product.category || '',
        product.protocol || '',
        product.image || '',
        product.details || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `price_list_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminNavbar />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">All Product List</h1>
            <p className="text-gray-600">Manage your complete product price list</p>
          </div>
          <div className="flex space-x-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImport}
              accept=".csv"
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center space-x-2"
              title="Import CSV file with columns: product_name, variant, price, category, protocol, image, details"
            >
              <Upload className="w-4 h-4" />
              <span>Import CSV</span>
            </Button>
            <Button
              variant="outline"
              onClick={handleExport}
              className="flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Add Product</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Product Name *</Label>
                      <Input
                        value={formData.product_name}
                        onChange={(e) => setFormData({...formData, product_name: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label>Variant</Label>
                      <Input
                        value={formData.variant}
                        onChange={(e) => setFormData({...formData, variant: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label>Price *</Label>
                      <Input
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label>Category</Label>
                      <Input
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label>Protocol</Label>
                      <Input
                        value={formData.protocol}
                        onChange={(e) => setFormData({...formData, protocol: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label>Product Image</Label>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => imageInputRef.current?.click()}
                            disabled={uploadingImage}
                            className="flex items-center space-x-2"
                          >
                            <ImageIcon className="w-4 h-4" />
                            <span>{uploadingImage ? 'Uploading...' : 'Upload Image'}</span>
                          </Button>
                          {formData.image && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setFormData(prev => ({...prev, image: ''}))}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                        {formData.image && (
                          <div className="w-20 h-20 border rounded-lg overflow-hidden bg-gray-50">
                            <img
                              src={formData.image}
                              alt="Product preview"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                console.log('Image load error:', formData.image);
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                        <input
                          ref={imageInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label>Details</Label>
                    <Textarea
                      value={formData.details}
                      onChange={(e) => setFormData({...formData, details: e.target.value})}
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => {
                      setIsDialogOpen(false);
                      resetForm();
                    }}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      <Save className="w-4 h-4 mr-2" />
                      {editingProduct ? 'Update' : 'Save'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Products ({filteredProducts.length})</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-80"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Variant</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Protocol</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        {product.image && product.image.length > 0 ? (
                          <img
                            src={product.image}
                            alt={product.product_name}
                            className="w-12 h-12 object-cover rounded-lg"
                            onError={(e) => {
                              console.log('Table image error:', product.image);
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div className={`w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center ${product.image ? 'hidden' : ''}`}>
                          <ImageIcon className="w-6 h-6 text-gray-400" />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{product.product_name}</TableCell>
                      <TableCell>{product.variant || '-'}</TableCell>
                      <TableCell>{product.price} BDT</TableCell>
                      <TableCell>{product.category || '-'}</TableCell>
                      <TableCell>{product.protocol || '-'}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(product)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="outline" className="text-red-600">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Product</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{product.product_name}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(product.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
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
              {filteredProducts.length === 0 && (
                <div className="text-center py-8">
                  <FileSpreadsheet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No products found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminPriceList;