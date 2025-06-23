"use client";
import React, { useState, useEffect } from "react";
import {
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Eye,
  EyeOff,
  Package,
  PackageX,
  ExternalLink,
  TestTube2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Peptide {
  id: string;
  name: string;
  category: string;
  description: string;
  dosages: string[];
  unit: "mg" | "mcg" | "iu";
  tags: string[];
  status: "active" | "inactive";
  retailersCount: number;
  lowestPrice: number;
  highestPrice: number;
  avgRating: number;
  totalReviews: number;
  createdAt: string;
  updatedAt: string;
}

export default function PeptideManagementTable() {
  const [peptides, setPeptides] = useState<Peptide[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeptides, setSelectedPeptides] = useState<string[]>([]);

  // Mock data - replace with API call
  const mockPeptides: Peptide[] = [
    {
      id: "1",
      name: "BPC-157",
      category: "healing",
      description:
        "Body Protection Compound 157 is a synthetic peptide that is being investigated...",
      dosages: ["5mg", "10mg", "15mg"],
      unit: "mg",
      tags: ["Healing", "Recovery", "Tissue Repair"],
      status: "active",
      retailersCount: 3,
      lowestPrice: 24.79,
      highestPrice: 35.0,
      avgRating: 4.6,
      totalReviews: 234,
      createdAt: "2024-01-15",
      updatedAt: "2024-06-20",
    },
    {
      id: "2",
      name: "Retatrutide",
      category: "fat-loss",
      description:
        "Retatrutide is an investigational once-weekly injectable peptide...",
      dosages: ["5mg", "10mg", "15mg"],
      unit: "mg",
      tags: ["GLP-1", "Weight Loss", "Diabetes"],
      status: "active",
      retailersCount: 2,
      lowestPrice: 61.2,
      highestPrice: 174.99,
      avgRating: 4.7,
      totalReviews: 134,
      createdAt: "2024-02-10",
      updatedAt: "2024-06-22",
    },
    {
      id: "3",
      name: "NAD+",
      category: "anti-aging",
      description:
        "NAD+ (nicotinamide adenine dinucleotide) is a vital coenzyme...",
      dosages: ["500mg", "1000mg"],
      unit: "mg",
      tags: ["Anti-aging", "Energy", "Longevity"],
      status: "inactive",
      retailersCount: 2,
      lowestPrice: 47.99,
      highestPrice: 190.0,
      avgRating: 4.4,
      totalReviews: 112,
      createdAt: "2024-01-20",
      updatedAt: "2024-06-18",
    },
  ];

  useEffect(() => {
    // Simulate API loading
    setTimeout(() => {
      setPeptides(mockPeptides);
      setIsLoading(false);
    }, 1000);
  }, []);

  const categories = [
    "fat-loss",
    "healing",
    "growth-hormone",
    "anti-aging",
    "nootropic",
  ];

  const filteredPeptides = peptides.filter((peptide) => {
    const matchesSearch =
      peptide.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      peptide.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      peptide.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesCategory =
      !filterCategory || peptide.category === filterCategory;
    const matchesStatus = !filterStatus || peptide.status === filterStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleDelete = async (id: string) => {
    if (
      confirm(
        "Are you sure you want to delete this peptide? This action cannot be undone."
      )
    ) {
      try {
        // API call to delete peptide
        setPeptides((prev) => prev.filter((p) => p.id !== id));
        // Show success message
      } catch (error) {
        console.error("Error deleting peptide:", error);
      }
    }
  };

  const handleStatusToggle = async (id: string) => {
    try {
      setPeptides((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, status: p.status === "active" ? "inactive" : "active" }
            : p
        )
      );
      // API call to update status
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleBulkAction = async (
    action: "activate" | "deactivate" | "delete"
  ) => {
    if (selectedPeptides.length === 0) return;

    if (action === "delete") {
      if (
        !confirm(
          `Are you sure you want to delete ${selectedPeptides.length} peptides?`
        )
      ) {
        return;
      }
    }

    try {
      // API calls for bulk actions
      if (action === "delete") {
        setPeptides((prev) =>
          prev.filter((p) => !selectedPeptides.includes(p.id))
        );
      } else {
        const newStatus = action === "activate" ? "active" : "inactive";
        setPeptides((prev) =>
          prev.map((p) =>
            selectedPeptides.includes(p.id) ? { ...p, status: newStatus } : p
          )
        );
      }
      setSelectedPeptides([]);
    } catch (error) {
      console.error("Error performing bulk action:", error);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      "fat-loss": "bg-red-100 text-red-700 border-red-200",
      healing: "bg-green-100 text-green-700 border-green-200",
      "growth-hormone": "bg-blue-100 text-blue-700 border-blue-200",
      "anti-aging": "bg-purple-100 text-purple-700 border-purple-200",
      nootropic: "bg-yellow-100 text-yellow-700 border-yellow-200",
    };
    return colors[category] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl shadow-lg">
                <TestTube2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
                  Peptide Management
                </h1>
                <p className="text-gray-600">
                  Manage all peptides in your database
                </p>
              </div>
            </div>

            <Button
              onClick={() => (window.location.href = "/admin/add-peptide")}
              className="gradient-primary text-white shadow-lg hover:shadow-xl transition-all"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Peptide
            </Button>
          </div>
        </div>

        {/* Filters and Search */}
        <Card className="gradient-card border-white/60 shadow-xl p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search peptides..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/70"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="w-full lg:w-48">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white/70 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.replace("-", " ").toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="w-full lg:w-48">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white/70 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Results Summary */}
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {filteredPeptides.length} of {peptides.length} peptides
            </div>

            {selectedPeptides.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {selectedPeptides.length} selected
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkAction("activate")}
                  >
                    Activate
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkAction("delete")}
                    className="text-red-600 hover:text-red-700"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Table */}
        <Card className="gradient-card border-white/60 shadow-xl overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="w-8 h-8 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading peptides...</p>
            </div>
          ) : filteredPeptides.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <TestTube2 className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No peptides found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search or filters, or add a new peptide.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50/50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left">
                      <input
                        type="checkbox"
                        checked={
                          selectedPeptides.length === filteredPeptides.length
                        }
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedPeptides(
                              filteredPeptides.map((p) => p.id)
                            );
                          } else {
                            setSelectedPeptides([]);
                          }
                        }}
                        className="rounded"
                      />
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">
                      Peptide
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">
                      Category
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">
                      Dosages
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">
                      Retailers
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">
                      Price Range
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">
                      Rating
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">
                      Last Updated
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredPeptides.map((peptide) => (
                    <tr
                      key={peptide.id}
                      className="hover:bg-white/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedPeptides.includes(peptide.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedPeptides((prev) => [
                                ...prev,
                                peptide.id,
                              ]);
                            } else {
                              setSelectedPeptides((prev) =>
                                prev.filter((id) => id !== peptide.id)
                              );
                            }
                          }}
                          className="rounded"
                        />
                      </td>

                      <td className="px-6 py-4">
                        <div>
                          <div className="font-semibold text-gray-900">
                            {peptide.name}
                          </div>
                          <div className="text-sm text-gray-600 max-w-xs truncate">
                            {peptide.description}
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {peptide.tags.slice(0, 2).map((tag) => (
                              <Badge
                                key={tag}
                                variant="secondary"
                                className="text-xs"
                              >
                                {tag}
                              </Badge>
                            ))}
                            {peptide.tags.length > 2 && (
                              <Badge variant="secondary" className="text-xs">
                                +{peptide.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <Badge className={getCategoryColor(peptide.category)}>
                          {peptide.category.replace("-", " ").toUpperCase()}
                        </Badge>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {peptide.dosages.map((dosage) => (
                            <Badge
                              key={dosage}
                              variant="outline"
                              className="text-xs"
                            >
                              {dosage}
                            </Badge>
                          ))}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-900">
                            {peptide.retailersCount}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="text-gray-900 font-medium">
                            ${peptide.lowestPrice} - ${peptide.highestPrice}
                          </div>
                          <div className="text-gray-500">
                            Best: ${peptide.lowestPrice}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="flex items-center gap-1">
                            <span className="text-yellow-400">★</span>
                            <span className="text-gray-900">
                              {peptide.avgRating}
                            </span>
                          </div>
                          <div className="text-gray-500">
                            ({peptide.totalReviews} reviews)
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleStatusToggle(peptide.id)}
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                            peptide.status === "active"
                              ? "bg-green-100 text-green-700 hover:bg-green-200"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          {peptide.status === "active" ? (
                            <>
                              <Eye className="h-3 w-3" />
                              Active
                            </>
                          ) : (
                            <>
                              <EyeOff className="h-3 w-3" />
                              Inactive
                            </>
                          )}
                        </button>
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(peptide.updatedAt).toLocaleDateString()}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              window.open(`/peptide/${peptide.id}`, "_blank")
                            }
                            className="text-gray-600 hover:text-gray-700"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              (window.location.href = `/admin/edit-peptide/${peptide.id}`)
                            }
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(peptide.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Stats Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="gradient-card border-white/60 shadow-xl p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TestTube2 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {peptides.length}
                </div>
                <div className="text-sm text-gray-600">Total Peptides</div>
              </div>
            </div>
          </Card>

          <Card className="gradient-card border-white/60 shadow-xl p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Package className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {peptides.filter((p) => p.status === "active").length}
                </div>
                <div className="text-sm text-gray-600">Active Peptides</div>
              </div>
            </div>
          </Card>

          <Card className="gradient-card border-white/60 shadow-xl p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <MoreVertical className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {categories.length}
                </div>
                <div className="text-sm text-gray-600">Categories</div>
              </div>
            </div>
          </Card>

          <Card className="gradient-card border-white/60 shadow-xl p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <ExternalLink className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {peptides.reduce((sum, p) => sum + p.retailersCount, 0)}
                </div>
                <div className="text-sm text-gray-600">Total Retailers</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
