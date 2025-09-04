import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Plus, Edit, Trash2, FolderPlus } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'
import AdminNavbar from '@/components/AdminNavbar'
import { categoryService } from '@/supabase'
import { ProductCategory, ProductSubcategory } from '@/supabase/types'

export default function AdminCategoriesNew() {
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [subcategories, setSubcategories] = useState<ProductSubcategory[]>([])
  const [loading, setLoading] = useState(false)
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)
  const [isSubcategoryDialogOpen, setIsSubcategoryDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null)
  const [editingSubcategory, setEditingSubcategory] = useState<ProductSubcategory | null>(null)
  
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    slug: '',
    image: '',
    position: 1
  })
  
  const [subcategoryForm, setSubcategoryForm] = useState({
    category_id: '',
    name: '',
    slug: '',
    image: '',
    position: 1
  })

  useEffect(() => {
    loadCategories()
    loadSubcategories()
  }, [])

  const loadCategories = async () => {
    try {
      const data = await categoryService.getCategories()
      setCategories(data)
    } catch (error) {
      console.error('Failed to load categories:', error)
    }
  }

  const loadSubcategories = async () => {
    try {
      const data = await categoryService.getSubcategories()
      setSubcategories(data)
    } catch (error) {
      console.error('Failed to load subcategories:', error)
    }
  }

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  }

  const handleSaveCategory = async () => {
    setLoading(true)
    try {
      const categoryData = {
        ...categoryForm,
        slug: generateSlug(categoryForm.name),
        is_active: true
      }

      if (editingCategory) {
        await categoryService.updateCategory(editingCategory.id, categoryData)
        toast({ title: "Category Updated", description: "Category has been updated successfully." })
      } else {
        await categoryService.createCategory(categoryData)
        toast({ title: "Category Created", description: "Category has been created successfully." })
      }

      setIsCategoryDialogOpen(false)
      setEditingCategory(null)
      setCategoryForm({ name: '', slug: '', image: '', position: 1 })
      loadCategories()
    } catch (error) {
      toast({ title: "Error", description: "Failed to save category.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSubcategory = async () => {
    setLoading(true)
    try {
      const subcategoryData = {
        ...subcategoryForm,
        slug: generateSlug(subcategoryForm.name),
        is_active: true
      }

      if (editingSubcategory) {
        await categoryService.updateSubcategory(editingSubcategory.id, subcategoryData)
        toast({ title: "Subcategory Updated", description: "Subcategory has been updated successfully." })
      } else {
        await categoryService.createSubcategory(subcategoryData)
        toast({ title: "Subcategory Created", description: "Subcategory has been created successfully." })
      }

      setIsSubcategoryDialogOpen(false)
      setEditingSubcategory(null)
      setSubcategoryForm({ category_id: '', name: '', slug: '', image: '', position: 1 })
      loadSubcategories()
    } catch (error) {
      toast({ title: "Error", description: "Failed to save subcategory.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleEditCategory = (category: ProductCategory) => {
    setEditingCategory(category)
    setCategoryForm({
      name: category.name,
      slug: category.slug,
      image: category.image || '',
      position: category.position
    })
    setIsCategoryDialogOpen(true)
  }

  const handleEditSubcategory = (subcategory: ProductSubcategory) => {
    setEditingSubcategory(subcategory)
    setSubcategoryForm({
      category_id: subcategory.category_id,
      name: subcategory.name,
      slug: subcategory.slug,
      image: subcategory.image || '',
      position: subcategory.position
    })
    setIsSubcategoryDialogOpen(true)
  }

  const handleDeleteCategory = async (id: string) => {
    try {
      await categoryService.deleteCategory(id)
      toast({ title: "Category Deleted", description: "Category has been deleted successfully." })
      loadCategories()
      loadSubcategories()
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete category.", variant: "destructive" })
    }
  }

  const handleDeleteSubcategory = async (id: string) => {
    try {
      await categoryService.deleteSubcategory(id)
      toast({ title: "Subcategory Deleted", description: "Subcategory has been deleted successfully." })
      loadSubcategories()
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete subcategory.", variant: "destructive" })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <AdminNavbar />
      <main className="p-4 md:p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2">
              Categories Management
            </h1>
            <p className="text-gray-600">Manage product categories and subcategories</p>
          </div>
          <div className="flex space-x-3">
            <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Category
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingCategory ? 'Edit Category' : 'Add New Category'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="category-name">Category Name</Label>
                    <Input
                      id="category-name"
                      value={categoryForm.name}
                      onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                      placeholder="Enter category name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category-image">Image URL</Label>
                    <Input
                      id="category-image"
                      value={categoryForm.image}
                      onChange={(e) => setCategoryForm({ ...categoryForm, image: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category-position">Position</Label>
                    <Input
                      id="category-position"
                      type="number"
                      value={categoryForm.position}
                      onChange={(e) => setCategoryForm({ ...categoryForm, position: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsCategoryDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveCategory} disabled={loading}>
                      {loading ? 'Saving...' : 'Save'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isSubcategoryDialogOpen} onOpenChange={setIsSubcategoryDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <FolderPlus className="w-4 h-4 mr-2" />
                  Add Subcategory
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingSubcategory ? 'Edit Subcategory' : 'Add New Subcategory'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="subcategory-category">Parent Category</Label>
                    <select
                      id="subcategory-category"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={subcategoryForm.category_id}
                      onChange={(e) => setSubcategoryForm({ ...subcategoryForm, category_id: e.target.value })}
                    >
                      <option value="">Select category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subcategory-name">Subcategory Name</Label>
                    <Input
                      id="subcategory-name"
                      value={subcategoryForm.name}
                      onChange={(e) => setSubcategoryForm({ ...subcategoryForm, name: e.target.value })}
                      placeholder="Enter subcategory name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subcategory-image">Image URL</Label>
                    <Input
                      id="subcategory-image"
                      value={subcategoryForm.image}
                      onChange={(e) => setSubcategoryForm({ ...subcategoryForm, image: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subcategory-position">Position</Label>
                    <Input
                      id="subcategory-position"
                      type="number"
                      value={subcategoryForm.position}
                      onChange={(e) => setSubcategoryForm({ ...subcategoryForm, position: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsSubcategoryDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveSubcategory} disabled={loading}>
                      {loading ? 'Saving...' : 'Save'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Categories Table */}
        <Card className="mb-8">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Categories</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden">
                        {category.image && (
                          <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell className="text-gray-500">{category.slug}</TableCell>
                    <TableCell>{category.position}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEditCategory(category)}>
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
                              <AlertDialogTitle>Delete Category</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{category.name}"? This will also delete all subcategories and products in this category.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteCategory(category.id)} className="bg-red-600 hover:bg-red-700">
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
        </Card>

        {/* Subcategories Table */}
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Subcategories</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Parent Category</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subcategories.map((subcategory) => {
                  const parentCategory = categories.find(c => c.id === subcategory.category_id)
                  return (
                    <TableRow key={subcategory.id}>
                      <TableCell>
                        <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden">
                          {subcategory.image && (
                            <img src={subcategory.image} alt={subcategory.name} className="w-full h-full object-cover" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{subcategory.name}</TableCell>
                      <TableCell>{parentCategory?.name || 'Unknown'}</TableCell>
                      <TableCell className="text-gray-500">{subcategory.slug}</TableCell>
                      <TableCell>{subcategory.position}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEditSubcategory(subcategory)}>
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
                                <AlertDialogTitle>Delete Subcategory</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{subcategory.name}"? This will also delete all products in this subcategory.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteSubcategory(subcategory.id)} className="bg-red-600 hover:bg-red-700">
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </Card>
      </main>
    </div>
  )
}