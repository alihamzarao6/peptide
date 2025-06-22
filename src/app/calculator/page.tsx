"use client";

import { useState, useEffect } from "react";
import {
  Calculator,
  TestTube2,
  Clock,
  DollarSign,
  Syringe,
  Target,
  Info,
  RotateCcw,
  Download,
  Share2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

interface CalculationResult {
  totalDoses: number;
  durationDays: number;
  durationWeeks: number;
  costPerDose: number;
  costPerWeek: number;
  costPerMonth: number;
  concentration: number;
  injectionVolume: number;
}

interface DosageGuide {
  name: string;
  category: string;
  startingDose: string;
  maintenanceDose: string;
  frequency: string;
  notes: string;
  color: string;
}

const dosageGuides: DosageGuide[] = [
  {
    name: "BPC-157",
    category: "Healing",
    startingDose: "250-500 mcg",
    maintenanceDose: "250-500 mcg",
    frequency: "Daily",
    notes:
      "Take on empty stomach. Can be injected subcutaneously near injury site.",
    color: "bg-green-100 text-green-700 border-green-200",
  },
  {
    name: "TB-500",
    category: "Recovery",
    startingDose: "2-2.5 mg",
    maintenanceDose: "2-2.5 mg",
    frequency: "2x per week",
    notes:
      "Loading phase: 2-2.5mg twice weekly for 4-6 weeks. Maintenance: once weekly.",
    color: "bg-blue-100 text-blue-700 border-blue-200",
  },
  {
    name: "Ipamorelin",
    category: "Growth Hormone",
    startingDose: "100-300 mcg",
    maintenanceDose: "200-300 mcg",
    frequency: "2-3x daily",
    notes: "Best taken on empty stomach, 20min before meals or 2hrs after.",
    color: "bg-purple-100 text-purple-700 border-purple-200",
  },
  {
    name: "CJC-1295",
    category: "Growth Hormone",
    startingDose: "100 mcg",
    maintenanceDose: "100-200 mcg",
    frequency: "2-3x weekly",
    notes:
      "Often stacked with Ipamorelin. Take before bedtime for best results.",
    color: "bg-indigo-100 text-indigo-700 border-indigo-200",
  },
  {
    name: "Semaglutide",
    category: "Weight Loss",
    startingDose: "0.25 mg",
    maintenanceDose: "1-2.4 mg",
    frequency: "Weekly",
    notes:
      "Start low and increase gradually. Week 1-4: 0.25mg, Week 5-8: 0.5mg, etc.",
    color: "bg-red-100 text-red-700 border-red-200",
  },
  {
    name: "NAD+",
    category: "Anti-Aging",
    startingDose: "50-100 mg",
    maintenanceDose: "100-200 mg",
    frequency: "2-3x weekly",
    notes: "Can cause flushing. Start with lower doses and increase gradually.",
    color: "bg-yellow-100 text-yellow-700 border-yellow-200",
  },
];

export default function CalculatorPage() {
  const [formData, setFormData] = useState({
    totalAmount: "",
    desiredDose: "",
    doseUnit: "mg",
    frequency: "daily",
    customFrequency: "",
    productPrice: "",
    reconstitutionVolume: "2", // mL
    syringeSize: "1", // mL
  });

  const [result, setResult] = useState<CalculationResult | null>(null);
  const [selectedGuide, setSelectedGuide] = useState<string>("");

  const frequencyOptions = [
    { value: "daily", label: "Daily (7x/week)", multiplier: 7 },
    { value: "eod", label: "Every Other Day (3.5x/week)", multiplier: 3.5 },
    { value: "twice-weekly", label: "Twice Weekly (2x/week)", multiplier: 2 },
    { value: "weekly", label: "Weekly (1x/week)", multiplier: 1 },
    { value: "custom", label: "Custom", multiplier: 1 },
  ];

  const calculateDosage = () => {
    const totalAmountNum = parseFloat(formData.totalAmount);
    const desiredDoseNum = parseFloat(formData.desiredDose);
    const productPriceNum = parseFloat(formData.productPrice);
    const reconstitutionVolumeNum = parseFloat(formData.reconstitutionVolume);
    const syringeSizeNum = parseFloat(formData.syringeSize);

    if (!totalAmountNum || !desiredDoseNum) {
      toast.error("Please enter valid amounts");
      return;
    }

    // Convert units if necessary
    const totalAmountInMg =
      formData.doseUnit === "mcg" ? totalAmountNum / 1000 : totalAmountNum;
    const desiredDoseInMg =
      formData.doseUnit === "mcg" ? desiredDoseNum / 1000 : desiredDoseNum;

    // Get frequency multiplier
    let frequencyMultiplier = 7; // daily default
    if (formData.frequency === "custom" && formData.customFrequency) {
      frequencyMultiplier = parseFloat(formData.customFrequency);
    } else {
      const freq = frequencyOptions.find((f) => f.value === formData.frequency);
      if (freq) frequencyMultiplier = freq.multiplier;
    }

    // Calculate results
    const totalDoses = totalAmountInMg / desiredDoseInMg;
    const durationDays = totalDoses / (frequencyMultiplier / 7);
    const durationWeeks = durationDays / 7;

    // Cost calculations
    const costPerDose = productPriceNum ? productPriceNum / totalDoses : 0;
    const costPerWeek = costPerDose * frequencyMultiplier;
    const costPerMonth = costPerWeek * 4.33; // average weeks per month

    // Injection volume calculations
    const concentration = totalAmountInMg / reconstitutionVolumeNum; // mg/mL
    const injectionVolume = desiredDoseInMg / concentration; // mL

    const calculationResult: CalculationResult = {
      totalDoses: Math.floor(totalDoses),
      durationDays: Math.round(durationDays),
      durationWeeks: Math.round(durationWeeks * 10) / 10,
      costPerDose: Math.round(costPerDose * 100) / 100,
      costPerWeek: Math.round(costPerWeek * 100) / 100,
      costPerMonth: Math.round(costPerMonth * 100) / 100,
      concentration: Math.round(concentration * 100) / 100,
      injectionVolume: Math.round(injectionVolume * 100) / 100,
    };

    setResult(calculationResult);
    toast.success("Calculation completed!");
  };

  const resetForm = () => {
    setFormData({
      totalAmount: "",
      desiredDose: "",
      doseUnit: "mg",
      frequency: "daily",
      customFrequency: "",
      productPrice: "",
      reconstitutionVolume: "2",
      syringeSize: "1",
    });
    setResult(null);
    setSelectedGuide("");
    toast.success("Form reset");
  };

  const shareCalculation = async () => {
    if (!result) return;

    const shareText = `Peptide Calculator Results:
• Total Doses: ${result.totalDoses}
• Duration: ${result.durationWeeks} weeks
• Cost per dose: $${result.costPerDose}
• Injection volume: ${result.injectionVolume}mL

Calculate yours at: ${window.location.href}`;

    try {
      await navigator.clipboard.writeText(shareText);
      toast.success("Calculation results copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy results");
    }
  };

  const exportResults = () => {
    if (!result) return;

    const csvData = [
      ["Parameter", "Value", "Unit"],
      ["Total Amount", formData.totalAmount, formData.doseUnit],
      ["Desired Dose", formData.desiredDose, formData.doseUnit],
      ["Frequency", formData.frequency, "per week"],
      ["Total Doses", result.totalDoses.toString(), "doses"],
      ["Duration", result.durationDays.toString(), "days"],
      ["Duration", result.durationWeeks.toString(), "weeks"],
      ["Cost per Dose", result.costPerDose.toString(), "USD"],
      ["Cost per Week", result.costPerWeek.toString(), "USD"],
      ["Cost per Month", result.costPerMonth.toString(), "USD"],
      ["Concentration", result.concentration.toString(), "mg/mL"],
      ["Injection Volume", result.injectionVolume.toString(), "mL"],
    ];

    const csvContent = csvData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "peptide-calculation-results.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast.success("Results exported successfully!");
  };

  const loadDosageGuide = (guideName: string) => {
    const guide = dosageGuides.find((g) => g.name === guideName);
    if (!guide) return;

    setSelectedGuide(guideName);
    // Parse the starting dose to populate form
    const doseMatch = guide.startingDose.match(/(\d+(?:\.\d+)?)\s*(mg|mcg)/i);
    if (doseMatch) {
      setFormData((prev) => ({
        ...prev,
        desiredDose: doseMatch[1],
        doseUnit: doseMatch[2].toLowerCase() as "mg" | "mcg",
      }));
    }

    toast.success(`Loaded ${guideName} dosage guide`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      <div className="container mx-auto px-4 sm:px-6 2xl:px-8 py-16">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl shadow-lg">
              <Calculator className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
              Peptide Dosage Calculator
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Calculate exact dosages for different peptides, track your costs,
            and plan your research cycles with precision.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calculator Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="gradient-card border-white/60 shadow-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <TestTube2 className="h-6 w-6 text-blue-600" />
                  Dosage Calculator
                </h2>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={resetForm}>
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Reset
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Total Amount */}
                <div className="space-y-2">
                  <Label htmlFor="totalAmount" className="text-sm font-medium">
                    Total Peptide Amount *
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="totalAmount"
                      type="number"
                      placeholder="5"
                      value={formData.totalAmount}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          totalAmount: e.target.value,
                        }))
                      }
                      className="bg-white/70"
                    />
                    <Select
                      value={formData.doseUnit}
                      onValueChange={(value: "mg" | "mcg") =>
                        setFormData((prev) => ({ ...prev, doseUnit: value }))
                      }
                    >
                      <SelectTrigger className="w-20 bg-white/70">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mg">mg</SelectItem>
                        <SelectItem value="mcg">mcg</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Desired Dose */}
                <div className="space-y-2">
                  <Label htmlFor="desiredDose" className="text-sm font-medium">
                    Desired Dose Per Injection *
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="desiredDose"
                      type="number"
                      placeholder="250"
                      value={formData.desiredDose}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          desiredDose: e.target.value,
                        }))
                      }
                      className="bg-white/70"
                    />
                    <div className="px-3 py-2 bg-gray-100 rounded-md text-sm text-gray-600 flex items-center">
                      {formData.doseUnit}
                    </div>
                  </div>
                </div>

                {/* Frequency */}
                <div className="space-y-2">
                  <Label htmlFor="frequency" className="text-sm font-medium">
                    Injection Frequency
                  </Label>
                  <Select
                    value={formData.frequency}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, frequency: value }))
                    }
                  >
                    <SelectTrigger className="bg-white/70">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {frequencyOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formData.frequency === "custom" && (
                    <Input
                      type="number"
                      placeholder="Times per week"
                      value={formData.customFrequency}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          customFrequency: e.target.value,
                        }))
                      }
                      className="bg-white/70 mt-2"
                    />
                  )}
                </div>

                {/* Product Price */}
                <div className="space-y-2">
                  <Label htmlFor="productPrice" className="text-sm font-medium">
                    Product Price (Optional)
                  </Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="productPrice"
                      type="number"
                      placeholder="49.99"
                      value={formData.productPrice}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          productPrice: e.target.value,
                        }))
                      }
                      className="pl-10 bg-white/70"
                    />
                  </div>
                </div>

                {/* Reconstitution Volume */}
                <div className="space-y-2">
                  <Label htmlFor="reconVolume" className="text-sm font-medium">
                    Reconstitution Volume
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="reconVolume"
                      type="number"
                      value={formData.reconstitutionVolume}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          reconstitutionVolume: e.target.value,
                        }))
                      }
                      className="bg-white/70"
                    />
                    <div className="px-3 py-2 bg-gray-100 rounded-md text-sm text-gray-600 flex items-center">
                      mL
                    </div>
                  </div>
                </div>

                {/* Syringe Size */}
                <div className="space-y-2">
                  <Label htmlFor="syringeSize" className="text-sm font-medium">
                    Syringe Size
                  </Label>
                  <Select
                    value={formData.syringeSize}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, syringeSize: value }))
                    }
                  >
                    <SelectTrigger className="bg-white/70">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0.3">0.3 mL (30 units)</SelectItem>
                      <SelectItem value="0.5">0.5 mL (50 units)</SelectItem>
                      <SelectItem value="1">1.0 mL (100 units)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                onClick={calculateDosage}
                className="w-full mt-6 gradient-primary text-white shadow-lg hover:shadow-xl transition-all duration-300"
                size="lg"
              >
                <Calculator className="h-5 w-5 mr-2" />
                Calculate Dosage
              </Button>
            </Card>

            {/* Results */}
            {result && (
              <Card className="gradient-card border-white/60 shadow-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Target className="h-6 w-6 text-green-600" />
                    Calculation Results
                  </h3>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={shareCalculation}
                    >
                      <Share2 className="h-4 w-4 mr-1" />
                      Share
                    </Button>
                    <Button variant="outline" size="sm" onClick={exportResults}>
                      <Download className="h-4 w-4 mr-1" />
                      Export
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-4 bg-white/60 rounded-lg border border-white/60">
                    <div className="flex items-center gap-2 mb-2">
                      <Syringe className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-gray-600">Total Doses</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {result.totalDoses}
                    </div>
                    <div className="text-xs text-gray-500">injections</div>
                  </div>

                  <div className="p-4 bg-white/60 rounded-lg border border-white/60">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-purple-600" />
                      <span className="text-sm text-gray-600">Duration</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {result.durationWeeks}
                    </div>
                    <div className="text-xs text-gray-500">
                      weeks ({result.durationDays} days)
                    </div>
                  </div>

                  <div className="p-4 bg-white/60 rounded-lg border border-white/60">
                    <div className="flex items-center gap-2 mb-2">
                      <TestTube2 className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-gray-600">
                        Injection Volume
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {result.injectionVolume}
                    </div>
                    <div className="text-xs text-gray-500">
                      mL per injection
                    </div>
                  </div>

                  {formData.productPrice && (
                    <>
                      <div className="p-4 bg-white/60 rounded-lg border border-white/60">
                        <div className="flex items-center gap-2 mb-2">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span className="text-sm text-gray-600">
                            Cost per Dose
                          </span>
                        </div>
                        <div className="text-2xl font-bold text-gray-900">
                          ${result.costPerDose}
                        </div>
                        <div className="text-xs text-gray-500">
                          per injection
                        </div>
                      </div>

                      <div className="p-4 bg-white/60 rounded-lg border border-white/60">
                        <div className="flex items-center gap-2 mb-2">
                          <DollarSign className="h-4 w-4 text-blue-600" />
                          <span className="text-sm text-gray-600">
                            Weekly Cost
                          </span>
                        </div>
                        <div className="text-2xl font-bold text-gray-900">
                          ${result.costPerWeek}
                        </div>
                        <div className="text-xs text-gray-500">per week</div>
                      </div>

                      <div className="p-4 bg-white/60 rounded-lg border border-white/60">
                        <div className="flex items-center gap-2 mb-2">
                          <DollarSign className="h-4 w-4 text-purple-600" />
                          <span className="text-sm text-gray-600">
                            Monthly Cost
                          </span>
                        </div>
                        <div className="text-2xl font-bold text-gray-900">
                          ${result.costPerMonth}
                        </div>
                        <div className="text-xs text-gray-500">per month</div>
                      </div>
                    </>
                  )}
                </div>

                <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2">
                    📋 Summary
                  </h4>
                  <p className="text-sm text-blue-700">
                    With {formData.totalAmount}
                    {formData.doseUnit} total, taking {formData.desiredDose}
                    {formData.doseUnit}{" "}
                    {formData.frequency === "daily"
                      ? "daily"
                      : formData.frequency}
                    , you'll have enough for{" "}
                    <strong>{result.totalDoses} injections</strong> lasting{" "}
                    <strong>{result.durationWeeks} weeks</strong>. Each
                    injection will be{" "}
                    <strong>{result.injectionVolume}mL</strong> at a
                    concentration of{" "}
                    <strong>{result.concentration}mg/mL</strong>.
                  </p>
                </div>
              </Card>
            )}
          </div>

          {/* Dosage Guides Sidebar */}
          <div className="lg:col-span-1">
            <Card className="gradient-card border-white/60 shadow-xl p-6 sticky top-24">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Info className="h-5 w-5 text-blue-600" />
                Dosage Guides
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Click on any peptide below to load recommended starting dosages:
              </p>

              <div className="space-y-3">
                {dosageGuides.map((guide) => (
                  <div
                    key={guide.name}
                    className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${
                      selectedGuide === guide.name
                        ? "bg-blue-50 border-blue-200 shadow-md"
                        : "bg-white/60 border-white/60 hover:bg-white/80"
                    }`}
                    onClick={() => loadDosageGuide(guide.name)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">
                        {guide.name}
                      </h4>
                      <Badge className={guide.color}>{guide.category}</Badge>
                    </div>
                    <div className="text-xs text-gray-600 space-y-1">
                      <div>
                        <strong>Starting:</strong> {guide.startingDose}
                      </div>
                      <div>
                        <strong>Maintenance:</strong> {guide.maintenanceDose}
                      </div>
                      <div>
                        <strong>Frequency:</strong> {guide.frequency}
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-500 italic">
                      {guide.notes}
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-6 bg-gray-200/50" />

              <Alert className="bg-yellow-50 border-yellow-200">
                <Info className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800 text-sm">
                  <strong>Important:</strong> This calculator is for research
                  purposes only. Always start with the lowest effective dose and
                  consult with a healthcare professional.
                </AlertDescription>
              </Alert>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
