
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Download } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Expense {
  id: number;
  amount: number;
  category: string;
  note: string;
  date: string;
  created_at: string;
}

interface ExportModalProps {
  expenses: Expense[];
  onClose: () => void;
}

const ExportModal = ({ expenses, onClose }: ExportModalProps) => {
  const exportToPDF = () => {
    // In a real implementation, you would use a library like jsPDF
    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    // Create a simple text representation for now
    let content = "EXPENSE REPORT\n\n";
    content += `Total Expenses: $${total.toFixed(2)}\n`;
    content += `Number of Expenses: ${expenses.length}\n\n`;
    content += "DETAILS:\n";
    content += expenses.map(expense => 
      `${expense.date} - ${expense.category} - $${expense.amount.toFixed(2)} - ${expense.note || 'No note'}`
    ).join('\n');

    // Create and download blob
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expense-report-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: "Your expense report has been downloaded.",
    });
    onClose();
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Category', 'Amount', 'Note'];
    const csvContent = [
      headers.join(','),
      ...expenses.map(expense => [
        expense.date,
        expense.category,
        expense.amount.toFixed(2),
        `"${expense.note || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expenses-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: "Your expenses have been downloaded as CSV.",
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg">Export Expenses</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-2">
            <p className="text-gray-600">Export {expenses.length} expenses</p>
            <p className="text-sm text-gray-500">
              Total: ${expenses.reduce((sum, expense) => sum + expense.amount, 0).toFixed(2)}
            </p>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={exportToPDF} 
              className="w-full flex items-center justify-center"
              variant="outline"
            >
              <Download className="w-4 h-4 mr-2" />
              Export as PDF Report
            </Button>
            
            <Button 
              onClick={exportToCSV} 
              className="w-full flex items-center justify-center"
              variant="outline"
            >
              <Download className="w-4 h-4 mr-2" />
              Export as CSV
            </Button>
          </div>

          <div className="text-xs text-gray-500 text-center">
            <p>PDF reports include summary and details</p>
            <p>CSV files can be opened in Excel or Google Sheets</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExportModal;
