
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg">Filter Expenses</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Date Range Filter */}
          <div className="space-y-2">
            <Label>Date Range</Label>
            <div className="grid grid-cols-2 gap-2">
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
                  className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
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
            <Label>Category</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFilters(prev => ({ ...prev, category: 'all' }))}
                className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
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
                  className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                    filters.category === category.name
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div 
                    className="w-3 h-3 rounded-full mx-auto mb-1" 
                    style={{ backgroundColor: category.color }}
                  />
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={handleReset} className="flex-1">
              Reset
            </Button>
            <Button onClick={handleApply} className="flex-1">
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FilterModal;
