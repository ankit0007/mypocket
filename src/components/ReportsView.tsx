
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import DateRangeFilter from "./DateRangeFilter";

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

interface ReportsViewProps {
  transactions: Transaction[];
  categories: Category[];
}

const ReportsView = ({ transactions, categories }: ReportsViewProps) => {
  const [activeView, setActiveView] = useState<'daily' | 'category' | 'monthly'>('daily');
  const [dateFilter, setDateFilter] = useState({ type: 'all' });

  // Filter transactions based on date range
  const getFilteredTransactions = () => {
    if (dateFilter.type === 'all') {
      return transactions;
    }

    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      const startDate = dateFilter.startDate ? new Date(dateFilter.startDate) : null;
      const endDate = dateFilter.endDate ? new Date(dateFilter.endDate) : null;

      if (startDate && endDate) {
        return transactionDate >= startDate && transactionDate <= endDate;
      }
      return true;
    });
  };

  const filteredTransactions = getFilteredTransactions();

  // Calculate daily totals for the filtered period
  const getDailyData = () => {
    const dailyTotals: { [key: string]: { income: number; expenses: number } } = {};
    
    filteredTransactions.forEach(transaction => {
      const day = transaction.date;
      if (!dailyTotals[day]) {
        dailyTotals[day] = { income: 0, expenses: 0 };
      }
      if (transaction.type === 'income') {
        dailyTotals[day].income += transaction.amount;
      } else {
        dailyTotals[day].expenses += transaction.amount;
      }
    });

    return Object.entries(dailyTotals)
      .map(([day, data]) => ({ 
        day: new Date(day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), 
        income: data.income,
        expenses: data.expenses,
        net: data.income - data.expenses
      }))
      .sort((a, b) => new Date(a.day).getTime() - new Date(b.day).getTime())
      .slice(-15); // Show last 15 days
  };

  // Calculate category totals for filtered data
  const getCategoryData = () => {
    const categoryTotals: { [key: string]: { income: number; expenses: number } } = {};
    
    filteredTransactions.forEach(transaction => {
      const category = categories.find(cat => cat.id === transaction.category_id);
      const categoryName = category?.name || 'Unknown';
      
      if (!categoryTotals[categoryName]) {
        categoryTotals[categoryName] = { income: 0, expenses: 0 };
      }
      
      if (transaction.type === 'income') {
        categoryTotals[categoryName].income += transaction.amount;
      } else {
        categoryTotals[categoryName].expenses += transaction.amount;
      }
    });

    return Object.entries(categoryTotals).map(([category, data]) => {
      const categoryInfo = categories.find(cat => cat.name === category);
      return {
        category,
        income: data.income,
        expenses: data.expenses,
        net: data.income - data.expenses,
        color: categoryInfo?.color || "#9CA3AF"
      };
    });
  };

  // Calculate monthly totals for filtered data
  const getMonthlyData = () => {
    const monthlyTotals: { [key: string]: { income: number; expenses: number } } = {};
    
    filteredTransactions.forEach(transaction => {
      const transactionDate = new Date(transaction.date);
      const monthKey = `${transactionDate.getFullYear()}-${transactionDate.getMonth() + 1}`;
      
      if (!monthlyTotals[monthKey]) {
        monthlyTotals[monthKey] = { income: 0, expenses: 0 };
      }
      
      if (transaction.type === 'income') {
        monthlyTotals[monthKey].income += transaction.amount;
      } else {
        monthlyTotals[monthKey].expenses += transaction.amount;
      }
    });

    return Object.entries(monthlyTotals).map(([month, data]) => ({
      month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      income: data.income,
      expenses: data.expenses,
      net: data.income - data.expenses
    }));
  };

  const totalIncome = filteredTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const netBalance = totalIncome - totalExpenses;

  return (
    <div className="space-y-4">
      {/* Date Range Filter */}
      <DateRangeFilter onFilterChange={setDateFilter} initialFilter={dateFilter} />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-gray-600">Filtered Income</p>
            <p className="text-xl font-bold text-green-600">₹{totalIncome.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-gray-600">Filtered Expenses</p>
            <p className="text-xl font-bold text-red-600">₹{totalExpenses.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card className="col-span-2">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-gray-600">Net Balance</p>
            <p className={`text-xl font-bold ${netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ₹{netBalance.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {filteredTransactions.length} transactions in selected period
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Chart Type Selector */}
      <div className="flex gap-2">
        <Button 
          size="sm" 
          variant={activeView === 'daily' ? 'default' : 'outline'}
          onClick={() => setActiveView('daily')}
        >
          Daily
        </Button>
        <Button 
          size="sm" 
          variant={activeView === 'category' ? 'default' : 'outline'}
          onClick={() => setActiveView('category')}
        >
          Category
        </Button>
        <Button 
          size="sm" 
          variant={activeView === 'monthly' ? 'default' : 'outline'}
          onClick={() => setActiveView('monthly')}
        >
          Monthly
        </Button>
      </div>

      {/* Charts */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {activeView === 'daily' && 'Daily Income vs Expenses'}
            {activeView === 'category' && 'Income vs Expenses by Category'}
            {activeView === 'monthly' && 'Monthly Income vs Expenses'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            {filteredTransactions.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <p>No data available for selected date range</p>
                  <p className="text-sm">Try adjusting your date filter</p>
                </div>
              </div>
            ) : (
              <>
                {activeView === 'daily' && (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getDailyData()}>
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="income" fill="#22C55E" radius={4} />
                      <Bar dataKey="expenses" fill="#EF4444" radius={4} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
                
                {activeView === 'category' && (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getCategoryData()}>
                      <XAxis dataKey="category" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="income" fill="#22C55E" radius={4} />
                      <Bar dataKey="expenses" fill="#EF4444" radius={4} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
                
                {activeView === 'monthly' && (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getMonthlyData()}>
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="income" fill="#22C55E" radius={4} />
                      <Bar dataKey="expenses" fill="#EF4444" radius={4} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsView;
