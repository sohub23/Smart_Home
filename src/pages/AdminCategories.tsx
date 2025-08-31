import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Plus, Trash2, Upload } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'
import AdminNavbar from '@/components/AdminNavbar'
import { useSupabase, categoryService, storageService, type CategoryImage } from '@/supabase'

const AdminCategories = () => {
  const { loading, executeQuery } = useSupabase()
  const [categoryImages, setCategoryImages] = useState<CategoryImage[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('Smart Switch')
  const [imageUrl, setImageUrl] = useState('')
  const [imageTitle, setImageTitle] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState('')

  const categories = ['Smart Switch', 'Smart Curtain', 'Security', 'PDLC Film']

  useEffect(() => {
    loadCategoryImages()
  }, [])

  const loadCategoryImages = async () => {
    try {
      const data = await executeQuery(() => categoryService.getCategoryImages())
      setCategoryImages(data || [])
    } catch (err) {
      console.error('Failed to load category images:', err)
      toast({
        title: "Database Error",
        description: "Failed to load category images. Please create the category_images table.",
        variant: "destructive"
      })
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = () => setImagePreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleAdd = async () => {
    try {
      let finalImageUrl = imageUrl

      if (imageFile) {
        try {
          finalImageUrl = await executeQuery(() => storageService.uploadProductImage(imageFile))
        } catch (uploadError) {
          console.error('Image upload failed:', uploadError)
          toast({
            title: "Upload Failed",
            description: "Image upload failed. Please try with a URL instead.",
            variant: "destructive"
          })
          return
        }
      }

      if (!finalImageUrl) {
        toast({
          title: "Error",
          description: "Please provide an image URL or upload a file.",
          variant: "destructive"
        })
        return
      }

      const imageData = {
        category: selectedCategory,
        image_url: finalImageUrl,
        title: imageTitle || undefined,
        is_active: true
      }
      console.log('Attempting to add category image:', imageData)
      await executeQuery(() => categoryService.addCategoryImage(imageData))

      toast({
        title: "Image Added",
        description: `Category image added successfully.`,
      })

      setIsAddDialogOpen(false)
      setImageUrl('')
      setImageTitle('')
      setImageFile(null)
      setImagePreview('')
      loadCategoryImages()
    } catch (err) {
      console.error('Add category image error:', err)
      toast({
        title: "Database Error",
        description: `Failed to add category image: ${err instanceof Error ? err.message : 'Unknown error'}. Please create the category_images table first.`,
        variant: "destructive"
      })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await executeQuery(() => categoryService.deleteCategoryImage(id))
      toast({
        title: "Image Deleted",
        description: "Category image deleted successfully.",
      })
      loadCategoryImages()
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete category image.",
        variant: "destructive"
      })
    }
  }

  const getImagesByCategory = (category: string) => {
    return categoryImages.filter(img => img.category === category)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />
      <main className="p-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Products & Categories</h1>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Add Category Image</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add Category Image</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <select 
                    id="category" 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Title (Optional)</Label>
                  <Input 
                    id="title" 
                    placeholder="Image title" 
                    value={imageTitle}
                    onChange={(e) => setImageTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="url">Image URL</Label>
                  <Input 
                    id="url" 
                    placeholder="https://example.com/image.jpg" 
                    value={imageUrl}
                    onChange={(e) => {
                      setImageUrl(e.target.value)
                      setImagePreview(e.target.value)
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="file">Or Upload File</Label>
                  <Input 
                    id="file" 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </div>
                {imagePreview && (
                  <div className="mt-2">
                    <img src={imagePreview} alt="Preview" className="w-20 h-20 object-cover rounded" />
                  </div>
                )}
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAdd} disabled={loading}>
                  {loading ? 'Adding...' : 'Add Image'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="w-full">
          <div className="flex border-b mb-6">
            <button 
              className="px-4 py-2 text-gray-500 hover:text-gray-700"
              onClick={() => {
                // Safe navigation using React Router or direct assignment
                window.location.href = '/admin/products';
              }}
            >
              All Products
            </button>
            <button 
              className="px-4 py-2 border-b-2 border-blue-500 text-blue-600 font-medium"
              onClick={() => {}}
            >
              Product Categories
            </button>
          </div>
          
          <div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map(category => (
            <Card key={category} className="p-4">
              <h3 className="text-lg font-semibold mb-4">{category}</h3>
              <div className="grid grid-cols-2 gap-2">
                {getImagesByCategory(category).map(image => (
                  <div key={image.id} className="relative group">
                    <img 
                      src={image.image_url} 
                      alt={image.title || category}
                      className="w-full h-20 object-cover rounded"
                    />
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 h-6 w-6"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Image</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this category image?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(image.id)} className="bg-red-600 hover:bg-red-700">
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {getImagesByCategory(category).length} images
              </p>
            </Card>
          ))}
        </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default AdminCategories