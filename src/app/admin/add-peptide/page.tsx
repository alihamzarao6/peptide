"use client";
import React, { useState, useEffect } from "react";
import {
  Plus,
  Minus,
  Save,
  X,
  TestTube2,
  AlertCircle,
  Check,
  Package,
  Target,
  Calculator,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { adminApi, publicApi, APIError } from "@/lib/api";
import {
  PeptideFormData,
  RetailerFormData,
  RetailerVariant,
} from "@/lib/types";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface FormData extends PeptideFormData {
  retailers: RetailerFormData[];
}

export default function AddPeptideForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    // Basic Info
    name: "",
    category: "",
    description: "",

    // Dosage Info
    dosages: [""],
    unit: "mg" as "mg" | "mcg" | "iu",
    tags: [""],

    // Calculator-specific data
    startingDose: "",
    maintenanceDose: "",
    frequency: "",
    dosageNotes: "",

    // Enhanced Stack Builder data
    recommendedForGoals: [] as string[],
    manualGoals: [""], // NEW: Manual goals array
    stackDifficulty: "Beginner" as "Beginner" | "Intermediate" | "Advanced",
    stackTiming: "",
    stackDuration: 8,

    // Status
    status: "active" as "active" | "inactive",

    // Enhanced Retailers with variants
    retailers: [
      {
        retailer_id: "",
        retailer_name: "",
        product_id: "",
        rating: 5,
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

  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Dynamic data states
  const [dynamicCategories, setDynamicCategories] = useState<string[]>([]);
  const [dynamicGoals, setDynamicGoals] = useState<string[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Load dynamic categories and goals on component mount
  useEffect(() => {
    const loadDynamicData = async () => {
      try {
        setIsLoadingData(true);

        // Fetch categories and peptides to extract dynamic goals
        const [categoriesData, peptidesData] = await Promise.all([
          publicApi.getCategories(),
          publicApi.getPeptides(),
        ]);

        // Extract category names
        const categoryNames = categoriesData.map((cat: any) => cat.id);
        setDynamicCategories(categoryNames);

        // Extract unique goals from existing peptides
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
        // Fallback to static data
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

    loadDynamicData();
  }, []);

  // Basic form handlers
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

  // NEW: Manual goals management
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

  // Enhanced retailer management
  const addRetailer = () => {
    setFormData((prev) => ({
      ...prev,
      retailers: [
        ...prev.retailers,
        {
          retailer_id: "",
          retailer_name: "",
          product_id: "",
          rating: 5,
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

  // NEW: Retailer variant management
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

                  // Auto-calculate discounted price when price or discount percentage changes
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

  const validateForm = (): string | null => {
    // Basic validation
    if (!formData.name.trim()) return "Peptide name is required";
    if (!formData.category) return "Category is required";
    if (!formData.description.trim()) return "Description is required";

    // Validate dosages
    const validDosages = formData.dosages.filter((d) => d.trim());
    if (validDosages.length === 0) return "At least one dosage is required";

    // Updated validation for new retailer variant structure
    const validRetailers = formData.retailers.filter((retailer) => {
      // Check if retailer has basic info filled
      const hasBasicInfo =
        retailer.retailer_id.trim() &&
        retailer.retailer_name.trim() &&
        retailer.affiliate_url.trim();

      // Check if retailer has at least one valid variant
      const hasValidVariant = retailer.variants.some(
        (variant) => variant.size.trim() && variant.price > 0
      );

      return hasBasicInfo && hasValidVariant;
    });

    if (validRetailers.length === 0) {
      return "At least one retailer with valid information and size variant is required";
    }

    // Validate each retailer that has any data entered
    for (let i = 0; i < formData.retailers.length; i++) {
      const retailer = formData.retailers[i];

      // Skip completely empty retailers
      const hasAnyData =
        retailer.retailer_id.trim() ||
        retailer.retailer_name.trim() ||
        retailer.affiliate_url.trim() ||
        retailer.variants.some((v) => v.size.trim() || v.price > 0);

      if (!hasAnyData) continue;

      // If retailer has any data, validate required fields
      if (!retailer.retailer_id.trim()) {
        return `Retailer #${i + 1}: Retailer ID is required`;
      }
      if (!retailer.retailer_name.trim()) {
        return `Retailer #${i + 1}: Retailer name is required`;
      }
      if (!retailer.affiliate_url.trim()) {
        return `Retailer #${i + 1}: Affiliate URL is required`;
      }

      // Check if retailer has at least one valid variant
      const validVariants = retailer.variants.filter(
        (v) => v.size.trim() && v.price > 0
      );
      if (validVariants.length === 0) {
        return `Retailer #${
          i + 1
        }: At least one size variant with size and price is required`;
      }

      // Validate each variant that has any data
      for (let vi = 0; vi < retailer.variants.length; vi++) {
        const variant = retailer.variants[vi];

        // Skip completely empty variants
        if (!variant.size.trim() && variant.price <= 0) continue;

        if (!variant.size.trim()) {
          return `Retailer #${i + 1}, Variant #${
            vi + 1
          }: Size/Dosage is required`;
        }
        if (variant.price <= 0) {
          return `Retailer #${i + 1}, Variant #${
            vi + 1
          }: Price must be greater than 0`;
        }
      }
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);
    setError("");
    setSuccess(false);

    try {
      // Validate form
      const validationError = validateForm();
      if (validationError) {
        throw new Error(validationError);
      }

      // Show loading toast
      const loadingToast = toast.loading("Creating peptide...");

      // Prepare data for API
      const submitData = {
        name: formData.name.trim(),
        category: formData.category,
        description: formData.description.trim(),
        dosages: formData.dosages.filter((d) => d.trim()),
        unit: formData.unit,
        tags: formData.tags.filter((t) => t.trim()),
        startingDose: formData.startingDose?.trim() || undefined,
        maintenanceDose: formData.maintenanceDose?.trim() || undefined,
        frequency: formData.frequency?.trim() || undefined,
        dosageNotes: formData.dosageNotes?.trim() || undefined,
        recommendedForGoals:
          (formData.recommendedForGoals ?? []).length > 0
            ? formData.recommendedForGoals
            : undefined,
        manualGoals:
          (formData.manualGoals ?? []).filter((g) => g.trim()).length > 0
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

      const response = await adminApi.createPeptide(submitData);

      // Dismiss loading toast and show success
      toast.dismiss(loadingToast);
      toast.success(response?.message || "Peptide created successfully!");

      setSuccess(true);
      setIsLoading(false);

      // Redirect after a short delay
      setTimeout(() => {
        router.push("/admin/peptide-management");
      }, 1500);

      // Reset form
      resetForm();
    } catch (error) {
      console.error("Error creating peptide:", error);

      const errorMessage =
        error instanceof APIError
          ? error.message
          : error instanceof Error
          ? error.message
          : "Failed to create peptide. Please try again.";

      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      description: "",
      dosages: [""],
      unit: "mg",
      tags: [""],
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
      retailers: [
        {
          retailer_id: "",
          retailer_name: "",
          product_id: "",
          rating: 5,
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
    setSuccess(false);
    toast.success("Form reset successfully");
  };

  if (isLoadingData) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading form data...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl shadow-lg">
                <TestTube2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
                  Add New Peptide
                </h1>
                <p className="text-gray-600">
                  Fill in all the details to add a peptide to the database
                </p>
              </div>
            </div>
          </div>

          {/* Success Message */}
          {success && (
            <Alert className="mb-6 bg-green-50 border-green-200">
              <Check className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                Peptide added successfully! Redirecting to peptide management...
              </AlertDescription>
            </Alert>
          )}

          {/* Error Message */}
          {error && (
            <Alert className="mb-6 bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <Card className="gradient-card border-white/60 shadow-xl p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                📋 Basic Information
              </h2>

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
                  {/* <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, category: value }))
                    }
                  >
                    <SelectTrigger className="!bg-white">
                      <SelectValue placeholder="Select or type category" />
                    </SelectTrigger>
                    <SelectContent className="!bg-white">
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
                  </Select> */}
                  <Input
                    value={formData.category}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        category: e.target.value,
                      }))
                    }
                    placeholder="Or type custom category (e.g., healing, fat-loss)"
                    className="bg-white/70 mt-2"
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
                    <SelectTrigger className="!bg-white w-full">
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent className="!bg-white">
                      <SelectItem value="mg">mg (milligrams)</SelectItem>
                      <SelectItem value="mcg">mcg (micrograms)</SelectItem>
                      <SelectItem value="iu">
                        IU (International Units)
                      </SelectItem>
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
                    <SelectTrigger className="!bg-white w-full">
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent className="!bg-white">
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
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
                    placeholder="Detailed description of the peptide..."
                    rows={4}
                    className="bg-white/70"
                    required
                  />
                </div>
              </div>
            </Card>

            {/* Dosages */}
            <Card className="gradient-card border-white/60 shadow-xl p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                💊 Available Dosages
              </h2>

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
            </Card>

            {/* Tags */}
            <Card className="gradient-card border-white/60 shadow-xl p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                🏷️ Tags
              </h2>

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
            </Card>

            {/* Calculator Data */}
            <Card className="gradient-card border-white/60 shadow-xl p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Calculator className="h-5 w-5 text-blue-600" />
                Calculator & Dosage Guide Data
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Starting Dose
                  </Label>
                  <Input
                    value={formData.startingDose || ""}
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
                    value={formData.maintenanceDose || ""}
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
                    value={formData.frequency || ""}
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
                    value={formData.stackDuration || 8}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        stackDuration: parseInt(e.target.value) || 8,
                      }))
                    }
                    placeholder="8"
                    className="bg-white/70"
                  />
                </div>
              </div>

              <div className="mt-4">
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Dosage Notes
                </Label>
                <Textarea
                  value={formData.dosageNotes || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      dosageNotes: e.target.value,
                    }))
                  }
                  placeholder="e.g., Take on empty stomach. Can be injected subcutaneously..."
                  rows={3}
                  className="bg-white/70"
                />
              </div>
            </Card>

            {/* Enhanced Stack Builder Data */}
            <Card className="gradient-card border-white/60 shadow-xl p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                Stack Builder Data
              </h2>

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
                            formData.recommendedForGoals?.includes(goal) ||
                            false
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
                      setFormData((prev) => ({
                        ...prev,
                        stackDifficulty: value,
                      }))
                    }
                  >
                    <SelectTrigger className="!bg-white w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="!bg-white">
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
                    value={formData.stackTiming || ""}
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
            </Card>

            {/* Enhanced Retailer Section with Multiple Variants */}
            <Card className="gradient-card border-white/60 shadow-xl p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-600" />
                Retailers & Pricing (Multiple Size/Dosage Variants)
              </h2>

              <div className="space-y-6">
                {formData.retailers.map((retailer, retailerIndex) => (
                  <div
                    key={retailerIndex}
                    className="border border-gray-200 rounded-lg p-4 bg-white/30"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Retailer #{retailerIndex + 1}
                      </h3>
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
                          max="6"
                          value={retailer.rating}
                          onChange={(e) =>
                            updateRetailer(
                              retailerIndex,
                              "rating",
                              parseFloat(e.target.value) || 5
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
                          value={retailer.review_count}
                          onChange={(e) =>
                            updateRetailer(
                              retailerIndex,
                              "review_count",
                              parseInt(e.target.value) || 0
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
                          Size/Dosage Variants * (Each retailer can have
                          multiple sizes)
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
                            <h4 className="font-medium text-gray-800 flex items-center gap-2">
                              <Package className="h-4 w-4" />
                              Size Variant #{variantIndex + 1}
                            </h4>
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

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                                <SelectTrigger className="!bg-white w-full">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="!bg-white">
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
                            No variants added yet. Click "Add Size Variant" to
                            get started.
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
            </Card>

            {/* Submit Buttons */}
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/admin/peptide-management")}
              >
                Cancel
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
                disabled={isLoading}
              >
                Reset Form
              </Button>

              <Button
                type="submit"
                disabled={isLoading}
                className="gradient-primary text-white shadow-lg hover:shadow-xl transition-all px-8"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    Creating...
                  </div>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Create Peptide
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Form Guidelines */}
          <Card className="gradient-card border-white/60 shadow-xl p-6 mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-blue-600" />
              Form Guidelines & New Features
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
              <div>
                <h4 className="font-semibold mb-2">
                  ✨ New: Multiple Size Variants
                </h4>
                <ul className="space-y-1 text-xs">
                  <li>• Each retailer can have multiple size/dosage options</li>
                  <li>
                    • Different prices for different sizes (5mg, 10mg, etc.)
                  </li>
                  <li>• Individual discount percentages per variant</li>
                  <li>• Automatic discounted price calculation</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">🎯 Enhanced Goals System</h4>
                <ul className="space-y-1 text-xs">
                  <li>• Select from existing dynamic goals</li>
                  <li>• Add custom goals manually</li>
                  <li>• Goals are pulled from database automatically</li>
                  <li>• Categories are also dynamic from existing data</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">💰 Automatic Pricing</h4>
                <ul className="space-y-1 text-xs">
                  <li>• Enter discount percentage (0-100%)</li>
                  <li>• Discounted price calculated automatically</li>
                  <li>• Shows savings amount in real-time</li>
                  <li>• No manual discounted price entry needed</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">
                  📋 Validation Requirements
                </h4>
                <ul className="space-y-1 text-xs">
                  <li>• At least one retailer with one valid variant</li>
                  <li>• Each variant needs size and price &gt; 0</li>
                  <li>• Retailer ID, name, and affiliate URL required</li>
                  <li>• Basic peptide info still required as before</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
