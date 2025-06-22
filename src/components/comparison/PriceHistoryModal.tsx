"use client";

import { useState, useMemo } from "react";
import {
  X,
  TrendingDown,
  TrendingUp,
  Calendar,
  DollarSign,
  Download,
  Share2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { toast } from "sonner";

interface PriceHistoryModalProps {
  peptideId: string;
  onClose: () => void;
}

// Enhanced mock price history data with more realistic fluctuations
const generatePriceHistory = (peptideId: string) => {
  const baseData = {
    retatrutide: {
      name: "Retatrutide",
      basePrice: {
        aminoasylum: 149.99,
        modernaminos: 65.2,
        ascension: 149.99,
        prime: 180.0,
      },
    },
    "nad-plus": {
      name: "NAD+",
      basePrice: { aminoasylum: 47.99, prime: 171.0, solution: 89.99 },
    },
    "bpc-157": {
      name: "BPC-157",
      basePrice: { ascension: 24.79, solution: 25.5, aminoasylum: 32.99 },
    },
  };

  const peptideData =
    baseData[peptideId as keyof typeof baseData] || baseData.retatrutide;
  const retailers = Object.keys(peptideData.basePrice);

  // Generate 6 months of price history
  const history = [];
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 6);

  for (let i = 0; i < 180; i += 7) {
    // Weekly data points
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);

    const dataPoint: any = {
      date: date.toISOString().split("T")[0],
      dateFormatted: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
    };

    retailers.forEach((retailer) => {
      const basePrice =
        peptideData.basePrice[retailer as keyof typeof peptideData.basePrice];
      // Add realistic price fluctuations (±15%)
      const fluctuation = (Math.random() - 0.5) * 0.3; // ±15%
      const timeDecay = Math.max(0.85, 1 - (i / 180) * 0.15); // Gradual price reduction over time
      dataPoint[retailer] = parseFloat(
        (basePrice * timeDecay * (1 + fluctuation)).toFixed(2)
      );
    });

    history.push(dataPoint);
  }

  return { history, retailers, name: peptideData.name };
};

const retailerColors: Record<string, string> = {
  aminoasylum: "#3B82F6",
  modernaminos: "#10B981",
  ascension: "#8B5CF6",
  prime: "#EF4444",
  solution: "#06B6D4",
};

const retailerNames: Record<string, string> = {
  aminoasylum: "Amino Asylum",
  modernaminos: "Modern Aminos",
  ascension: "Ascension Peptides",
  prime: "Prime Peptides",
  solution: "Solution Peptides",
};

const timeRanges = [
  { label: "30 Days", value: "30d", days: 30 },
  { label: "90 Days", value: "90d", days: 90 },
  { label: "6 Months", value: "6m", days: 180 },
  { label: "1 Year", value: "1y", days: 365 },
];

export function PriceHistoryModal({
  peptideId,
  onClose,
}: PriceHistoryModalProps) {
  const [timeRange, setTimeRange] = useState("90d");
  const [selectedRetailers, setSelectedRetailers] = useState<string[]>([]);

  const {
    history,
    retailers,
    name: peptideName,
  } = useMemo(() => generatePriceHistory(peptideId), [peptideId]);

  // Initialize selected retailers
  useState(() => {
    if (selectedRetailers.length === 0) {
      setSelectedRetailers(retailers.slice(0, 3));
    }
  });

  const filteredData = useMemo(() => {
    const days = timeRanges.find((r) => r.value === timeRange)?.days || 90;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return history.filter((item) => new Date(item.date) >= cutoffDate);
  }, [history, timeRange]);

  const currentPrices = useMemo(() => {
    if (filteredData.length === 0) return {};
    const latest = filteredData[filteredData.length - 1];
    const result: Record<string, number> = {};
    retailers.forEach((retailer) => {
      result[retailer] = latest[retailer];
    });
    return result;
  }, [filteredData, retailers]);

  const priceChanges = useMemo(() => {
    if (filteredData.length < 2) return {};
    const oldest = filteredData[0];
    const latest = filteredData[filteredData.length - 1];
    const result: Record<string, number> = {};

    retailers.forEach((retailer) => {
      const oldPrice = oldest[retailer];
      const newPrice = latest[retailer];
      result[retailer] = ((newPrice - oldPrice) / oldPrice) * 100;
    });
    return result;
  }, [filteredData, retailers]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-effect p-4 rounded-lg border border-white/30 shadow-xl">
          <p className="font-medium text-gray-900 mb-2">{formatDate(label)}</p>
          {payload
            .filter((entry: any) => selectedRetailers.includes(entry.dataKey))
            .map((entry: any) => (
              <div key={entry.dataKey} className="flex items-center gap-2 mb-1">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm text-gray-700">
                  {retailerNames[entry.dataKey] || entry.dataKey}:
                </span>
                <span className="font-semibold text-gray-900">
                  ${entry.value}
                </span>
              </div>
            ))}
        </div>
      );
    }
    return null;
  };

  const handleShare = async () => {
    try {
      const url = `${window.location.origin}/?peptide=${peptideId}`;
      await navigator.clipboard.writeText(url);
      toast.success("Price history link copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  const handleExport = () => {
    // Create CSV data
    const csvData = [
      ["Date", ...selectedRetailers.map((r) => retailerNames[r] || r)],
      ...filteredData.map((item) => [
        item.date,
        ...selectedRetailers.map((retailer) => item[retailer]),
      ]),
    ];

    const csvContent = csvData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${peptideName}-price-history-${timeRange}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast.success("Price history exported successfully!");
  };

  const stats = useMemo(() => {
    if (Object.keys(currentPrices).length === 0) return null;

    const prices = Object.values(currentPrices);
    const lowest = Math.min(...prices);
    const highest = Math.max(...prices);
    const average = prices.reduce((a, b) => a + b, 0) / prices.length;

    const lowestRetailer = Object.entries(currentPrices).find(
      ([_, price]) => price === lowest
    )?.[0];
    const highestRetailer = Object.entries(currentPrices).find(
      ([_, price]) => price === highest
    )?.[0];

    return {
      lowest: { price: lowest, retailer: lowestRetailer },
      highest: { price: highest, retailer: highestRetailer },
      average,
      range: highest - lowest,
    };
  }, [currentPrices]);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto gradient-card border-white/60 !bg-[#ababab]">
        <DialogHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-gray-900">
                  Price History
                </DialogTitle>
                <p className="text-lg text-gray-600 font-medium">
                  {peptideName}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="bg-white/70 hover:bg-white"
              >
                <Share2 className="h-4 w-4 mr-1" />
                Share
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="bg-white/70 hover:bg-white"
              >
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="chart" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white/50">
            <TabsTrigger
              value="chart"
              className="data-[state=active]:bg-white cursor-pointer"
            >
              📈 Price Chart
            </TabsTrigger>
            <TabsTrigger
              value="summary"
              className="data-[state=active]:bg-white cursor-pointer"
            >
              📊 Price Summary
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chart" className="space-y-6">
            {/* Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 glass-effect rounded-lg border border-white/30">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">
                    Time Range:
                  </span>
                </div>
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-32 bg-white/70">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timeRanges.map((range) => (
                      <SelectItem key={range.value} value={range.value}>
                        {range.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">
                  Retailers:
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  {retailers.map((retailer) => (
                    <Badge
                      key={retailer}
                      variant={
                        selectedRetailers.includes(retailer)
                          ? "default"
                          : "outline"
                      }
                      className={`cursor-pointer transition-all ${
                        selectedRetailers.includes(retailer)
                          ? "text-white"
                          : "hover:bg-gray-100"
                      }`}
                      style={{
                        backgroundColor: selectedRetailers.includes(retailer)
                          ? retailerColors[retailer]
                          : undefined,
                      }}
                      onClick={() => {
                        if (selectedRetailers.includes(retailer)) {
                          if (selectedRetailers.length > 1) {
                            setSelectedRetailers(
                              selectedRetailers.filter((r) => r !== retailer)
                            );
                          }
                        } else {
                          setSelectedRetailers([
                            ...selectedRetailers,
                            retailer,
                          ]);
                        }
                      }}
                    >
                      {retailerNames[retailer] || retailer}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Price Chart */}
            <div className="p-6 glass-effect rounded-lg border border-white/30">
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={filteredData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={formatDate}
                      stroke="#64748b"
                      fontSize={12}
                    />
                    <YAxis
                      stroke="#64748b"
                      fontSize={12}
                      tickFormatter={(value) => `$${value}`}
                      domain={["dataMin - 5", "dataMax + 5"]}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    {selectedRetailers.map((retailer) => (
                      <Line
                        key={retailer}
                        type="monotone"
                        dataKey={retailer}
                        stroke={retailerColors[retailer]}
                        strokeWidth={3}
                        dot={{
                          fill: retailerColors[retailer],
                          strokeWidth: 2,
                          r: 3,
                        }}
                        activeDot={{
                          r: 6,
                          stroke: retailerColors[retailer],
                          strokeWidth: 2,
                        }}
                        name={retailerNames[retailer] || retailer}
                        connectNulls={false}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Quick Insights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 glass-effect rounded-lg border border-white/30">
                <h4 className="font-semibold text-gray-900 mb-2">
                  📈 Trend Analysis
                </h4>
                <p className="text-sm text-gray-600">
                  {Object.values(priceChanges).some((change) => change < -5)
                    ? "Prices have generally decreased over this period - great for buyers!"
                    : Object.values(priceChanges).some((change) => change > 5)
                    ? "Prices have been rising - consider buying soon."
                    : "Prices have remained relatively stable."}
                </p>
              </div>

              <div className="p-4 glass-effect rounded-lg border border-white/30">
                <h4 className="font-semibold text-gray-900 mb-2">
                  💰 Best Value
                </h4>
                <p className="text-sm text-gray-600">
                  {stats &&
                    `${
                      retailerNames[stats.lowest.retailer!] ||
                      stats.lowest.retailer
                    } consistently offers the lowest prices.`}
                </p>
              </div>

              <div className="p-4 glass-effect rounded-lg border border-white/30">
                <h4 className="font-semibold text-gray-900 mb-2">
                  📊 Price Volatility
                </h4>
                <p className="text-sm text-gray-600">
                  {stats && stats.range > 50
                    ? "High price variation between retailers - shop around!"
                    : "Low price variation - fairly consistent pricing."}
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="summary" className="space-y-6">
            {/* Current Prices */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(currentPrices).map(([retailer, price]) => (
                <div
                  key={retailer}
                  className="p-4 glass-effect rounded-lg border border-white/30 hover:shadow-lg transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: retailerColors[retailer] }}
                      />
                      <span className="font-medium text-gray-900">
                        {retailerNames[retailer] || retailer}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {priceChanges[retailer] < 0 ? (
                        <TrendingDown className="h-4 w-4 text-green-600" />
                      ) : priceChanges[retailer] > 0 ? (
                        <TrendingUp className="h-4 w-4 text-red-600" />
                      ) : (
                        <div className="h-4 w-4" />
                      )}
                    </div>
                  </div>

                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    ${price.toFixed(2)}
                  </div>

                  <div
                    className={`text-sm font-medium ${
                      priceChanges[retailer] < 0
                        ? "text-green-600"
                        : priceChanges[retailer] > 0
                        ? "text-red-600"
                        : "text-gray-500"
                    }`}
                  >
                    {priceChanges[retailer] > 0 ? "+" : ""}
                    {priceChanges[retailer].toFixed(1)}% ({timeRange})
                  </div>
                </div>
              ))}
            </div>

            {/* Price Statistics */}
            {stats && (
              <div className="p-6 glass-effect rounded-lg border border-white/30">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                  Price Statistics (
                  {timeRanges.find((r) => r.value === timeRange)?.label})
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 mb-1">
                      ${stats.lowest.price.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600">Lowest Price</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {retailerNames[stats.lowest.retailer!] ||
                        stats.lowest.retailer}
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600 mb-1">
                      ${stats.highest.price.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600">Highest Price</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {retailerNames[stats.highest.retailer!] ||
                        stats.highest.retailer}
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                      ${stats.average.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600">Average Price</div>
                    <div className="text-xs text-gray-500 mt-1">
                      All Retailers
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600 mb-1">
                      ${stats.range.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600">Price Range</div>
                    <div className="text-xs text-gray-500 mt-1">High - Low</div>
                  </div>
                </div>
              </div>
            )}

            {/* Best Deals Alert */}
            {stats && (
              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <TrendingDown className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-800">
                      💡 Smart Shopping Tip
                    </h4>
                    <p className="text-sm text-green-700">
                      {retailerNames[stats.lowest.retailer!] ||
                        stats.lowest.retailer}{" "}
                      offers the best price at ${stats.lowest.price.toFixed(2)}
                      {stats.range > 20 &&
                        ` - that's $${stats.range.toFixed(
                          2
                        )} less than the highest price!`}
                    </p>
                    {Object.entries(priceChanges).some(
                      ([_, change]) => change < -10
                    ) && (
                      <p className="text-sm text-green-700 mt-1">
                        🔥 Some retailers have dropped prices significantly
                        recently!
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Historical Performance */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 glass-effect rounded-lg border border-white/30">
                <h4 className="font-semibold text-gray-900 mb-3">
                  📈 Best Performers
                </h4>
                <div className="space-y-2">
                  {Object.entries(priceChanges)
                    .sort(([, a], [, b]) => a - b)
                    .slice(0, 3)
                    .map(([retailer, change]) => (
                      <div
                        key={retailer}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm text-gray-700">
                          {retailerNames[retailer] || retailer}
                        </span>
                        <span
                          className={`text-sm font-medium ${
                            change < 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {change > 0 ? "+" : ""}
                          {change.toFixed(1)}%
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              <div className="p-4 glass-effect rounded-lg border border-white/30">
                <h4 className="font-semibold text-gray-900 mb-3">
                  ⏰ Price Alerts
                </h4>
                <p className="text-sm text-gray-600 mb-2">
                  Get notified when prices drop below your target:
                </p>
                <Button
                  size="sm"
                  className="w-full"
                  onClick={() =>
                    toast.success("Price alert feature coming soon!")
                  }
                >
                  Set Price Alert
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
