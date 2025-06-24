"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getCategoryColor } from "@/lib/dynamicUtils";

interface CategoryFilterProps {
  selectedCategories: string[];
  categories: string[];
  onChange: (categories: string[]) => void;
}

export function CategoryFilter({
  selectedCategories,
  categories,
  onChange,
}: CategoryFilterProps) {
  const handleCategoryToggle = (category: string) => {
    if (selectedCategories.includes(category)) {
      onChange(selectedCategories.filter((c) => c !== category));
    } else {
      onChange([...selectedCategories, category]);
    }
  };

  return (
    <Select>
      <SelectTrigger className="w-full bg-white/50 border-gray-200 hover:bg-white/80 transition-colors">
        <SelectValue
          placeholder={
            selectedCategories.length > 0
              ? `${selectedCategories.length} selected`
              : "Select categories"
          }
        />
      </SelectTrigger>
      <SelectContent className="glass-effect border-white/30">
        <div className="p-2 space-y-2 max-h-64 overflow-y-auto">
          {categories.map((category) => (
            <div
              key={category}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-blue-50/50 transition-colors"
            >
              <Checkbox
                id={category}
                checked={selectedCategories.includes(category)}
                onCheckedChange={() => handleCategoryToggle(category)}
                className="border-gray-300"
              />
              <label
                htmlFor={category}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
              >
                <Badge
                  variant="outline"
                  className={`${getCategoryColor(category)} font-normal`}
                >
                  {category}
                </Badge>
              </label>
            </div>
          ))}
        </div>
      </SelectContent>
    </Select>
  );
}
