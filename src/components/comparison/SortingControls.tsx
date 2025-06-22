"use client";

import { ArrowUpDown, Grid3X3, List, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SortOption, ViewMode } from "@/lib/types";

interface SortingControlsProps {
  sortBy: string;
  onSortChange: (sort: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  totalResults: number;
  showingResults: number;
  activeFiltersCount: number;
}

const sortOptions: SortOption[] = [
  { key: "name_asc", label: "Name (A-Z)", value: "name_asc" },
  { key: "name_desc", label: "Name (Z-A)", value: "name_desc" },
  { key: "price_asc", label: "Price (Low-High)", value: "price_asc" },
  { key: "price_desc", label: "Price (High-Low)", value: "price_desc" },
  { key: "rating_desc", label: "Rating (High-Low)", value: "rating_desc" },
];

export function SortingControls({
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  totalResults,
  showingResults,
  activeFiltersCount,
}: SortingControlsProps) {
  return (
    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-6 glass-effect rounded-xl border border-white/30 shadow-lg">
      {/* Results Info & Filters */}
      <div className="flex items-center gap-4">
        <div className="text-sm text-gray-600">
          Showing{" "}
          <span className="font-semibold text-gray-900">{showingResults}</span>{" "}
          of <span className="font-semibold text-gray-900">{totalResults}</span>{" "}
          products
        </div>
        {activeFiltersCount > 0 && (
          <Badge
            variant="secondary"
            className="bg-blue-100 text-blue-700 border-blue-200"
          >
            <Filter className="h-3 w-3 mr-1" />
            {activeFiltersCount} filter{activeFiltersCount !== 1 ? "s" : ""}
          </Badge>
        )}
      </div>

      {/* Sort & View Controls */}
      <div className="flex items-center gap-3 w-full lg:w-auto">
        {/* Sort By */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
            Sort by:
          </span>
        </div>

        <div className="flex items-center gap-2 flex-1 lg:flex-initial">
          {sortOptions.map((option) => (
            <Button
              key={option.key}
              variant={sortBy === option.value ? "default" : "outline"}
              size="sm"
              onClick={() => onSortChange(option.value)}
              className={`text-xs whitespace-nowrap transition-all duration-200 cursor-pointer ${
                sortBy === option.value
                  ? "gradient-primary text-white shadow-md"
                  : "bg-white/70 hover:bg-white hover:shadow-sm border-gray-200"
              }`}
            >
              {option.label}
            </Button>
          ))}
        </div>

        {/* View Toggle */}
        <div className="flex items-center bg-white/70 rounded-lg p-1 border border-gray-200 shadow-sm">
          <Button
            variant={viewMode.type === "grid" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange({ ...viewMode, type: "grid" })}
            className={`h-8 w-8 p-0 transition-all duration-200 cursor-pointer ${
              viewMode.type === "grid"
                ? "gradient-primary text-white shadow-sm"
                : "hover:bg-gray-100"
            }`}
            title="Grid View"
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode.type === "table" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange({ ...viewMode, type: "table" })}
            className={`h-8 w-8 p-0 transition-all duration-200 cursor-pointer ${
              viewMode.type === "table"
                ? "gradient-primary text-white shadow-sm"
                : "hover:bg-gray-100"
            }`}
            title="Table View"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
