
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";

interface Expense {
  id: number;
  amount: number;
  category: string;
  note: string;
  date: string;
  created_at: string;
}

interface Category {
  id: number;
  name: string;
  color: string;
}

interface ExpenseListProps {
  expenses: Expense[];
  categories: Category[];
  onDeleteExpense: (id: number) => void;
}

const ExpenseList = ({ expenses, categories, onDeleteExpense }: ExpenseListProps) => {
  const getCategoryColor = (categoryName: string) => {
    const category = categories.find(cat => cat.name === categoryName);
    return category?.color || "#9CA3AF";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
  };

  if (expenses.length === 0) {
    return (
      <Card className="text-center py-8">
        <CardContent>
          <p className="text-gray-500">No expenses found</p>
          <p className="text-sm text-gray-400">Add your first expense to get started</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {expenses.map((expense) => (
        <Card key={expense.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1">
                <div 
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: getCategoryColor(expense.category) }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">${expense.amount.toFixed(2)}</span>
                    <span className="text-sm text-gray-500">{formatDate(expense.date)}</span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm text-gray-600">{expense.category}</span>
                  </div>
                  {expense.note && (
                    <p className="text-sm text-gray-500 mt-1 truncate">{expense.note}</p>
                  )}
                </div>
              </div>
              <div className="flex space-x-1 ml-2">
                <Button variant="ghost" size="sm" className="p-2">
                  <Edit className="w-4 h-4 text-gray-400" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="p-2"
                  onClick={() => onDeleteExpense(expense.id)}
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ExpenseList;
