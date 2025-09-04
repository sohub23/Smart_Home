import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'
import AdminNavbar from '@/components/AdminNavbar'
import AdminProductForm from '@/components/AdminProductForm'
import { productService, categoryService } from '@/supabase'
import { Product, ProductCategory, ProductSubcategory } from '@/supabase/types'

export default function AdminProductsNew() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [subcategories, setSubcategories] = useState<ProductSubcategory[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedSubcategory, setSelectedSubcategory] = useState('')
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (selectedCategory) {
      loadSubcategories(selectedCategory)
    } else {
      setSubcategories([])
    }
    setSelectedSubcategory('')
  }, [selectedCategory])

  const loadData = async () => {
    setLoading(true)
    try {
      const [productsData, categoriesData] = await Promise.all([
        productService.getProducts(),
        categoryService.getCategories()
      ])
      setProducts(productsData)
      setCategories(categoriesData)
    } catch (error) {
      console.error('Failed to load data:', error)
      toast({ title: "Error", description: "Failed to load data.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const loadSubcategories = async (categoryId: string) => {
    try {
      const data = await categoryService.getSubcategories(categoryId)
      setSubcategories(data)
    } catch (error) {
      console.error('Failed to load subcategories:', error)
    }
  }

  const handleAddProduct = () => {
    setEditingProduct(null)
    setIsProductDialogOpen(true)
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setIsProductDialogOpen(true)
  }

  const handleSaveProduct = (product: Product) => {
    setIsProductDialogOpen(false)
    setEditingProduct(null)
    loadData()
    toast({
      title: editingProduct ? "Product Updated" : "Product Created",
      description: `${product.title} has been ${editingProduct ? 'updated' : 'created'} successfully.`
    })
  }

  const handleDeleteProduct = async (id: string) => {
    try {
      await productService.deleteProduct(id)
      toast({ title: "Product Deleted", description: "Product has been deleted successfully." })
      loadData()
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete product.", variant: "destructive" })
    }
  }

  const getCategoryName = (categoryId?: string) => {
    if (!categoryId) return 'No Category'
    const category = categories.find(c => c.id === categoryId)
    return category?.name || 'Unknown Category'
  }

  const getSubcategoryName = (subcategoryId?: string) => {
    if (!subcategoryId) return null
    const subcategory = subcategories.find(s => s.id === subcategoryId)
    return subcategory?.name || 'Unknown Subcategory'
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.display_name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || product.category_id === selectedCategory
    const matchesSubcategory = !selectedSubcategory || product.subcategory_id === selectedSubcategory
    
    return matchesSearch && matchesCategory && matchesSubcategory
  })

  const getStatusColor = (status: string, stock: number) => {
    if (stock === 0) return 'bg-red-100 text-red-800'
    if (stock <= 3) return 'bg-orange-100 text-orange-800'
    if (stock <= 10) return 'bg-yellow-100 text-yellow-800'
    return 'bg-green-100 text-green-800'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <AdminNavbar />
      <main className="p-4 md:p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2">
              Products Management
            </h1>
            <p className="text-gray-600">Manage your product catalog with categories, variants, and colors</p>
          </div>
          <Button onClick={handleAddProduct}>
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>

              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={selectedSubcategory}
                onChange={(e) => setSelectedSubcategory(e.target.value)}
                disabled={!selectedCategory}
              >
                <option value="">All Subcategories</option>
                {subcategories.map((subcategory) => (
                  <option key={subcategory.id} value={subcategory.id}>
                    {subcategory.name}
                  </option>
                ))}
              </select>

              <div className="text-sm text-gray-500 flex items-center">
                Total: {filteredProducts.length} products
              </div>
            </div>
          </div>
        </Card>

        {/* Products Table */}
        <Card>
          <div className="p-6">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm ? `No products match "${searchTerm}"` : 'Start by adding your first product'}
                </p>
                <Button onClick={handleAddProduct}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Product
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Image</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Model</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead className="w-32">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden">
                            <img
                              src={product.main_image || 'https://via.placeholder.com/150x150?text=No+Image'}
                              alt={product.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.src = 'https://via.placeholder.com/150x150?text=No+Image'
                              }}
                            />
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div>
                            <div className="font-semibold text-gray-900">{product.title}</div>
                            <div className="text-sm text-gray-500">{product.display_name}</div>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div>
                            <Badge variant="outline">{getCategoryName(product.category_id)}</Badge>
                            {product.subcategory_id && (
                              <div className="mt-1">
                                <Badge variant="secondary" className="text-xs">
                                  {getSubcategoryName(product.subcategory_id)}
                                </Badge>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          {product.model && (
                            <Badge variant="outline" className="text-xs">
                              {product.model}
                            </Badge>
                          )}
                        </TableCell>
                        
                        <TableCell>
                          <div>
                            <div className="font-bold">৳{product.base_price.toLocaleString()}</div>
                            {product.discount_price && product.discount_price > 0 && (
                              <div className="text-sm text-green-600">
                                Discount: ৳{product.discount_price.toLocaleString()}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{product.stock}</span>
                            <div className={`w-2 h-2 rounded-full ${
                              product.stock === 0 ? 'bg-red-500' : 
                              product.stock <= 3 ? 'bg-orange-500' : 
                              product.stock <= 10 ? 'bg-yellow-500' : 'bg-green-500'
                            }`} />
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <Badge className={`${getStatusColor(product.status, product.stock)} border font-medium text-xs`}>
                            {product.stock === 0 ? 'Out of Stock' : 
                             product.stock <= 3 ? 'Low Stock' : 
                             product.stock <= 10 ? 'Medium' : 'In Stock'}
                          </Badge>
                        </TableCell>
                        
                        <TableCell>
                          <span className="text-sm text-gray-500">{product.position}</span>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex space-x-1">
                            <Button variant="ghost" size="sm" onClick={() => handleEditProduct(product)}>
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
                                    Are you sure you want to delete "{product.title}"? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleDeleteProduct(product.id)}
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
              </div>
            )}
          </div>
        </Card>

        {/* Product Form Dialog */}
        <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            </DialogHeader>
            <AdminProductForm
              product={editingProduct || undefined}
              onSave={handleSaveProduct}
              onCancel={() => setIsProductDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}