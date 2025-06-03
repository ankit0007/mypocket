
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Plus, Trash2, Edit2, Save, XIcon } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Category {
  id: number;
  name: string;
  color: string;
  created_at: string;
}

interface CategoryManagerProps {
  categories: Category[];
  onClose: () => void;
  onCategoriesUpdate: (categories: Category[]) => void;
}

const CategoryManager = ({ categories, onClose, onCategoriesUpdate }: CategoryManagerProps) => {
  const [formData, setFormData] = useState({
    name: "",
    color: "#9CA3AF",
  });
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    color: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Category name is required.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('categories')
        .insert({
          name: formData.name.trim(),
          color: formData.color,
        })
        .select();

      if (error) throw error;
      
      toast({
        title: "Category Added",
        description: `Category "${formData.name}" has been created.`,
      });

      setFormData({ name: "", color: "#9CA3AF" });
    } catch (error: any) {
      console.error('Error adding category:', error);
      toast({
        title: "Error",
        description: "Failed to add category.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCategory = async (id: number) => {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Category Deleted",
        description: "The category has been removed.",
      });
    } catch (error: any) {
      console.error('Error deleting category:', error);
      toast({
        title: "Error",
        description: "Failed to delete category.",
        variant: "destructive",
      });
    }
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setEditFormData({
      name: category.name,
      color: category.color,
    });
  };

  const handleSaveEdit = async () => {
    if (!editFormData.name.trim() || !editingCategory) {
      toast({
        title: "Error",
        description: "Category name is required.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('categories')
        .update({
          name: editFormData.name.trim(),
          color: editFormData.color,
        })
        .eq('id', editingCategory.id);

      if (error) throw error;
      
      toast({
        title: "Category Updated",
        description: `Category "${editFormData.name}" has been updated.`,
      });

      setEditingCategory(null);
      setEditFormData({ name: "", color: "" });
    } catch (error: any) {
      console.error('Error updating category:', error);
      toast({
        title: "Error",
        description: "Failed to update category.",
        variant: "destructive",
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setEditFormData({ name: "", color: "" });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 z-50">
      <Card className="w-full max-w-xs mx-auto max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base">Manage Categories</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add New Category Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="name" className="text-sm">Category Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter category name"
                required
                className="text-sm"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="color" className="text-sm">Color</Label>
              <div className="flex gap-2 items-center">
                <Input
                  id="color"
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  className="w-12 h-8 flex-shrink-0"
                />
                <span className="text-xs text-gray-600 flex-1 truncate">{formData.color}</span>
              </div>
            </div>

            <Button type="submit" className="w-full text-xs" size="sm">
              <Plus className="w-3 h-3 mr-2" />
              Add Category
            </Button>
          </form>

          {/* Existing Categories */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-900">Existing Categories</h3>
            {categories.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-4">
                No categories yet. Add your first category above.
              </p>
            ) : (
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {categories.map((category) => (
                  <div key={category.id} className="p-2 border rounded-lg">
                    {editingCategory?.id === category.id ? (
                      // Edit Form
                      <div className="space-y-2">
                        <Input
                          value={editFormData.name}
                          onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                          className="text-sm"
                          placeholder="Category name"
                        />
                        <div className="flex gap-2 items-center">
                          <Input
                            type="color"
                            value={editFormData.color}
                            onChange={(e) => setEditFormData(prev => ({ ...prev, color: e.target.value }))}
                            className="w-12 h-8 flex-shrink-0"
                          />
                          <div className="flex gap-1 flex-1">
                            <Button
                              size="sm"
                              onClick={handleSaveEdit}
                              className="flex-1 h-8 text-xs"
                            >
                              <Save className="w-3 h-3 mr-1" />
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleCancelEdit}
                              className="flex-1 h-8 text-xs"
                            >
                              <XIcon className="w-3 h-3 mr-1" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      // Display Mode
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                          <div 
                            className="w-3 h-3 rounded-full flex-shrink-0" 
                            style={{ backgroundColor: category.color }}
                          />
                          <span className="text-sm font-medium truncate">{category.name}</span>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditCategory(category)}
                            className="text-blue-500 hover:text-blue-700 h-6 w-6 p-0"
                          >
                            <Edit2 className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteCategory(category.id)}
                            className="text-red-500 hover:text-red-700 h-6 w-6 p-0"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CategoryManager;
