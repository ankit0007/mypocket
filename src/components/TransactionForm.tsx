
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Plus, Minus, IndianRupee } from "lucide-react";

interface Category {
  id: number;
  name: string;
  color: string;
}

interface Transaction {
  id: number;
  amount: number;
  category_id: number;
  description: string;
  date: string;
  created_at: string;
  type: 'expense' | 'income';
}

interface TransactionFormProps {
  categories: Category[];
  transactionType: 'expense' | 'income';
  onSubmit: (transaction: any) => void;
  onClose: () => void;
  editTransaction?: Transaction | null;
}

const TransactionForm = ({ categories, transactionType, onSubmit, onClose, editTransaction }: TransactionFormProps) => {
  const [formData, setFormData] = useState({
    amount: "",
    category_id: "",
    description: "",
    date: new Date().toISOString().split('T')[0],
    type: transactionType,
  });

  // Load existing transaction data when editing
  useEffect(() => {
    if (editTransaction) {
      setFormData({
        amount: editTransaction.amount.toString(),
        category_id: editTransaction.category_id.toString(),
        description: editTransaction.description || "",
        date: editTransaction.date,
        type: editTransaction.type,
      });
    }
  }, [editTransaction]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.category_id) {
      return;
    }
    
    const transactionData = {
      amount: parseFloat(formData.amount),
      category_id: parseInt(formData.category_id),
      description: formData.description,
      date: formData.date,
      type: formData.type,
    };

    if (editTransaction) {
      onSubmit({ ...transactionData, id: editTransaction.id });
    } else {
      onSubmit(transactionData);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const selectedCategory = categories.find(cat => cat.id.toString() === formData.category_id);
  const isEditing = !!editTransaction;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg flex items-center">
            {formData.type === 'expense' ? (
              <>
                <Minus className="w-5 h-5 mr-2 text-red-500" />
                {isEditing ? 'Edit Expense' : 'Add New Expense'}
              </>
            ) : (
              <>
                <Plus className="w-5 h-5 mr-2 text-green-500" />
                {isEditing ? 'Edit Income' : 'Add New Income'}
              </>
            )}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => handleInputChange("amount", e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              {categories.length === 0 ? (
                <div className="p-3 border border-dashed border-gray-300 rounded-lg text-center text-sm text-gray-500">
                  No categories available. Please add a category first.
                </div>
              ) : (
                <Select
                  value={formData.category_id}
                  onValueChange={(value) => handleInputChange("category_id", value)}
                  required
                >
                  <SelectTrigger className="w-full">
                    <div className="flex items-center gap-2">
                      {selectedCategory && (
                        <div 
                          className="w-3 h-3 rounded-full flex-shrink-0" 
                          style={{ backgroundColor: selectedCategory.color }}
                        />
                      )}
                      <SelectValue placeholder="Select a category" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: category.color }}
                          />
                          {category.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Input
                id="description"
                placeholder="Add a description..."
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange("date", e.target.value)}
                required
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button 
                type="submit" 
                className={`flex-1 ${
                  formData.type === 'expense' 
                    ? 'bg-red-500 hover:bg-red-600' 
                    : 'bg-green-500 hover:bg-green-600'
                }`}
                disabled={!formData.amount || !formData.category_id || categories.length === 0}
              >
                {isEditing ? 'Update' : 'Add'} {formData.type === 'expense' ? 'Expense' : 'Income'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionForm;
