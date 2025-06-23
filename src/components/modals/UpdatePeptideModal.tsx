import React, { useState, useEffect } from "react";
import { X, TestTube2, Save, Plus, Minus, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AdminPeptide, RetailerFormData } from "@/lib/types";
import { adminApi, APIError } from "@/lib/api";
import { toast } from "sonner";

interface UpdatePeptideModalProps {
  peptide: AdminPeptide | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedPeptide: AdminPeptide) => void;
}

interface FormData {
  name: string;
  category: string;
  subcategory: string;
  description: string;
  dosages: string[];
  unit: "mg" | "mcg" | "iu";
  tags: string[];
  image: string;
  startingDose: string;
  maintenanceDose: string;
  frequency: string;
  dosageNotes: string;
  recommendedForGoals: string[];
  stackDifficulty: "Beginner" | "Intermediate" | "Advanced";
  stackTiming: string;
  stackDuration: number;
  status: "active" | "inactive";
}

const categories = [
  "fat-loss",
  "healing",
  "growth-hormone",
  "anti-aging",
  "nootropic",
  "cognitive",
  "recovery",
  "longevity",
];

const goals = [
  "fat-loss",
  "muscle-growth",
  "healing",
  "anti-aging",
  "cognitive",
];

export function UpdatePeptideModal({
  peptide,
  isOpen,
  onClose,
  onSuccess,
}: UpdatePeptideModalProps) {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    category: "",
    subcategory: "",
    description: "",
    dosages: [""],
    unit: "mg",
    tags: [""],
    image: "",
    startingDose: "",
    maintenanceDose: "",
    frequency: "",
    dosageNotes: "",
    recommendedForGoals: [],
    stackDifficulty: "Beginner",
    stackTiming: "",
    stackDuration: 8,
    status: "active",
  });

  const [retailers, setRetailers] = useState<RetailerFormData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Initialize form data when peptide changes
  useEffect(() => {
    if (peptide && isOpen) {
      setFormData({
        name: peptide.name,
        category: peptide.category,
        subcategory: peptide.subcategory || "",
        description: peptide.description,
        dosages: peptide.dosages.length > 0 ? peptide.dosages : [""],
        unit: peptide.unit,
        tags: peptide.tags.length > 0 ? peptide.tags : [""],
        image: peptide.image || "",
        startingDose: peptide.startingDose || "",
        maintenanceDose: peptide.maintenanceDose || "",
        frequency: peptide.frequency || "",
        dosageNotes: peptide.dosageNotes || "",
        recommendedForGoals: peptide.recommendedForGoals || [],
        stackDifficulty: peptide.stackDifficulty || "Beginner",
        stackTiming: peptide.stackTiming || "",
        stackDuration: peptide.stackDuration || 8,
        status: peptide.status,
      });

      // Transform retailers to form format
      const retailerData = peptide.retailers.map((retailer) => ({
        retailer_id: retailer.retailer_id,
        retailer_name: retailer.retailer_name || "",
        product_id: retailer.product_id,
        price: retailer.price,
        discounted_price: retailer.discounted_price,
        discount_percentage: retailer.discount_percentage,
        stock: retailer.stock,
        rating: retailer.rating,
        review_count: retailer.review_count,
        affiliate_url: retailer.affiliate_url,
        coupon_code: retailer.coupon_code || "",
        size: retailer.size,
      }));

      setRetailers(
        retailerData.length > 0
          ? retailerData
          : [
              {
                retailer_id: "",
                retailer_name: "",
                product_id: "",
                price: 0,
                discounted_price: 0,
                stock: true,
                rating: 4.5,
                review_count: 0,
                affiliate_url: "",
                coupon_code: "",
                size: "",
              },
            ]
      );
      setError("");
    }
  }, [peptide, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!peptide) return;

    setIsLoading(true);
    setError("");

    try {
      // Validate required fields
      if (!formData.name || !formData.category || !formData.description) {
        throw new Error("Please fill in all required fields");
      }

      // Prepare data for API
      const updateData = {
        ...formData,
        dosages: formData.dosages.filter((d) => d.trim()),
        tags: formData.tags.filter((t) => t.trim()),
        retailers: retailers.filter(
          (r) => r.retailer_id && r.affiliate_url && r.size && r.price > 0
        ),
      };

      const response = await adminApi.updatePeptide(peptide._id, updateData);

      toast.success("Peptide updated successfully!");
      onSuccess(response.peptide);
      onClose();
    } catch (error) {
      console.error("Error updating peptide:", error);
      const errorMessage =
        error instanceof APIError
          ? error.message
          : "Failed to update peptide. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const addDosage = () => {
    setFormData((prev) => ({
      ...prev,
      dosages: [...prev.dosages, ""],
    }));
  };

  const removeDosage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      dosages: prev.dosages.filter((_, i) => i !== index),
    }));
  };

  const updateDosage = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      dosages: prev.dosages.map((dosage, i) => (i === index ? value : dosage)),
    }));
  };

  const addTag = () => {
    setFormData((prev) => ({
      ...prev,
      tags: [...prev.tags, ""],
    }));
  };

  const removeTag = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index),
    }));
  };

  const updateTag = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.map((tag, i) => (i === index ? value : tag)),
    }));
  };

  const addRetailer = () => {
    setRetailers((prev) => [
      ...prev,
      {
        retailer_id: "",
        retailer_name: "",
        product_id: "",
        price: 0,
        discounted_price: 0,
        stock: true,
        rating: 4.5,
        review_count: 0,
        affiliate_url: "",
        coupon_code: "",
        size: "",
      },
    ]);
  };

  const removeRetailer = (index: number) => {
    setRetailers((prev) => prev.filter((_, i) => i !== index));
  };

  const updateRetailer = (
    index: number,
    field: keyof RetailerFormData,
    value: any
  ) => {
    setRetailers((prev) =>
      prev.map((retailer, i) =>
        i === index ? { ...retailer, [field]: value } : retailer
      )
    );
  };

  if (!peptide) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto gradient-card border-white/60">
        <DialogHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TestTube2 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-gray-900">
                  Update Peptide
                </DialogTitle>
                <p className="text-gray-600">Edit {peptide.name} details</p>
              </div>
            </div>
          </div>
        </DialogHeader>

        {error && (
          <Alert className="mb-4 bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              {error}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="glass-effect rounded-lg p-4 border border-white/30">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="bg-white/70"
                  required
                />
              </div>

              <div>
                <Label htmlFor="category">Category *</Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white/70 focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.replace("-", " ").toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="unit">Unit *</Label>
                <select
                  id="unit"
                  value={formData.unit}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      unit: e.target.value as "mg" | "mcg" | "iu",
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white/70 focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="mg">mg (milligrams)</option>
                  <option value="mcg">mcg (micrograms)</option>
                  <option value="iu">IU (International Units)</option>
                </select>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      status: e.target.value as "active" | "inactive",
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white/70 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="description">Description *</Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white/70 focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Dosages */}
          <div className="glass-effect rounded-lg p-4 border border-white/30">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Available Dosages
            </h3>
            <div className="space-y-3">
              {formData.dosages.map((dosage, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Input
                    value={dosage}
                    onChange={(e) => updateDosage(index, e.target.value)}
                    placeholder={`e.g., 5${formData.unit}`}
                    className="bg-white/70"
                  />
                  {formData.dosages.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeDosage(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addDosage}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Dosage
              </Button>
            </div>
          </div>

          {/* Tags */}
          <div className="glass-effect rounded-lg p-4 border border-white/30">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
            <div className="space-y-3">
              {formData.tags.map((tag, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Input
                    value={tag}
                    onChange={(e) => updateTag(index, e.target.value)}
                    placeholder="e.g., Weight Loss, Recovery"
                    className="bg-white/70"
                  />
                  {formData.tags.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeTag(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addTag}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Tag
              </Button>
            </div>
          </div>

          {/* Calculator Data */}
          <div className="glass-effect rounded-lg p-4 border border-white/30">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Calculator & Dosage Guide Data
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startingDose">Starting Dose</Label>
                <Input
                  id="startingDose"
                  value={formData.startingDose}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      startingDose: e.target.value,
                    }))
                  }
                  placeholder="e.g., 250-500 mcg"
                  className="bg-white/70"
                />
              </div>

              <div>
                <Label htmlFor="maintenanceDose">Maintenance Dose</Label>
                <Input
                  id="maintenanceDose"
                  value={formData.maintenanceDose}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      maintenanceDose: e.target.value,
                    }))
                  }
                  placeholder="e.g., 250-500 mcg"
                  className="bg-white/70"
                />
              </div>

              <div>
                <Label htmlFor="frequency">Frequency</Label>
                <Input
                  id="frequency"
                  value={formData.frequency}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      frequency: e.target.value,
                    }))
                  }
                  placeholder="e.g., Daily, Twice weekly"
                  className="bg-white/70"
                />
              </div>

              <div>
                <Label htmlFor="stackDuration">Stack Duration (weeks)</Label>
                <Input
                  id="stackDuration"
                  type="number"
                  value={formData.stackDuration}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      stackDuration: parseInt(e.target.value) || 8,
                    }))
                  }
                  className="bg-white/70"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="dosageNotes">Dosage Notes</Label>
                <textarea
                  id="dosageNotes"
                  value={formData.dosageNotes}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      dosageNotes: e.target.value,
                    }))
                  }
                  rows={3}
                  placeholder="e.g., Take on empty stomach. Can be injected subcutaneously..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white/70 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Stack Builder Data */}
          <div className="glass-effect rounded-lg p-4 border border-white/30">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Stack Builder Data
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Recommended for Goals</Label>
                <div className="space-y-2 mt-2">
                  {goals.map((goal) => (
                    <label key={goal} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.recommendedForGoals.includes(goal)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData((prev) => ({
                              ...prev,
                              recommendedForGoals: [
                                ...prev.recommendedForGoals,
                                goal,
                              ],
                            }));
                          } else {
                            setFormData((prev) => ({
                              ...prev,
                              recommendedForGoals:
                                prev.recommendedForGoals.filter(
                                  (g) => g !== goal
                                ),
                            }));
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm capitalize">
                        {goal.replace("-", " ")}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="stackDifficulty">Stack Difficulty</Label>
                <select
                  id="stackDifficulty"
                  value={formData.stackDifficulty}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      stackDifficulty: e.target.value as
                        | "Beginner"
                        | "Intermediate"
                        | "Advanced",
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white/70 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="stackTiming">
                  Stack Timing Recommendations
                </Label>
                <Input
                  id="stackTiming"
                  value={formData.stackTiming}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      stackTiming: e.target.value,
                    }))
                  }
                  placeholder="e.g., Morning fasted, Post-workout, Before bed"
                  className="bg-white/70"
                />
              </div>
            </div>
          </div>

          {/* Retailers */}
          <div className="glass-effect rounded-lg p-4 border border-white/30">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Retailers & Pricing
            </h3>
            <div className="space-y-6">
              {retailers.map((retailer, index) => (
                <div
                  key={index}
                  className="p-4 bg-white/50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-900">
                      Retailer #{index + 1}
                    </h4>
                    {retailers.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeRetailer(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Retailer Name *
                      </label>
                      <Input
                        value={retailer.retailer_name}
                        onChange={(e) => {
                          updateRetailer(
                            index,
                            "retailer_name",
                            e.target.value
                          );
                        }}
                        placeholder="i.e Amino Asylum, Ascension Peptides"
                        className="bg-white/70"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Retailer ID *
                      </label>
                      <Input
                        value={retailer.retailer_id}
                        onChange={(e) => {
                          updateRetailer(index, "retailer_id", e.target.value);
                        }}
                        placeholder="i.e aminosasylum, ascensionpeptides"
                        className="bg-white/70"
                        required
                      />
                    </div>

                    <div>
                      <Label>Product ID</Label>
                      <Input
                        value={retailer.product_id}
                        onChange={(e) =>
                          updateRetailer(index, "product_id", e.target.value)
                        }
                        placeholder="e.g., bpc157-5mg"
                        className="bg-white"
                      />
                    </div>

                    <div>
                      <Label>Size/Dosage *</Label>
                      <Input
                        value={retailer.size}
                        onChange={(e) =>
                          updateRetailer(index, "size", e.target.value)
                        }
                        placeholder="e.g., 5mg"
                        className="bg-white"
                      />
                    </div>

                    <div>
                      <Label>Regular Price ($) *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={retailer.price}
                        onChange={(e) =>
                          updateRetailer(
                            index,
                            "price",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        placeholder="49.99"
                        className="bg-white"
                      />
                    </div>

                    <div>
                      <Label>Discounted Price ($)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={retailer.discounted_price || ""}
                        onChange={(e) =>
                          updateRetailer(
                            index,
                            "discounted_price",
                            parseFloat(e.target.value) || undefined
                          )
                        }
                        placeholder="39.99"
                        className="bg-white"
                      />
                    </div>

                    <div>
                      <Label>Stock Status</Label>
                      <select
                        value={retailer.stock.toString()}
                        onChange={(e) =>
                          updateRetailer(
                            index,
                            "stock",
                            e.target.value === "true"
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="true">In Stock</option>
                        <option value="false">Out of Stock</option>
                      </select>
                    </div>

                    <div>
                      <Label>Rating (1-5)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        min="1"
                        max="5"
                        value={retailer.rating}
                        onChange={(e) =>
                          updateRetailer(
                            index,
                            "rating",
                            parseFloat(e.target.value) || 4.5
                          )
                        }
                        className="bg-white"
                      />
                    </div>

                    <div>
                      <Label>Review Count</Label>
                      <Input
                        type="number"
                        value={retailer.review_count}
                        onChange={(e) =>
                          updateRetailer(
                            index,
                            "review_count",
                            parseInt(e.target.value) || 0
                          )
                        }
                        placeholder="89"
                        className="bg-white"
                      />
                    </div>

                    <div>
                      <Label>Coupon Code</Label>
                      <Input
                        value={retailer.coupon_code || ""}
                        onChange={(e) =>
                          updateRetailer(index, "coupon_code", e.target.value)
                        }
                        placeholder="derek"
                        className="bg-white"
                      />
                    </div>

                    <div className="md:col-span-3">
                      <Label>Affiliate URL (with your referral code) *</Label>
                      <Input
                        value={retailer.affiliate_url}
                        onChange={(e) =>
                          updateRetailer(index, "affiliate_url", e.target.value)
                        }
                        placeholder="https://retailer.com/product?ref=yourcode"
                        className="bg-white"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={addRetailer}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Another Retailer
              </Button>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="gradient-primary text-white shadow-lg hover:shadow-xl transition-all px-8"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  Updating...
                </div>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update Peptide
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
