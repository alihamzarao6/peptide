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
import { publicApi } from "@/lib/api";
import { useRetailerData, useCategoryData } from "@/lib/dynamicUtils";

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
  _id: string;
  name: string;
  category: string;
  startingDose: string;
  maintenanceDose: string;
  frequency: string;
  dosageNotes: string;
  unit: "mg" | "mcg" | "iu";
  dosages: string[];
  retailers: Array<{
    retailer_id: string;
    retailer_name: string;
    price: number;
    discounted_price?: number;
    size: string;
    stock: boolean;
  }>;
  color: string;
}

interface PeptideData {
  _id: string;
  name: string;
  category: string;
  unit: "mg" | "mcg" | "iu";
  dosages: string[];
  startingDose?: string;
  maintenanceDose?: string;
  frequency?: string;
  dosageNotes?: string;
  retailers: Array<{
    retailer_id: string;
    retailer_name: string;
    price: number;
    discounted_price?: number;
    size: string;
    stock: boolean;
    affiliate_url: string;
    coupon_code?: string;
  }>;
}

export default function CalculatorPage() {
  const [formData, setFormData] = useState({
    selectedPeptide: "",
    totalAmount: "",
    desiredDose: "",
    doseUnit: "mg" as "mg" | "mcg" | "iu",
    frequency: "daily",
    customFrequency: "",
    productPrice: "",
    reconstitutionVolume: "2", // mL
    syringeSize: "1", // mL
    selectedRetailer: "",
    selectedSize: "",
  });

  const [result, setResult] = useState<CalculationResult | null>(null);
  const [selectedGuide, setSelectedGuide] = useState<string>("");
  const [dosageGuides, setDosageGuides] = useState<DosageGuide[]>([]);
  const [allPeptides, setAllPeptides] = useState<PeptideData[]>([]);
  const [isLoadingGuides, setIsLoadingGuides] = useState(true);
  const [availableRetailers, setAvailableRetailers] = useState<
    Array<{
      retailer_id: string;
      retailer_name: string;
      price: number;
      discounted_price?: number;
      size: string;
      stock: boolean;
      affiliate_url: string;
      coupon_code?: string;
    }>
  >([]);

  const { getCategoryColor } = useCategoryData(allPeptides);

  // Fetch peptides and create dosage guides
  useEffect(() => {
    const fetchDosageGuides = async () => {
      try {
        setIsLoadingGuides(true);
        const peptides = await publicApi.getPeptides();

        // Store all peptides for selection, ensuring retailer_name is always a string
        setAllPeptides(
          peptides.map((peptide: any) => ({
            ...peptide,
            retailers: (peptide.retailers || []).map((retailer: any) => ({
              ...retailer,
              retailer_name: retailer.retailer_name ?? "",
              affiliate_url: retailer.affiliate_url ?? "",
              size: retailer.size ?? "",
              retailer_id: retailer.retailer_id ?? "",
              price: retailer.price ?? 0,
              stock: retailer.stock ?? false,
            })),
          }))
        );

        // Transform peptides into dosage guides (only those with calculator data)
        const dosageGuidesData: DosageGuide[] = peptides
          .filter(
            (peptide: any) =>
              (peptide.startingDose && peptide.maintenanceDose) ||
              (peptide.dosages && peptide.dosages.length > 0)
          )
          .map((peptide: any) => ({
            _id: peptide._id,
            name: peptide.name,
            category: peptide.category
              .split("-")
              .map(
                (word: string) => word.charAt(0).toUpperCase() + word.slice(1)
              )
              .join(" "),
            startingDose:
              peptide.startingDose || `${peptide.dosages[0] || "5mg"}`,
            maintenanceDose:
              peptide.maintenanceDose || `${peptide.dosages[0] || "5mg"}`,
            frequency: peptide.frequency || "Daily",
            dosageNotes: peptide.dosageNotes || "Follow standard protocols",
            unit: peptide.unit || "mg",
            dosages: peptide.dosages || [],
            retailers: peptide.retailers || [],
            color: getCategoryColor(peptide.category),
          }));

        setDosageGuides(dosageGuidesData);
      } catch (error) {
        console.error("Error fetching dosage guides:", error);
        toast.error("Failed to load peptide data");
      } finally {
        setIsLoadingGuides(false);
      }
    };

    fetchDosageGuides();
  }, []);

  // Update available retailers when peptide is selected
  useEffect(() => {
    if (formData.selectedPeptide) {
      const selectedPeptide = allPeptides.find(
        (p) => p._id === formData.selectedPeptide
      );
      if (selectedPeptide) {
        setAvailableRetailers(selectedPeptide.retailers);

        // Auto-select first available retailer and size
        if (selectedPeptide.retailers.length > 0) {
          const firstRetailer = selectedPeptide.retailers[0];
          setFormData((prev) => ({
            ...prev,
            selectedRetailer: `${firstRetailer.retailer_id}-${firstRetailer.size}`,
            selectedSize: firstRetailer.size,
            productPrice: (
              firstRetailer.discounted_price || firstRetailer.price
            ).toString(),
            doseUnit: selectedPeptide.unit,
          }));
        }
      }
    } else {
      setAvailableRetailers([]);
    }
  }, [formData.selectedPeptide, allPeptides]);

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

    if (!totalAmountNum || !desiredDoseNum) {
      toast.error("Please enter valid amounts");
      return;
    }

    // Convert units if necessary
    const totalAmountInMg =
      formData.doseUnit === "mcg"
        ? totalAmountNum / 1000
        : formData.doseUnit === "iu"
        ? totalAmountNum
        : totalAmountNum;
    const desiredDoseInMg =
      formData.doseUnit === "mcg"
        ? desiredDoseNum / 1000
        : formData.doseUnit === "iu"
        ? desiredDoseNum
        : desiredDoseNum;

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
      selectedPeptide: "",
      totalAmount: "",
      desiredDose: "",
      doseUnit: "mg",
      frequency: "daily",
      customFrequency: "",
      productPrice: "",
      reconstitutionVolume: "2",
      syringeSize: "1",
      selectedRetailer: "",
      selectedSize: "",
    });
    setResult(null);
    setSelectedGuide("");
    setAvailableRetailers([]);
    toast.success("Form reset");
  };

  const loadDosageGuide = (guideId: string) => {
    const guide = dosageGuides.find((g) => g._id === guideId);
    if (!guide) return;

    setSelectedGuide(guideId);
    setFormData((prev) => ({
      ...prev,
      selectedPeptide: guide._id,
    }));

    // Parse the starting dose to populate form
    const doseMatch = guide.startingDose.match(
      /(\d+(?:\.\d+)?)\s*(mg|mcg|iu)/i
    );
    if (doseMatch) {
      setFormData((prev) => ({
        ...prev,
        desiredDose: doseMatch[1],
        doseUnit: doseMatch[2].toLowerCase() as "mg" | "mcg" | "iu",
      }));
    }

    // If dosages are available, use the first one for total amount
    if (guide.dosages.length > 0) {
      const firstDosage = guide.dosages[0];
      const amountMatch = firstDosage.match(/(\d+(?:\.\d+)?)/);
      if (amountMatch) {
        setFormData((prev) => ({
          ...prev,
          totalAmount: amountMatch[1],
        }));
      }
    }

    toast.success(`Loaded ${guide.name} dosage guide`);
  };

  const handleRetailerChange = (retailerValue: string) => {
    const [retailerId, size] = retailerValue.split("-");
    const retailer = availableRetailers.find(
      (r) => r.retailer_id === retailerId && r.size === size
    );

    if (retailer) {
      setFormData((prev) => ({
        ...prev,
        selectedRetailer: retailerValue,
        selectedSize: size,
        productPrice: (retailer.discounted_price || retailer.price).toString(),
      }));
    }
  };

  const handlePeptideChange = (peptideId: string) => {
    const peptide = allPeptides.find((p) => p._id === peptideId);
    if (peptide) {
      setFormData((prev) => ({
        ...prev,
        selectedPeptide: peptideId,
        doseUnit: peptide.unit,
        selectedRetailer: "",
        selectedSize: "",
        productPrice: "",
      }));

      // Auto-fill starting dose if available
      if (peptide.startingDose) {
        const doseMatch = peptide.startingDose.match(
          /(\d+(?:\.\d+)?)\s*(mg|mcg|iu)/i
        );
        if (doseMatch) {
          setFormData((prev) => ({
            ...prev,
            desiredDose: doseMatch[1],
          }));
        }
      }

      // Auto-fill total amount from first dosage
      if (peptide.dosages.length > 0) {
        const firstDosage = peptide.dosages[0];
        const amountMatch = firstDosage.match(/(\d+(?:\.\d+)?)/);
        if (amountMatch) {
          setFormData((prev) => ({
            ...prev,
            totalAmount: amountMatch[1],
          }));
        }
      }

      setSelectedGuide(peptideId);
    }
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
                {/* Peptide Selection */}
                <div className="md:col-span-2 space-y-2">
                  <Label
                    htmlFor="peptideSelect"
                    className="text-sm font-medium"
                  >
                    Select Peptide (Optional)
                  </Label>
                  <Select
                    value={formData.selectedPeptide}
                    onValueChange={handlePeptideChange}
                  >
                    <SelectTrigger className="bg-white/70">
                      <SelectValue placeholder="Choose a peptide for auto-fill" />
                    </SelectTrigger>
                    <SelectContent className="!bg-white max-h-60">
                      {allPeptides.map((peptide) => (
                        <SelectItem key={peptide._id} value={peptide._id}>
                          <div className="flex items-center gap-2">
                            <span>{peptide.name}</span>
                            <Badge
                              className={getCategoryColor(peptide.category)}
                              variant="outline"
                            >
                              {peptide.category.replace("-", " ")}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Retailer Selection */}
                {availableRetailers.length > 0 && (
                  <div className="md:col-span-2 space-y-2">
                    <Label
                      htmlFor="retailerSelect"
                      className="text-sm font-medium"
                    >
                      Select Retailer & Size
                    </Label>
                    <Select
                      value={formData.selectedRetailer}
                      onValueChange={handleRetailerChange}
                    >
                      <SelectTrigger className="bg-white/70">
                        <SelectValue placeholder="Choose retailer and size" />
                      </SelectTrigger>
                      <SelectContent className="!bg-white">
                        {availableRetailers.map((retailer, index) => (
                          <SelectItem
                            key={`${retailer.retailer_id}-${retailer.size}-${index}`}
                            value={`${retailer.retailer_id}-${retailer.size}`}
                          >
                            <div className="flex items-center justify-between w-full">
                              <span>
                                {retailer.retailer_name} - {retailer.size}
                              </span>
                              <span className="ml-2 font-semibold">
                                ${retailer.discounted_price || retailer.price}
                                {retailer.coupon_code && (
                                  <span className="text-xs text-blue-600 ml-1">
                                    ({retailer.coupon_code})
                                  </span>
                                )}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

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
                      onValueChange={(value: "mg" | "mcg" | "iu") =>
                        setFormData((prev) => ({ ...prev, doseUnit: value }))
                      }
                    >
                      <SelectTrigger className="w-20 bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="!bg-white">
                        <SelectItem value="mg">mg</SelectItem>
                        <SelectItem value="mcg">mcg</SelectItem>
                        <SelectItem value="iu">IU</SelectItem>
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
                    <SelectTrigger className="!bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="!bg-white">
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
                    <SelectTrigger className="!bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="!bg-white">
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

              {isLoadingGuides ? (
                <div className="text-center py-4">
                  <div className="w-6 h-6 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600">Loading guides...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {dosageGuides.map((guide) => (
                    <div
                      key={guide._id}
                      className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${
                        selectedGuide === guide._id
                          ? "bg-blue-50 border-blue-200 shadow-md"
                          : "bg-white/60 border-white/60 hover:bg-white/80"
                      }`}
                      onClick={() => loadDosageGuide(guide._id)}
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
                        {guide.dosages.length > 0 && (
                          <div>
                            <strong>Available sizes:</strong>{" "}
                            {guide.dosages.slice(0, 3).join(", ")}
                            {guide.dosages.length > 3 && "..."}
                          </div>
                        )}
                        {guide.retailers.length > 0 && (
                          <div>
                            <strong>Retailers:</strong> {guide.retailers.length}{" "}
                            available
                          </div>
                        )}
                      </div>
                      <div className="mt-2 text-xs text-gray-500 italic">
                        {guide.dosageNotes}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <Separator className="my-6 bg-gray-200/50" />

              {/* Selected Peptide Info */}
              {formData.selectedPeptide && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Selected Peptide Info
                  </h4>
                  {(() => {
                    const selected = allPeptides.find(
                      (p) => p._id === formData.selectedPeptide
                    );
                    return selected ? (
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="font-medium text-blue-900">
                          {selected.name}
                        </div>
                        <div className="text-sm text-blue-700 mt-1">
                          Unit: {selected.unit} | Category:{" "}
                          {selected.category.replace("-", " ")}
                        </div>
                        {selected.startingDose && (
                          <div className="text-xs text-blue-600 mt-1">
                            Starting dose: {selected.startingDose}
                          </div>
                        )}
                        {selected.frequency && (
                          <div className="text-xs text-blue-600">
                            Frequency: {selected.frequency}
                          </div>
                        )}
                      </div>
                    ) : null;
                  })()}
                </div>
              )}

              {/* Current Retailer Info */}
              {formData.selectedRetailer && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Selected Retailer
                  </h4>
                  {(() => {
                    const [retailerId, size] =
                      formData.selectedRetailer.split("-");
                    const retailer = availableRetailers.find(
                      (r) => r.retailer_id === retailerId && r.size === size
                    );
                    return retailer ? (
                      <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="font-medium text-green-900">
                          {retailer.retailer_name}
                        </div>
                        <div className="text-sm text-green-700 mt-1">
                          Size: {retailer.size}
                        </div>
                        <div className="text-sm text-green-700">
                          Price: ${retailer.discounted_price || retailer.price}
                          {retailer.discounted_price &&
                            retailer.discounted_price !== retailer.price && (
                              <span className="line-through text-green-500 ml-1">
                                ${retailer.price}
                              </span>
                            )}
                        </div>
                        {retailer.coupon_code && (
                          <div className="text-xs text-green-600 mt-1">
                            Code: {retailer.coupon_code}
                          </div>
                        )}
                        <div
                          className={`text-xs mt-1 ${
                            retailer.stock ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {retailer.stock ? "✓ In Stock" : "✗ Out of Stock"}
                        </div>
                      </div>
                    ) : null;
                  })()}
                </div>
              )}

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
