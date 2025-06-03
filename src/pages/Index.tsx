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
import { supabase } from "@/integrations/supabase/client";

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
  created_at: string;
}

// Use a fixed user ID for demo purposes since we don't have authentication
const DEMO_USER_ID = "demo-user-123";

const Index = () => {
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [transactionType, setTransactionType] = useState<'expense' | 'income'>('expense');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [activeFilters, setActiveFilters] = useState({ dateRange: 'all', category: 'all' });
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Load data from Supabase on component mount
  useEffect(() => {
    loadData();
    setupRealtimeSubscriptions();
  }, []);

  const loadData = async () => {
    try {
      // Load categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('id');

      if (categoriesError) throw categoriesError;

      // Load transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (transactionsError) throw transactionsError;

      setCategories(categoriesData || []);
      setTransactions((transactionsData || []).map(t => ({
        ...t,
        type: t.type as 'expense' | 'income'
      })));

      // If no categories exist, create default ones
      if (!categoriesData || categoriesData.length === 0) {
        await createDefaultCategories();
      }
    } catch (error: any) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load data from database.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createDefaultCategories = async () => {
    const defaultCategories = [
      { name: 'Food', color: '#FF6B6B' },
      { name: 'Transport', color: '#4ECDC4' },
      { name: 'Entertainment', color: '#45B7D1' },
      { name: 'Salary', color: '#96CEB4' },
      { name: 'Other', color: '#FFEAA7' }
    ];

    try {
      const { data, error } = await supabase
        .from('categories')
        .insert(defaultCategories)
        .select();

      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      console.error('Error creating default categories:', error);
    }
  };

  const setupRealtimeSubscriptions = () => {
    // Subscribe to categories changes
    const categoriesSubscription = supabase
      .channel('categories-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, () => {
        loadCategories();
      })
      .subscribe();

    // Subscribe to transactions changes
    const transactionsSubscription = supabase
      .channel('transactions-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () => {
        loadTransactions();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(categoriesSubscription);
      supabase.removeChannel(transactionsSubscription);
    };
  };

  const loadCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('id');

    if (!error && data) {
      setCategories(data);
    }
  };

  const loadTransactions = async () => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setTransactions(data.map(t => ({
        ...t,
        type: t.type as 'expense' | 'income'
      })));
    }
  };

  const handleAddTransaction = async (newTransaction: any) => {
    try {
      if (newTransaction.id) {
        // Update existing transaction
        const { data, error } = await supabase
          .from('transactions')
          .update({
            amount: newTransaction.amount,
            category_id: newTransaction.category_id,
            description: newTransaction.description || '',
            date: newTransaction.date,
            type: newTransaction.type
          })
          .eq('id', newTransaction.id)
          .select();

        if (error) throw error;

        toast({
          title: `${newTransaction.type === 'expense' ? 'Expense' : 'Income'} Updated`,
          description: `Your ${newTransaction.type} has been successfully updated.`,
        });
      } else {
        // Create new transaction
        const { data, error } = await supabase
          .from('transactions')
          .insert({
            amount: newTransaction.amount,
            category_id: newTransaction.category_id,
            description: newTransaction.description || '',
            date: newTransaction.date,
            type: newTransaction.type
          })
          .select();

        if (error) throw error;

        toast({
          title: `${newTransaction.type === 'expense' ? 'Expense' : 'Income'} Added`,
          description: `Your ${newTransaction.type} has been successfully recorded.`,
        });
      }
      
      setShowTransactionForm(false);
      setEditingTransaction(null);
    } catch (error: any) {
      console.error('Error saving transaction:', error);
      toast({
        title: "Error",
        description: "Failed to save transaction.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTransaction = async (id: number) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Transaction Deleted",
        description: "The transaction has been removed.",
      });
    } catch (error: any) {
      console.error('Error deleting transaction:', error);
      toast({
        title: "Error",
        description: "Failed to delete transaction.",
        variant: "destructive",
      });
    }
  };

  const handleCategoriesUpdate = async (updatedCategories: Category[]) => {
    // This will be handled by the CategoryManager component directly
    // The real-time subscription will update the local state
  };

  const getFilteredTransactions = () => {
    let filtered = transactions;

    // Apply date range filter
    if (activeFilters.dateRange !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      switch (activeFilters.dateRange) {
        case 'today':
          filtered = filtered.filter(t => {
            const transactionDate = new Date(t.date);
            return transactionDate >= today;
          });
          break;
        case 'week':
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          filtered = filtered.filter(t => {
            const transactionDate = new Date(t.date);
            return transactionDate >= weekAgo;
          });
          break;
        case 'month':
          const monthAgo = new Date(today);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          filtered = filtered.filter(t => {
            const transactionDate = new Date(t.date);
            return transactionDate >= monthAgo;
          });
          break;
      }
    }

    // Apply category filter
    if (activeFilters.category !== 'all') {
      const selectedCategory = categories.find(cat => cat.name === activeFilters.category);
      if (selectedCategory) {
        filtered = filtered.filter(t => t.category_id === selectedCategory.id);
      }
    }

    return filtered;
  };

  const calculateTotalExpenses = () => {
    return getFilteredTransactions()
      .filter(t => t.type === 'expense')
      .reduce((total: number, transaction) => total + transaction.amount, 0);
  };

  const calculateTotalIncome = () => {
    return getFilteredTransactions()
      .filter(t => t.type === 'income')
      .reduce((total: number, transaction) => total + transaction.amount, 0);
  };

  const calculateNetBalance = () => {
    return calculateTotalIncome() - calculateTotalExpenses();
  };

  const handleShowTransactionForm = (type: 'expense' | 'income') => {
    setTransactionType(type);
    setEditingTransaction(null);
    setShowTransactionForm(true);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setTransactionType(transaction.type);
    setEditingTransaction(transaction);
    setShowTransactionForm(true);
  };

  // Convert transactions to expenses format for ExportModal - use filtered data
  const convertToExpenses = () => {
    return getFilteredTransactions().map(transaction => {
      const category = categories.find(cat => cat.id === transaction.category_id);
      return {
        ...transaction,
        category: category?.name || 'Unknown',
        note: transaction.description || '',
        type: transaction.type
      };
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your finance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile App Container */}
      <div className="w-full max-w-sm mx-auto bg-white min-h-screen shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-b-lg">
          <div className="flex justify-between items-center">
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold truncate">Personal Finance</h1>
              <p className="text-xs text-blue-100">Track income & expenses</p>
            </div>
            <div className="text-right flex-shrink-0 ml-2">
              <p className="text-xs text-blue-100">Net Balance</p>
              <p className={`text-sm font-bold ${calculateNetBalance() >= 0 ? 'text-green-200' : 'text-red-200'}`}>
                ₹{calculateNetBalance().toFixed(2)}
              </p>
            </div>
          </div>
          
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-2 mt-3">
            <div className="bg-white/20 rounded-lg p-2 text-center">
              <p className="text-xs text-blue-100">Income</p>
              <p className="text-sm font-bold text-green-200">₹{calculateTotalIncome().toFixed(2)}</p>
            </div>
            <div className="bg-white/20 rounded-lg p-2 text-center">
              <p className="text-xs text-blue-100">Expenses</p>
              <p className="text-sm font-bold text-red-200">₹{calculateTotalExpenses().toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons - More Compact Layout */}
        <div className="p-3 space-y-2">
          {/* Primary Actions */}
          <div className="flex gap-2">
            <Button 
              onClick={() => handleShowTransactionForm('income')} 
              className="flex-1 bg-green-500 hover:bg-green-600 text-xs px-2 py-2"
              size="sm"
            >
              <Plus className="w-3 h-3 mr-1" />
              Add Income
            </Button>
            <Button 
              onClick={() => handleShowTransactionForm('expense')} 
              className="flex-1 bg-red-500 hover:bg-red-600 text-xs px-2 py-2"
              size="sm"
            >
              <Minus className="w-3 h-3 mr-1" />
              Add Expense
            </Button>
          </div>
          
          {/* Secondary Actions */}
          <div className="flex gap-1">
            <Button 
              variant="outline" 
              onClick={() => setShowCategoryManager(true)}
              className="flex-1 text-xs px-2 py-2"
              size="sm"
            >
              <Settings className="w-3 h-3 mr-1" />
              Categories
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowFilterModal(true)}
              className="flex-1 text-xs px-2 py-2"
              size="sm"
            >
              <Filter className="w-3 h-3 mr-1" />
              Filter
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowExportModal(true)}
              className="flex-1 text-xs px-2 py-2"
              size="sm"
            >
              <Download className="w-3 h-3 mr-1" />
              Export
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-3 pb-4">
          <Tabs defaultValue="transactions" className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-8">
              <TabsTrigger value="transactions" className="text-xs">Transactions</TabsTrigger>
              <TabsTrigger value="reports" className="text-xs">
                <TrendingUp className="w-3 h-3 mr-1" />
                Reports
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="transactions" className="mt-3">
              <TransactionList 
                transactions={getFilteredTransactions()} 
                categories={categories}
                onDeleteTransaction={handleDeleteTransaction}
                onEditTransaction={handleEditTransaction}
              />
            </TabsContent>
            
            <TabsContent value="reports" className="mt-3">
              <ReportsView 
                transactions={getFilteredTransactions()}
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
            onClose={() => {
              setShowTransactionForm(false);
              setEditingTransaction(null);
            }}
            editTransaction={editingTransaction}
          />
        )}

        {showCategoryManager && (
          <CategoryManager
            categories={categories}
            onClose={() => setShowCategoryManager(false)}
            onCategoriesUpdate={handleCategoriesUpdate}
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
            transactions={convertToExpenses()}
            onClose={() => setShowExportModal(false)}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
