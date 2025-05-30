
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X } from "lucide-react";

interface Category {
  id: number;
  name: string;
  color: string;
}

interface FilterModalProps {
  categories: Category[];
  activeFilters: any;
  onApplyFilters: (filters: any) => void;
  onClose: () => void;
}

const FilterModal = ({ categories, activeFilters, onApplyFilters, onClose }: FilterModalProps) => {
  const [filters, setFilters] = useState(activeFilters);

  const handleApply = () => {
    onApplyFilters(filters);
  };

  const handleReset = () => {
    const resetFilters = { dateRange: 'all', category: 'all' };
    setFilters(resetFilters);
    onApplyFilters(resetFilters);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 z-50">
      <Card className="w-full max-w-xs mx-auto max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base">Filter Expenses</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Date Range Filter */}
          <div className="space-y-2">
            <Label className="text-sm">Date Range</Label>
            <div className="grid grid-cols-2 gap-1">
              {[
                { value: 'all', label: 'All Time' },
                { value: 'today', label: 'Today' },
                { value: 'week', label: 'This Week' },
                { value: 'month', label: 'This Month' },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFilters(prev => ({ ...prev, dateRange: option.value }))}
                  className={`p-2 rounded-lg border-2 text-xs font-medium transition-all ${
                    filters.dateRange === option.value
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <Label className="text-sm">Category</Label>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              <button
                type="button"
                onClick={() => setFilters(prev => ({ ...prev, category: 'all' }))}
                className={`w-full p-2 rounded-lg border-2 text-xs font-medium transition-all ${
                  filters.category === 'all'
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                All Categories
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setFilters(prev => ({ ...prev, category: category.name }))}
                  className={`w-full p-2 rounded-lg border-2 text-xs font-medium transition-all flex items-center gap-2 ${
                    filters.category === category.name
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div 
                    className="w-3 h-3 rounded-full flex-shrink-0" 
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="truncate">{category.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={handleReset} className="flex-1 text-xs">
              Reset
            </Button>
            <Button onClick={handleApply} className="flex-1 text-xs">
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FilterModal;
