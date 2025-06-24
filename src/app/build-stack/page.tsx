"use client";
import React, { useState, useMemo, useEffect } from "react";
import {
  Plus,
  Minus,
  Calculator,
  Target,
  ShoppingCart,
  Trash2,
  Copy,
  Check,
  Save,
  Share2,
  Download,
  AlertCircle,
  Lightbulb,
  DollarSign,
  Package,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { publicApi } from "@/lib/api";
import { toast } from "sonner";
import {
  useRetailerData,
  useCategoryData,
  getCategoryIcon,
  getCategoryColor,
  formatRetailerName,
} from "@/lib/dynamicUtils";

interface StackItem {
  id: string;
  peptideId: string;
  peptideName: string;
  category: string;
  dosage: string;
  quantity: number;
  duration: number; // weeks
  retailerId: string;
  retailerName: string;
  pricePerUnit: number;
  discountedPrice?: number;
  couponCode?: string;
  inStock: boolean;
  size: string;
  affiliateUrl: string;
}

interface Goal {
  id: string;
  name: string;
  icon: any;
  color: string;
  description: string;
  recommendedPeptides: string[];
}

interface StackTemplate {
  id: string;
  name: string;
  description: string;
  goals: string[];
  peptides: {
    peptideId: string;
    name: string;
    dosage: string;
    duration: number;
    timing: string;
  }[];
  estimatedCost: number;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
}

interface ApiPeptide {
  _id: string;
  name: string;
  category: string;
  dosages: string[];
  unit: string;
  recommendedForGoals?: string[];
  stackDifficulty?: "Beginner" | "Intermediate" | "Advanced";
  stackTiming?: string;
  stackDuration?: number;
  retailers: Array<{
    retailer_id: string;
    retailer_name?: string; // allow undefined
    price: number;
    discounted_price?: number;
    size: string;
    stock: boolean;
    affiliate_url: string;
    coupon_code?: string;
  }>;
}

export default function StackBuilderPage() {
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [stackItems, setStackItems] = useState<StackItem[]>([]);
  const [activeTab, setActiveTab] = useState<"goals" | "custom" | "templates">(
    "goals"
  );
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [savedStacks, setSavedStacks] = useState<any[]>([]);

  // API Data
  const [availablePeptides, setAvailablePeptides] = useState<ApiPeptide[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [retailers, setRetailers] = useState<any[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [stackTemplates, setStackTemplates] = useState<StackTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Dynamic utilities
  const { getRetailerColor, getRetailerName } =
    useRetailerData(availablePeptides);
  const { getCategoryById, getCategoryColor: getCatColor } =
    useCategoryData(availablePeptides);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch peptides
        const peptidesData = await publicApi.getPeptides();
        setAvailablePeptides(peptidesData);

        // Extract categories from peptides
        const categoriesData = await publicApi.getCategories();
        setCategories(categoriesData);

        // Extract retailers from peptides
        const retailersData = await publicApi.getRetailers();
        setRetailers(retailersData);

        // Generate goals dynamically from categories
        const generatedGoals: Goal[] = categoriesData.map((cat: any) => ({
          id: cat.id,
          name: cat.name,
          icon: getCategoryIcon(cat.id),
          color: getCategoryColor(cat.id),
          description: generateGoalDescription(cat.name),
          recommendedPeptides: peptidesData
            .filter((p: ApiPeptide) => p.category === cat.id)
            .map((p: ApiPeptide) => p._id),
        }));
        setGoals(generatedGoals);

        // Generate stack templates from peptides with stack data
        const templates = generateStackTemplates(peptidesData);
        setStackTemplates(templates);
      } catch (error) {
        console.error("Error fetching stack builder data:", error);
        toast.error("Failed to load stack builder data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const generateGoalDescription = (categoryName: string): string => {
    const descriptions: Record<string, string> = {
      "Fat Loss": "Burn fat and improve body composition",
      Healing: "Recovery and tissue repair peptides",
      "Growth Hormone": "Growth hormone releasing peptides",
      "Anti-Aging": "Longevity and anti-aging compounds",
      Nootropic: "Cognitive enhancement peptides",
      "Muscle Growth": "Build lean muscle mass and strength",
      Recovery: "Accelerate recovery and tissue repair",
      Performance: "Enhance athletic performance",
      Wellness: "Overall health and wellness support",
    };

    return (
      descriptions[categoryName] ||
      `${categoryName} related peptides for optimal results`
    );
  };

  // Replace the generateStackTemplates function in your stack builder page with this improved version:

  const generateStackTemplates = (peptides: ApiPeptide[]): StackTemplate[] => {
    const templates: StackTemplate[] = [];

    console.log("🔍 Debugging Template Generation:");
    console.log("- Total peptides:", peptides.length);
    console.log("- Categories available:", categories.length);
    console.log("- Sample peptide:", peptides[0]);
    console.log("- Sample category:", categories[0]);

    // Check if we have data
    if (!peptides.length || !categories.length) {
      console.log("❌ Missing data - peptides or categories empty");
      return generateFallbackTemplates(peptides);
    }

    // Generate templates for each category
    categories.forEach((category, index) => {
      console.log(`\n📋 Processing category ${index + 1}:`, category);

      // More flexible category matching - try multiple approaches
      const categoryPeptides = peptides.filter((p) => {
        // Try exact match first
        if (p.category === category.id) return true;

        // Try with category name converted to slug
        const categorySlug = category.name?.toLowerCase().replace(/\s+/g, "-");
        if (p.category === categorySlug) return true;

        // Try matching category name directly
        if (p.category === category.name) return true;

        return false;
      });

      console.log(
        `- Found ${categoryPeptides.length} peptides for category:`,
        category.name
      );
      console.log(`- Peptide categories found:`, [
        ...new Set(peptides.map((p) => p.category)),
      ]);

      if (categoryPeptides.length >= 1) {
        // BEGINNER TEMPLATE - Always create if we have any peptides
        const beginnerPeptides = categoryPeptides.slice(
          0,
          Math.min(2, categoryPeptides.length)
        );

        const beginnerTemplate: StackTemplate = {
          id: `beginner-${
            category.id || category.name?.toLowerCase().replace(/\s+/g, "-")
          }`,
          name: `Beginner ${category.name}`,
          description: `Simple ${category.name?.toLowerCase()} stack perfect for newcomers`,
          goals: [category.id || category.name],
          peptides: beginnerPeptides.map((p) => ({
            peptideId: p._id,
            name: p.name,
            dosage: p.dosages?.[0] || "5mg",
            duration: p.stackDuration || 8,
            timing: p.stackTiming || "As directed by research protocols",
          })),
          estimatedCost: calculateTemplateCost(beginnerPeptides),
          difficulty: "Beginner",
        };

        templates.push(beginnerTemplate);
        console.log("✅ Added beginner template:", beginnerTemplate.name);

        // INTERMEDIATE TEMPLATE - Create if we have 2+ peptides
        if (categoryPeptides.length >= 2) {
          const intermediatePeptides = categoryPeptides.slice(
            0,
            Math.min(3, categoryPeptides.length)
          );

          const intermediateTemplate: StackTemplate = {
            id: `intermediate-${
              category.id || category.name?.toLowerCase().replace(/\s+/g, "-")
            }`,
            name: `Intermediate ${category.name}`,
            description: `Enhanced ${category.name?.toLowerCase()} stack for experienced users`,
            goals: [category.id || category.name],
            peptides: intermediatePeptides.map((p) => ({
              peptideId: p._id,
              name: p.name,
              dosage: p.dosages?.[0] || "5mg",
              duration: p.stackDuration || 10,
              timing: p.stackTiming || "As directed by research protocols",
            })),
            estimatedCost: calculateTemplateCost(intermediatePeptides),
            difficulty: "Intermediate",
          };

          templates.push(intermediateTemplate);
          console.log(
            "✅ Added intermediate template:",
            intermediateTemplate.name
          );
        }

        // ADVANCED TEMPLATE - Create if we have 3+ peptides
        if (categoryPeptides.length >= 3) {
          const advancedPeptides = categoryPeptides.slice(
            0,
            Math.min(4, categoryPeptides.length)
          );

          const advancedTemplate: StackTemplate = {
            id: `advanced-${
              category.id || category.name?.toLowerCase().replace(/\s+/g, "-")
            }`,
            name: `Advanced ${category.name}`,
            description: `Comprehensive ${category.name?.toLowerCase()} stack for experts`,
            goals: [category.id || category.name],
            peptides: advancedPeptides.map((p) => ({
              peptideId: p._id,
              name: p.name,
              dosage:
                p.dosages?.[Math.min(1, (p.dosages?.length || 1) - 1)] ||
                p.dosages?.[0] ||
                "5mg",
              duration: p.stackDuration || 12,
              timing: p.stackTiming || "As directed by research protocols",
            })),
            estimatedCost: calculateTemplateCost(advancedPeptides),
            difficulty: "Advanced",
          };

          templates.push(advancedTemplate);
          console.log("✅ Added advanced template:", advancedTemplate.name);
        }
      } else {
        console.log("⚠️ No peptides found for category:", category.name);
      }
    });

    // Add fallback templates if we still have no templates
    if (templates.length === 0) {
      console.log("🚨 No templates generated, adding fallbacks");
      return generateFallbackTemplates(peptides);
    }

    console.log(`\n🎉 Generated ${templates.length} templates total`);
    return templates;
  };

  // Fallback template generation function
  const generateFallbackTemplates = (
    peptides: ApiPeptide[]
  ): StackTemplate[] => {
    const templates: StackTemplate[] = [];

    if (peptides.length === 0) {
      console.log("❌ No peptides available for fallback templates");
      return templates;
    }

    // Group peptides by category for fallback
    const peptidesByCategory: Record<string, ApiPeptide[]> = {};
    peptides.forEach((peptide) => {
      const category = peptide.category || "general";
      if (!peptidesByCategory[category]) {
        peptidesByCategory[category] = [];
      }
      peptidesByCategory[category].push(peptide);
    });

    console.log(
      "📦 Fallback: Grouped peptides by category:",
      Object.keys(peptidesByCategory)
    );

    // Create at least one template per category that has peptides
    Object.entries(peptidesByCategory).forEach(
      ([categoryKey, categoryPeptides]) => {
        if (categoryPeptides.length > 0) {
          const categoryName = categoryKey
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");

          const fallbackTemplate: StackTemplate = {
            id: `fallback-${categoryKey}`,
            name: `${categoryName} Stack`,
            description: `Effective ${categoryName.toLowerCase()} peptide combination`,
            goals: [categoryKey],
            peptides: categoryPeptides.slice(0, 2).map((p) => ({
              peptideId: p._id,
              name: p.name,
              dosage: p.dosages?.[0] || "5mg",
              duration: 8,
              timing: "As directed",
            })),
            estimatedCost: calculateTemplateCost(categoryPeptides.slice(0, 2)),
            difficulty: "Beginner",
          };

          templates.push(fallbackTemplate);
          console.log("✅ Added fallback template:", fallbackTemplate.name);
        }
      }
    );

    // If still no templates, create a general one
    if (templates.length === 0 && peptides.length > 0) {
      const generalTemplate: StackTemplate = {
        id: "general-starter",
        name: "Starter Research Stack",
        description: "General peptide research combination for beginners",
        goals: ["general"],
        peptides: peptides.slice(0, 2).map((p) => ({
          peptideId: p._id,
          name: p.name,
          dosage: p.dosages?.[0] || "5mg",
          duration: 8,
          timing: "As directed",
        })),
        estimatedCost: calculateTemplateCost(peptides.slice(0, 2)),
        difficulty: "Beginner",
      };

      templates.push(generalTemplate);
      console.log("✅ Added general fallback template");
    }

    return templates;
  };

  const calculateTemplateCost = (peptides: ApiPeptide[]): number => {
    if (!peptides || peptides.length === 0) {
      return 0;
    }

    return peptides.reduce((total, peptide) => {
      // Check if peptide has retailers
      if (!peptide.retailers || peptide.retailers.length === 0) {
        console.log(`⚠️ Peptide ${peptide.name} has no retailers`);
        return total; // Skip peptides without retailers
      }

      try {
        // Calculate average price across all retailers for this peptide
        const retailerPrices = peptide.retailers
          .filter((retailer) => retailer.price > 0) // Only consider retailers with valid prices
          .map((retailer) => retailer.discounted_price || retailer.price);

        if (retailerPrices.length === 0) {
          console.log(`⚠️ Peptide ${peptide.name} has no valid prices`);
          return total;
        }

        const avgPrice =
          retailerPrices.reduce((sum, price) => sum + price, 0) /
          retailerPrices.length;
        console.log(
          `💰 ${peptide.name}: $${avgPrice.toFixed(2)} (from ${
            retailerPrices.length
          } retailers)`
        );

        return total + avgPrice;
      } catch (error) {
        console.error(
          `Error calculating cost for peptide ${peptide.name}:`,
          error
        );
        return total;
      }
    }, 0);
  };

  const addToStack = (peptide: ApiPeptide, dosage: string, retailer: any) => {
    const selectedRetailer = peptide.retailers.find(
      (r) => r.retailer_id === retailer.id && r.size === dosage
    );

    if (!selectedRetailer) {
      toast.error("Retailer not found for this peptide");
      return;
    }

    const newItem: StackItem = {
      id: `${peptide._id}-${dosage}-${retailer.id}-${Date.now()}`,
      peptideId: peptide._id,
      peptideName: peptide.name,
      category: peptide.category,
      dosage: dosage,
      quantity: 1,
      duration: peptide.stackDuration || 8,
      retailerId: retailer.id,
      retailerName: getRetailerName(retailer.id),
      pricePerUnit: selectedRetailer.price,
      discountedPrice: selectedRetailer.discounted_price,
      couponCode: selectedRetailer.coupon_code,
      inStock: selectedRetailer.stock,
      size: selectedRetailer.size,
      affiliateUrl: selectedRetailer.affiliate_url,
    };

    setStackItems([...stackItems, newItem]);
    toast.success(`Added ${peptide.name} to stack`);
  };

  const removeFromStack = (itemId: string) => {
    setStackItems(stackItems.filter((item) => item.id !== itemId));
    toast.success("Removed from stack");
  };

  const updateStackItem = (
    itemId: string,
    field: keyof StackItem,
    value: any
  ) => {
    setStackItems(
      stackItems.map((item) =>
        item.id === itemId ? { ...item, [field]: value } : item
      )
    );
  };

  const totalCost = useMemo(() => {
    return stackItems.reduce((total, item) => {
      const price = item.discountedPrice || item.pricePerUnit;
      return total + price * item.quantity;
    }, 0);
  }, [stackItems]);

  const totalSavings = useMemo(() => {
    return stackItems.reduce((total, item) => {
      if (item.discountedPrice) {
        return (
          total + (item.pricePerUnit - item.discountedPrice) * item.quantity
        );
      }
      return total;
    }, 0);
  }, [stackItems]);

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
      toast.success(`Copied ${code}!`);
    } catch (err) {
      toast.error("Failed to copy code");
    }
  };

  const loadTemplate = (template: StackTemplate) => {
    const newItems: StackItem[] = [];

    template.peptides.forEach((templatePeptide) => {
      const peptide = availablePeptides.find(
        (p) => p._id === templatePeptide.peptideId
      );
      if (peptide && peptide.retailers.length > 0) {
        const retailer = peptide.retailers[0]; // Use first available retailer

        newItems.push({
          id: `template-${
            templatePeptide.peptideId
          }-${Date.now()}-${Math.random()}`,
          peptideId: templatePeptide.peptideId,
          peptideName: peptide.name,
          category: peptide.category,
          dosage: templatePeptide.dosage,
          quantity: 1,
          duration: templatePeptide.duration,
          retailerId: retailer.retailer_id,
          retailerName:
            getRetailerName(retailer.retailer_id) ||
            retailer.retailer_name ||
            "",
          pricePerUnit: retailer.price,
          discountedPrice: retailer.discounted_price,
          couponCode: retailer.coupon_code,
          inStock: retailer.stock,
          size: retailer.size,
          affiliateUrl: retailer.affiliate_url,
        });
      }
    });

    setStackItems(newItems);
    toast.success(`Loaded ${template.name} template`);
  };

  const handleCheckout = () => {
    if (stackItems.length === 0) {
      toast.error("Add items to your stack first");
      return;
    }

    // Group items by retailer and open affiliate links
    const retailerGroups = stackItems.reduce((groups, item) => {
      if (!groups[item.retailerId]) {
        groups[item.retailerId] = [];
      }
      groups[item.retailerId].push(item);
      return groups;
    }, {} as Record<string, StackItem[]>);

    Object.values(retailerGroups).forEach((items) => {
      // Open the first item's affiliate URL for each retailer
      if (items.length > 0) {
        window.open(items[0].affiliateUrl, "_blank");
      }
    });

    toast.success(
      `Opening ${Object.keys(retailerGroups).length} retailer sites`
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading stack builder...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-b border-white/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-600 rounded-2xl blur-lg opacity-30 animate-pulse"></div>
                <div className="relative p-4 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl shadow-2xl">
                  <Calculator className="h-12 w-12 text-white" />
                </div>
              </div>
              <div className="text-left">
                <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 bg-clip-text text-transparent leading-tight">
                  Stack Builder
                </h1>
                <p className="text-gray-600 text-lg mt-2">
                  Create custom peptide combinations for optimal results
                </p>
              </div>
            </div>

            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Build personalized peptide stacks based on your goals. Compare
              prices, optimize dosages, and track total costs across multiple
              retailers.
            </p>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
              <div className="glass-effect rounded-xl p-4 border border-white/20">
                <div className="text-2xl font-bold text-blue-600">
                  {stackItems.length}
                </div>
                <div className="text-sm text-gray-600">Items in Stack</div>
              </div>
              <div className="glass-effect rounded-xl p-4 border border-white/20">
                <div className="text-2xl font-bold text-green-600">
                  ${totalCost.toFixed(2)}
                </div>
                <div className="text-sm text-gray-600">Total Cost</div>
              </div>
              <div className="glass-effect rounded-xl p-4 border border-white/20">
                <div className="text-2xl font-bold text-purple-600">
                  ${totalSavings.toFixed(2)}
                </div>
                <div className="text-sm text-gray-600">Total Savings</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Builder */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <div className="glass-effect rounded-xl p-6 border border-white/30">
              <div className="flex flex-wrap gap-2 mb-6">
                {[
                  {
                    id: "goals",
                    label: "🎯 Goal-Based",
                    desc: "Start with your fitness goals",
                  },
                  {
                    id: "templates",
                    label: "📋 Templates",
                    desc: "Pre-built expert stacks",
                  },
                  {
                    id: "custom",
                    label: "🔧 Custom Build",
                    desc: "Build from scratch",
                  },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 min-w-0 p-4 rounded-lg text-left transition-all cursor-pointer ${
                      activeTab === tab.id
                        ? "bg-blue-500 text-white shadow-lg"
                        : "bg-white/50 hover:bg-white/80 text-gray-700"
                    }`}
                  >
                    <div className="font-semibold">{tab.label}</div>
                    <div className="text-sm opacity-80">{tab.desc}</div>
                  </button>
                ))}
              </div>

              {/* Goals Tab */}
              {activeTab === "goals" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                      Select Your Goals
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {goals.map((goal) => {
                        const Icon = goal.icon;
                        const isSelected = selectedGoals.includes(goal.id);

                        return (
                          <div
                            key={goal.id}
                            onClick={() => {
                              if (isSelected) {
                                setSelectedGoals(
                                  selectedGoals.filter((g) => g !== goal.id)
                                );
                              } else {
                                setSelectedGoals([...selectedGoals, goal.id]);
                              }
                            }}
                            className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-lg ${
                              isSelected
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200 bg-white hover:border-blue-300"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`p-2 rounded-lg text-white ${
                                  goal.color.includes("bg-")
                                    ? goal.color
                                        .replace("bg-", "bg-")
                                        .split(" ")[0]
                                        .replace("100", "500")
                                    : "bg-blue-500"
                                }`}
                              >
                                <Icon className="h-5 w-5" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900">
                                  {goal.name}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  {goal.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {selectedGoals.length > 0 && (
                    <div>
                      <h4 className="text-md font-semibold text-gray-900 mb-4">
                        Recommended Peptides
                      </h4>
                      <div className="space-y-3">
                        {availablePeptides
                          .filter((peptide) =>
                            selectedGoals.includes(peptide.category)
                          )
                          .map((peptide) => (
                            <div
                              key={peptide._id}
                              className="bg-white/70 rounded-lg p-4 border border-gray-200"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`p-2 rounded-lg text-white ${
                                      getCatColor(peptide.category).includes(
                                        "bg-"
                                      )
                                        ? getCatColor(peptide.category)
                                            .split(" ")[0]
                                            .replace("100", "500")
                                        : "bg-blue-500"
                                    }`}
                                  >
                                    {React.createElement(
                                      getCategoryIcon(peptide.category),
                                      { className: "h-4 w-4" }
                                    )}
                                  </div>
                                  <div>
                                    <h5 className="font-semibold text-gray-900">
                                      {peptide.name}
                                    </h5>
                                    <div className="flex gap-2 mt-1">
                                      {peptide.dosages
                                        .slice(0, 3)
                                        .map((dosage) => (
                                          <span
                                            key={dosage}
                                            className="text-xs bg-gray-100 px-2 py-1 rounded"
                                          >
                                            {dosage}
                                          </span>
                                        ))}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  {peptide.retailers
                                    .slice(0, 2)
                                    .map((retailer, idx) => (
                                      <button
                                        key={`${retailer.retailer_id}-${idx}`}
                                        onClick={() =>
                                          addToStack(
                                            peptide,
                                            peptide.dosages[0],
                                            {
                                              id: retailer.retailer_id,
                                              name: retailer.retailer_name,
                                            }
                                          )
                                        }
                                        className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors cursor-pointer"
                                      >
                                        Add from{" "}
                                        {getRetailerName(retailer.retailer_id)}
                                      </button>
                                    ))}
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Templates Tab */}
              {activeTab === "templates" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Expert Stack Templates
                  </h3>
                  {stackTemplates.map((template) => (
                    <div
                      key={template.id}
                      className="bg-white/70 rounded-lg p-6 border border-gray-200"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-lg font-bold text-gray-900">
                              {template.name}
                            </h4>
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                template.difficulty === "Beginner"
                                  ? "bg-green-100 text-green-700"
                                  : template.difficulty === "Intermediate"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {template.difficulty}
                            </span>
                          </div>
                          <p className="text-gray-600 mb-3">
                            {template.description}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>💊 {template.peptides.length} Peptides</span>
                            <span>
                              💰 ~${template.estimatedCost.toFixed(0)}
                            </span>
                            <span>
                              ⏱️{" "}
                              {Math.max(
                                ...template.peptides.map((p) => p.duration)
                              )}{" "}
                              weeks
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => loadTemplate(template)}
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors cursor-pointer"
                        >
                          Load Template
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {template.peptides.map((peptide, index) => (
                          <div
                            key={index}
                            className="bg-gray-50 rounded-lg p-3 text-sm"
                          >
                            <div className="font-medium text-gray-900">
                              {peptide.name}
                            </div>
                            <div className="text-gray-600">
                              {peptide.dosage} • {peptide.duration}w
                            </div>
                            <div className="text-xs text-gray-500">
                              {peptide.timing}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Custom Tab */}
              {activeTab === "custom" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Build Custom Stack
                  </h3>
                  <div className="grid gap-4">
                    {availablePeptides.map((peptide) => (
                      <div
                        key={peptide._id}
                        className="bg-white/70 rounded-lg p-4 border border-gray-200"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className={`p-2 rounded-lg text-white ${
                                getCatColor(peptide.category).includes("bg-")
                                  ? getCatColor(peptide.category)
                                      .split(" ")[0]
                                      .replace("100", "500")
                                  : "bg-blue-500"
                              }`}
                            >
                              {React.createElement(
                                getCategoryIcon(peptide.category),
                                { className: "h-4 w-4" }
                              )}
                            </div>
                            <div>
                              <h5 className="font-semibold text-gray-900">
                                {peptide.name}
                              </h5>
                              <div className="flex gap-2 mt-1">
                                {peptide.dosages.slice(0, 3).map((dosage) => (
                                  <span
                                    key={dosage}
                                    className="text-xs bg-gray-100 px-2 py-1 rounded"
                                  >
                                    {dosage}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() =>
                              addToStack(peptide, peptide.dosages[0], {
                                id: peptide.retailers[0]?.retailer_id,
                                name: peptide.retailers[0]?.retailer_name,
                              })
                            }
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 cursor-pointer"
                            disabled={!peptide.retailers.length}
                          >
                            <Plus className="h-4 w-4" />
                            Add to Stack
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Current Stack */}
          <div className="space-y-6">
            <div className="glass-effect rounded-xl p-6 border border-white/30 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Your Stack</h3>
                {stackItems.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setStackItems([]);
                      toast.success("Stack cleared");
                    }}
                  >
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Clear
                  </Button>
                )}
              </div>

              {stackItems.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <ShoppingCart className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500">Your stack is empty</p>
                  <p className="text-sm text-gray-400">
                    Add peptides to get started
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {stackItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white/70 rounded-lg p-4 border border-gray-200"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h5 className="font-semibold text-gray-900">
                            {item.peptideName}
                          </h5>
                          <p className="text-sm text-gray-600">
                            {item.retailerName}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                              {item.dosage}
                            </span>
                            {!item.inStock && (
                              <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                                Out of Stock
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => removeFromStack(item.id)}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            Quantity:
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                updateStackItem(
                                  item.id,
                                  "quantity",
                                  Math.max(1, item.quantity - 1)
                                )
                              }
                              className="p-1 bg-gray-100 rounded hover:bg-gray-200 cursor-pointer"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="text-sm font-medium w-8 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateStackItem(
                                  item.id,
                                  "quantity",
                                  item.quantity + 1
                                )
                              }
                              className="p-1 bg-gray-100 rounded hover:bg-gray-200 cursor-pointer"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            Duration:
                          </span>
                          <select
                            value={item.duration}
                            onChange={(e) =>
                              updateStackItem(
                                item.id,
                                "duration",
                                parseInt(e.target.value)
                              )
                            }
                            className="text-sm border border-gray-200 rounded px-2 py-1 cursor-pointer"
                          >
                            {[4, 6, 8, 12, 16, 20].map((weeks) => (
                              <option key={weeks} value={weeks}>
                                {weeks} weeks
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                          <div>
                            {item.discountedPrice ? (
                              <div>
                                <div className="text-sm font-bold text-green-600">
                                  $
                                  {(
                                    item.discountedPrice * item.quantity
                                  ).toFixed(2)}
                                </div>
                                <div className="text-xs text-gray-500 line-through">
                                  $
                                  {(item.pricePerUnit * item.quantity).toFixed(
                                    2
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div className="text-sm font-bold text-gray-900">
                                $
                                {(item.pricePerUnit * item.quantity).toFixed(2)}
                              </div>
                            )}
                          </div>
                          {item.couponCode && (
                            <button
                              onClick={() => copyCode(item.couponCode!)}
                              className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs hover:bg-blue-100 transition-colors cursor-pointer"
                            >
                              {copiedCode === item.couponCode ? (
                                <Check className="h-3 w-3" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                              {item.couponCode}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Stack Summary */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                    <h4 className="font-semibold text-gray-900 mb-3">
                      Stack Summary
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Items:</span>
                        <span className="font-medium">
                          {stackItems.reduce(
                            (sum, item) => sum + item.quantity,
                            0
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="font-medium">
                          $
                          {stackItems
                            .reduce(
                              (sum, item) =>
                                sum + item.pricePerUnit * item.quantity,
                              0
                            )
                            .toFixed(2)}
                        </span>
                      </div>
                      {totalSavings > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Savings:</span>
                          <span className="font-medium">
                            -${totalSavings.toFixed(2)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-200">
                        <span>Total:</span>
                        <span>${totalCost.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Duration Analysis */}
                    <div className="mt-4 pt-3 border-t border-blue-200">
                      <div className="text-xs text-gray-600 mb-2">
                        Duration Analysis:
                      </div>
                      <div className="space-y-1">
                        {Array.from(
                          new Set(stackItems.map((item) => item.duration))
                        )
                          .sort((a, b) => a - b)
                          .map((duration) => {
                            const items = stackItems.filter(
                              (item) => item.duration === duration
                            );
                            return (
                              <div
                                key={duration}
                                className="flex justify-between text-xs"
                              >
                                <span>{duration} weeks:</span>
                                <span>
                                  {items.length} peptide
                                  {items.length !== 1 ? "s" : ""}
                                </span>
                              </div>
                            );
                          })}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-4 space-y-2">
                      <button
                        onClick={handleCheckout}
                        className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <ShoppingCart className="h-4 w-4" />
                        Proceed to Checkout
                      </button>
                      <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 cursor-pointer">
                        <Download className="h-4 w-4" />
                        Export Stack Details
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Stack Insights */}
            {stackItems.length > 0 && (
              <div className="glass-effect rounded-xl p-6 border border-white/30">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                  Stack Insights
                </h4>

                <div className="space-y-3">
                  {/* Goal Coverage */}
                  <div className="bg-white/50 rounded-lg p-3">
                    <div className="text-sm font-medium text-gray-900 mb-2">
                      Goal Coverage
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {Array.from(
                        new Set(stackItems.map((item) => item.category))
                      ).map((category) => {
                        const categoryData = getCategoryById(category);
                        const Icon = categoryData.icon;
                        return (
                          <div
                            key={category}
                            className="flex items-center gap-1 px-2 py-1 bg-blue-50 rounded text-xs"
                          >
                            <Icon className="h-3 w-3" />
                            {categoryData.name}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Cost Analysis */}
                  <div className="bg-white/50 rounded-lg p-3">
                    <div className="text-sm font-medium text-gray-900 mb-2">
                      Cost Breakdown
                    </div>
                    <div className="space-y-1">
                      {stackItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex justify-between text-xs"
                        >
                          <span className="truncate">{item.peptideName}</span>
                          <span>
                            $
                            {(
                              (item.discountedPrice || item.pricePerUnit) *
                              item.quantity
                            ).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Timing Recommendations */}
                  <div className="bg-white/50 rounded-lg p-3">
                    <div className="text-sm font-medium text-gray-900 mb-2">
                      Timing Tips
                    </div>
                    <div className="text-xs text-gray-600 space-y-1">
                      <div>• Take growth peptides before bed</div>
                      <div>• Fat loss peptides work best fasted</div>
                      <div>• Healing peptides: twice daily dosing</div>
                    </div>
                  </div>

                  {/* Safety Warnings */}
                  {stackItems.length > 3 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-yellow-800">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          Complex Stack
                        </span>
                      </div>
                      <p className="text-xs text-yellow-700 mt-1">
                        Consider consulting with a healthcare provider for
                        stacks with 4+ peptides.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Educational Section */}
        <div className="mt-12 glass-effect rounded-xl p-8 border border-white/30">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Stack Building Guide
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-blue-100 rounded-full flex items-center justify-center">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                1. Define Goals
              </h3>
              <p className="text-sm text-gray-600">
                Start by selecting your primary fitness and health objectives.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-green-100 rounded-full flex items-center justify-center">
                <Plus className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                2. Select Peptides
              </h3>
              <p className="text-sm text-gray-600">
                Choose peptides that synergistically support your goals.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-purple-100 rounded-full flex items-center justify-center">
                <Calculator className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                3. Optimize Dosing
              </h3>
              <p className="text-sm text-gray-600">
                Calculate proper dosages and cycle lengths for safety.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-yellow-100 rounded-full flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                4. Compare Costs
              </h3>
              <p className="text-sm text-gray-600">
                Find the best prices across multiple retailers.
              </p>
            </div>
          </div>

          <div className="mt-8 bg-blue-50 rounded-lg p-6 border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-3">
              💡 Pro Tips for Effective Stacking
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
              <div>
                <strong>Start Simple:</strong> Begin with 1-2 peptides to assess
                tolerance before adding more.
              </div>
              <div>
                <strong>Cycle Properly:</strong> Most peptides work best in 8-12
                week cycles with breaks.
              </div>
              <div>
                <strong>Track Progress:</strong> Keep detailed logs of dosing,
                timing, and results.
              </div>
              <div>
                <strong>Quality Matters:</strong> Always source from reputable
                retailers with testing certificates.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
