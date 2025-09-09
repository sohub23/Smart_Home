import { useState, useEffect, memo, useCallback, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Edit, Trash2, Layers, Image, ArrowUpDown, Upload, X } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import AdminNavbar from '@/components/AdminNavbar';
import { supabase } from '@/supabase';


const AdminCategoriesEnhanced = memo(() => {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingSubcategory, setEditingSubcategory] = useState(null);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isSubcategoryDialogOpen, setIsSubcategoryDialogOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    image_url: '',
    position: 1
  });

  const [subcategoryForm, setSubcategoryForm] = useState({
    category_id: '',
    name: '',
    description: '',
    image_url: '',
    position: 1
  });

  const [dragActive, setDragActive] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = useCallback(async () => {
    try {
      const [categoriesResult, subcategoriesResult] = await Promise.all([
        supabase.from('product_categories').select('id, name, image_url, position').eq('is_active', true).order('name'),
        supabase.from('product_subcategories').select('id, name, category_id, image_url, position').eq('is_active', true).order('name')
      ]);
      
      setCategories(categoriesResult.data || []);
      setSubcategories(subcategoriesResult.data || []);
    } catch (error) {
      toast({ title: "Error", description: "Failed to load data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCreateCategory = async () => {
    if (!categoryForm.name.trim()) {
      toast({ title: "Error", description: "Category name is required", variant: "destructive" });
      return;
    }

    try {
      if (editingCategory) {
        const { error } = await supabase
          .from('product_categories')
          .update({
            name: categoryForm.name,
            image_url: categoryForm.image_url || null,
            position: categoryForm.position
          })
          .eq('id', editingCategory.id);
          
        if (error) throw error;
        toast({ title: "Success", description: "Category updated successfully" });
      } else {
        const { error } = await supabase
          .from('product_categories')
          .insert([{
            name: categoryForm.name,
            image_url: categoryForm.image_url || null,
            position: categoryForm.position || categories.length + 1,
            is_active: true
          }]);
          
        if (error) throw error;
        toast({ title: "Success", description: "Category created successfully" });
      }
      
      setIsCategoryDialogOpen(false);
      setCategoryForm({ name: '', description: '', image_url: '', position: 1 });
      setEditingCategory(null);
      loadData();
    } catch (error) {
      toast({ title: "Error", description: "Failed to save category", variant: "destructive" });
    }
  };

  const handleCreateSubcategory = async () => {
    if (!subcategoryForm.category_id || !subcategoryForm.name.trim()) {
      toast({ title: "Error", description: "Parent category and subcategory name are required", variant: "destructive" });
      return;
    }

    try {
      if (editingSubcategory) {
        const { error } = await supabase
          .from('product_subcategories')
          .update({
            category_id: subcategoryForm.category_id,
            name: subcategoryForm.name,
            image_url: subcategoryForm.image_url || null,
            position: subcategoryForm.position
          })
          .eq('id', editingSubcategory.id);
          
        if (error) throw error;
        toast({ title: "Success", description: "Subcategory updated successfully" });
      } else {
        const { error } = await supabase
          .from('product_subcategories')
          .insert([{
            category_id: subcategoryForm.category_id,
            name: subcategoryForm.name,
            image_url: subcategoryForm.image_url || null,
            position: subcategoryForm.position || subcategories.filter(sub => sub.category_id === subcategoryForm.category_id).length + 1,
            is_active: true
          }]);
          
        if (error) throw error;
        toast({ title: "Success", description: "Subcategory created successfully" });
      }
      
      setIsSubcategoryDialogOpen(false);
      resetSubcategoryForm();
      loadData();
    } catch (error) {
      toast({ title: "Error", description: "Failed to save subcategory", variant: "destructive" });
    }
  };

  const getSubcategoriesForCategory = useCallback((categoryId) => {
    return subcategories.filter(sub => sub.category_id === categoryId);
  }, [subcategories]);

  const memoizedCategories = useMemo(() => categories.slice(0, 10), [categories]);

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      description: category.description || '',
      image_url: category.image_url || '',
      position: category.position
    });
    setIsCategoryDialogOpen(true);
  };

  const handleEditSubcategory = (subcategory) => {
    setEditingSubcategory(subcategory);
    setSubcategoryForm({
      category_id: subcategory.category_id,
      name: subcategory.name,
      description: subcategory.description || '',
      image_url: subcategory.image_url || '',
      position: subcategory.position
    });
    setUploadedImage(subcategory.image_url || null);
    setIsSubcategoryDialogOpen(true);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files[0]);
    }
  };

  const handleImageUpload = (file) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target.result;
        setUploadedImage(imageUrl);
        setSubcategoryForm({...subcategoryForm, image_url: imageUrl});
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setUploadedImage(null);
    setSubcategoryForm({...subcategoryForm, image_url: ''});
  };

  const resetSubcategoryForm = () => {
    setSubcategoryForm({ category_id: '', name: '', description: '', image_url: '', position: 1 });
    setEditingSubcategory(null);
    setUploadedImage(null);
  };

  const handleDeleteCategory = async (id) => {
    try {
      const { error } = await supabase.from('product_categories').delete().eq('id', id);
      if (error) throw error;
      toast({ title: "Success", description: "Category deleted successfully" });
      loadData();
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete category", variant: "destructive" });
    }
  };

  const handleDeleteSubcategory = async (id) => {
    try {
      const { error } = await supabase.from('product_subcategories').delete().eq('id', id);
      if (error) throw error;
      toast({ title: "Success", description: "Subcategory deleted successfully" });
      loadData();
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete subcategory", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <AdminNavbar />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <AdminNavbar />
      <main className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2">
              Category Management
            </h1>
            <p className="text-gray-600">Manage product categories and subcategories</p>
          </div>
          <div className="flex space-x-3">
            <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Add Category</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingCategory ? 'Edit Category' : 'Create New Category'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label>Category Name *</Label>
                    <Input
                      value={categoryForm.name}
                      onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                      placeholder="Enter category name"
                      required
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={categoryForm.description}
                      onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})}
                      placeholder="Category description"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label>Image URL</Label>
                    <Input
                      value={categoryForm.image_url}
                      onChange={(e) => setCategoryForm({...categoryForm, image_url: e.target.value})}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  <div>
                    <Label>Position</Label>
                    <Input
                      type="number"
                      value={categoryForm.position}
                      onChange={(e) => setCategoryForm({...categoryForm, position: parseInt(e.target.value)})}
                      min="1"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsCategoryDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateCategory}>
                    {editingCategory ? 'Update Category' : 'Create Category'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isSubcategoryDialogOpen} onOpenChange={setIsSubcategoryDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center space-x-2">
                  <Layers className="w-4 h-4" />
                  <span>Add Subcategory</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingSubcategory ? 'Edit Subcategory' : 'Create New Subcategory'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label>Parent Category *</Label>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={subcategoryForm.category_id}
                      onChange={(e) => setSubcategoryForm({...subcategoryForm, category_id: e.target.value})}
                      required
                    >
                      <option value="">Select parent category</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label>Subcategory Name *</Label>
                    <Input
                      value={subcategoryForm.name}
                      onChange={(e) => setSubcategoryForm({...subcategoryForm, name: e.target.value})}
                      placeholder="Enter subcategory name"
                      required
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={subcategoryForm.description}
                      onChange={(e) => setSubcategoryForm({...subcategoryForm, description: e.target.value})}
                      placeholder="Subcategory description"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label>Category Image</Label>
                    <div className="mt-2">
                      {uploadedImage ? (
                        <div className="relative">
                          <div className="w-full h-32 bg-gray-100 rounded-lg overflow-hidden border-2 border-dashed border-gray-300">
                            <img 
                              src={uploadedImage} 
                              alt="Preview" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={removeImage}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div
                          className={`w-full h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors ${
                            dragActive 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                          }`}
                          onDragEnter={handleDrag}
                          onDragLeave={handleDrag}
                          onDragOver={handleDrag}
                          onDrop={handleDrop}
                          onClick={() => document.getElementById('subcategory-image-input').click()}
                        >
                          <Upload className={`w-8 h-8 mb-2 ${
                            dragActive ? 'text-blue-500' : 'text-gray-400'
                          }`} />
                          <p className={`text-sm ${
                            dragActive ? 'text-blue-600' : 'text-gray-500'
                          }`}>
                            {dragActive ? 'Drop image here' : 'Drag & drop image or click to browse'}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF up to 10MB</p>
                        </div>
                      )}
                      <input
                        id="subcategory-image-input"
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files[0] && handleImageUpload(e.target.files[0])}
                        className="hidden"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Position</Label>
                    <Input
                      type="number"
                      value={subcategoryForm.position}
                      onChange={(e) => setSubcategoryForm({...subcategoryForm, position: parseInt(e.target.value)})}
                      min="1"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => {
                    setIsSubcategoryDialogOpen(false);
                    resetSubcategoryForm();
                  }}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateSubcategory}>
                    {editingSubcategory ? 'Update Subcategory' : 'Create Subcategory'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="space-y-8">
          {memoizedCategories.map(category => {
            const categorySubcategories = getSubcategoriesForCategory(category.id);
            
            return (
              <Card key={category.id} className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    {category.image_url && (
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                        <img
                          src={category.image_url}
                          alt={category.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center space-x-3">
                        <h2 className="text-2xl font-bold text-gray-900">{category.name}</h2>
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
                          #{category.position}
                        </span>
                      </div>
                      {category.description && (
                        <p className="text-gray-600 mt-1">{category.description}</p>
                      )}
                      <p className="text-sm text-gray-500 mt-1">
                        {categorySubcategories.length} subcategories
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" onClick={() => handleEditCategory(category)}>
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50">
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Category</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{category.name}"? This action cannot be undone and will also delete all subcategories and products in this category.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDeleteCategory(category.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete Category
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    <Button size="sm" variant="outline">
                      <ArrowUpDown className="w-4 h-4 mr-1" />
                      Reorder
                    </Button>
                  </div>
                </div>

                {/* Subcategories */}
                {categorySubcategories.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <Layers className="w-5 h-5 mr-2" />
                      Subcategories
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {categorySubcategories.map(subcategory => (
                        <Card key={subcategory.id} className="p-4 bg-gray-50 border-gray-200">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-3 flex-1">
                              {subcategory.image_url && (
                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-white">
                                  <img
                                    src={subcategory.image_url}
                                    alt={subcategory.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              )}
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <h4 className="font-semibold text-gray-900">{subcategory.name}</h4>
                                  <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded text-xs">
                                    #{subcategory.position}
                                  </span>
                                </div>
                                {subcategory.description && (
                                  <p className="text-sm text-gray-600 mt-1">{subcategory.description}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex space-x-1">
                              <Button size="sm" variant="ghost" onClick={() => handleEditSubcategory(subcategory)}>
                                <Edit className="w-3 h-3" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50">
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Subcategory</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete "{subcategory.name}"? This action cannot be undone and will also delete all products in this subcategory.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => handleDeleteSubcategory(subcategory.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Delete Subcategory
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {categorySubcategories.length === 0 && (
                  <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                    <Layers className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 mb-3">No subcategories yet</p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSubcategoryForm({...subcategoryForm, category_id: category.id});
                        setIsSubcategoryDialogOpen(true);
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Subcategory
                    </Button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {categories.length === 0 && (
          <Card className="p-12 text-center">
            <Image className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No categories yet</h3>
            <p className="text-gray-600 mb-4">Start by creating your first product category</p>
            <Button onClick={() => setIsCategoryDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Category
            </Button>
          </Card>
        )}
      </main>
    </div>
  );
});

export default AdminCategoriesEnhanced;