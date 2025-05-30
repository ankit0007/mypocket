
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, TrendingUp, Download, Filter, Settings, Minus } from "lucide-react";
import TransactionForm from "@/components/TransactionForm";
import TransactionList from "@/components/TransactionList";
import ReportsView from "@/components/ReportsView";
import FilterModal from "@/components/FilterModal";
import ExportModal from "@/components/ExportModal";
import CategoryManager from "@/components/CategoryManager";
import { toast } from "@/hooks/use-toast";

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

const Index = () => {
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [transactionType, setTransactionType] = useState<'expense' | 'income'>('expense');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [activeFilters, setActiveFilters] = useState({ dateRange: 'all', category: 'all' });
  
  // Local storage for transactions and categories (no authentication needed)
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedTransactions = localStorage.getItem('finance-transactions');
    const savedCategories = localStorage.getItem('finance-categories');
    
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    }
    
    if (savedCategories) {
      setCategories(JSON.parse(savedCategories));
    } else {
      // Default categories
      const defaultCategories = [
        { id: 1, name: 'Food', color: '#FF6B6B' },
        { id: 2, name: 'Transport', color: '#4ECDC4' },
        { id: 3, name: 'Entertainment', color: '#45B7D1' },
        { id: 4, name: 'Salary', color: '#96CEB4' },
        { id: 5, name: 'Other', color: '#FFEAA7' }
      ];
      setCategories(defaultCategories);
      localStorage.setItem('finance-categories', JSON.stringify(defaultCategories));
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('finance-transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('finance-categories', JSON.stringify(categories));
  }, [categories]);

  const handleAddTransaction = (newTransaction: any) => {
    const transaction: Transaction = {
      id: Date.now(), // Simple ID generation
      amount: newTransaction.amount,
      category_id: newTransaction.category_id,
      description: newTransaction.description || '',
      date: newTransaction.date,
      created_at: new Date().toISOString(),
      type: newTransaction.type
    };

    setTransactions(prev => [transaction, ...prev]);
    toast({
      title: `${newTransaction.type === 'expense' ? 'Expense' : 'Income'} Added`,
      description: `Your ${newTransaction.type} has been successfully recorded.`,
    });
    setShowTransactionForm(false);
  };

  const handleDeleteTransaction = (id: number) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    toast({
      title: "Transaction Deleted",
      description: "The transaction has been removed.",
    });
  };

  const calculateTotalExpenses = () => {
    return transactions
      .filter(t => t.type === 'expense')
      .reduce((total: number, transaction) => total + transaction.amount, 0);
  };

  const calculateTotalIncome = () => {
    return transactions
      .filter(t => t.type === 'income')
      .reduce((total: number, transaction) => total + transaction.amount, 0);
  };

  const calculateNetBalance = () => {
    return calculateTotalIncome() - calculateTotalExpenses();
  };

  const handleShowTransactionForm = (type: 'expense' | 'income') => {
    setTransactionType(type);
    setShowTransactionForm(true);
  };

  // Convert transactions to expenses format for ExportModal
  const convertToExpenses = () => {
    return transactions.map(transaction => {
      const category = categories.find(cat => cat.id === transaction.category_id);
      return {
        ...transaction,
        category: category?.name || 'Unknown',
        note: transaction.description || ''
      };
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile App Container */}
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-b-lg">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold">Personal Finance Tracker</h1>
              <p className="text-blue-100">Track income & expenses</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-blue-100">Net Balance</p>
              <p className={`text-xl font-bold ${calculateNetBalance() >= 0 ? 'text-green-200' : 'text-red-200'}`}>
                ${calculateNetBalance().toFixed(2)}
              </p>
            </div>
          </div>
          
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="bg-white/20 rounded-lg p-3 text-center">
              <p className="text-sm text-blue-100">Income</p>
              <p className="text-lg font-bold text-green-200">${calculateTotalIncome().toFixed(2)}</p>
            </div>
            <div className="bg-white/20 rounded-lg p-3 text-center">
              <p className="text-sm text-blue-100">Expenses</p>
              <p className="text-lg font-bold text-red-200">${calculateTotalExpenses().toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 flex gap-2">
          <Button 
            onClick={() => handleShowTransactionForm('income')} 
            className="flex-1 bg-green-500 hover:bg-green-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Income
          </Button>
          <Button 
            onClick={() => handleShowTransactionForm('expense')} 
            className="flex-1 bg-red-500 hover:bg-red-600"
          >
            <Minus className="w-4 h-4 mr-2" />
            Add Expense
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setShowCategoryManager(true)}
            className="px-3"
          >
            <Settings className="w-4 h-4" />
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setShowFilterModal(true)}
            className="px-3"
          >
            <Filter className="w-4 h-4" />
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setShowExportModal(true)}
            className="px-3"
          >
            <Download className="w-4 h-4" />
          </Button>
        </div>

        {/* Main Content */}
        <div className="px-4 pb-4">
          <Tabs defaultValue="transactions" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="reports">
                <TrendingUp className="w-4 h-4 mr-2" />
                Reports
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="transactions" className="mt-4">
              <TransactionList 
                transactions={transactions} 
                categories={categories}
                onDeleteTransaction={handleDeleteTransaction}
              />
            </TabsContent>
            
            <TabsContent value="reports" className="mt-4">
              <ReportsView 
                transactions={transactions}
                categories={categories}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Modals */}
        {showTransactionForm && (
          <TransactionForm
            categories={categories}
            transactionType={transactionType}
            onSubmit={handleAddTransaction}
            onClose={() => setShowTransactionForm(false)}
          />
        )}

        {showCategoryManager && (
          <CategoryManager
            categories={categories}
            onClose={() => setShowCategoryManager(false)}
            onCategoriesUpdate={setCategories}
          />
        )}

        {showFilterModal && (
          <FilterModal
            categories={categories}
            activeFilters={activeFilters}
            onApplyFilters={setActiveFilters}
            onClose={() => setShowFilterModal(false)}
          />
        )}

        {showExportModal && (
          <ExportModal
            expenses={convertToExpenses()}
            onClose={() => setShowExportModal(false)}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
