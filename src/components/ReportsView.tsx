
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
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

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Income vs Expenses</CardTitle>
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
    </div>
  );
};

export default ReportsView;
