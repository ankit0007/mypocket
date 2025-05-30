
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Transaction {
  id: number;
  amount: number;
  category_id: number;
  description: string;
  date: string;
  created_at: string;
  user_id: string;
  type: 'expense' | 'income';
}

const Index = () => {
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [transactionType, setTransactionType] = useState<'expense' | 'income'>('expense');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [activeFilters, setActiveFilters] = useState({ dateRange: 'all', category: 'all' });
  const queryClient = useQueryClient();

  // For demo purposes, we'll use a fixed user ID since login is not required
  const demoUserId = 'demo-user-123';

  // Fetch transactions from Supabase
  const { data: transactions = [], isLoading: transactionsLoading } = useQuery({
    queryKey: ['transactions', demoUserId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', demoUserId)
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data.map(transaction => ({
        ...transaction,
        type: transaction.amount > 0 ? 'income' : 'expense',
        amount: Math.abs(transaction.amount)
      }));
    },
  });

  // Fetch categories from Supabase
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories', demoUserId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', demoUserId)
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  const handleAddTransaction = async (newTransaction: any) => {
    try {
      const amount = newTransaction.type === 'expense' ? -Math.abs(newTransaction.amount) : Math.abs(newTransaction.amount);
      
      const { error } = await supabase
        .from('transactions')
        .insert({
          ...newTransaction,
          amount,
          user_id: demoUserId,
        });
      
      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['transactions', demoUserId] });
      toast({
        title: `${newTransaction.type === 'expense' ? 'Expense' : 'Income'} Added`,
        description: `Your ${newTransaction.type} has been successfully recorded.`,
      });
      setShowTransactionForm(false);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleDeleteTransaction = async (id: number) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', demoUserId);
      
      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['transactions', demoUserId] });
      toast({
        title: "Transaction Deleted",
        description: "The transaction has been removed.",
      });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
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

  if (transactionsLoading || categoriesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
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
              <h1 className="text-xl font-bold">Finance Tracker</h1>
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
            userId={demoUserId}
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
            expenses={transactions}
            onClose={() => setShowExportModal(false)}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
