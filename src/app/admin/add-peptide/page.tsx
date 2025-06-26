"use client";
import React, { useState } from "react";
import {
  Plus,
  Minus,
  Save,
  X,
  TestTube2,
  AlertCircle,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { adminApi, APIError } from "@/lib/api";
import { PeptideFormData, RetailerFormData } from "@/lib/types";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface FormData extends PeptideFormData {
  retailers: RetailerFormData[];
}

interface ApiCategory {
  id: string;
  name: string;
  slug: string;
}

export default function AddPeptideForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    // Basic Info
    name: "",
    category: "",
    subcategory: "",
    description: "",

    // Dosage Info
    dosages: [""],
    unit: "mg" as "mg" | "mcg" | "iu",
    tags: [""],
    image: "",

    // Calculator-specific data
    startingDose: "",
    maintenanceDose: "",
    frequency: "",
    dosageNotes: "",

    // Stack Builder data
    recommendedForGoals: [] as string[],
    stackDifficulty: "Beginner" as "Beginner" | "Intermediate" | "Advanced",
    stackTiming: "",
    stackDuration: 8,

    // Status
    status: "active" as "active" | "inactive",

    // Retailers
    retailers: [
      {
        retailer_id: "",
        retailer_name: "",
        product_id: "",
        price: 0,
        discounted_price: 0,
        discount_percentage: 0,
        stock: true,
        rating: 0,
        review_count: 0,
        affiliate_url: "",
        coupon_code: "",
        size: "",
      },
    ],
  });

  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const goals = [
    "fat-loss",
    "muscle-growth",
    "healing",
    "anti-aging",
    "cognitive",
  ];

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

  const addRetailer = () => {
    setFormData((prev) => ({
      ...prev,
      retailers: [
        ...prev.retailers,
        {
          retailer_id: "",
          retailer_name: "",
          product_id: "",
          price: 0,
          discounted_price: 0,
          discount_percentage: 0,
          stock: true,
          rating: 0,
          review_count: 0,
          affiliate_url: "",
          coupon_code: "",
          size: "",
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
    field: keyof RetailerFormData,
    value: any
  ) => {
    setFormData((prev) => ({
      ...prev,
      retailers: prev.retailers.map((retailer, i) =>
        i === index ? { ...retailer, [field]: value } : retailer
      ),
    }));

    // Auto-calculate discount percentage when prices change
    if (field === "price" || field === "discounted_price") {
      const retailer = formData.retailers[index];
      if (retailer.price > 0 && (retailer.discounted_price ?? 0) > 0) {
        const discountPercentage = Math.round(
          ((retailer.price - (retailer.discounted_price ?? 0)) /
            retailer.price) *
            100
        );
        updateRetailer(index, "discount_percentage", discountPercentage);
      }
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
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

    // Validate retailers
    const validRetailers = formData.retailers.filter(
      (r) => r.retailer_id && r.affiliate_url && r.size && r.price > 0
    );
    if (validRetailers.length === 0) {
      return "At least one retailer with valid information is required";
    }

    // Validate each retailer
    for (let i = 0; i < formData.retailers.length; i++) {
      const retailer = formData.retailers[i];
      if (
        retailer.retailer_id ||
        retailer.affiliate_url ||
        retailer.size ||
        retailer.price > 0
      ) {
        if (!retailer.retailer_id)
          return `Retailer #${i + 1}: Retailer selection is required`;
        if (!retailer.affiliate_url)
          return `Retailer #${i + 1}: Affiliate URL is required`;
        if (!retailer.size)
          return `Retailer #${i + 1}: Size/Dosage is required`;
        if (retailer.price <= 0)
          return `Retailer #${i + 1}: Valid price is required`;
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
          (formData.recommendedForGoals ?? []).length > 0
            ? formData.recommendedForGoals
            : undefined,
        stackDifficulty: formData.stackDifficulty,
        stackTiming: formData.stackTiming?.trim() || undefined,
        stackDuration: formData.stackDuration,
        status: formData.status,
        retailers: formData.retailers.filter(
          (r) => r.retailer_id && r.affiliate_url && r.size && r.price > 0
        ),
      };

      const response = await adminApi.createPeptide(submitData);

      // Dismiss loading toast and show success
      toast.dismiss(loadingToast);
      toast.success(response?.message || "Peptide created successfully!");

      setSuccess(true);

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
      retailers: [
        {
          retailer_id: "",
          retailer_name: "",
          product_id: "",
          price: 0,
          discounted_price: 0,
          discount_percentage: 0,
          stock: true,
          rating: 0,
          review_count: 0,
          affiliate_url: "",
          coupon_code: "",
          size: "",
        },
      ],
    });
    setError("");
    setSuccess(false);
    toast.success("Form reset successfully");
  };

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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Peptide Name *
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g., BPC-157"
                    className="bg-white/70"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <Input
                    value={formData.category}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        category: e.target.value,
                      }))
                    }
                    placeholder="healing, fat-loss, growth-hormone"
                    className="bg-white/70"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unit *
                  </label>
                  <select
                    value={formData.unit}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        unit: e.target.value as any,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white/70 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="mg">mg (milligrams)</option>
                    <option value="mcg">mcg (micrograms)</option>
                    <option value="iu">IU (International Units)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Detailed description of the peptide..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white/70 focus:ring-2 focus:ring-blue-500"
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
                🧮 Calculator & Dosage Guide Data
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Starting Dose
                  </label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maintenance Dose
                  </label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Frequency
                  </label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stack Duration (weeks)
                  </label>
                  <Input
                    type="number"
                    value={formData.stackDuration}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        stackDuration: parseInt(e.target.value),
                      }))
                    }
                    placeholder="i.e 8"
                    className="bg-white/70"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dosage Notes
                </label>
                <textarea
                  value={formData.dosageNotes}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      dosageNotes: e.target.value,
                    }))
                  }
                  placeholder="e.g., Take on empty stomach. Can be injected subcutaneously..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white/70 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </Card>

            {/* Stack Builder Data */}
            <Card className="gradient-card border-white/60 shadow-xl p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                🎯 Stack Builder Data
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recommended for Goals
                  </label>
                  <div className="space-y-2">
                    {goals.map((goal) => (
                      <label key={goal} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.recommendedForGoals?.includes(goal)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData((prev) => ({
                                ...prev,
                                recommendedForGoals: [
                                  ...(prev.recommendedForGoals ?? []),
                                  goal,
                                ],
                              }));
                            } else {
                              setFormData((prev) => ({
                                ...prev,
                                recommendedForGoals:
                                  prev.recommendedForGoals?.filter(
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stack Difficulty
                  </label>
                  <select
                    value={formData.stackDifficulty}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        stackDifficulty: e.target.value as any,
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stack Timing Recommendations
                  </label>
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
            </Card>

            {/* Retailers */}
            <Card className="gradient-card border-white/60 shadow-xl p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                🏪 Retailers & Pricing
              </h2>

              <div className="space-y-6">
                {formData.retailers.map((retailer, index) => (
                  <div
                    key={index}
                    className="p-4 bg-white/50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900">
                        Retailer #{index + 1}
                      </h3>
                      {formData.retailers.length > 1 && (
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
                              e.target.value || ""
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
                            updateRetailer(
                              index,
                              "retailer_id",
                              e.target.value
                            );
                          }}
                          placeholder="i.e aminosasylum, ascensionpeptides"
                          className="bg-white/70"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Product ID
                        </label>
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Size/Dosage *
                        </label>
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Regular Price ($) *
                        </label>
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Discounted Price ($)
                        </label>
                        <Input
                          type="number"
                          step="0.01"
                          value={retailer.discounted_price || ""}
                          onChange={(e) =>
                            updateRetailer(
                              index,
                              "discounted_price",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          placeholder="39.99"
                          className="bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Stock Status
                        </label>
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Rating (1-5)
                        </label>
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
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Review Count
                        </label>
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Coupon Code
                        </label>
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Affiliate URL (with your referral code) *
                        </label>
                        <Input
                          value={retailer.affiliate_url}
                          onChange={(e) =>
                            updateRetailer(
                              index,
                              "affiliate_url",
                              e.target.value
                            )
                          }
                          placeholder="https://retailer.com/product?ref=yourcode"
                          className="bg-white"
                        />
                      </div>

                      {/* Show calculated discount percentage */}
                      {retailer.price > 0 &&
                        retailer.discounted_price !== undefined &&
                        retailer.discounted_price > 0 && (
                          <div className="md:col-span-3">
                            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                              <div className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-green-600" />
                                <span className="text-sm text-green-700">
                                  Discount: {retailer.discount_percentage}%
                                  (Save $
                                  {(
                                    retailer.price - retailer.discounted_price
                                  ).toFixed(2)}
                                  )
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
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
            </Card>

            {/* Submit Button */}
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
              Form Guidelines
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
              <div>
                <h4 className="font-semibold mb-2">Required Fields:</h4>
                <ul className="space-y-1 text-xs">
                  <li>• Peptide name and description</li>
                  <li>• At least one dosage option</li>
                  <li>• Category selection</li>
                  <li>• At least one valid retailer</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Retailer Requirements:</h4>
                <ul className="space-y-1 text-xs">
                  <li>• Retailer selection and affiliate URL</li>
                  <li>• Size/dosage and price information</li>
                  <li>• Valid pricing (greater than 0)</li>
                  <li>• Stock status selection</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Calculator Data:</h4>
                <ul className="space-y-1 text-xs">
                  <li>• Starting and maintenance doses (optional)</li>
                  <li>• Frequency and timing information</li>
                  <li>• Dosage notes for users</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Stack Builder Data:</h4>
                <ul className="space-y-1 text-xs">
                  <li>• Goal recommendations (optional)</li>
                  <li>• Difficulty level assignment</li>
                  <li>• Timing and duration guidance</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
