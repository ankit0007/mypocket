
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, TrendingUp, Download, Filter } from "lucide-react";
import ExpenseForm from "@/components/ExpenseForm";
import ExpenseList from "@/components/ExpenseList";
import ReportsView from "@/components/ReportsView";
import FilterModal from "@/components/FilterModal";
import ExportModal from "@/components/ExportModal";
import { toast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

// Mock data for demonstration - in real app this would come from Supabase
const mockExpenses = [
  { id: 1, amount: 25.50, category: "Food", note: "Lunch at cafe", date: "2025-05-30", created_at: "2025-05-30T12:00:00Z" },
  { id: 2, amount: 15.00, category: "Transport", note: "Bus fare", date: "2025-05-30", created_at: "2025-05-30T08:00:00Z" },
  { id: 3, amount: 50.00, category: "Groceries", note: "Weekly shopping", date: "2025-05-29", created_at: "2025-05-29T18:00:00Z" },
];

const mockCategories = [
  { id: 1, name: "Food", color: "#FF6B6B" },
  { id: 2, name: "Transport", color: "#4ECDC4" },
  { id: 3, name: "Groceries", color: "#45B7D1" },
  { id: 4, name: "Entertainment", color: "#96CEB4" },
  { id: 5, name: "Health", color: "#FFEAA7" },
];

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [expenses, setExpenses] = useState(mockExpenses);
  const [filteredExpenses, setFilteredExpenses] = useState(mockExpenses);
  const [activeFilters, setActiveFilters] = useState({ dateRange: 'all', category: 'all' });

  // Simulate authentication - replace with Supabase auth
  useEffect(() => {
    setIsAuthenticated(true);
  }, []);

  const handleAddExpense = (newExpense: any) => {
    const expense = {
      ...newExpense,
      id: expenses.length + 1,
      created_at: new Date().toISOString(),
    };
    setExpenses([expense, ...expenses]);
    setFilteredExpenses([expense, ...filteredExpenses]);
    toast({
      title: "Expense Added",
      description: "Your expense has been successfully recorded.",
    });
    setShowExpenseForm(false);
  };

  const handleDeleteExpense = (id: number) => {
    const updatedExpenses = expenses.filter(exp => exp.id !== id);
    setExpenses(updatedExpenses);
    setFilteredExpenses(updatedExpenses.filter(exp => applyFilters(exp)));
    toast({
      title: "Expense Deleted",
      description: "The expense has been removed.",
    });
  };

  const applyFilters = (expense: any) => {
    // Filter logic would be implemented here
    return true;
  };

  const handleFilterChange = (filters: any) => {
    setActiveFilters(filters);
    // Apply filters to expenses
    const filtered = expenses.filter(applyFilters);
    setFilteredExpenses(filtered);
    setShowFilterModal(false);
  };

  const calculateTotalExpenses = () => {
    return filteredExpenses.reduce((total, expense) => total + expense.amount, 0);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-800">Daily Expense Tracker</CardTitle>
            <p className="text-gray-600">Track your expenses on the go</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="Enter your email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="Enter your password" />
            </div>
            <Button onClick={() => setIsAuthenticated(true)} className="w-full">
              Sign In
            </Button>
            <p className="text-center text-sm text-gray-600">
              Don't have an account? <span className="text-blue-600 cursor-pointer">Sign up</span>
            </p>
          </CardContent>
        </Card>
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
              <h1 className="text-xl font-bold">Daily Expenses</h1>
              <p className="text-blue-100">Track your spending</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-blue-100">Total</p>
              <p className="text-xl font-bold">${calculateTotalExpenses().toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 flex gap-2">
          <Button 
            onClick={() => setShowExpenseForm(true)} 
            className="flex-1 bg-green-500 hover:bg-green-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Expense
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
          <Tabs defaultValue="expenses" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="expenses">Expenses</TabsTrigger>
              <TabsTrigger value="reports">
                <TrendingUp className="w-4 h-4 mr-2" />
                Reports
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="expenses" className="mt-4">
              <ExpenseList 
                expenses={filteredExpenses} 
                categories={mockCategories}
                onDeleteExpense={handleDeleteExpense}
              />
            </TabsContent>
            
            <TabsContent value="reports" className="mt-4">
              <ReportsView 
                expenses={filteredExpenses}
                categories={mockCategories}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Modals */}
        {showExpenseForm && (
          <ExpenseForm
            categories={mockCategories}
            onSubmit={handleAddExpense}
            onClose={() => setShowExpenseForm(false)}
          />
        )}

        {showFilterModal && (
          <FilterModal
            categories={mockCategories}
            activeFilters={activeFilters}
            onApplyFilters={handleFilterChange}
            onClose={() => setShowFilterModal(false)}
          />
        )}

        {showExportModal && (
          <ExportModal
            expenses={filteredExpenses}
            onClose={() => setShowExportModal(false)}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
