"use client";

import { ArrowUpDown, Grid3X3, List, Filter, ChevronDown } from "lucide-react";
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
import { useState } from "react";

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
  const [isExpanded, setIsExpanded] = useState(false);

  const currentSortLabel =
    sortOptions.find((option) => option.value === sortBy)?.label ||
    "Name (A-Z)";

  return (
    <div className="glass-effect rounded-xl border border-white/30 shadow-lg overflow-hidden">
      {/* Mobile Header - Always Visible */}
      <div className="p-4 lg:p-6">
        <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
          {/* Results Info & Filters */}
          <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
            <div className="text-sm text-gray-600">
              Showing{" "}
              <span className="font-semibold text-gray-900">
                {showingResults}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-gray-900">
                {totalResults}
              </span>{" "}
              products
            </div>
            {activeFiltersCount > 0 && (
              <Badge
                variant="secondary"
                className="bg-blue-100 text-blue-700 border-blue-200 w-fit"
              >
                <Filter className="h-3 w-3 mr-1" />
                {activeFiltersCount} filter{activeFiltersCount !== 1 ? "s" : ""}
              </Badge>
            )}
          </div>

          {/* Mobile Toggle Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="lg:hidden bg-white/70 hover:bg-white border-gray-200 w-full sm:w-auto"
          >
            <ArrowUpDown className="h-4 w-4 mr-2" />
            Sort & View Options
            <ChevronDown
              className={`h-4 w-4 ml-2 transition-transform ${
                isExpanded ? "rotate-180" : ""
              }`}
            />
          </Button>

          {/* Desktop Controls - Always Visible on Large Screens */}
          <div className="hidden lg:flex lg:items-center lg:gap-4">
            {/* Sort Controls */}
            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                Sort by:
              </span>
            </div>

            <div className="flex items-center gap-2">
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

        {/* Mobile Expanded Controls */}
        {isExpanded && (
          <div className="lg:hidden mt-4 pt-4 border-t border-gray-200 space-y-4">
            {/* Sort Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4" />
                Sort by:
              </label>
              <Select value={sortBy} onValueChange={onSortChange}>
                <SelectTrigger className="w-full bg-white">
                  <SelectValue placeholder="Select sorting option">
                    {currentSortLabel}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="!bg-white">
                  {sortOptions.map((option) => (
                    <SelectItem key={option.key} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* View Mode Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                View Mode:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={viewMode.type === "grid" ? "default" : "outline"}
                  onClick={() =>
                    onViewModeChange({ ...viewMode, type: "grid" })
                  }
                  className={`justify-center ${
                    viewMode.type === "grid"
                      ? "gradient-primary text-white"
                      : "bg-white/70 hover:bg-white border-gray-200"
                  }`}
                >
                  <Grid3X3 className="h-4 w-4 mr-2" />
                  Grid
                </Button>
                <Button
                  variant={viewMode.type === "table" ? "default" : "outline"}
                  onClick={() =>
                    onViewModeChange({ ...viewMode, type: "table" })
                  }
                  className={`justify-center ${
                    viewMode.type === "table"
                      ? "gradient-primary text-white"
                      : "bg-white/70 hover:bg-white border-gray-200"
                  }`}
                >
                  <List className="h-4 w-4 mr-2" />
                  Table
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
