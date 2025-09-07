import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, FolderPlus } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import AdminNavbar from '@/components/AdminNavbar';

const AdminCategoriesSimple = () => {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isSubcategoryDialogOpen, setIsSubcategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingSubcategory, setEditingSubcategory] = useState(null);

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    image_url: '',
    position: 1
  });

  const [subcategoryForm, setSubcategoryForm] = useState({
    category_id: '',
    name: '',
    image_url: '',
    position: 1
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { supabase } = await import('@/supabase/client');
      
      // Load categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('product_categories')
        .select('*')
        .eq('is_active', true)
        .order('position');

      if (categoriesError) throw categoriesError;

      // Load subcategories
      const { data: subcategoriesData, error: subcategoriesError } = await supabase
        .from('product_subcategories')
        .select('*')
        .eq('is_active', true)
        .order('position');

      if (subcategoriesError) throw subcategoriesError;

      setCategories(categoriesData || []);
      setSubcategories(subcategoriesData || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load categories",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
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
      image_url: subcategory.image_url || '',
      position: subcategory.position
    });
    setIsSubcategoryDialogOpen(true);
  };

  const resetCategoryForm = () => {
    setCategoryForm({ name: '', image_url: '', position: 1 });
    setEditingCategory(null);
  };

  const resetSubcategoryForm = () => {
    setSubcategoryForm({ category_id: '', name: '', image_url: '', position: 1 });
    setEditingSubcategory(null);
  };

  const handleCreateCategory = async () => {
    if (!categoryForm.name) {
      toast({
        title: "Error",
        description: "Category name is required",
        variant: "destructive"
      });
      return;
    }

    try {
      const { supabase } = await import('@/supabase/client');
      
      if (editingCategory) {
        // Update existing category
        const { data, error } = await supabase
          .from('product_categories')
          .update({
            name: categoryForm.name,
            image_url: categoryForm.image_url || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingCategory.id)
          .select()
          .single();

        if (error) throw error;

        setCategories(categories.map(cat => cat.id === editingCategory.id ? data : cat));
        toast({
          title: "Success",
          description: "Category updated successfully"
        });
      } else {
        // Create new category
        const { data, error } = await supabase
          .from('product_categories')
          .insert([{
            name: categoryForm.name,
            image_url: categoryForm.image_url || null,
            position: categories.length + 1,
            is_active: true
          }])
          .select()
          .single();

        if (error) throw error;

        setCategories([...categories, data]);
        toast({
          title: "Success",
          description: "Category created successfully"
        });
      }

      setIsCategoryDialogOpen(false);
      resetCategoryForm();
    } catch (error) {
      console.error('Error creating category:', error);
      toast({
        title: "Error",
        description: "Failed to create category",
        variant: "destructive"
      });
    }
  };

  const handleCreateSubcategory = async () => {
    if (!subcategoryForm.name || !subcategoryForm.category_id) {
      toast({
        title: "Error",
        description: "Subcategory name and parent category are required",
        variant: "destructive"
      });
      return;
    }

    try {
      const { supabase } = await import('@/supabase/client');
      
      if (editingSubcategory) {
        // Update existing subcategory
        const { data, error } = await supabase
          .from('product_subcategories')
          .update({
            category_id: subcategoryForm.category_id,
            name: subcategoryForm.name,
            image_url: subcategoryForm.image_url || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingSubcategory.id)
          .select()
          .single();

        if (error) throw error;

        setSubcategories(subcategories.map(sub => sub.id === editingSubcategory.id ? data : sub));
        toast({
          title: "Success",
          description: "Subcategory updated successfully"
        });
      } else {
        // Create new subcategory
        const { data, error } = await supabase
          .from('product_subcategories')
          .insert([{
            category_id: subcategoryForm.category_id,
            name: subcategoryForm.name,
            image_url: subcategoryForm.image_url || null,
            position: subcategories.filter(sub => sub.category_id === subcategoryForm.category_id).length + 1,
            is_active: true
          }])
          .select()
          .single();

        if (error) throw error;

        setSubcategories([...subcategories, data]);
        toast({
          title: "Success",
          description: "Subcategory created successfully"
        });
      }

      setIsSubcategoryDialogOpen(false);
      resetSubcategoryForm();
    } catch (error) {
      console.error('Error creating subcategory:', error);
      toast({
        title: "Error",
        description: `Failed to create subcategory: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!confirm('Are you sure you want to delete this category? This will also delete all subcategories.')) return;
    
    try {
      const { supabase } = await import('@/supabase/client');
      
      const { error } = await supabase
        .from('product_categories')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setCategories(categories.filter(cat => cat.id !== id));
      // Also remove subcategories of this category
      setSubcategories(subcategories.filter(sub => sub.category_id !== id));
      toast({
        title: "Success",
        description: "Category deleted successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive"
      });
    }
  };

  const handleDeleteSubcategory = async (id) => {
    if (!confirm('Are you sure you want to delete this subcategory?')) return;
    
    try {
      const { supabase } = await import('@/supabase/client');
      
      const { error } = await supabase
        .from('product_subcategories')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setSubcategories(subcategories.filter(sub => sub.id !== id));
      toast({
        title: "Success",
        description: "Subcategory deleted successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete subcategory",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminNavbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading categories...</p>
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
              Category Management
            </h1>
            <p className="text-gray-600">Manage product categories and subcategories</p>
          </div>
          <div className="flex space-x-3">
            <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Category
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingCategory ? 'Edit Category' : 'Add New Category'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label>Category Name *</Label>
                    <Input
                      value={categoryForm.name}
                      onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                      placeholder="e.g., Smart Lights"
                    />
                  </div>
                  <div>
                    <Label>Image URL</Label>
                    <Input
                      value={categoryForm.image_url}
                      onChange={(e) => setCategoryForm({ ...categoryForm, image_url: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button variant="outline" onClick={() => {
                      setIsCategoryDialogOpen(false);
                      resetCategoryForm();
                    }}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateCategory} className="bg-blue-600 hover:bg-blue-700">
                      {editingCategory ? 'Update Category' : 'Create Category'}
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
                <div className="space-y-4 py-4">
                  <div>
                    <Label>Parent Category *</Label>
                    <select
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
                  <div>
                    <Label>Subcategory Name *</Label>
                    <Input
                      value={subcategoryForm.name}
                      onChange={(e) => setSubcategoryForm({ ...subcategoryForm, name: e.target.value })}
                      placeholder="e.g., LED Bulbs"
                    />
                  </div>
                  <div>
                    <Label>Image URL</Label>
                    <Input
                      value={subcategoryForm.image_url}
                      onChange={(e) => setSubcategoryForm({ ...subcategoryForm, image_url: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button variant="outline" onClick={() => {
                      setIsSubcategoryDialogOpen(false);
                      resetSubcategoryForm();
                    }}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateSubcategory} className="bg-blue-600 hover:bg-blue-700">
                      {editingSubcategory ? 'Update Subcategory' : 'Create Subcategory'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Categories */}
        <Card className="mb-8">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Categories ({categories.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => (
                <Card key={category.id} className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold">{category.name}</h3>
                      <p className="text-sm text-gray-500">Position: {category.position}</p>
                    </div>
                    <div className="flex space-x-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEditCategory(category)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDeleteCategory(category.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  {category.image_url && (
                    <div className="w-full h-24 bg-gray-100 rounded overflow-hidden">
                      <img 
                        src={category.image_url} 
                        alt={category.name} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        </Card>

        {/* Subcategories */}
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Subcategories ({subcategories.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subcategories.map((subcategory) => {
                const parentCategory = categories.find(c => c.id === subcategory.category_id);
                return (
                  <Card key={subcategory.id} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">{subcategory.name}</h3>
                        <p className="text-sm text-gray-500">
                          Parent: {parentCategory?.name || 'Unknown'}
                        </p>
                        <p className="text-sm text-gray-500">Position: {subcategory.position}</p>
                      </div>
                      <div className="flex space-x-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditSubcategory(subcategory)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDeleteSubcategory(subcategory.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    {subcategory.image_url && (
                      <div className="w-full h-24 bg-gray-100 rounded overflow-hidden">
                        <img 
                          src={subcategory.image_url} 
                          alt={subcategory.name} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default AdminCategoriesSimple;