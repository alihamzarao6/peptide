import React from "react";
import {
  X,
  TestTube2,
  Tag,
  DollarSign,
  Package,
  Star,
  ExternalLink,
  Calendar,
  Target,
  Clock,
  Brain,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AdminPeptide } from "@/lib/types";

interface ViewPeptideModalProps {
  peptide: AdminPeptide | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (peptide: AdminPeptide) => void;
}

const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    "fat-loss": "bg-red-100 text-red-700 border-red-200",
    healing: "bg-green-100 text-green-700 border-green-200",
    "growth-hormone": "bg-blue-100 text-blue-700 border-blue-200",
    "anti-aging": "bg-purple-100 text-purple-700 border-purple-200",
    nootropic: "bg-yellow-100 text-yellow-700 border-yellow-200",
    cognitive: "bg-yellow-100 text-yellow-700 border-yellow-200",
    recovery: "bg-green-100 text-green-700 border-green-200",
    longevity: "bg-purple-100 text-purple-700 border-purple-200",
  };
  return colors[category] || "bg-gray-100 text-gray-700 border-gray-200";
};

const getStatusColor = (status: string): string => {
  return status === "active"
    ? "bg-green-100 text-green-700 border-green-200"
    : "bg-gray-100 text-gray-700 border-gray-200";
};

export function ViewPeptideModal({
  peptide,
  isOpen,
  onClose,
  onEdit,
}: ViewPeptideModalProps) {
  if (!peptide) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto gradient-card border-white/60">
        <DialogHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TestTube2 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-gray-900">
                  {peptide.name}
                </DialogTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={getCategoryColor(peptide.category)}>
                    {peptide.category.replace("-", " ").toUpperCase()}
                  </Badge>
                  <Badge className={getStatusColor(peptide.status)}>
                    {peptide.status.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-effect rounded-lg p-4 border border-white/30">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <TestTube2 className="h-5 w-5 text-blue-600" />
                Basic Information
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Name:
                  </label>
                  <p className="text-gray-900">{peptide.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Slug:
                  </label>
                  <p className="text-gray-600 font-mono text-sm">
                    {peptide.slug}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Unit:
                  </label>
                  <p className="text-gray-900">{peptide.unit}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Description:
                  </label>
                  <p className="text-gray-900 leading-relaxed">
                    {peptide.description}
                  </p>
                </div>
              </div>
            </div>

            <div className="glass-effect rounded-lg p-4 border border-white/30">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-green-600" />
                Metadata
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Created:
                  </label>
                  <p className="text-gray-900">
                    {formatDate(peptide.createdAt)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Last Updated:
                  </label>
                  <p className="text-gray-900">
                    {formatDate(peptide.updatedAt)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Retailers Count:
                  </label>
                  <p className="text-gray-900">{peptide.retailers.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Dosages and Tags */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-effect rounded-lg p-4 border border-white/30">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Package className="h-5 w-5 text-purple-600" />
                Available Dosages
              </h3>
              <div className="flex flex-wrap gap-2">
                {peptide.dosages.map((dosage) => (
                  <Badge key={dosage} variant="outline" className="bg-white/70">
                    {dosage}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="glass-effect rounded-lg p-4 border border-white/30">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Tag className="h-5 w-5 text-orange-600" />
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {peptide.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="bg-blue-50">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Calculator Data */}
          {(peptide.startingDose || peptide.maintenanceDose) && (
            <div className="glass-effect rounded-lg p-4 border border-white/30">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Brain className="h-5 w-5 text-indigo-600" />
                Calculator & Dosage Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {peptide.startingDose && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Starting Dose:
                    </label>
                    <p className="text-gray-900">{peptide.startingDose}</p>
                  </div>
                )}
                {peptide.maintenanceDose && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Maintenance Dose:
                    </label>
                    <p className="text-gray-900">{peptide.maintenanceDose}</p>
                  </div>
                )}
                {peptide.frequency && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Frequency:
                    </label>
                    <p className="text-gray-900">{peptide.frequency}</p>
                  </div>
                )}
                {peptide.stackDuration && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Stack Duration:
                    </label>
                    <p className="text-gray-900">
                      {peptide.stackDuration} weeks
                    </p>
                  </div>
                )}
              </div>
              {peptide.dosageNotes && (
                <div className="mt-4">
                  <label className="text-sm font-medium text-gray-700">
                    Dosage Notes:
                  </label>
                  <p className="text-gray-900 leading-relaxed">
                    {peptide.dosageNotes}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Stack Builder Data */}
          {(peptide.recommendedForGoals?.length ||
            peptide.stackDifficulty ||
            peptide.stackTiming) && (
            <div className="glass-effect rounded-lg p-4 border border-white/30">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Target className="h-5 w-5 text-red-600" />
                Stack Builder Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {peptide.recommendedForGoals?.length && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Recommended for Goals:
                    </label>
                    <div className="flex flex-wrap gap-1">
                      {peptide.recommendedForGoals.map((goal) => (
                        <Badge
                          key={goal}
                          variant="outline"
                          className="text-xs bg-green-50"
                        >
                          {goal.replace("-", " ")}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {peptide.stackDifficulty && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Stack Difficulty:
                    </label>
                    <p className="text-gray-900">{peptide.stackDifficulty}</p>
                  </div>
                )}
                {peptide.stackTiming && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Stack Timing:
                    </label>
                    <p className="text-gray-900">{peptide.stackTiming}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Retailers */}
          <div className="glass-effect rounded-lg p-4 border border-white/30">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Retailers & Pricing ({peptide.retailers.length})
            </h3>
            <div className="space-y-4">
              {peptide.retailers.map((retailer, index) => (
                <div
                  key={index}
                  className="bg-white/70 rounded-lg p-4 border border-gray-200"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <h4 className="font-semibold text-gray-900">
                        {retailer.retailer_name}
                      </h4>
                      <Badge variant="outline" className="text-xs">
                        {retailer.size}
                      </Badge>
                      {retailer.stock ? (
                        <Badge className="bg-green-100 text-green-700 text-xs">
                          In Stock
                        </Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-700 text-xs">
                          Out of Stock
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm text-gray-600">
                          {retailer.rating}
                        </span>
                        <span className="text-xs text-gray-400">
                          ({retailer.review_count})
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          window.open(retailer.affiliate_url, "_blank")
                        }
                        className="text-xs"
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Visit
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <label className="text-gray-600">Product ID:</label>
                      <p className="font-mono text-gray-900">
                        {retailer.product_id}
                      </p>
                    </div>
                    <div>
                      <label className="text-gray-600">Price:</label>
                      <div>
                        {retailer.discounted_price &&
                        retailer.discounted_price !== retailer.price ? (
                          <div>
                            <p className="font-bold text-green-600">
                              ${retailer.discounted_price}
                            </p>
                            <p className="text-gray-500 line-through text-xs">
                              ${retailer.price}
                            </p>
                          </div>
                        ) : (
                          <p className="font-bold text-gray-900">
                            ${retailer.price}
                          </p>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="text-gray-600">Coupon Code:</label>
                      <p className="text-gray-900">
                        {retailer.coupon_code || "None"}
                      </p>
                    </div>
                    <div>
                      <label className="text-gray-600">Discount:</label>
                      <p className="text-gray-900">
                        {retailer.discount_percentage
                          ? `${retailer.discount_percentage}%`
                          : "0%"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
