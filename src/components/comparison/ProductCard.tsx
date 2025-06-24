"use client";

import { useState } from "react";
import {
  ChevronDown,
  ExternalLink,
  Star,
  TrendingUp,
  Package,
  Timer,
  Badge as BadgeIcon,
  Zap,
  Heart,
  Brain,
  Clock,
  Target,
  Copy,
  Check,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Peptide } from "@/lib/types";
import { toast } from "sonner";

interface ProductCardProps {
  peptide: Peptide;
  onPriceHistoryClick: (peptideId: string) => void;
}

const categoryIcons: Record<string, any> = {
  "fat-loss": Zap,
  healing: Heart,
  "growth-hormone": TrendingUp,
  "anti-aging": Clock,
  nootropic: Brain,
};

const categoryColors: Record<string, string> = {
  "fat-loss": "bg-red-100 text-red-700 border-red-200",
  healing: "bg-green-100 text-green-700 border-green-200",
  "growth-hormone": "bg-blue-100 text-blue-700 border-blue-200",
  "anti-aging": "bg-purple-100 text-purple-700 border-purple-200",
  nootropic: "bg-yellow-100 text-yellow-700 border-yellow-200",
};

const retailerColors: Record<string, string> = {
  aminoasylum: "from-blue-500 to-blue-600",
  modernaminos: "from-green-500 to-green-600",
  ascension: "from-purple-500 to-purple-600",
  simple: "from-amber-500 to-amber-600",
  prime: "from-red-500 to-red-600",
  solution: "from-cyan-500 to-cyan-600",
};

const retailerNames: Record<string, string> = {
  aminoasylum: "Amino Asylum",
  modernaminos: "Modern Aminos",
  ascension: "Ascension Peptides",
  simple: "Simple Peptide",
  prime: "Prime Peptides",
  solution: "Solution Peptides",
};

export function ProductCard({
  peptide,
  onPriceHistoryClick,
}: ProductCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAllRetailers, setShowAllRetailers] = useState(false);
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);

  const visibleRetailers = showAllRetailers
    ? peptide.retailers
    : peptide.retailers.slice(0, 3);
  const hiddenRetailersCount = peptide.retailers.length - 3;

  const bestPrice = Math.min(
    ...peptide.retailers.map((r) => r.discounted_price || r.price)
  );
  const bestValueRetailer = peptide.retailers.find(
    (r) => (r.discounted_price || r.price) === bestPrice
  );

  const CategoryIcon = categoryIcons[peptide.category] || Target;

  const copyCode = async (code: string, retailerName: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCoupon(code);
      toast.success(`Copied ${code} for ${retailerName}!`);
      setTimeout(() => setCopiedCoupon(null), 2000);
    } catch (err) {
      toast.error("Failed to copy code");
    }
  };

  const formatRetailerName = (id: string): string => {
    return retailerNames[id] || id.replace(/([A-Z])/g, " $1").trim();
  };

  const calculatePerMgPrice = (price: number, size: string): number => {
    const sizeNumber = parseFloat(size.replace(/[^0-9.]/g, ""));
    return price / sizeNumber;
  };

  return (
    <Card className="group hover-lift gradient-card border-white/60 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                {peptide.name}
              </h3>
              <Badge
                className={`${
                  categoryColors[peptide.category] ||
                  "bg-gray-100 text-gray-700 border-gray-200"
                } font-medium`}
              >
                {/* <CategoryIcon className="h-3 w-3 mr-1" /> */}
                {peptide.category
                  .replace("-", " ")
                  .split(" ")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ")}
              </Badge>
            </div>

            {/* Dosage Options */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm text-gray-600 font-medium">
                Available sizes:
              </span>
              {peptide.dosages.map((dosage) => (
                <Badge
                  key={dosage}
                  variant="outline"
                  className="text-xs bg-white/70 border-gray-300"
                >
                  {dosage}
                </Badge>
              ))}
            </div>

            {/* Tags */}
            {peptide.tags && peptide.tags.length > 0 && (
              <div className="flex items-center gap-2 mb-3">
                {peptide.tags.slice(0, 3).map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                  >
                    {tag}
                  </Badge>
                ))}
                {peptide.tags.length > 3 && (
                  <Badge
                    variant="secondary"
                    className="text-xs bg-gray-50 text-gray-600"
                  >
                    +{peptide.tags.length - 3} more
                  </Badge>
                )}
              </div>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPriceHistoryClick(peptide._id || peptide.id)}
            className="shrink-0 ml-4 bg-white/70 hover:bg-white border-gray-200 hover:border-blue-300 hover:text-blue-700 transition-all duration-200 cursor-pointer"
          >
            <TrendingUp className="h-4 w-4 mr-1" />
            Price History
          </Button>
        </div>

        {/* Description */}
        <div className="mb-4">
          <p
            className={`text-gray-600 leading-relaxed transition-all duration-300 ${
              isExpanded ? "" : "line-clamp-2"
            }`}
          >
            {peptide.description}
          </p>
          {peptide.description.length > 150 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-1 h-6 px-0 text-blue-600 hover:text-blue-700 hover:bg-transparent cursor-pointer"
            >
              {isExpanded ? "Show Less" : "Show More"}
              <ChevronDown
                className={`h-3 w-3 ml-1 transition-transform ${
                  isExpanded ? "rotate-180" : ""
                }`}
              />
            </Button>
          )}
        </div>
      </div>

      <Separator className="bg-gray-200/50" />

      {/* Pricing Section */}
      <div className="p-6 pt-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
            <BadgeIcon className="h-4 w-4 text-blue-600" />
            Prices shown:
          </h4>
          <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white font-medium">
            $ With Discount
          </Badge>
        </div>

        {/* Retailers */}
        <div className="space-y-3">
          {visibleRetailers.map((retailer, index) => (
            <div
              key={`${retailer.retailer_id}-${retailer.size}`}
              className="group/retailer p-4 rounded-xl bg-white/60 border border-white/80 hover:bg-white/90 hover:border-blue-200 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div
                    className={`w-3 h-3 rounded-full bg-gradient-to-r ${
                      retailerColors[retailer.retailer_id] ||
                      "from-gray-400 to-gray-500"
                    }`}
                  ></div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900">
                        {formatRetailerName(retailer.retailer_id)}
                      </span>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs text-gray-600">
                          {retailer.rating}
                        </span>
                        <span className="text-xs text-gray-400">
                          ({retailer.review_count})
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="text-xs h-5">
                        {retailer.size}
                      </Badge>
                      {retailer.stock ? (
                        <Badge className="bg-green-100 text-green-700 border-green-200 text-xs h-5">
                          <Package className="h-2 w-2 mr-1" />
                          In Stock
                        </Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-700 border-red-200 text-xs h-5">
                          <Timer className="h-2 w-2 mr-1" />
                          Out of Stock
                        </Badge>
                      )}
                      {retailer.coupon_code && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            copyCode(
                              retailer.coupon_code!,
                              formatRetailerName(retailer.retailer_id)
                            )
                          }
                          className="h-5 px-2 text-xs bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 cursor-pointer"
                        >
                          {copiedCoupon === retailer.coupon_code ? (
                            <Check className="h-2 w-2 mr-1" />
                          ) : (
                            <Copy className="h-2 w-2 mr-1" />
                          )}
                          {retailer.coupon_code}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    {retailer.discounted_price &&
                    retailer.discounted_price !== retailer.price ? (
                      <div>
                        <div className="text-lg font-bold text-green-600">
                          ${retailer.discounted_price}
                        </div>
                        <div className="text-sm text-gray-500 line-through">
                          ${retailer.price}
                        </div>
                        <div className="text-xs text-green-600 font-medium">
                          Save {retailer.discount_percentage}%
                        </div>
                      </div>
                    ) : (
                      <div className="text-lg font-bold text-gray-900">
                        ${retailer.price}
                      </div>
                    )}
                    <div className="text-xs text-gray-500">
                      $
                      {calculatePerMgPrice(
                        retailer.discounted_price || retailer.price,
                        retailer.size
                      ).toFixed(2)}
                      /mg
                    </div>
                  </div>

                  <Button
                    size="sm"
                    className={`bg-gradient-to-r ${
                      retailerColors[retailer.retailer_id] ||
                      "from-gray-500 to-gray-600"
                    } hover:shadow-lg transition-all duration-300 group-hover/retailer:scale-105 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer`}
                    disabled={!retailer.stock}
                    onClick={() => {
                      window.open(retailer.affiliate_url, "_blank");
                      toast.success(
                        `Redirecting to ${formatRetailerName(
                          retailer.retailer_id
                        )}...`
                      );
                    }}
                  >
                    {retailer.stock ? (
                      <>
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Buy
                      </>
                    ) : (
                      "Out of Stock"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Show More Retailers */}
        {hiddenRetailersCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAllRetailers(!showAllRetailers)}
            className="w-full mt-3 bg-white/50 hover:bg-white border-gray-200 hover:border-blue-300 transition-all duration-200 cursor-pointer"
          >
            {showAllRetailers ? (
              <>
                Show Less
                <ChevronDown className="h-4 w-4 ml-2 rotate-180" />
              </>
            ) : (
              <>
                Show {hiddenRetailersCount} More Retailer
                {hiddenRetailersCount !== 1 ? "s" : ""}
                <ChevronDown className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        )}

        {/* Best Price & Value Indicators */}
        {bestValueRetailer && (
          <div className="mt-4 p-3 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-800">
                  Best Price: ${bestPrice} at{" "}
                  {formatRetailerName(bestValueRetailer.retailer_id)}
                </span>
              </div>
              <Badge className="bg-green-100 text-green-700 border-green-300 text-xs">
                Best Deal
              </Badge>
            </div>
            <div className="text-xs text-green-600 mt-1">
              Best Value: $
              {calculatePerMgPrice(
                bestValueRetailer.discounted_price || bestValueRetailer.price,
                bestValueRetailer.size
              ).toFixed(2)}
              /mg
            </div>
            {bestValueRetailer.coupon_code && (
              <div className="text-xs text-green-600 mt-1">
                💡 Use code <strong>{bestValueRetailer.coupon_code}</strong> for
                additional savings
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
