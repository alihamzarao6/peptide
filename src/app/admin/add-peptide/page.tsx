"use client";
import React, { useState } from "react";
import {
  Plus,
  Minus,
  Save,
  X,
  TestTube2,
  Upload,
  AlertCircle,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface RetailerEntry {
  id: string;
  retailer_id: string;
  retailer_name: string;
  product_id: string;
  size: string;
  price: number;
  discounted_price?: number;
  stock: boolean;
  rating: number;
  review_count: number;
  affiliate_url: string;
  coupon_code?: string;
}

export default function AddPeptideForm() {
  const [formData, setFormData] = useState({
    // Basic Info
    name: "",
    slug: "",
    category: "",
    subcategory: "",
    description: "",

    // Dosage Info
    dosages: [""],
    unit: "mg" as "mg" | "mcg" | "iu",

    // Additional Info
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
  });

  const [retailers, setRetailers] = useState<RetailerEntry[]>([
    {
      id: "1",
      retailer_id: "",
      retailer_name: "",
      product_id: "",
      size: "",
      price: 0,
      discounted_price: 0,
      stock: true,
      rating: 4.5,
      review_count: 0,
      affiliate_url: "",
      coupon_code: "",
    },
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Predefined options
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

  const retailerOptions = [
    { id: "aminoasylum", name: "Amino Asylum" },
    { id: "modernaminos", name: "Modern Aminos" },
    { id: "ascension", name: "Ascension Peptides" },
    { id: "simple", name: "Simple Peptide" },
    { id: "prime", name: "Prime Peptides" },
    { id: "solution", name: "Solution Peptides" },
  ];

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
        id: Date.now().toString(),
        retailer_id: "",
        retailer_name: "",
        product_id: "",
        size: "",
        price: 0,
        discounted_price: 0,
        stock: true,
        rating: 4.5,
        review_count: 0,
        affiliate_url: "",
        coupon_code: "",
      },
    ]);
  };

  const removeRetailer = (id: string) => {
    setRetailers((prev) => prev.filter((r) => r.id !== id));
  };

  const updateRetailer = (
    id: string,
    field: keyof RetailerEntry,
    value: any
  ) => {
    setRetailers((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
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
      slug: generateSlug(name),
    }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      // Validate required fields
      if (!formData.name || !formData.category || !formData.description) {
        throw new Error("Please fill in all required fields");
      }

      if (
        retailers.length === 0 ||
        retailers.some((r) => !r.retailer_id || !r.affiliate_url)
      ) {
        throw new Error(
          "Please add at least one retailer with valid information"
        );
      }

      // Filter out empty values
      const cleanedData = {
        ...formData,
        dosages: formData.dosages.filter((d) => d.trim()),
        tags: formData.tags.filter((t) => t.trim()),
        retailers: retailers.filter((r) => r.retailer_id && r.affiliate_url),
      };

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      console.log("Peptide data to submit:", cleanedData);

      setSuccess(true);

      // Reset form after success
      setTimeout(() => {
        setSuccess(false);
        // Reset form or redirect to peptide list
      }, 3000);
    } catch (error) {
      console.error("Error saving peptide:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
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

        {success && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <Check className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              Peptide added successfully! It will appear in the comparison tool
              shortly.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          {/* Basic Information */}
          <Card className="gradient-card border-white/60 shadow-xl p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              📋 Basic Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  Image URL
                </label>
                <Input
                  value={formData.image}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, image: e.target.value }))
                  }
                  placeholder="https://example.com/peptide-image.jpg"
                  className="bg-white/70"
                />
              </div>
            </div>

            <div className="mt-4">
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
              />
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
                      stackDuration: parseInt(e.target.value) || 8,
                    }))
                  }
                  placeholder="8"
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
              {retailers.map((retailer, index) => (
                <div
                  key={retailer.id}
                  className="p-4 bg-white/50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">
                      Retailer #{index + 1}
                    </h3>
                    {retailers.length > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeRetailer(retailer.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Retailer *
                      </label>
                      <select
                        value={retailer.retailer_id}
                        onChange={(e) => {
                          const selectedRetailer = retailerOptions.find(
                            (r) => r.id === e.target.value
                          );
                          updateRetailer(
                            retailer.id,
                            "retailer_id",
                            e.target.value
                          );
                          updateRetailer(
                            retailer.id,
                            "retailer_name",
                            selectedRetailer?.name || ""
                          );
                        }}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select retailer</option>
                        {retailerOptions.map((opt) => (
                          <option key={opt.id} value={opt.id}>
                            {opt.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Product ID
                      </label>
                      <Input
                        value={retailer.product_id}
                        onChange={(e) =>
                          updateRetailer(
                            retailer.id,
                            "product_id",
                            e.target.value
                          )
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
                          updateRetailer(retailer.id, "size", e.target.value)
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
                            retailer.id,
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
                            retailer.id,
                            "discounted_price",
                            parseFloat(e.target.value) || undefined
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
                            retailer.id,
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
                            retailer.id,
                            "rating",
                            parseFloat(e.target.value) || 4.5
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
                            retailer.id,
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
                          updateRetailer(
                            retailer.id,
                            "coupon_code",
                            e.target.value
                          )
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
                            retailer.id,
                            "affiliate_url",
                            e.target.value
                          )
                        }
                        placeholder="https://retailer.com/product?ref=yourcode"
                        className="bg-white"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <Button
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
            <Button variant="outline" onClick={() => window.history.back()}>
              Cancel
            </Button>

            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="gradient-primary text-white shadow-lg hover:shadow-xl transition-all px-8"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  Saving...
                </div>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Peptide
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
