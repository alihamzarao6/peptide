import React, { useState, useEffect } from "react";
import {
  X,
  TestTube2,
  Save,
  Plus,
  Minus,
  AlertCircle,
  Package,
  Target,
  Calculator,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AdminPeptide, RetailerFormData, RetailerVariant } from "@/lib/types";
import { adminApi, publicApi, APIError } from "@/lib/api";
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
  manualGoals: string[];
  stackDifficulty: "Beginner" | "Intermediate" | "Advanced";
  stackTiming: string;
  stackDuration: number;
  status: "active" | "inactive";
  retailers: RetailerFormData[];
}

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
    manualGoals: [""],
    stackDifficulty: "Beginner",
    stackTiming: "",
    stackDuration: 8,
    status: "active",
    retailers: [],
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Dynamic data states
  const [dynamicCategories, setDynamicCategories] = useState<string[]>([]);
  const [dynamicGoals, setDynamicGoals] = useState<string[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Load dynamic categories and goals
  useEffect(() => {
    const loadDynamicData = async () => {
      try {
        setIsLoadingData(true);

        const [categoriesData, peptidesData] = await Promise.all([
          publicApi.getCategories(),
          publicApi.getPeptides(),
        ]);

        const categoryNames = categoriesData.map((cat: any) => cat.id);
        setDynamicCategories(categoryNames);

        const goalSet = new Set<string>();
        peptidesData.forEach((peptide: any) => {
          if (peptide.recommendedForGoals) {
            peptide.recommendedForGoals.forEach((goal: string) =>
              goalSet.add(goal)
            );
          }
          if (peptide.manualGoals) {
            peptide.manualGoals.forEach((goal: string) => goalSet.add(goal));
          }
        });

        setDynamicGoals(Array.from(goalSet));
      } catch (error) {
        console.error("Error loading dynamic data:", error);
        setDynamicCategories([
          "fat-loss",
          "healing",
          "growth-hormone",
          "anti-aging",
          "nootropic",
          "cognitive",
          "recovery",
          "longevity",
        ]);
        setDynamicGoals([
          "fat-loss",
          "muscle-growth",
          "healing",
          "anti-aging",
          "cognitive",
        ]);
      } finally {
        setIsLoadingData(false);
      }
    };

    if (isOpen) {
      loadDynamicData();
    }
  }, [isOpen]);

  // Initialize form data when peptide changes
  useEffect(() => {
    if (peptide && isOpen) {
      // Transform old retailer structure to new variant structure if needed
      const transformedRetailers: RetailerFormData[] = [];

      if (peptide.retailers) {
        // Group retailers by retailer_id to create variants
        const retailerGroups: { [key: string]: any[] } = {};

        peptide.retailers.forEach((retailer: any) => {
          const key = retailer.retailer_id;
          if (!retailerGroups[key]) {
            retailerGroups[key] = [];
          }
          retailerGroups[key].push(retailer);
        });

        // Convert groups to new variant structure
        Object.entries(retailerGroups).forEach(([retailerId, retailers]) => {
          const firstRetailer = retailers[0];
          const variants = retailers.map((r: any) => ({
            _id: r._id,
            size: r.size || "",
            price: r.price || 0,
            discount_percentage: r.discount_percentage || 0,
            discounted_price: r.discounted_price || 0,
            stock: r.stock !== undefined ? r.stock : true,
            coupon_code: r.coupon_code || "",
          }));

          transformedRetailers.push({
            retailer_id: firstRetailer.retailer_id,
            retailer_name: firstRetailer.retailer_name || "",
            product_id: firstRetailer.product_id || "",
            rating: firstRetailer.rating || 4.5,
            review_count: firstRetailer.review_count || 0,
            affiliate_url: firstRetailer.affiliate_url || "",
            variants: variants,
          });
        });
      }

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
        manualGoals:
          (peptide as any).manualGoals?.length > 0
            ? (peptide as any).manualGoals
            : [""],
        stackDifficulty: peptide.stackDifficulty || "Beginner",
        stackTiming: peptide.stackTiming || "",
        stackDuration: peptide.stackDuration || 8,
        status: peptide.status,
        retailers:
          transformedRetailers.length > 0
            ? transformedRetailers
            : [
                {
                  retailer_id: "",
                  retailer_name: "",
                  product_id: "",
                  rating: 4.5,
                  review_count: 0,
                  affiliate_url: "",
                  variants: [
                    {
                      size: "",
                      price: 0,
                      discount_percentage: 0,
                      discounted_price: 0,
                      stock: true,
                      coupon_code: "",
                    },
                  ],
                },
              ],
      });
      setError("");
    }
  }, [peptide, isOpen]);

  // Form handlers (same as Add Peptide form)
  const addDosage = () => {
    setFormData((prev) => ({
      ...prev,
      dosages: [...prev.dosages, ""],
    }));
  };

  const removeDosage = (index: number) => {
    if (formData.dosages.length > 1) {
      setFormData((prev) => ({
        ...prev,
        dosages: prev.dosages.filter((_, i) => i !== index),
      }));
    }
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
    if (formData.tags.length > 1) {
      setFormData((prev) => ({
        ...prev,
        tags: prev.tags.filter((_, i) => i !== index),
      }));
    }
  };

  const updateTag = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.map((tag, i) => (i === index ? value : tag)),
    }));
  };

  const addManualGoal = () => {
    setFormData((prev) => ({
      ...prev,
      manualGoals: [...(prev.manualGoals || []), ""],
    }));
  };

  const removeManualGoal = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      manualGoals: (prev.manualGoals || []).filter((_, i) => i !== index),
    }));
  };

  const updateManualGoal = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      manualGoals: (prev.manualGoals || []).map((goal, i) =>
        i === index ? value : goal
      ),
    }));
  };

  const addRetailer = () => {
    setFormData((prev) => ({
      ...prev,
      retailers: [
        ...prev.retailers,
        {
          retailer_id: "",
          retailer_name: "",
          product_id: "",
          rating: 4.5,
          review_count: 0,
          affiliate_url: "",
          variants: [
            {
              size: "",
              price: 0,
              discount_percentage: 0,
              discounted_price: 0,
              stock: true,
              coupon_code: "",
            },
          ],
        },
      ],
    }));
  };

  const removeRetailer = (index: number) => {
    if (formData.retailers.length > 1) {
      setFormData((prev) => ({
        ...prev,
        retailers: prev.retailers.filter((_, i) => i !== index),
      }));
    }
  };

  const updateRetailer = (
    index: number,
    field: keyof Omit<RetailerFormData, "variants">,
    value: any
  ) => {
    setFormData((prev) => ({
      ...prev,
      retailers: prev.retailers.map((retailer, i) =>
        i === index ? { ...retailer, [field]: value } : retailer
      ),
    }));
  };

  const addRetailerVariant = (retailerIndex: number) => {
    setFormData((prev) => ({
      ...prev,
      retailers: prev.retailers.map((retailer, i) =>
        i === retailerIndex
          ? {
              ...retailer,
              variants: [
                ...retailer.variants,
                {
                  size: "",
                  price: 0,
                  discount_percentage: 0,
                  discounted_price: 0,
                  stock: true,
                  coupon_code: "",
                },
              ],
            }
          : retailer
      ),
    }));
  };

  const removeRetailerVariant = (
    retailerIndex: number,
    variantIndex: number
  ) => {
    setFormData((prev) => ({
      ...prev,
      retailers: prev.retailers.map((retailer, i) =>
        i === retailerIndex
          ? {
              ...retailer,
              variants: retailer.variants.filter(
                (_, vi) => vi !== variantIndex
              ),
            }
          : retailer
      ),
    }));
  };

  const updateRetailerVariant = (
    retailerIndex: number,
    variantIndex: number,
    field: keyof RetailerVariant,
    value: any
  ) => {
    setFormData((prev) => ({
      ...prev,
      retailers: prev.retailers.map((retailer, i) =>
        i === retailerIndex
          ? {
              ...retailer,
              variants: retailer.variants.map((variant, vi) => {
                if (vi === variantIndex) {
                  const updatedVariant = { ...variant, [field]: value };

                  // Auto-calculate discounted price
                  if (field === "price" || field === "discount_percentage") {
                    const price = field === "price" ? value : variant.price;
                    const discountPercent =
                      field === "discount_percentage"
                        ? value
                        : variant.discount_percentage;

                    if (price > 0 && discountPercent > 0) {
                      updatedVariant.discounted_price =
                        Math.round(price * (1 - discountPercent / 100) * 100) /
                        100;
                    } else {
                      updatedVariant.discounted_price = 0;
                    }
                  }

                  return updatedVariant;
                }
                return variant;
              }),
            }
          : retailer
      ),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!peptide) return;

    setIsLoading(true);
    setError("");

    try {
      const submitData = {
        name: formData.name.trim(),
        category: formData.category,
        subcategory: formData.subcategory?.trim() || undefined,
        description: formData.description.trim(),
        dosages: formData.dosages.filter((d) => d.trim()),
        unit: formData.unit,
        tags: formData.tags.filter((t) => t.trim()),
        image: formData.image?.trim() || undefined,
        startingDose: formData.startingDose?.trim() || undefined,
        maintenanceDose: formData.maintenanceDose?.trim() || undefined,
        frequency: formData.frequency?.trim() || undefined,
        dosageNotes: formData.dosageNotes?.trim() || undefined,
        recommendedForGoals:
          formData.recommendedForGoals.length > 0
            ? formData.recommendedForGoals
            : undefined,
        manualGoals:
          (formData.manualGoals || []).filter((g) => g.trim()).length > 0
            ? formData.manualGoals?.filter((g) => g.trim())
            : undefined,
        stackDifficulty: formData.stackDifficulty,
        stackTiming: formData.stackTiming?.trim() || undefined,
        stackDuration: formData.stackDuration,
        status: formData.status,
        retailers: formData.retailers
          .filter(
            (retailer) =>
              retailer.retailer_id &&
              retailer.affiliate_url &&
              retailer.variants.some(
                (variant) => variant.size && variant.price > 0
              )
          )
          .map((retailer) => ({
            ...retailer,
            variants: retailer.variants.filter(
              (variant) => variant.size && variant.price > 0
            ),
          })),
      };

      const response = await adminApi.updatePeptide(peptide._id, submitData);
      toast.success("Peptide updated successfully!");
      onSuccess(response.peptide);
      onClose();
    } catch (error) {
      const errorMessage =
        error instanceof APIError ? error.message : "Failed to update peptide";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!peptide) return null;

  if (isLoadingData) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 ml-4">Loading form data...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto gradient-card border-white/60">
        <DialogHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl shadow-lg">
                <TestTube2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
                  Edit Peptide
                </DialogTitle>
                <p className="text-gray-600">Update {peptide.name} details</p>
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
          <div className="gradient-card border-white/60 shadow-xl p-6 rounded-lg">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              📋 Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Peptide Name *
                </Label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="e.g., BPC-157"
                  className="bg-white/70"
                  required
                />
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Category *
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, category: value }))
                  }
                >
                  <SelectTrigger className="bg-white/70">
                    <SelectValue placeholder="Select or type category" />
                  </SelectTrigger>
                  <SelectContent>
                    {dynamicCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category
                          .split("-")
                          .map(
                            (word) =>
                              word.charAt(0).toUpperCase() + word.slice(1)
                          )
                          .join(" ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  value={formData.category}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }))
                  }
                  placeholder="Or type custom category"
                  className="bg-white/70 mt-2"
                />
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Subcategory
                </Label>
                <Input
                  value={formData.subcategory}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      subcategory: e.target.value,
                    }))
                  }
                  placeholder="e.g., wound healing, joint repair"
                  className="bg-white/70"
                />
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Unit *
                </Label>
                <Select
                  value={formData.unit}
                  onValueChange={(value: "mg" | "mcg" | "iu") =>
                    setFormData((prev) => ({ ...prev, unit: value }))
                  }
                >
                  <SelectTrigger className="bg-white/70">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mg">mg (milligrams)</SelectItem>
                    <SelectItem value="mcg">mcg (micrograms)</SelectItem>
                    <SelectItem value="iu">IU (International Units)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Status
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: "active" | "inactive") =>
                    setFormData((prev) => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger className="bg-white/70">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Image URL
                </Label>
                <Input
                  value={formData.image}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, image: e.target.value }))
                  }
                  placeholder="https://example.com/image.jpg"
                  className="bg-white/70"
                />
              </div>

              <div className="md:col-span-2">
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Description *
                </Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={4}
                  className="bg-white/70"
                  required
                />
              </div>
            </div>
          </div>

          {/* Dosages */}
          <div className="gradient-card border-white/60 shadow-xl p-6 rounded-lg">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              💊 Available Dosages
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
          <div className="gradient-card border-white/60 shadow-xl p-6 rounded-lg">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              🏷️ Tags
            </h3>
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
          <div className="gradient-card border-white/60 shadow-xl p-6 rounded-lg">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Calculator className="h-5 w-5 text-blue-600" />
              Calculator & Dosage Guide Data
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Starting Dose
                </Label>
                <Input
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
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Maintenance Dose
                </Label>
                <Input
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
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Frequency
                </Label>
                <Input
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
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Stack Duration (weeks)
                </Label>
                <Input
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
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Dosage Notes
                </Label>
                <Textarea
                  value={formData.dosageNotes}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      dosageNotes: e.target.value,
                    }))
                  }
                  rows={3}
                  className="bg-white/70"
                />
              </div>
            </div>
          </div>

          {/* Enhanced Stack Builder Data */}
          <div className="gradient-card border-white/60 shadow-xl p-6 rounded-lg">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              Stack Builder Data
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Predefined Goals */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-3 block">
                  Recommended for Goals (Select from existing)
                </Label>
                <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-white/50">
                  {dynamicGoals.map((goal) => (
                    <div key={goal} className="flex items-center space-x-2">
                      <Checkbox
                        id={goal}
                        checked={
                          formData.recommendedForGoals?.includes(goal) || false
                        }
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFormData((prev) => ({
                              ...prev,
                              recommendedForGoals: [
                                ...(prev.recommendedForGoals || []),
                                goal,
                              ],
                            }));
                          } else {
                            setFormData((prev) => ({
                              ...prev,
                              recommendedForGoals: (
                                prev.recommendedForGoals || []
                              ).filter((g) => g !== goal),
                            }));
                          }
                        }}
                      />
                      <Label
                        htmlFor={goal}
                        className="text-sm text-gray-700 capitalize cursor-pointer"
                      >
                        {goal.replace(/-/g, " ")}
                      </Label>
                    </div>
                  ))}
                </div>
                {dynamicGoals.length === 0 && (
                  <p className="text-sm text-gray-500 mt-2">
                    No existing goals found. Add custom goals below.
                  </p>
                )}
              </div>

              {/* Manual Goals Input */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-3 block">
                  Add Custom Goals
                </Label>
                <div className="space-y-2">
                  {(formData.manualGoals || []).map((goal, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={goal}
                        onChange={(e) =>
                          updateManualGoal(index, e.target.value)
                        }
                        placeholder="Enter custom goal (e.g., sleep-improvement)"
                        className="bg-white/70"
                      />
                      {formData.manualGoals &&
                        formData.manualGoals.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeManualGoal(index)}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addManualGoal}
                    className="text-blue-600 hover:bg-blue-50 mt-2"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Custom Goal
                  </Button>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Stack Difficulty
                </Label>
                <Select
                  value={formData.stackDifficulty}
                  onValueChange={(
                    value: "Beginner" | "Intermediate" | "Advanced"
                  ) =>
                    setFormData((prev) => ({ ...prev, stackDifficulty: value }))
                  }
                >
                  <SelectTrigger className="bg-white/70">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Stack Timing Recommendations
                </Label>
                <Input
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

          {/* Enhanced Retailer Section with Multiple Variants */}
          <div className="gradient-card border-white/60 shadow-xl p-6 rounded-lg">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600" />
              Retailers & Pricing (Multiple Size/Dosage Variants)
            </h3>

            <div className="space-y-6">
              {formData.retailers.map((retailer, retailerIndex) => (
                <div
                  key={retailerIndex}
                  className="border border-gray-200 rounded-lg p-4 bg-white/30"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Retailer #{retailerIndex + 1}
                    </h4>
                    {formData.retailers.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeRetailer(retailerIndex)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {/* Retailer Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-2 block">
                        Retailer ID *
                      </Label>
                      <Input
                        value={retailer.retailer_id}
                        onChange={(e) =>
                          updateRetailer(
                            retailerIndex,
                            "retailer_id",
                            e.target.value
                          )
                        }
                        placeholder="e.g., aminosasylum"
                        className="bg-white/70"
                        required
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-2 block">
                        Retailer Name *
                      </Label>
                      <Input
                        value={retailer.retailer_name}
                        onChange={(e) =>
                          updateRetailer(
                            retailerIndex,
                            "retailer_name",
                            e.target.value
                          )
                        }
                        placeholder="e.g., Amino Asylum"
                        className="bg-white/70"
                        required
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-2 block">
                        Product ID
                      </Label>
                      <Input
                        value={retailer.product_id}
                        onChange={(e) =>
                          updateRetailer(
                            retailerIndex,
                            "product_id",
                            e.target.value
                          )
                        }
                        placeholder="e.g., bpc157-5mg"
                        className="bg-white/70"
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-2 block">
                        Rating (1-5)
                      </Label>
                      <Input
                        type="number"
                        step="0.1"
                        min="1"
                        max="5"
                        value={retailer.rating || ""}
                        onChange={(e) =>
                          updateRetailer(
                            retailerIndex,
                            "rating",
                            e.target.value === ""
                              ? 4.5
                              : parseFloat(e.target.value) || 4.5
                          )
                        }
                        className="bg-white/70"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-2 block">
                        Review Count
                      </Label>
                      <Input
                        type="number"
                        value={retailer.review_count || ""}
                        onChange={(e) =>
                          updateRetailer(
                            retailerIndex,
                            "review_count",
                            e.target.value === ""
                              ? 0
                              : parseInt(e.target.value) || 0
                          )
                        }
                        placeholder="89"
                        className="bg-white/70"
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-2 block">
                        Affiliate URL *
                      </Label>
                      <Input
                        value={retailer.affiliate_url}
                        onChange={(e) =>
                          updateRetailer(
                            retailerIndex,
                            "affiliate_url",
                            e.target.value
                          )
                        }
                        placeholder="https://retailer.com/product?ref=yourcode"
                        className="bg-white/70"
                        required
                      />
                    </div>
                  </div>

                  {/* Size/Dosage Variants Section */}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <Label className="text-sm font-medium text-gray-700">
                        Size/Dosage Variants * (Each retailer can have multiple
                        sizes)
                      </Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addRetailerVariant(retailerIndex)}
                        className="text-blue-600 hover:bg-blue-50"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Size Variant
                      </Button>
                    </div>

                    {retailer.variants.map((variant, variantIndex) => (
                      <div
                        key={variantIndex}
                        className="bg-gray-50 rounded-lg p-4 mb-3 border border-gray-200"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="font-medium text-gray-800 flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            Size Variant #{variantIndex + 1}
                          </h5>
                          {retailer.variants.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                removeRetailerVariant(
                                  retailerIndex,
                                  variantIndex
                                )
                              }
                              className="text-red-600 hover:bg-red-50"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                          <div>
                            <Label className="text-sm font-medium text-gray-700 mb-2 block">
                              Size/Dosage *
                            </Label>
                            <Input
                              value={variant.size}
                              onChange={(e) =>
                                updateRetailerVariant(
                                  retailerIndex,
                                  variantIndex,
                                  "size",
                                  e.target.value
                                )
                              }
                              placeholder="e.g., 5mg"
                              className="bg-white"
                              required
                            />
                          </div>

                          <div>
                            <Label className="text-sm font-medium text-gray-700 mb-2 block">
                              Regular Price ($) *
                            </Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={variant.price || ""}
                              onChange={(e) =>
                                updateRetailerVariant(
                                  retailerIndex,
                                  variantIndex,
                                  "price",
                                  e.target.value === ""
                                    ? 0
                                    : parseFloat(e.target.value) || 0
                                )
                              }
                              placeholder="49.99"
                              className="bg-white"
                              required
                            />
                          </div>

                          <div>
                            <Label className="text-sm font-medium text-gray-700 mb-2 block">
                              Discount %
                            </Label>
                            <Input
                              type="number"
                              step="1"
                              min="0"
                              max="100"
                              value={variant.discount_percentage || ""}
                              onChange={(e) =>
                                updateRetailerVariant(
                                  retailerIndex,
                                  variantIndex,
                                  "discount_percentage",
                                  e.target.value === ""
                                    ? 0
                                    : parseFloat(e.target.value) || 0
                                )
                              }
                              placeholder="0"
                              className="bg-white"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Auto-calculates discounted price
                            </p>
                          </div>

                          <div>
                            <Label className="text-sm font-medium text-gray-700 mb-2 block">
                              Discounted Price ($)
                            </Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={variant.discounted_price || ""}
                              className="bg-gray-100"
                              disabled
                              placeholder="Auto-calculated"
                            />
                            {variant.discount_percentage > 0 &&
                              variant.price > 0 && (
                                <p className="text-xs text-green-600 mt-1">
                                  Save $
                                  {(
                                    variant.price -
                                    (variant.discounted_price || 0)
                                  ).toFixed(2)}
                                </p>
                              )}
                          </div>

                          <div>
                            <Label className="text-sm font-medium text-gray-700 mb-2 block">
                              Stock Status
                            </Label>
                            <Select
                              value={variant.stock ? "true" : "false"}
                              onValueChange={(value) =>
                                updateRetailerVariant(
                                  retailerIndex,
                                  variantIndex,
                                  "stock",
                                  value === "true"
                                )
                              }
                            >
                              <SelectTrigger className="bg-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="true">In Stock</SelectItem>
                                <SelectItem value="false">
                                  Out of Stock
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label className="text-sm font-medium text-gray-700 mb-2 block">
                              Coupon Code
                            </Label>
                            <Input
                              value={variant.coupon_code || ""}
                              onChange={(e) =>
                                updateRetailerVariant(
                                  retailerIndex,
                                  variantIndex,
                                  "coupon_code",
                                  e.target.value
                                )
                              }
                              placeholder="e.g., SAVE10"
                              className="bg-white"
                            />
                          </div>
                        </div>

                        {/* Variant Summary */}
                        {variant.size && variant.price > 0 && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-blue-700 font-medium">
                                {variant.size} - ${variant.price}
                                {variant.discounted_price &&
                                  variant.discounted_price > 0 &&
                                  ` → $${variant.discounted_price} (${variant.discount_percentage}% off)`}
                              </span>
                              <span
                                className={`px-2 py-1 rounded-full text-xs ${
                                  variant.stock
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                {variant.stock ? "In Stock" : "Out of Stock"}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    {retailer.variants.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>
                          No variants added yet. Click "Add Size Variant" to get
                          started.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={addRetailer}
                className="w-full text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                <Plus className="h-4 w-4 mr-2" />
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
