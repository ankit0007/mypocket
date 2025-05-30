
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Download } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Transaction {
  id: number;
  amount: number;
  category: string;
  note: string;
  date: string;
  created_at: string;
  type: 'expense' | 'income';
}

interface ExportModalProps {
  transactions: Transaction[];
  onClose: () => void;
}

const ExportModal = ({ transactions, onClose }: ExportModalProps) => {
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  
  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  
  const netBalance = totalIncome - totalExpenses;

  const exportToPDF = () => {
    // Create comprehensive financial report
    let content = "PERSONAL FINANCE REPORT\n";
    content += "=" + "=".repeat(50) + "\n\n";
    
    // Summary Section
    content += "FINANCIAL SUMMARY:\n";
    content += "-".repeat(30) + "\n";
    content += `Total Income: $${totalIncome.toFixed(2)}\n`;
    content += `Total Expenses: $${totalExpenses.toFixed(2)}\n`;
    content += `Net Balance: $${netBalance.toFixed(2)}\n`;
    content += `Total Transactions: ${transactions.length}\n\n`;
    
    // Income Details
    const incomeTransactions = transactions.filter(t => t.type === 'income');
    if (incomeTransactions.length > 0) {
      content += "INCOME DETAILS:\n";
      content += "-".repeat(30) + "\n";
      incomeTransactions.forEach(transaction => {
        content += `${transaction.date} | ${transaction.category} | $${transaction.amount.toFixed(2)} | ${transaction.note || 'No note'}\n`;
      });
      content += `\nTotal Income: $${totalIncome.toFixed(2)}\n`;
      content += `Income Transactions: ${incomeTransactions.length}\n\n`;
    }
    
    // Expense Details
    const expenseTransactions = transactions.filter(t => t.type === 'expense');
    if (expenseTransactions.length > 0) {
      content += "EXPENSE DETAILS:\n";
      content += "-".repeat(30) + "\n";
      expenseTransactions.forEach(transaction => {
        content += `${transaction.date} | ${transaction.category} | $${transaction.amount.toFixed(2)} | ${transaction.note || 'No note'}\n`;
      });
      content += `\nTotal Expenses: $${totalExpenses.toFixed(2)}\n`;
      content += `Expense Transactions: ${expenseTransactions.length}\n\n`;
    }
    
    // Category Breakdown
    const categoryTotals = {};
    transactions.forEach(transaction => {
      const key = `${transaction.category} (${transaction.type})`;
      categoryTotals[key] = (categoryTotals[key] || 0) + transaction.amount;
    });
    
    if (Object.keys(categoryTotals).length > 0) {
      content += "CATEGORY BREAKDOWN:\n";
      content += "-".repeat(30) + "\n";
      Object.entries(categoryTotals).forEach(([category, total]) => {
        content += `${category}: $${total.toFixed(2)}\n`;
      });
    }
    
    content += "\n" + "=" + "=".repeat(50) + "\n";
    content += `Report Generated: ${new Date().toLocaleString()}\n`;

    // Create and download blob
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financial-report-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Financial Report Exported",
      description: "Complete financial report with income and expense totals downloaded.",
    });
    onClose();
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Type', 'Category', 'Amount', 'Note'];
    
    // Add summary rows at the top
    const summaryRows = [
      ['FINANCIAL SUMMARY', '', '', '', ''],
      ['Total Income', '', '', totalIncome.toFixed(2), ''],
      ['Total Expenses', '', '', totalExpenses.toFixed(2), ''],
      ['Net Balance', '', '', netBalance.toFixed(2), ''],
      ['Total Transactions', '', '', transactions.length.toString(), ''],
      ['', '', '', '', ''],
      ['TRANSACTION DETAILS', '', '', '', ''],
    ];
    
    const csvContent = [
      headers.join(','),
      ...summaryRows.map(row => row.map(cell => `"${cell}"`).join(',')),
      ...transactions.map(transaction => [
        transaction.date,
        transaction.type.toUpperCase(),
        transaction.category,
        transaction.amount.toFixed(2),
        `"${transaction.note || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financial-data-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Financial Data Exported",
      description: "Complete financial data with totals downloaded as CSV.",
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 z-50">
      <Card className="w-full max-w-xs mx-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base">Export Financial Data</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-2 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-800">Financial Summary</p>
            <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
              <div>
                <p className="text-green-600 font-medium">Income: ${totalIncome.toFixed(2)}</p>
                <p className="text-gray-500">{transactions.filter(t => t.type === 'income').length} transactions</p>
              </div>
              <div>
                <p className="text-red-600 font-medium">Expenses: ${totalExpenses.toFixed(2)}</p>
                <p className="text-gray-500">{transactions.filter(t => t.type === 'expense').length} transactions</p>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-gray-200">
              <p className={`text-sm font-bold ${netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                Net Balance: ${netBalance.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Button 
              onClick={exportToPDF} 
              className="w-full flex items-center justify-center text-xs"
              variant="outline"
              size="sm"
            >
              <Download className="w-3 h-3 mr-2" />
              Export Complete Report (PDF)
            </Button>
            
            <Button 
              onClick={exportToCSV} 
              className="w-full flex items-center justify-center text-xs"
              variant="outline"
              size="sm"
            >
              <Download className="w-3 h-3 mr-2" />
              Export Data with Totals (CSV)
            </Button>
          </div>

          <div className="text-xs text-gray-500 text-center space-y-1">
            <p>Reports include complete income & expense breakdown</p>
            <p>CSV files include summary totals and all transaction details</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExportModal;
