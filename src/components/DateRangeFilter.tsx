
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, CalendarIcon } from "lucide-react";

interface DateRangeFilterProps {
  onFilterChange: (filter: { type: string; startDate?: string; endDate?: string }) => void;
  initialFilter?: { type: string; startDate?: string; endDate?: string };
}

const DateRangeFilter = ({ onFilterChange, initialFilter }: DateRangeFilterProps) => {
  const [filterType, setFilterType] = useState(initialFilter?.type || 'all');
  const [startDate, setStartDate] = useState(initialFilter?.startDate || '');
  const [endDate, setEndDate] = useState(initialFilter?.endDate || '');

  const handleFilterTypeChange = (type: string) => {
    setFilterType(type);
    
    const today = new Date();
    let filter: { type: string; startDate?: string; endDate?: string } = { type };
    
    switch (type) {
      case 'today':
        filter = { type, startDate: today.toISOString().split('T')[0], endDate: today.toISOString().split('T')[0] };
        break;
      case 'week':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        filter = { type, startDate: weekStart.toISOString().split('T')[0], endDate: weekEnd.toISOString().split('T')[0] };
        break;
      case 'month':
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        filter = { type, startDate: monthStart.toISOString().split('T')[0], endDate: monthEnd.toISOString().split('T')[0] };
        break;
      case 'year':
        const yearStart = new Date(today.getFullYear(), 0, 1);
        const yearEnd = new Date(today.getFullYear(), 11, 31);
        filter = { type, startDate: yearStart.toISOString().split('T')[0], endDate: yearEnd.toISOString().split('T')[0] };
        break;
      default:
        filter = { type };
    }
    
    onFilterChange(filter);
  };

  const handleCustomDateChange = () => {
    if (startDate && endDate) {
      onFilterChange({ type: 'custom', startDate, endDate });
    }
  };

  return (
    <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4 text-gray-600" />
        <Label className="text-sm font-medium">Date Range</Label>
      </div>
      
      <Select value={filterType} onValueChange={handleFilterTypeChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select date range" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Time</SelectItem>
          <SelectItem value="today">Today</SelectItem>
          <SelectItem value="week">This Week</SelectItem>
          <SelectItem value="month">This Month</SelectItem>
          <SelectItem value="year">This Year</SelectItem>
          <SelectItem value="custom">Custom Range</SelectItem>
        </SelectContent>
      </Select>

      {filterType === 'custom' && (
        <div className="space-y-2">
          <div>
            <Label className="text-xs">Start Date</Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-xs">End Date</Label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="mt-1"
            />
          </div>
          <Button 
            onClick={handleCustomDateChange} 
            size="sm" 
            className="w-full"
            disabled={!startDate || !endDate}
          >
            Apply Custom Range
          </Button>
        </div>
      )}
    </div>
  );
};

export default DateRangeFilter;
