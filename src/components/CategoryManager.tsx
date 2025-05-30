import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Plus, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Category {
  id: number;
  name: string;
  color: string;
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md mx-auto max-h-[80vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg">Manage Categories</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add New Category Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Category Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter category name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <div className="flex gap-2 items-center">
                <Input
                  id="color"
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  className="w-16 h-10"
                />
                <span className="text-sm text-gray-600">{formData.color}</span>
              </div>
            </div>

            <Button type="submit" className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
          </form>

          {/* Existing Categories */}
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900">Existing Categories</h3>
            {categories.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                No categories yet. Add your first category above.
              </p>
            ) : (
              <div className="space-y-2">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="font-medium">{category.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteCategory(category.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
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
