
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, TrendingUp, TrendingDown } from "lucide-react";

interface Transaction {
  id: number;
  amount: number;
  category_id: number;
  description: string;
  date: string;
  created_at: string;
  type: 'expense' | 'income';
}

interface Category {
  id: number;
  name: string;
  color: string;
}

interface TransactionListProps {
  transactions: Transaction[];
  categories: Category[];
  onDeleteTransaction: (id: number) => void;
  onEditTransaction?: (transaction: Transaction) => void;
}

const TransactionList = ({ transactions, categories, onDeleteTransaction, onEditTransaction }: TransactionListProps) => {
  const getCategoryInfo = (categoryId: number) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category || { name: "Unknown", color: "#9CA3AF" };
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
  };

  // Sort transactions by date (newest first)
  const sortedTransactions = [...transactions].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  if (transactions.length === 0) {
    return (
      <Card className="text-center py-8">
        <CardContent>
          <p className="text-gray-500">No transactions found</p>
          <p className="text-sm text-gray-400">Add your first transaction to get started</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {sortedTransactions.map((transaction) => {
        const categoryInfo = getCategoryInfo(transaction.category_id);
        return (
          <Card key={transaction.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1">
                  <div className="flex items-center">
                    {transaction.type === 'income' ? (
                      <TrendingUp className="w-4 h-4 text-green-500 mr-2" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-500 mr-2" />
                    )}
                    <div 
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: categoryInfo.color }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={`font-medium ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount.toFixed(2)}
                      </span>
                      <span className="text-sm text-gray-500">{formatDate(transaction.date)}</span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm text-gray-600">{categoryInfo.name}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        transaction.type === 'income' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {transaction.type}
                      </span>
                    </div>
                    {transaction.description && (
                      <p className="text-sm text-gray-500 mt-1 truncate">{transaction.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex space-x-1 ml-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="p-2"
                    onClick={() => onEditTransaction?.(transaction)}
                  >
                    <Edit className="w-4 h-4 text-gray-400" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="p-2"
                    onClick={() => onDeleteTransaction(transaction.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default TransactionList;
