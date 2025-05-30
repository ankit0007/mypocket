
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
  user_id: string;
}

interface Category {
  id: number;
  name: string;
  color: string;
  user_id: string;
  created_at: string;
}

// Use a fixed user ID for demo purposes since we don't have authentication
const DEMO_USER_ID = "demo-user-123";

const Index = () => {
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [transactionType, setTransactionType] = useState<'expense' | 'income'>('expense');
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
      { name: 'Food', color: '#FF6B6B', user_id: DEMO_USER_ID },
      { name: 'Transport', color: '#4ECDC4', user_id: DEMO_USER_ID },
      { name: 'Entertainment', color: '#45B7D1', user_id: DEMO_USER_ID },
      { name: 'Salary', color: '#96CEB4', user_id: DEMO_USER_ID },
      { name: 'Other', color: '#FFEAA7', user_id: DEMO_USER_ID }
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
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          amount: newTransaction.amount,
          category_id: newTransaction.category_id,
          description: newTransaction.description || '',
          date: newTransaction.date,
          type: newTransaction.type,
          user_id: DEMO_USER_ID
        })
        .select();

      if (error) throw error;

      toast({
        title: `${newTransaction.type === 'expense' ? 'Expense' : 'Income'} Added`,
        description: `Your ${newTransaction.type} has been successfully recorded.`,
      });
      setShowTransactionForm(false);
    } catch (error: any) {
      console.error('Error adding transaction:', error);
      toast({
        title: "Error",
        description: "Failed to add transaction.",
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
            expenses={convertToExpenses()}
            onClose={() => setShowExportModal(false)}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
