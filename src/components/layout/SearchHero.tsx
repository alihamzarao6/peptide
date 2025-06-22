"use client";

import { useState } from "react";
import { Search, TestTube2, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface SearchHeroProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCountry: string;
  onCountryChange: (country: string) => void;
}

const countries = [
  { code: "us", name: "United States", flag: "🇺🇸", currency: "USD" },
  { code: "ca", name: "Canada", flag: "🇨🇦", currency: "CAD" },
  { code: "eu", name: "European Union", flag: "🇪🇺", currency: "EUR" },
];

export function SearchHero({
  searchQuery,
  onSearchChange,
  selectedCountry,
  onCountryChange,
}: SearchHeroProps) {
  return (
    <div className="relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"></div>
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="text-center max-w-4xl mx-auto">
          {/* Hero Content */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-600 rounded-2xl blur-lg opacity-30 animate-pulse"></div>
              <div className="relative p-4 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl shadow-2xl">
                <TestTube2 className="h-12 w-12 text-white" />
              </div>
            </div>
            <div className="text-left">
              <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 bg-clip-text text-transparent leading-tight">
                Compare Peptide Prices
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <Sparkles className="h-5 w-5 text-yellow-500" />
                <span className="text-gray-600 font-medium">
                  Find the Best Deals
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-xl text-gray-600 mb-12 leading-relaxed max-w-3xl mx-auto">
            Find the best deals on peptides from top retailers in one place. Use
            the coupon codes below for the best discounts, it also supports the
            site.
          </p>

          {/* Search Section */}
          <div className="max-w-3xl mx-auto">
            <div className="flex flex-col lg:flex-row items-center gap-4 p-2 glass-effect rounded-2xl shadow-2xl border border-white/20">
              {/* Search Input */}
              <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search peptides... (e.g., BPC-157, Retatrutide)"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="pl-12 pr-4 py-4 text-lg border-0 bg-transparent focus:ring-2 focus:ring-blue-500/20 placeholder:text-gray-400"
                />
              </div>

              {/* Country Selection */}
              <div className="flex items-center gap-2 bg-white/50 backdrop-blur-sm rounded-xl p-2 border border-white/30">
                {countries.map((country) => (
                  <Button
                    key={country.code}
                    variant={
                      selectedCountry === country.code ? "default" : "ghost"
                    }
                    size="sm"
                    onClick={() => onCountryChange(country.code)}
                    className={`h-12 w-16 text-2xl p-0 transition-all duration-300 cursor-pointer ${
                      selectedCountry === country.code
                        ? "gradient-primary text-white shadow-lg scale-110"
                        : "hover:bg-white/80 hover:scale-105"
                    }`}
                    title={`${country.name} (${country.currency})`}
                  >
                    {country.flag}
                  </Button>
                ))}
              </div>
            </div>

            {/* Selected Country Info */}
            {selectedCountry && (
              <div className="mt-4 flex justify-center">
                <Badge
                  variant="secondary"
                  className="px-4 py-2 text-sm font-medium bg-white/80 backdrop-blur-sm border border-white/30"
                >
                  Showing results for{" "}
                  {countries.find((c) => c.code === selectedCountry)?.name}(
                  {countries.find((c) => c.code === selectedCountry)?.currency})
                </Badge>
              </div>
            )}

            {/* Quick Stats */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
              <div className="glass-effect rounded-xl p-4 border border-white/20">
                <div className="text-2xl font-bold text-blue-600">50+</div>
                <div className="text-sm text-gray-600">Peptides</div>
              </div>
              <div className="glass-effect rounded-xl p-4 border border-white/20">
                <div className="text-2xl font-bold text-green-600">12</div>
                <div className="text-sm text-gray-600">Retailers</div>
              </div>
              <div className="glass-effect rounded-xl p-4 border border-white/20">
                <div className="text-2xl font-bold text-purple-600">24/7</div>
                <div className="text-sm text-gray-600">Updated</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
