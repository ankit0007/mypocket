
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

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

interface ReportsViewProps {
  expenses: Expense[];
  categories: Category[];
}

const ReportsView = ({ expenses, categories }: ReportsViewProps) => {
  const [activeView, setActiveView] = useState<'daily' | 'category' | 'monthly'>('daily');

  // Calculate daily totals for the current month
  const getDailyData = () => {
    const currentMonth = new Date().getMonth();
    const dailyTotals: { [key: string]: number } = {};
    
    expenses.forEach(expense => {
      const expenseDate = new Date(expense.date);
      if (expenseDate.getMonth() === currentMonth) {
        const day = expenseDate.getDate().toString();
        dailyTotals[day] = (dailyTotals[day] || 0) + expense.amount;
      }
    });

    return Object.entries(dailyTotals)
      .map(([day, amount]) => ({ day: `Day ${day}`, amount }))
      .slice(0, 10); // Show last 10 days
  };

  // Calculate category totals
  const getCategoryData = () => {
    const categoryTotals: { [key: string]: number } = {};
    
    expenses.forEach(expense => {
      categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
    });

    return Object.entries(categoryTotals).map(([category, amount]) => {
      const categoryInfo = categories.find(cat => cat.name === category);
      return {
        category,
        amount,
        color: categoryInfo?.color || "#9CA3AF"
      };
    });
  };

  // Calculate monthly totals
  const getMonthlyData = () => {
    const monthlyTotals: { [key: string]: number } = {};
    
    expenses.forEach(expense => {
      const expenseDate = new Date(expense.date);
      const monthKey = `${expenseDate.getFullYear()}-${expenseDate.getMonth() + 1}`;
      monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + expense.amount;
    });

    return Object.entries(monthlyTotals).map(([month, amount]) => ({
      month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      amount
    }));
  };

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const averageDaily = totalExpenses / Math.max(1, new Set(expenses.map(e => e.date)).size);
  const topCategory = getCategoryData().sort((a, b) => b.amount - a.amount)[0];

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-gray-600">Total Spent</p>
            <p className="text-xl font-bold text-gray-900">${totalExpenses.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-gray-600">Daily Average</p>
            <p className="text-xl font-bold text-gray-900">${averageDaily.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card className="col-span-2">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-gray-600">Top Category</p>
            <div className="flex items-center justify-center mt-1">
              {topCategory && (
                <>
                  <div 
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: topCategory.color }}
                  />
                  <span className="font-medium">{topCategory.category}</span>
                  <span className="ml-2 text-gray-600">${topCategory.amount.toFixed(2)}</span>
                </>
              )}
            </div>
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
            {activeView === 'daily' && 'Daily Expenses'}
            {activeView === 'category' && 'Expenses by Category'}
            {activeView === 'monthly' && 'Monthly Expenses'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            {activeView === 'daily' && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getDailyData()}>
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="amount" fill="#3B82F6" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            )}
            
            {activeView === 'category' && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={getCategoryData()}
                    dataKey="amount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ category, amount }) => `${category}: $${amount.toFixed(2)}`}
                  >
                    {getCategoryData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
            
            {activeView === 'monthly' && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getMonthlyData()}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="amount" fill="#3B82F6" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsView;
