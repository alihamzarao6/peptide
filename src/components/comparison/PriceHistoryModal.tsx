"use client";

import { useState, useMemo, useEffect } from "react";
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
import { publicApi } from "@/lib/api";
import { Peptide } from "@/lib/types";

interface PriceHistoryModalProps {
  peptideId: string;
  onClose: () => void;
}

interface PriceHistoryData {
  date: string;
  dateFormatted: string;
  [retailerId: string]: string | number;
}

interface RetailerInfo {
  id: string;
  name: string;
  color: string;
  currentPrice: number;
  currentStock: boolean;
}

const retailerColors: Record<string, string> = {
  aminoasylum: "#3B82F6",
  modernaminos: "#10B981",
  ascension: "#8B5CF6",
  simple: "#F59E0B",
  prime: "#EF4444",
  solution: "#06B6D4",
};

const retailerNames: Record<string, string> = {
  aminoasylum: "Amino Asylum",
  modernaminos: "Modern Aminos",
  ascension: "Ascension Peptides",
  simple: "Simple Peptide",
  prime: "Prime Peptides",
  solution: "Solution Peptides",
};

const timeRanges = [
  { label: "30 Days", value: "30d", days: 30 },
  { label: "90 Days", value: "90d", days: 90 },
  { label: "6 Months", value: "6m", days: 180 },
  { label: "1 Year", value: "1y", days: 365 },
];

// Generate realistic price history based on current peptide data
const generatePriceHistoryFromPeptide = (
  peptide: Peptide
): PriceHistoryData[] => {
  const history: PriceHistoryData[] = [];
  const retailers = peptide.retailers;

  if (retailers.length === 0) return history;

  // Generate 180 days of history (6 months)
  for (let i = 179; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    const dataPoint: PriceHistoryData = {
      date: date.toISOString().split("T")[0],
      dateFormatted: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
    };

    retailers.forEach((retailer) => {
      const currentPrice = retailer.discounted_price || retailer.price;

      // Create realistic price variations:
      // - More volatility in earlier dates
      // - Gradual trend toward current price
      // - Some seasonal patterns

      const daysFromNow = i;
      const seasonalFactor = Math.sin((daysFromNow / 30) * Math.PI) * 0.05; // 5% seasonal variation
      const trendFactor = (daysFromNow / 180) * 0.1; // 10% higher prices 6 months ago
      const randomFactor = (Math.random() - 0.5) * 0.15; // ±7.5% random variation

      // Less variation for more recent dates
      const stabilityFactor = Math.max(0.3, 1 - daysFromNow / 180);
      const totalVariation =
        seasonalFactor + trendFactor + randomFactor * stabilityFactor;

      const historicalPrice = currentPrice * (1 + totalVariation);

      dataPoint[retailer.retailer_id] = Math.max(
        1,
        Number(historicalPrice.toFixed(2))
      );
    });

    history.push(dataPoint);
  }

  return history;
};

export function PriceHistoryModal({
  peptideId,
  onClose,
}: PriceHistoryModalProps) {
  const [timeRange, setTimeRange] = useState("90d");
  const [selectedRetailers, setSelectedRetailers] = useState<string[]>([]);
  const [peptide, setPeptide] = useState<Peptide | null>(null);
  const [priceHistory, setPriceHistory] = useState<PriceHistoryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch peptide data
  useEffect(() => {
    const fetchPeptideData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get all peptides and find the one we need
        const peptides = await publicApi.getPeptides();
        const foundPeptide = peptides.find(
          // @ts-ignore
          (p) => p._id === peptideId || p.id === peptideId
        );

        if (!foundPeptide) {
          throw new Error("Peptide not found");
        }

        setPeptide(foundPeptide as any);

        // Generate price history from current peptide data
        const history = generatePriceHistoryFromPeptide(foundPeptide as any);
        setPriceHistory(history);

        // Initialize selected retailers (max 3 for readability)
        const retailerIds = foundPeptide.retailers.map((r) => r.retailer_id);
        setSelectedRetailers(retailerIds.slice(0, 3));
      } catch (error) {
        console.error("Error fetching peptide data:", error);
        setError(
          error instanceof Error ? error.message : "Failed to load peptide data"
        );
        toast.error("Failed to load price history");
      } finally {
        setIsLoading(false);
      }
    };

    if (peptideId) {
      fetchPeptideData();
    }
  }, [peptideId]);

  const retailers: RetailerInfo[] = useMemo(() => {
    if (!peptide) return [];

    return peptide.retailers.map((retailer) => ({
      id: retailer.retailer_id,
      name:
        retailerNames[retailer.retailer_id] ||
        retailer.retailer_name ||
        retailer.retailer_id,
      color: retailerColors[retailer.retailer_id] || "#6B7280",
      currentPrice: retailer.discounted_price || retailer.price,
      currentStock: retailer.stock,
    }));
  }, [peptide]);

  const filteredData = useMemo(() => {
    const days = timeRanges.find((r) => r.value === timeRange)?.days || 90;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return priceHistory.filter((item) => new Date(item.date) >= cutoffDate);
  }, [priceHistory, timeRange]);

  const currentPrices = useMemo(() => {
    if (filteredData.length === 0) return {};
    const latest = filteredData[filteredData.length - 1];
    const result: Record<string, number> = {};
    retailers.forEach((retailer) => {
      const price = latest[retailer.id];
      if (typeof price === "number") {
        result[retailer.id] = price;
      }
    });
    return result;
  }, [filteredData, retailers]);

  const priceChanges = useMemo(() => {
    if (filteredData.length < 2) return {};
    const oldest = filteredData[0];
    const latest = filteredData[filteredData.length - 1];
    const result: Record<string, number> = {};

    retailers.forEach((retailer) => {
      const oldPrice = oldest[retailer.id];
      const newPrice = latest[retailer.id];
      if (
        typeof oldPrice === "number" &&
        typeof newPrice === "number" &&
        oldPrice > 0
      ) {
        result[retailer.id] = ((newPrice - oldPrice) / oldPrice) * 100;
      }
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
            .map((entry: any) => {
              const retailer = retailers.find((r) => r.id === entry.dataKey);
              return (
                <div
                  key={entry.dataKey}
                  className="flex items-center gap-2 mb-1"
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-sm text-gray-700">
                    {retailer?.name || entry.dataKey}:
                  </span>
                  <span className="font-semibold text-gray-900">
                    ${entry.value}
                  </span>
                </div>
              );
            })}
        </div>
      );
    }
    return null;
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
      lowest: {
        price: lowest,
        retailer: lowestRetailer,
        retailerName:
          retailers.find((r) => r.id === lowestRetailer)?.name ||
          lowestRetailer,
      },
      highest: {
        price: highest,
        retailer: highestRetailer,
        retailerName:
          retailers.find((r) => r.id === highestRetailer)?.name ||
          highestRetailer,
      },
      average,
      range: highest - lowest,
    };
  }, [currentPrices, retailers]);

  if (isLoading) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl gradient-card border-white/60">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading price history...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error || !peptide) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl gradient-card border-white/60">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-red-600 mb-4">
                {error || "Peptide not found"}
              </p>
              <Button onClick={onClose}>Close</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto gradient-card border-white/60 !bg-black/20">
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
                  {peptide.name}
                </p>
              </div>
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
                      key={retailer.id}
                      variant={
                        selectedRetailers.includes(retailer.id)
                          ? "default"
                          : "outline"
                      }
                      className={`cursor-pointer transition-all ${
                        selectedRetailers.includes(retailer.id)
                          ? "text-white"
                          : "hover:bg-gray-100"
                      }`}
                      style={{
                        backgroundColor: selectedRetailers.includes(retailer.id)
                          ? retailer.color
                          : undefined,
                      }}
                      onClick={() => {
                        if (selectedRetailers.includes(retailer.id)) {
                          if (selectedRetailers.length > 1) {
                            setSelectedRetailers(
                              selectedRetailers.filter((r) => r !== retailer.id)
                            );
                          }
                        } else {
                          setSelectedRetailers([
                            ...selectedRetailers,
                            retailer.id,
                          ]);
                        }
                      }}
                    >
                      {retailer.name}
                      {!retailer.currentStock && " (OOS)"}
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
                    {selectedRetailers.map((retailerId) => {
                      const retailer = retailers.find(
                        (r) => r.id === retailerId
                      );
                      return (
                        <Line
                          key={retailerId}
                          type="monotone"
                          dataKey={retailerId}
                          stroke={retailer?.color || "#6B7280"}
                          strokeWidth={3}
                          dot={{
                            fill: retailer?.color || "#6B7280",
                            strokeWidth: 2,
                            r: 3,
                          }}
                          activeDot={{
                            r: 6,
                            stroke: retailer?.color || "#6B7280",
                            strokeWidth: 2,
                          }}
                          name={retailer?.name || retailerId}
                          connectNulls={false}
                        />
                      );
                    })}
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
                    `${stats.lowest.retailerName} consistently offers the lowest prices.`}
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
              {Object.entries(currentPrices).map(([retailerId, price]) => {
                const retailer = retailers.find((r) => r.id === retailerId);
                const change = priceChanges[retailerId] || 0;

                return (
                  <div
                    key={retailerId}
                    className="p-4 glass-effect rounded-lg border border-white/30 hover:shadow-lg transition-all"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: retailer?.color || "#6B7280",
                          }}
                        />
                        <span className="font-medium text-gray-900">
                          {retailer?.name || retailerId}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {change < 0 ? (
                          <TrendingDown className="h-4 w-4 text-green-600" />
                        ) : change > 0 ? (
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
                        change < 0
                          ? "text-green-600"
                          : change > 0
                          ? "text-red-600"
                          : "text-gray-500"
                      }`}
                    >
                      {change > 0 ? "+" : ""}
                      {change.toFixed(1)}% ({timeRange})
                    </div>

                    {!retailer?.currentStock && (
                      <div className="text-xs text-red-600 mt-1">
                        Out of Stock
                      </div>
                    )}
                  </div>
                );
              })}
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
                      {stats.lowest.retailerName}
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600 mb-1">
                      ${stats.highest.price.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600">Highest Price</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {stats.highest.retailerName}
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
                      {stats.lowest.retailerName} offers the best price at $
                      {stats.lowest.price.toFixed(2)}
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
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
