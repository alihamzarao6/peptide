"use client";

import { useState } from "react";
import {
  ChevronUp,
  SlidersHorizontal,
  Building2,
  Tag,
  DollarSign,
  Package,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CompanyFilter } from "./CompanyFilter";
import { CategoryFilter } from "./CategoryFilter";
import { PriceRangeFilter } from "./PriceRangeFilter";
import { AvailabilityFilter } from "./AvailabilityFilter";
import { FilterState } from "@/lib/types";

interface FilterSidebarProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  companies: string[];
  categories: string[];
  totalResults: number;
}

export function FilterSidebar({
  filters,
  onFiltersChange,
  companies,
  categories,
  totalResults,
}: FilterSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const activeFiltersCount =
    filters.companies.length +
    filters.categories.length +
    (filters.availability ? 1 : 0) +
    (filters.priceRange.min > 0 || filters.priceRange.max < 1000 ? 1 : 0);

  const resetFilters = () => {
    onFiltersChange({
      search: filters.search,
      companies: [],
      categories: [],
      priceRange: { min: 0, max: 1000 },
      availability: false,
      country: filters.country,
    });
  };

  return (
    <Card className="sticky top-24 gradient-card border-white/60 shadow-xl backdrop-blur-sm">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <SlidersHorizontal className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900">Filters</h3>
              <p className="text-sm text-gray-500">
                {totalResults} products found
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 w-8 p-0 hover:bg-blue-50"
          >
            <ChevronUp
              className={`h-4 w-4 transition-transform duration-300 ${
                isExpanded ? "rotate-180" : ""
              }`}
            />
          </Button>
        </div>

        {/* Active Filters Summary */}
        {activeFiltersCount > 0 && (
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              {activeFiltersCount} active filter
              {activeFiltersCount !== 1 ? "s" : ""}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="h-7 px-2 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Reset
            </Button>
          </div>
        )}
      </div>

      {/* Filter Content */}
      {isExpanded && (
        <div className="px-6 pb-6 space-y-6">
          {/* Company Filter */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-gray-500" />
              <label className="font-semibold text-sm text-gray-700">
                Company
              </label>
              {filters.companies.length > 0 && (
                <Badge variant="outline" className="h-5 text-xs">
                  {filters.companies.length}
                </Badge>
              )}
            </div>
            <CompanyFilter
              selectedCompanies={filters.companies}
              companies={companies}
              onChange={(companies: any) =>
                onFiltersChange({ ...filters, companies })
              }
            />
          </div>

          <Separator className="bg-gray-200/50" />

          {/* Categories Filter */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-gray-500" />
              <label className="font-semibold text-sm text-gray-700">
                Categories
              </label>
              {filters.categories.length > 0 && (
                <Badge variant="outline" className="h-5 text-xs">
                  {filters.categories.length}
                </Badge>
              )}
            </div>
            <CategoryFilter
              selectedCategories={filters.categories}
              categories={categories}
              onChange={(categories: any) =>
                onFiltersChange({ ...filters, categories })
              }
            />
          </div>

          <Separator className="bg-gray-200/50" />

          {/* Price Range Filter */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-gray-500" />
              <label className="font-semibold text-sm text-gray-700">
                Price Range
              </label>
              {(filters.priceRange.min > 0 ||
                filters.priceRange.max < 1000) && (
                <Badge variant="outline" className="h-5 text-xs">
                  ${filters.priceRange.min}-${filters.priceRange.max}
                </Badge>
              )}
            </div>
            <PriceRangeFilter
              priceRange={filters.priceRange}
              onChange={(priceRange: any) =>
                onFiltersChange({ ...filters, priceRange })
              }
            />
          </div>

          <Separator className="bg-gray-200/50" />

          {/* Availability Filter */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-gray-500" />
              <label className="font-semibold text-sm text-gray-700">
                Availability
              </label>
            </div>
            <AvailabilityFilter
              availability={filters.availability}
              onChange={(availability: any) =>
                onFiltersChange({ ...filters, availability })
              }
            />
          </div>
        </div>
      )}
    </Card>
  );
}
