import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from "recharts";
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
  const [dateFilter, setDateFilter] = useState<{ type: string; startDate?: string; endDate?: string }>({
    type: 'all'
  });

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
    const dailyTotals: {
      [key: string]: {
        income: number;
        expenses: number;
      };
    } = {};

    filteredTransactions.forEach(transaction => {
      const day = transaction.date;
      if (!dailyTotals[day]) {
        dailyTotals[day] = {
          income: 0,
          expenses: 0
        };
      }
      if (transaction.type === 'income') {
        dailyTotals[day].income += transaction.amount;
      } else {
        dailyTotals[day].expenses += transaction.amount;
      }
    });

    return Object.entries(dailyTotals)
      .map(([day, data]) => ({
        day: new Date(day).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        }),
        income: data.income,
        expenses: data.expenses,
        net: data.income - data.expenses
      }))
      .sort((a, b) => new Date(a.day).getTime() - new Date(b.day).getTime())
      .slice(-15); // Show last 15 days
  };

  // Calculate category-wise data
  const getCategoryData = () => {
    const categoryTotals: {
      [key: number]: {
        income: number;
        expenses: number;
      };
    } = {};

    filteredTransactions.forEach(transaction => {
      const categoryId = transaction.category_id;
      if (!categoryTotals[categoryId]) {
        categoryTotals[categoryId] = {
          income: 0,
          expenses: 0
        };
      }
      if (transaction.type === 'income') {
        categoryTotals[categoryId].income += transaction.amount;
      } else {
        categoryTotals[categoryId].expenses += transaction.amount;
      }
    });

    return Object.entries(categoryTotals)
      .map(([categoryId, data]) => {
        const category = categories.find(c => c.id === parseInt(categoryId));
        return {
          category: category?.name || 'Unknown',
          color: category?.color || '#9CA3AF',
          income: data.income,
          expenses: data.expenses,
          total: data.income + data.expenses
        };
      })
      .filter(item => item.total > 0)
      .sort((a, b) => b.total - a.total);
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

      {/* Daily Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Daily Income vs Expenses</CardTitle>
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
          </div>
        </CardContent>
      </Card>

      {/* Category Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Category Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            {getCategoryData().length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <p>No category data available</p>
                  <p className="text-sm">Try adjusting your date filter</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col h-full">
                <div className="flex-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getCategoryData()}
                        cx="50%"
                        cy="50%"
                        outerRadius={60}
                        dataKey="total"
                      >
                        {getCategoryData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: any) => [`₹${value.toFixed(2)}`, 'Total Amount']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                  {getCategoryData().map((entry, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-sm flex-shrink-0"
                        style={{ backgroundColor: entry.color }}
                      />
                      <span className="truncate font-medium">{entry.category}</span>
                      <span className="text-gray-600">₹{entry.total.toFixed(0)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsView;
