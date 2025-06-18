"use client";

import { useState, useEffect } from "react";
import { SearchHero } from "@/components/layout/SearchHero";
import { FilterSidebar } from "@/components/filters/FilterSidebar";
import { SortingControls } from "@/components/comparison/SortingControls";
import { ProductCard } from "@/components/comparison/ProductCard";
import { PriceHistoryModal } from "@/components/comparison/PriceHistoryModal";
import { FilterState, ViewMode, Peptide } from "@/lib/types";

// Sample data - replace with API calls
const samplePeptides: Peptide[] = [
  {
    id: "retatrutide",
    name: "Retatrutide",
    slug: "retatrutide",
    category: "fat-loss",
    description:
      "Retatrutide is an investigational once-weekly injectable peptide that acts as a triple agonist of the GLP-1, GIP, and glucagon receptors. This powerful combination targets multiple pathways involved in glucose regulation, appetite control, and weight management.",
    dosages: ["5mg", "10mg", "15mg"],
    unit: "mg",
    tags: ["GLP-1", "Weight Loss", "Diabetes"],
    retailers: [
      {
        retailer_id: "aminoasylum",
        product_id: "retatru-5mg",
        price: 174.99,
        discounted_price: 139.99,
        discount_percentage: 20,
        stock: true,
        rating: 4.8,
        review_count: 89,
        affiliate_url:
          "https://aminoasylum.shop/product/retatru/?v=0b3b97fa6688/ref/1616/",
        coupon_code: "derek",
        size: "5mg",
        last_updated: "2025-06-16T22:54:01.548466+00:00",
      },
      {
        retailer_id: "modernaminos",
        product_id: "retatrutide-5mg",
        price: 68.0,
        discounted_price: 61.2,
        discount_percentage: 10,
        stock: true,
        rating: 4.7,
        review_count: 45,
        affiliate_url:
          "https://modernaminos.com/product/retatrutide/?ref=derek",
        coupon_code: "derek",
        size: "5mg",
        last_updated: "2025-06-16T22:54:01.548466+00:00",
      },
      {
        retailer_id: "ascension",
        product_id: "retatrutide-5mg",
        price: 174.99,
        discounted_price: 139.99,
        discount_percentage: 20,
        stock: false,
        rating: 4.5,
        review_count: 67,
        affiliate_url:
          "https://ascensionpeptides.com/product/retatrutide-5mg/ref/derekpruski/",
        coupon_code: "derek",
        size: "5mg",
        last_updated: "2025-06-16T22:54:01.548466+00:00",
      },
    ],
    price_history: [],
  },
  {
    id: "nad-plus",
    name: "NAD+",
    slug: "nad-plus",
    category: "anti-aging",
    description:
      "NAD+ (nicotinamide adenine dinucleotide) is a vital coenzyme found in all living cells that acts as an electron carrier in redox reactions. It plays crucial roles in energy metabolism, DNA repair, and cellular signaling pathways.",
    dosages: ["500mg", "1000mg", "200mg"],
    unit: "mg",
    tags: ["Anti-aging", "Energy", "Longevity"],
    retailers: [
      {
        retailer_id: "prime",
        product_id: "nad-1000mg",
        price: 190.0,
        discounted_price: 171.0,
        discount_percentage: 10,
        stock: true,
        rating: 4.3,
        review_count: 34,
        affiliate_url:
          "https://primepeptides.co/products/nad?sca_ref=8658472.73VW1Vo4d1",
        size: "1000mg",
        last_updated: "2025-06-16T22:54:01.548466+00:00",
      },
      {
        retailer_id: "aminoasylum",
        product_id: "nad-500mg",
        price: 59.99,
        discounted_price: 47.99,
        discount_percentage: 20,
        stock: true,
        rating: 4.6,
        review_count: 78,
        affiliate_url: "https://aminoasylum.shop/product/nad/?ref=derek",
        coupon_code: "derek",
        size: "500mg",
        last_updated: "2025-06-16T22:54:01.548466+00:00",
      },
    ],
    price_history: [],
  },
  {
    id: "bpc-157",
    name: "BPC-157",
    slug: "bpc-157",
    category: "healing",
    description:
      "Body Protection Compound 157 is a synthetic peptide that is being investigated for its potential regenerative effects on muscles, tendons, and other soft tissues.",
    dosages: ["5mg", "10mg", "15mg"],
    unit: "mg",
    tags: ["Healing", "Recovery", "Tissue Repair"],
    retailers: [
      {
        retailer_id: "ascension",
        product_id: "bpc157-5mg",
        price: 38.99,
        discounted_price: 24.79,
        discount_percentage: 36,
        stock: true,
        rating: 4.5,
        review_count: 156,
        affiliate_url:
          "https://ascensionpeptides.com/product/bpc-157/?ref=derek",
        coupon_code: "derek",
        size: "5mg",
        last_updated: "2025-06-16T22:54:01.548466+00:00",
      },
      {
        retailer_id: "solution",
        product_id: "bpc157-5mg",
        price: 35.0,
        discounted_price: 25.5,
        discount_percentage: 27,
        stock: true,
        rating: 5.0,
        review_count: 89,
        affiliate_url:
          "https://solutionpeptides.com/product/bpc-157/?ref=derek",
        coupon_code: "derek",
        size: "5mg",
        last_updated: "2025-06-16T22:54:01.548466+00:00",
      },
    ],
    price_history: [],
  },
];

const companies = [
  "Amino Asylum",
  "Modern Aminos",
  "Ascension Peptides",
  "Simple Peptide",
  "Prime Peptides",
  "Solution Peptides",
];
const categories = [
  "Fat Loss",
  "Healing",
  "Growth Hormone",
  "Anti-Aging",
  "Nootropic",
];

export default function HomePage() {
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    companies: [],
    categories: [],
    priceRange: { min: 0, max: 1000 },
    availability: false,
    country: "us",
  });

  const [sortBy, setSortBy] = useState("name_asc");
  const [viewMode, setViewMode] = useState<ViewMode>({
    type: "grid",
    itemsPerPage: 12,
  });
  const [selectedPeptideForHistory, setSelectedPeptideForHistory] = useState<
    string | null
  >(null);
  const [filteredPeptides, setFilteredPeptides] =
    useState<Peptide[]>(samplePeptides);

  // Filter and sort peptides
  useEffect(() => {
    let filtered = [...samplePeptides];

    // Search filter
    if (filters.search) {
      filtered = filtered.filter(
        (peptide) =>
          peptide.name.toLowerCase().includes(filters.search.toLowerCase()) ||
          peptide.description
            .toLowerCase()
            .includes(filters.search.toLowerCase())
      );
    }

    // Company filter
    if (filters.companies.length > 0) {
      filtered = filtered.filter((peptide) =>
        peptide.retailers.some((retailer) =>
          filters.companies.some((company) =>
            company
              .toLowerCase()
              .replace(/\s+/g, "")
              .includes(retailer.retailer_id.toLowerCase())
          )
        )
      );
    }

    // Category filter
    if (filters.categories.length > 0) {
      filtered = filtered.filter((peptide) =>
        filters.categories.some(
          (category) =>
            category.toLowerCase().replace(/\s+/g, "-") === peptide.category
        )
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
      const minPrice = Math.min(
        ...peptide.retailers.map((r) => r.discounted_price || r.price)
      );
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
        case "price_asc":
          const aMinPrice = Math.min(
            ...a.retailers.map((r) => r.discounted_price || r.price)
          );
          const bMinPrice = Math.min(
            ...b.retailers.map((r) => r.discounted_price || r.price)
          );
          return aMinPrice - bMinPrice;
        case "price_desc":
          const aMaxPrice = Math.min(
            ...a.retailers.map((r) => r.discounted_price || r.price)
          );
          const bMaxPrice = Math.min(
            ...b.retailers.map((r) => r.discounted_price || r.price)
          );
          return bMaxPrice - aMaxPrice;
        case "rating_desc":
          const aAvgRating =
            a.retailers.reduce((sum, r) => sum + r.rating, 0) /
            a.retailers.length;
          const bAvgRating =
            b.retailers.reduce((sum, r) => sum + r.rating, 0) /
            b.retailers.length;
          return bAvgRating - aAvgRating;
        default:
          return 0;
      }
    });

    setFilteredPeptides(filtered);
  }, [filters, sortBy]);

  const activeFiltersCount =
    filters.companies.length +
    filters.categories.length +
    (filters.availability ? 1 : 0) +
    (filters.priceRange.min > 0 || filters.priceRange.max < 1000 ? 1 : 0);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <SearchHero
        searchQuery={filters.search}
        onSearchChange={(search) => setFilters({ ...filters, search })}
        selectedCountry={filters.country}
        onCountryChange={(country) => setFilters({ ...filters, country })}
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 2xl:px-8 pb-16">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="lg:w-80 shrink-0">
            <FilterSidebar
              filters={filters}
              onFiltersChange={setFilters}
              companies={companies}
              categories={categories}
              totalResults={filteredPeptides.length}
            />
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            {/* Sorting Controls */}
            <div className="mb-8">
              <SortingControls
                sortBy={sortBy}
                onSortChange={setSortBy}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                totalResults={samplePeptides.length}
                showingResults={filteredPeptides.length}
                activeFiltersCount={activeFiltersCount}
              />
            </div>

            {/* Products Grid */}
            {filteredPeptides.length > 0 ? (
              <div
                className={`grid gap-4 2xl:gap-6 ${
                  viewMode.type === "grid"
                    ? "grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3"
                    : "grid-cols-1"
                }`}
              >
                {filteredPeptides.map((peptide) => (
                  <ProductCard
                    key={peptide.id}
                    peptide={peptide}
                    onPriceHistoryClick={setSelectedPeptideForHistory}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="max-w-md mx-auto">
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
                    onClick={() =>
                      setFilters({
                        search: "",
                        companies: [],
                        categories: [],
                        priceRange: { min: 0, max: 1000 },
                        availability: false,
                        country: filters.country,
                      })
                    }
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Clear all filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Price History Modal */}
      {selectedPeptideForHistory && (
        <PriceHistoryModal
          peptideId={selectedPeptideForHistory}
          onClose={() => setSelectedPeptideForHistory(null)}
        />
      )}
    </div>
  );
}
