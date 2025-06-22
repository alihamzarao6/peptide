"use client";
import React, { useState, useMemo } from "react";
import {
  Plus,
  Minus,
  Calculator,
  Target,
  Zap,
  Heart,
  Brain,
  Clock,
  TrendingUp,
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
} from "lucide-react";

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
    dosage: string;
    duration: number;
    timing: string;
  }[];
  estimatedCost: number;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
}

const goals: Goal[] = [
  {
    id: "fat-loss",
    name: "Fat Loss",
    icon: Zap,
    color: "bg-red-500",
    description: "Burn fat and improve body composition",
    recommendedPeptides: [
      "retatrutide",
      "aod-9604",
      "5-amino-1mq",
      "semaglutide",
    ],
  },
  {
    id: "muscle-growth",
    name: "Muscle Growth",
    icon: TrendingUp,
    color: "bg-blue-500",
    description: "Build lean muscle mass and strength",
    recommendedPeptides: [
      "ipamorelin",
      "cjc-1295",
      "igf-1-lr3",
      "follistatin-344",
    ],
  },
  {
    id: "healing",
    name: "Healing & Recovery",
    icon: Heart,
    color: "bg-green-500",
    description: "Accelerate recovery and tissue repair",
    recommendedPeptides: ["bpc-157", "tb-500", "ghk-cu", "thymosin-beta-4"],
  },
  {
    id: "anti-aging",
    name: "Anti-Aging",
    icon: Clock,
    color: "bg-purple-500",
    description: "Slow aging and improve longevity",
    recommendedPeptides: ["nad+", "epitalon", "ghk-cu", "thymosin-alpha-1"],
  },
  {
    id: "cognitive",
    name: "Cognitive Enhancement",
    icon: Brain,
    color: "bg-yellow-500",
    description: "Improve focus, memory, and mental clarity",
    recommendedPeptides: ["selank", "semax", "noopept", "cerebrolysin"],
  },
];

const stackTemplates: StackTemplate[] = [
  {
    id: "beginner-fat-loss",
    name: "Beginner Fat Loss",
    description: "Simple and effective fat loss stack for newcomers",
    goals: ["fat-loss"],
    peptides: [
      {
        peptideId: "aod-9604",
        dosage: "5mg",
        duration: 8,
        timing: "Morning, fasted",
      },
      {
        peptideId: "5-amino-1mq",
        dosage: "10mg",
        duration: 8,
        timing: "Evening",
      },
    ],
    estimatedCost: 200,
    difficulty: "Beginner",
  },
  {
    id: "advanced-muscle-growth",
    name: "Advanced Muscle Growth",
    description: "Comprehensive muscle building stack for experienced users",
    goals: ["muscle-growth"],
    peptides: [
      {
        peptideId: "ipamorelin",
        dosage: "100mcg",
        duration: 12,
        timing: "Post-workout",
      },
      {
        peptideId: "cjc-1295",
        dosage: "100mcg",
        duration: 12,
        timing: "Before bed",
      },
      {
        peptideId: "igf-1-lr3",
        dosage: "50mcg",
        duration: 4,
        timing: "Post-workout",
      },
    ],
    estimatedCost: 450,
    difficulty: "Advanced",
  },
  {
    id: "healing-recovery",
    name: "Ultimate Recovery",
    description: "Powerful healing stack for injury recovery",
    goals: ["healing"],
    peptides: [
      {
        peptideId: "bpc-157",
        dosage: "500mcg",
        duration: 8,
        timing: "Twice daily",
      },
      {
        peptideId: "tb-500",
        dosage: "2mg",
        duration: 6,
        timing: "Every 3 days",
      },
    ],
    estimatedCost: 320,
    difficulty: "Intermediate",
  },
];

const availablePeptides = [
  {
    id: "retatrutide",
    name: "Retatrutide",
    category: "fat-loss",
    dosages: ["5mg", "10mg", "15mg"],
  },
  {
    id: "aod-9604",
    name: "AOD-9604",
    category: "fat-loss",
    dosages: ["5mg", "10mg"],
  },
  {
    id: "5-amino-1mq",
    name: "5-Amino-1MQ",
    category: "fat-loss",
    dosages: ["10mg", "25mg", "50mg"],
  },
  {
    id: "bpc-157",
    name: "BPC-157",
    category: "healing",
    dosages: ["5mg", "10mg", "15mg"],
  },
  {
    id: "tb-500",
    name: "TB-500",
    category: "healing",
    dosages: ["2mg", "5mg", "10mg"],
  },
  {
    id: "ipamorelin",
    name: "Ipamorelin",
    category: "muscle-growth",
    dosages: ["100mcg", "200mcg", "500mcg"],
  },
  {
    id: "cjc-1295",
    name: "CJC-1295",
    category: "muscle-growth",
    dosages: ["100mcg", "200mcg"],
  },
  {
    id: "nad+",
    name: "NAD+",
    category: "anti-aging",
    dosages: ["500mg", "1000mg"],
  },
  {
    id: "selank",
    name: "Selank",
    category: "cognitive",
    dosages: ["150mcg", "300mcg"],
  },
];

const retailers = [
  { id: "aminoasylum", name: "Amino Asylum", color: "bg-blue-500" },
  { id: "modernaminos", name: "Modern Aminos", color: "bg-green-500" },
  { id: "ascension", name: "Ascension Peptides", color: "bg-purple-500" },
  { id: "solution", name: "Solution Peptides", color: "bg-cyan-500" },
];

export default function StackBuilderPage() {
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [stackItems, setStackItems] = useState<StackItem[]>([]);
  const [activeTab, setActiveTab] = useState<"goals" | "custom" | "templates">(
    "goals"
  );
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [savedStacks, setSavedStacks] = useState<any[]>([]);

  const addToStack = (peptide: any, dosage: string, retailer: any) => {
    const newItem: StackItem = {
      id: `${peptide.id}-${dosage}-${retailer.id}-${Date.now()}`,
      peptideId: peptide.id,
      peptideName: peptide.name,
      category: peptide.category,
      dosage,
      quantity: 1,
      duration: 8,
      retailerId: retailer.id,
      retailerName: retailer.name,
      pricePerUnit: Math.floor(Math.random() * 150) + 50,
      discountedPrice:
        Math.random() > 0.5 ? Math.floor(Math.random() * 40) + 30 : undefined,
      couponCode: Math.random() > 0.5 ? "derek" : undefined,
      inStock: Math.random() > 0.2,
    };
    setStackItems([...stackItems, newItem]);
  };

  const removeFromStack = (itemId: string) => {
    setStackItems(stackItems.filter((item) => item.id !== itemId));
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
    } catch (err) {
      console.error("Failed to copy code");
    }
  };

  const loadTemplate = (template: StackTemplate) => {
    const newItems: StackItem[] = template.peptides.map((peptide, index) => {
      const peptideData = availablePeptides.find(
        (p) => p.id === peptide.peptideId
      );
      const retailer = retailers[index % retailers.length];

      return {
        id: `template-${peptide.peptideId}-${Date.now()}-${index}`,
        peptideId: peptide.peptideId,
        peptideName: peptideData?.name || peptide.peptideId,
        category: peptideData?.category || "unknown",
        dosage: peptide.dosage,
        quantity: 1,
        duration: peptide.duration,
        retailerId: retailer.id,
        retailerName: retailer.name,
        pricePerUnit: Math.floor(Math.random() * 150) + 50,
        discountedPrice:
          Math.random() > 0.5 ? Math.floor(Math.random() * 40) + 30 : undefined,
        couponCode: "derek",
        inStock: true,
      };
    });
    setStackItems(newItems);
  };

  const getCategoryIcon = (category: string) => {
    const goal = goals.find((g) => g.id === category);
    return goal ? goal.icon : Target;
  };

  const getCategoryColor = (category: string) => {
    const goal = goals.find((g) => g.id === category);
    return goal ? goal.color : "bg-gray-500";
  };

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
                                className={`p-2 rounded-lg ${goal.color} text-white`}
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
                              key={peptide.id}
                              className="bg-white/70 rounded-lg p-4 border border-gray-200"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`p-2 rounded-lg ${getCategoryColor(
                                      peptide.category
                                    )} text-white`}
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
                                      {peptide.dosages.map((dosage) => (
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
                                  {retailers.slice(0, 2).map((retailer) => (
                                    <button
                                      key={retailer.id}
                                      onClick={() =>
                                        addToStack(
                                          peptide,
                                          peptide.dosages[0],
                                          retailer
                                        )
                                      }
                                      className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors cursor-pointer"
                                    >
                                      Add from {retailer.name}
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
                            <span>💰 ~${template.estimatedCost}</span>
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
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          Load Template
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {template.peptides.map((peptide, index) => {
                          const peptideData = availablePeptides.find(
                            (p) => p.id === peptide.peptideId
                          );
                          return (
                            <div
                              key={index}
                              className="bg-gray-50 rounded-lg p-3 text-sm"
                            >
                              <div className="font-medium text-gray-900">
                                {peptideData?.name}
                              </div>
                              <div className="text-gray-600">
                                {peptide.dosage} • {peptide.duration}w
                              </div>
                              <div className="text-xs text-gray-500">
                                {peptide.timing}
                              </div>
                            </div>
                          );
                        })}
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
                        key={peptide.id}
                        className="bg-white/70 rounded-lg p-4 border border-gray-200"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className={`p-2 rounded-lg ${getCategoryColor(
                                peptide.category
                              )} text-white`}
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
                                {peptide.dosages.map((dosage) => (
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
                              addToStack(
                                peptide,
                                peptide.dosages[0],
                                retailers[0]
                              )
                            }
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
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
                      <button className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2">
                        <ShoppingCart className="h-4 w-4" />
                        Proceed to Checkout
                      </button>
                      <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
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
                        const goal = goals.find((g) => g.id === category);
                        const Icon = goal?.icon || Target;
                        return (
                          <div
                            key={category}
                            className="flex items-center gap-1 px-2 py-1 bg-blue-50 rounded text-xs"
                          >
                            <Icon className="h-3 w-3" />
                            {goal?.name || category}
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
