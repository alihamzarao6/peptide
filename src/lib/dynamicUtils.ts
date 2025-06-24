import {
    Zap,
    Heart,
    TrendingUp,
    Clock,
    Brain,
    Target,
    Activity,
    Shield,
    Sparkles,
} from "lucide-react";

// Dynamic retailer utilities
export const generateRetailerColor = (retailerId: string): string => {
    // Generate consistent colors based on retailer ID hash
    const colors = [
        "from-blue-500 to-blue-600",
        "from-green-500 to-green-600",
        "from-purple-500 to-purple-600",
        "from-amber-500 to-amber-600",
        "from-red-500 to-red-600",
        "from-cyan-500 to-cyan-600",
        "from-indigo-500 to-indigo-600",
        "from-pink-500 to-pink-600",
        "from-teal-500 to-teal-600",
        "from-orange-500 to-orange-600",
        "from-violet-500 to-violet-600",
        "from-emerald-500 to-emerald-600",
    ];

    // Simple hash function for consistent color assignment
    let hash = 0;
    for (let i = 0; i < retailerId.length; i++) {
        const char = retailerId.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }

    return colors[Math.abs(hash) % colors.length];
};

export const generateRetailerHexColor = (retailerId: string): string => {
    // Generate hex colors for charts and other uses
    const colors = [
        "#3B82F6", // blue
        "#10B981", // green
        "#8B5CF6", // purple
        "#F59E0B", // amber
        "#EF4444", // red
        "#06B6D4", // cyan
        "#6366F1", // indigo
        "#EC4899", // pink
        "#14B8A6", // teal
        "#F97316", // orange
        "#8B5CF6", // violet
        "#059669", // emerald
    ];

    let hash = 0;
    for (let i = 0; i < retailerId.length; i++) {
        const char = retailerId.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }

    return colors[Math.abs(hash) % colors.length];
};

export const formatRetailerName = (retailerId: string): string => {
    // Handle common patterns and fallback to formatted version
    const commonNames: Record<string, string> = {
        aminoasylum: "Amino Asylum",
        modernaminos: "Modern Aminos",
        ascension: "Ascension Peptides",
        simple: "Simple Peptide",
        prime: "Prime Peptides",
        solution: "Solution Peptides",
        // Add more as they come from backend
        peptidehub: "Peptide Hub",
        biotechlabs: "Biotech Labs",
        peptideworld: "Peptide World",
        advancedbio: "Advanced Bio",
    };

    const normalizedId = retailerId.toLowerCase().replace(/[_-]/g, "");

    // Return known name first
    if (commonNames[normalizedId]) {
        return commonNames[normalizedId];
    }

    // Smart formatting for unknown retailers
    return retailerId
        .replace(/([A-Z])/g, " $1") // Add space before capitals (camelCase)
        .replace(/[-_]/g, " ") // Replace dashes/underscores with spaces
        .replace(/\d+/g, (match) => ` ${match}`) // Add space before numbers
        .split(" ")
        .filter(word => word.length > 0) // Remove empty strings
        .map(word => {
            // Handle common abbreviations
            const upperWords = ['LLC', 'CO', 'INC', 'LTD', 'USA', 'UK', 'EU'];
            if (upperWords.includes(word.toUpperCase())) {
                return word.toUpperCase();
            }
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        })
        .join(" ")
        .trim();
};

// Dynamic category utilities with intelligent fallbacks
export const getCategoryIcon = (category: string) => {
    const iconMap: Record<string, any> = {
        "fat-loss": Zap,
        "weight-loss": Zap,
        healing: Heart,
        recovery: Heart,
        "growth-hormone": TrendingUp,
        "muscle-growth": TrendingUp,
        "anti-aging": Clock,
        longevity: Clock,
        nootropic: Brain,
        cognitive: Brain,
        performance: Activity,
        wellness: Shield,
        beauty: Sparkles,
        // Add intelligent keyword matching for new categories
        sleep: Clock,
        energy: Zap,
        immune: Shield,
        digestive: Heart,
        skin: Sparkles,
        joint: Heart,
        stress: Brain,
        focus: Brain,
        endurance: Activity,
        strength: TrendingUp,
        mood: Brain,
    };

    const normalizedCategory = category.toLowerCase().replace(/[_\s-]+/g, "-");

    // Direct match
    if (iconMap[normalizedCategory]) {
        return iconMap[normalizedCategory];
    }

    // Keyword matching for unknown categories
    for (const [keyword, icon] of Object.entries(iconMap)) {
        if (normalizedCategory.includes(keyword) || keyword.includes(normalizedCategory)) {
            return icon;
        }
    }

    return Target; // Ultimate fallback
};

export const getCategoryColor = (category: string): string => {
    const colorMap: Record<string, string> = {
        "fat-loss": "bg-red-100 text-red-700 border-red-200",
        "weight-loss": "bg-red-100 text-red-700 border-red-200",
        healing: "bg-green-100 text-green-700 border-green-200",
        recovery: "bg-green-100 text-green-700 border-green-200",
        "growth-hormone": "bg-blue-100 text-blue-700 border-blue-200",
        "muscle-growth": "bg-blue-100 text-blue-700 border-blue-200",
        "anti-aging": "bg-purple-100 text-purple-700 border-purple-200",
        longevity: "bg-purple-100 text-purple-700 border-purple-200",
        nootropic: "bg-yellow-100 text-yellow-700 border-yellow-200",
        cognitive: "bg-yellow-100 text-yellow-700 border-yellow-200",
        performance: "bg-orange-100 text-orange-700 border-orange-200",
        wellness: "bg-teal-100 text-teal-700 border-teal-200",
        beauty: "bg-pink-100 text-pink-700 border-pink-200",
        // Add intelligent keyword matching
        sleep: "bg-indigo-100 text-indigo-700 border-indigo-200",
        energy: "bg-amber-100 text-amber-700 border-amber-200",
        immune: "bg-emerald-100 text-emerald-700 border-emerald-200",
        digestive: "bg-lime-100 text-lime-700 border-lime-200",
        skin: "bg-rose-100 text-rose-700 border-rose-200",
        joint: "bg-green-100 text-green-700 border-green-200",
        stress: "bg-slate-100 text-slate-700 border-slate-200",
        focus: "bg-violet-100 text-violet-700 border-violet-200",
        endurance: "bg-orange-100 text-orange-700 border-orange-200",
        strength: "bg-blue-100 text-blue-700 border-blue-200",
        mood: "bg-purple-100 text-purple-700 border-purple-200",
    };

    const normalizedCategory = category.toLowerCase().replace(/[_\s-]+/g, "-");

    // Direct match
    if (colorMap[normalizedCategory]) {
        return colorMap[normalizedCategory];
    }

    // Keyword matching for unknown categories
    for (const [keyword, color] of Object.entries(colorMap)) {
        if (normalizedCategory.includes(keyword) || keyword.includes(normalizedCategory)) {
            return color;
        }
    }

    // Generate color based on category hash if no match found
    return generateCategoryColor(category);
};

// Generate consistent colors for completely new categories
const generateCategoryColor = (category: string): string => {
    const colors = [
        "bg-red-100 text-red-700 border-red-200",
        "bg-blue-100 text-blue-700 border-blue-200",
        "bg-green-100 text-green-700 border-green-200",
        "bg-purple-100 text-purple-700 border-purple-200",
        "bg-yellow-100 text-yellow-700 border-yellow-200",
        "bg-pink-100 text-pink-700 border-pink-200",
        "bg-indigo-100 text-indigo-700 border-indigo-200",
        "bg-orange-100 text-orange-700 border-orange-200",
        "bg-teal-100 text-teal-700 border-teal-200",
        "bg-cyan-100 text-cyan-700 border-cyan-200",
    ];

    let hash = 0;
    for (let i = 0; i < category.length; i++) {
        const char = category.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }

    return colors[Math.abs(hash) % colors.length];
};

// Extract dynamic data from peptides
export const extractRetailersFromPeptides = (peptides: any[]): Array<{
    id: string;
    name: string;
    color: string;
    hexColor: string;
}> => {
    const retailerSet = new Set<string>();

    // Collect all unique retailer IDs
    peptides.forEach(peptide => {
        if (peptide.retailers) {
            peptide.retailers.forEach((retailer: any) => {
                retailerSet.add(retailer.retailer_id);
            });
        }
    });

    // Convert to array with colors
    return Array.from(retailerSet).map(retailerId => ({
        id: retailerId,
        name: formatRetailerName(retailerId),
        color: generateRetailerColor(retailerId),
        hexColor: generateRetailerHexColor(retailerId),
    }));
};

export const extractCategoriesFromPeptides = (peptides: any[]): Array<{
    id: string;
    name: string;
    color: string;
    icon: any;
}> => {
    const categorySet = new Set<string>();

    // Collect all unique categories
    peptides.forEach(peptide => {
        if (peptide.category) {
            categorySet.add(peptide.category);
        }
    });

    // Convert to array with metadata
    return Array.from(categorySet).map(category => ({
        id: category,
        name: category
            .split("-")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" "),
        color: getCategoryColor(category),
        icon: getCategoryIcon(category),
    }));
};

// Utility hooks for React components
export const useRetailerData = (peptides: any[]) => {
    const retailers = extractRetailersFromPeptides(peptides);

    const getRetailerById = (id: string) =>
        retailers.find(r => r.id === id) || {
            id,
            name: formatRetailerName(id),
            color: generateRetailerColor(id),
            hexColor: generateRetailerHexColor(id),
        };

    const getRetailerColor = (id: string) => getRetailerById(id).color;
    const getRetailerHexColor = (id: string) => getRetailerById(id).hexColor;
    const getRetailerName = (id: string) => getRetailerById(id).name;

    return {
        retailers,
        getRetailerById,
        getRetailerColor,
        getRetailerHexColor,
        getRetailerName,
    };
};

export const useCategoryData = (peptides: any[]) => {
    const categories = extractCategoriesFromPeptides(peptides);

    const getCategoryById = (id: string) =>
        categories.find(c => c.id === id) || {
            id,
            name: id.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase()),
            color: getCategoryColor(id),
            icon: getCategoryIcon(id),
        };

    return {
        categories,
        getCategoryById,
        getCategoryColor: (id: string) => getCategoryById(id).color,
        getCategoryIcon: (id: string) => getCategoryById(id).icon,
        getCategoryName: (id: string) => getCategoryById(id).name,
    };
};