
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, TrendingUp, Download, Filter, Settings } from "lucide-react";
import ExpenseForm from "@/components/ExpenseForm";
import ExpenseList from "@/components/ExpenseList";
import ReportsView from "@/components/ReportsView";
import FilterModal from "@/components/FilterModal";
import ExportModal from "@/components/ExportModal";
import CategoryManager from "@/components/CategoryManager";
import { toast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [activeFilters, setActiveFilters] = useState({ dateRange: 'all', category: 'all' });
  const queryClient = useQueryClient();

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsAuthenticated(true);
        setUser(session.user);
      }
    };
    
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setIsAuthenticated(true);
        setUser(session.user);
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch expenses from Supabase
  const { data: expenses = [], isLoading: expensesLoading } = useQuery({
    queryKey: ['transactions', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch categories from Supabase
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .order('name');
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const handleSignIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast({ title: "Signed in successfully!" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleSignUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      toast({ title: "Account created! Please check your email." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleAddExpense = async (newExpense: any) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .insert({
          ...newExpense,
          user_id: user.id,
        });
      
      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['transactions', user.id] });
      toast({
        title: "Expense Added",
        description: "Your expense has been successfully recorded.",
      });
      setShowExpenseForm(false);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleDeleteExpense = async (id: number) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['transactions', user.id] });
      toast({
        title: "Expense Deleted",
        description: "The expense has been removed.",
      });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const calculateTotalExpenses = () => {
    return expenses.reduce((total: number, expense: any) => total + parseFloat(expense.amount), 0);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (!isAuthenticated) {
    return (
      <AuthForm onSignIn={handleSignIn} onSignUp={handleSignUp} />
    );
  }

  if (expensesLoading || categoriesLoading) {
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
              <h1 className="text-xl font-bold">Daily Expenses</h1>
              <p className="text-blue-100">Track your spending</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-blue-100">Total</p>
              <p className="text-xl font-bold">${calculateTotalExpenses().toFixed(2)}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-blue-100 hover:text-white mt-1"
              >
                Sign Out
              </Button>
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
                expenses={expenses} 
                categories={categories}
                onDeleteExpense={handleDeleteExpense}
              />
            </TabsContent>
            
            <TabsContent value="reports" className="mt-4">
              <ReportsView 
                expenses={expenses}
                categories={categories}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Modals */}
        {showExpenseForm && (
          <ExpenseForm
            categories={categories}
            onSubmit={handleAddExpense}
            onClose={() => setShowExpenseForm(false)}
          />
        )}

        {showCategoryManager && (
          <CategoryManager
            categories={categories}
            onClose={() => setShowCategoryManager(false)}
            userId={user?.id}
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
            expenses={expenses}
            onClose={() => setShowExportModal(false)}
          />
        )}
      </div>
    </div>
  );
};

// Auth Form Component
const AuthForm = ({ onSignIn, onSignUp }: { onSignIn: (email: string, password: string) => void, onSignUp: (email: string, password: string) => void }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignUp) {
      onSignUp(email, password);
    } else {
      onSignIn(email, password);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-800">Daily Expense Tracker</CardTitle>
          <p className="text-gray-600">Track your expenses on the go</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="Enter your email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="Enter your password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              {isSignUp ? "Sign Up" : "Sign In"}
            </Button>
            <p className="text-center text-sm text-gray-600">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
              <span 
                className="text-blue-600 cursor-pointer hover:underline"
                onClick={() => setIsSignUp(!isSignUp)}
              >
                {isSignUp ? "Sign in" : "Sign up"}
              </span>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
