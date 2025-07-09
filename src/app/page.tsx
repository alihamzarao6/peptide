"use client";

import { useState, useEffect } from "react";
import { SearchHero } from "@/components/layout/SearchHero";
import { FilterSidebar } from "@/components/filters/FilterSidebar";
import { SortingControls } from "@/components/comparison/SortingControls";
import { ProductCard } from "@/components/comparison/ProductCard";
import { PriceHistoryModal } from "@/components/comparison/PriceHistoryModal";
import { FilterState, ViewMode, Peptide } from "@/lib/types";
import { publicApi } from "@/lib/api";
import { toast } from "sonner";

interface ApiPeptide {
  _id: string;
  name: string;
  slug: string;
  category: string;
  subcategory?: string;
  description: string;
  dosages: string[];
  unit: "mg" | "mcg" | "iu";
  tags: string[];
  image?: string;
  retailers: Array<{
    _id?: string;
    retailer_id: string;
    retailer_name: string;
    product_id: string;
    price: number;
    discounted_price?: number;
    discount_percentage?: number;
    stock: boolean;
    rating: number;
    review_count: number;
    affiliate_url: string;
    coupon_code?: string;
    size: string;
    last_updated?: string;
    variants?: Array<{
      price: number;
      discounted_price?: number;
      discount_percentage?: number;
      stock: boolean;
      coupon_code?: string;
      size: string;
    }>;
  }>;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
  // Calculator fields
  startingDose?: string;
  maintenanceDose?: string;
  frequency?: string;
  dosageNotes?: string;
  // Stack builder fields
  recommendedForGoals?: string[];
  stackDifficulty?: "Beginner" | "Intermediate" | "Advanced";
  stackTiming?: string;
  stackDuration?: number;
}

interface ApiCategory {
  id: string;
  name: string;
  slug: string;
}

interface ApiRetailer {
  id: string;
  name: string;
}

// Transform API data to frontend format
const transformPeptideData = (apiPeptide: ApiPeptide): Peptide => {
  return {
    _id: apiPeptide._id,
    id: apiPeptide._id, // For backward compatibility
    name: apiPeptide.name,
    slug: apiPeptide.slug,
    category: apiPeptide.category,
    subcategory: apiPeptide.subcategory,
    description: apiPeptide.description,
    dosages: apiPeptide.dosages,
    unit: apiPeptide.unit,
    tags: apiPeptide.tags,
    image: apiPeptide.image,
    // Handle both old and new retailer structures
    retailers: apiPeptide.retailers
      ? apiPeptide.retailers.map((retailer) => {
          // If retailer has variants (new structure)
          if (retailer.variants && retailer.variants.length > 0) {
            // Return the first variant as the main retailer data for compatibility
            const firstVariant = retailer.variants[0];
            return {
              retailer_id: retailer.retailer_id,
              product_id: retailer.product_id,
              price: firstVariant.price,
              original_price: firstVariant.price,
              discounted_price: firstVariant.discounted_price,
              discount_percentage: firstVariant.discount_percentage,
              stock: firstVariant.stock,
              rating: retailer.rating,
              review_count: retailer.review_count,
              affiliate_url: retailer.affiliate_url,
              coupon_code: firstVariant.coupon_code,
              size: firstVariant.size,
              last_updated: apiPeptide.updatedAt || new Date().toISOString(),
            };
          } else {
            // Handle old structure (direct retailer properties)
            return {
              retailer_id: retailer.retailer_id,
              product_id: retailer.product_id,
              price: retailer.price || 0,
              original_price: retailer.price || 0,
              discounted_price: retailer.discounted_price,
              discount_percentage: retailer.discount_percentage,
              stock: retailer.stock !== undefined ? retailer.stock : true,
              rating: retailer.rating || 4.5,
              review_count: retailer.review_count || 0,
              affiliate_url: retailer.affiliate_url || "",
              coupon_code: retailer.coupon_code,
              size: retailer.size || "",
              last_updated: apiPeptide.updatedAt || new Date().toISOString(),
            };
          }
        })
      : [], // Handle empty retailers array
    price_history: [], // Empty for now, will be populated if needed
    status: apiPeptide.status,
    createdAt: apiPeptide.createdAt,
    updatedAt: apiPeptide.updatedAt,
  };
};

export default function HomePage() {
  const [peptides, setPeptides] = useState<Peptide[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [companies, setCompanies] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<FilterState>({
    search: "",
    companies: [],
    categories: [],
    priceRange: { min: 0, max: 1000 },
    availability: false,
    country: "us",
  });

  const [sortBy, setSortBy] = useState<string>("name_asc");
  const [viewMode, setViewMode] = useState<ViewMode>({
    type: "grid",
    itemsPerPage: 12,
  });
  const [selectedPeptideForHistory, setSelectedPeptideForHistory] = useState<
    string | null
  >(null);
  const [filteredPeptides, setFilteredPeptides] = useState<Peptide[]>([]);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        setIsLoading(true);
        setError(null);

        const [peptidesData, categoriesData, retailersData] = await Promise.all(
          [
            publicApi.getPeptides() as Promise<ApiPeptide[]>,
            publicApi.getCategories() as Promise<ApiCategory[]>,
            publicApi.getRetailers() as Promise<ApiRetailer[]>,
          ]
        );

        // Transform API data to frontend format
        const transformedPeptides = peptidesData.map(transformPeptideData);
        setPeptides(transformedPeptides);

        // Extract category and company names
        setCategories(categoriesData.map((cat: ApiCategory) => cat.name));
        setCompanies(retailersData.map((ret: ApiRetailer) => ret.name));
      } catch (error: any) {
        console.error("Error fetching data:", error);
        const errorMessage = error.message || "Failed to load peptides";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter and sort peptides
  useEffect(() => {
    let filtered: Peptide[] = [...peptides];

    // Search filter
    if (filters.search.trim()) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(
        (peptide) =>
          peptide.name.toLowerCase().includes(searchTerm) ||
          peptide.description.toLowerCase().includes(searchTerm) ||
          peptide.tags.some((tag) => tag.toLowerCase().includes(searchTerm))
      );
    }

    // Company filter
    if (filters.companies.length > 0) {
      filtered = filtered.filter((peptide) =>
        peptide.retailers.some((retailer) => {
          // Get retailer name from the retailers array
          const retailerName = companies.find((company) =>
            peptide.retailers.some(
              (r) => r.retailer_id === company.toLowerCase().replace(/\s+/g, "")
            )
          );
          return filters.companies.includes(retailerName || "");
        })
      );
    }

    // Category filter
    if (filters.categories.length > 0) {
      filtered = filtered.filter((peptide) =>
        filters.categories.some((category) => {
          const categorySlug = category.toLowerCase().replace(/\s+/g, "-");
          return categorySlug === peptide.category;
        })
      );
    }

    // Availability filter
    if (filters.availability) {
      filtered = filtered.filter((peptide) =>
        peptide.retailers.some((retailer) => retailer.stock)
      );
    }

    // Price range filter
    filtered = filtered.filter((peptide) => {
      if (peptide.retailers.length === 0) return false;

      const prices = peptide.retailers.map(
        (r) => r.discounted_price || r.price
      );
      const minPrice = Math.min(...prices);

      return (
        minPrice >= filters.priceRange.min && minPrice <= filters.priceRange.max
      );
    });

    // Sort peptides
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name_asc":
          return a.name.localeCompare(b.name);
        case "name_desc":
          return b.name.localeCompare(a.name);
        case "price_asc": {
          const aMinPrice =
            a.retailers.length > 0
              ? Math.min(
                  ...a.retailers.map((r) => r.discounted_price || r.price)
                )
              : Infinity;
          const bMinPrice =
            b.retailers.length > 0
              ? Math.min(
                  ...b.retailers.map((r) => r.discounted_price || r.price)
                )
              : Infinity;
          return aMinPrice - bMinPrice;
        }
        case "price_desc": {
          const aMinPrice =
            a.retailers.length > 0
              ? Math.min(
                  ...a.retailers.map((r) => r.discounted_price || r.price)
                )
              : 0;
          const bMinPrice =
            b.retailers.length > 0
              ? Math.min(
                  ...b.retailers.map((r) => r.discounted_price || r.price)
                )
              : 0;
          return bMinPrice - aMinPrice;
        }
        case "rating_desc": {
          const aAvgRating =
            a.retailers.length > 0
              ? a.retailers.reduce((sum, r) => sum + r.rating, 0) /
                a.retailers.length
              : 0;
          const bAvgRating =
            b.retailers.length > 0
              ? b.retailers.reduce((sum, r) => sum + r.rating, 0) /
                b.retailers.length
              : 0;
          return bAvgRating - aAvgRating;
        }
        default:
          return 0;
      }
    });

    setFilteredPeptides(filtered);
  }, [filters, sortBy, peptides, companies]);

  const activeFiltersCount: number =
    filters.companies.length +
    filters.categories.length +
    (filters.availability ? 1 : 0) +
    (filters.priceRange.min > 0 || filters.priceRange.max < 1000 ? 1 : 0);

  const handleFiltersChange = (newFilters: FilterState): void => {
    setFilters(newFilters);
  };

  const handleSortChange = (newSort: string): void => {
    setSortBy(newSort);
  };

  const handleViewModeChange = (newViewMode: ViewMode): void => {
    setViewMode(newViewMode);
  };

  const handlePriceHistoryClick = (peptideId: string): void => {
    setSelectedPeptideForHistory(peptideId);
  };

  const handleClosePriceHistory = (): void => {
    setSelectedPeptideForHistory(null);
  };

  const handleSearchChange = (search: string): void => {
    setFilters((prev) => ({ ...prev, search }));
  };

  const handleCountryChange = (country: string): void => {
    setFilters((prev) => ({ ...prev, country }));
  };

  const clearAllFilters = (): void => {
    setFilters({
      search: "",
      companies: [],
      categories: [],
      priceRange: { min: 0, max: 1000 },
      availability: false,
      country: filters.country,
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen">
        <SearchHero
          searchQuery={filters.search}
          onSearchChange={handleSearchChange}
          selectedCountry={filters.country}
          onCountryChange={handleCountryChange}
        />
        <div className="container xl:max-w-[108rem] mx-auto px-4 sm:px-6 2xl:px-8 pb-16">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading peptides...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen">
        <SearchHero
          searchQuery={filters.search}
          onSearchChange={handleSearchChange}
          selectedCountry={filters.country}
          onCountryChange={handleCountryChange}
        />
        <div className="container xl:max-w-[108rem] mx-auto px-4 sm:px-6 2xl:px-8 pb-16">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-red-600 mb-2">
                Error Loading Data
              </h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      {/* Hero Section */}
      <SearchHero
        searchQuery={filters.search}
        onSearchChange={handleSearchChange}
        selectedCountry={filters.country}
        onCountryChange={handleCountryChange}
      />

      {/* Main Content - Mobile Safe Container */}
      <div className="w-full overflow-x-hidden">
        <div className="container xl:max-w-[108rem] mx-auto px-4 sm:px-6 2xl:px-8 pb-16">
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
            {/* Sidebar Filters - Mobile Friendly */}
            <div className="w-full lg:w-80 lg:shrink-0">
              <FilterSidebar
                filters={filters}
                onFiltersChange={handleFiltersChange}
                companies={companies}
                categories={categories}
                totalResults={filteredPeptides.length}
              />
            </div>

            {/* Main Content Area - Prevent Overflow */}
            <div className="flex-1 min-w-0 w-full overflow-x-hidden">
              {/* Sorting Controls - Now Mobile Responsive */}
              <div className="mb-6 lg:mb-8">
                <SortingControls
                  sortBy={sortBy}
                  onSortChange={handleSortChange}
                  viewMode={viewMode}
                  onViewModeChange={handleViewModeChange}
                  totalResults={peptides.length}
                  showingResults={filteredPeptides.length}
                  activeFiltersCount={activeFiltersCount}
                />
              </div>

              {/* Products Grid - Mobile Safe */}
              {filteredPeptides.length > 0 ? (
                <div
                  className={`w-full grid gap-4 2xl:gap-6 ${
                    viewMode.type === "grid"
                      ? "grid-cols-1 xl:grid-cols-2 mw1950:grid-cols-3"
                      : "grid-cols-1"
                  }`}
                >
                  {filteredPeptides.map((peptide) => (
                    <div key={peptide._id} className="w-full min-w-0">
                      <ProductCard
                        peptide={peptide}
                        onPriceHistoryClick={handlePriceHistoryClick}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="max-w-md mx-auto px-4">
                    <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-4xl">🔍</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      No peptides found
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Try adjusting your filters or search terms to find what
                      you're looking for.
                    </p>
                    <button
                      onClick={clearAllFilters}
                      className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                    >
                      Clear all filters
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Price History Modal */}
      {selectedPeptideForHistory && (
        <PriceHistoryModal
          peptideId={selectedPeptideForHistory}
          onClose={handleClosePriceHistory}
        />
      )}
    </div>
  );
}
