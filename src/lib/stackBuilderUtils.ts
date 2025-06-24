// src/lib/stackBuilderUtils.ts

import { getCategoryIcon, getCategoryColor } from '@/lib/dynamicUtils';

export interface StackBuilderPeptide {
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
        retailer_name: string;
        price: number;
        discounted_price?: number;
        size: string;
        stock: boolean;
        affiliate_url: string;
        coupon_code?: string;
    }>;
}

export interface StackGoal {
    id: string;
    name: string;
    icon: any;
    color: string;
    description: string;
    recommendedPeptides: string[];
}

export interface GeneratedStackTemplate {
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

/**
 * Generate dynamic goals from categories and peptides
 */
export const generateGoalsFromData = (
    categories: any[],
    peptides: StackBuilderPeptide[]
): StackGoal[] => {
    return categories.map((category) => {
        const categoryPeptides = peptides.filter(p => p.category === category.id);

        return {
            id: category.id,
            name: category.name,
            icon: getCategoryIcon(category.id),
            color: getCategoryColor(category.id),
            description: generateGoalDescription(category.name),
            recommendedPeptides: categoryPeptides.map(p => p._id),
        };
    });
};

/**
 * Generate goal descriptions based on category
 */
export const generateGoalDescription = (categoryName: string): string => {
    const descriptions: Record<string, string> = {
        "Fat Loss": "Burn fat and improve body composition effectively",
        "Weight Loss": "Achieve sustainable weight management goals",
        "Healing": "Recovery and tissue repair peptides for optimal healing",
        "Recovery": "Accelerate recovery from training and injuries",
        "Growth Hormone": "Growth hormone releasing peptides for muscle growth",
        "Muscle Growth": "Build lean muscle mass and strength efficiently",
        "Anti-Aging": "Longevity and anti-aging compounds for wellness",
        "Longevity": "Support healthy aging and cellular regeneration",
        "Nootropic": "Cognitive enhancement peptides for mental performance",
        "Cognitive": "Improve focus, memory, and mental clarity",
        "Performance": "Enhance athletic performance and endurance",
        "Wellness": "Overall health and wellness support compounds",
        "Beauty": "Skin health and aesthetic enhancement peptides",
        "Sleep": "Improve sleep quality and recovery",
        "Energy": "Boost energy levels and vitality",
        "Immune": "Support immune system function",
        "Digestive": "Improve digestive health and gut function",
        "Joint": "Support joint health and mobility",
        "Stress": "Manage stress and promote relaxation",
    };

    return descriptions[categoryName] || `${categoryName} related peptides for optimal results`;
};

/**
 * Generate stack templates from peptide data
 */
export const generateStackTemplates = (
    peptides: StackBuilderPeptide[],
    categories: any[]
): GeneratedStackTemplate[] => {
    const templates: GeneratedStackTemplate[] = [];

    // Generate templates for each category
    categories.forEach((category) => {
        const categoryPeptides = peptides.filter(p => p.category === category.id);

        if (categoryPeptides.length >= 1) {
            // Beginner template (1-2 peptides)
            const beginnerPeptides = categoryPeptides
                .filter(p => !p.stackDifficulty || p.stackDifficulty === "Beginner")
                .slice(0, 2);

            if (beginnerPeptides.length >= 1) {
                templates.push({
                    id: `beginner-${category.id}`,
                    name: `Beginner ${category.name}`,
                    description: `Simple and effective ${category.name.toLowerCase()} stack for newcomers`,
                    goals: [category.id],
                    peptides: beginnerPeptides.map(p => ({
                        peptideId: p._id,
                        name: p.name,
                        dosage: p.dosages[0] || "5mg",
                        duration: p.stackDuration || 8,
                        timing: p.stackTiming || "As directed",
                    })),
                    estimatedCost: calculateTemplateCost(beginnerPeptides),
                    difficulty: "Beginner",
                });
            }

            // Intermediate template (2-3 peptides)
            const intermediatePeptides = categoryPeptides
                .filter(p => p.stackDifficulty === "Intermediate" || !p.stackDifficulty)
                .slice(0, 3);

            if (intermediatePeptides.length >= 2) {
                templates.push({
                    id: `intermediate-${category.id}`,
                    name: `Intermediate ${category.name}`,
                    description: `Balanced ${category.name.toLowerCase()} stack for regular users`,
                    goals: [category.id],
                    peptides: intermediatePeptides.map(p => ({
                        peptideId: p._id,
                        name: p.name,
                        dosage: p.dosages[0] || "5mg",
                        duration: p.stackDuration || 10,
                        timing: p.stackTiming || "As directed",
                    })),
                    estimatedCost: calculateTemplateCost(intermediatePeptides),
                    difficulty: "Intermediate",
                });
            }

            // Advanced template (3-4 peptides)
            const advancedPeptides = categoryPeptides.slice(0, 4);
            if (advancedPeptides.length >= 3) {
                templates.push({
                    id: `advanced-${category.id}`,
                    name: `Advanced ${category.name}`,
                    description: `Comprehensive ${category.name.toLowerCase()} stack for experienced users`,
                    goals: [category.id],
                    peptides: advancedPeptides.map(p => ({
                        peptideId: p._id,
                        name: p.name,
                        dosage: p.dosages[Math.min(1, p.dosages.length - 1)] || p.dosages[0] || "5mg", // Use higher dosage for advanced
                        duration: p.stackDuration || 12,
                        timing: p.stackTiming || "As directed",
                    })),
                    estimatedCost: calculateTemplateCost(advancedPeptides),
                    difficulty: "Advanced",
                });
            }
        }
    });

    // Generate combination templates for popular goal combinations
    const popularCombinations = [
        {
            goals: ["fat-loss", "muscle-growth"],
            name: "Body Recomposition",
            description: "Burn fat while building lean muscle mass",
        },
        {
            goals: ["healing", "recovery"],
            name: "Recovery & Healing",
            description: "Comprehensive recovery and tissue repair",
        },
        {
            goals: ["anti-aging", "wellness"],
            name: "Anti-Aging Wellness",
            description: "Longevity and overall health optimization",
        },
    ];

    popularCombinations.forEach((combo) => {
        const comboPeptides: StackBuilderPeptide[] = [];
        combo.goals.forEach(goalId => {
            const goalPeptides = peptides.filter(p => p.category === goalId).slice(0, 2);
            comboPeptides.push(...goalPeptides);
        });

        if (comboPeptides.length >= 2) {
            templates.push({
                id: `combo-${combo.goals.join("-")}`,
                name: combo.name,
                description: combo.description,
                goals: combo.goals,
                peptides: comboPeptides.map(p => ({
                    peptideId: p._id,
                    name: p.name,
                    dosage: p.dosages[0] || "5mg",
                    duration: p.stackDuration || 10,
                    timing: p.stackTiming || "As directed",
                })),
                estimatedCost: calculateTemplateCost(comboPeptides),
                difficulty: "Intermediate",
            });
        }
    });

    return templates;
};

/**
 * Calculate estimated cost for a template
 */
export const calculateTemplateCost = (peptides: StackBuilderPeptide[]): number => {
    return peptides.reduce((total, peptide) => {
        if (peptide.retailers.length > 0) {
            // Use average price across retailers
            const avgPrice = peptide.retailers.reduce((sum, r) =>
                sum + (r.discounted_price || r.price), 0
            ) / peptide.retailers.length;
            return total + avgPrice;
        }
        return total;
    }, 0);
};

/**
 * Filter peptides by goals
 */
export const filterPeptidesByGoals = (
    peptides: StackBuilderPeptide[],
    selectedGoals: string[]
): StackBuilderPeptide[] => {
    if (selectedGoals.length === 0) return [];

    return peptides.filter(peptide =>
        selectedGoals.includes(peptide.category) ||
        (peptide.recommendedForGoals &&
            peptide.recommendedForGoals.some(goal => selectedGoals.includes(goal)))
    );
};

/**
 * Get best retailer for a peptide (lowest price, in stock)
 */
export const getBestRetailer = (peptide: StackBuilderPeptide) => {
    const inStockRetailers = peptide.retailers.filter(r => r.stock);

    if (inStockRetailers.length === 0) {
        return peptide.retailers[0]; // Return first retailer if none in stock
    }

    // Find retailer with lowest price (considering discounts)
    return inStockRetailers.reduce((best, current) => {
        const bestPrice = best.discounted_price || best.price;
        const currentPrice = current.discounted_price || current.price;
        return currentPrice < bestPrice ? current : best;
    });
};

/**
 * Validate stack for conflicts or issues
 */
export const validateStack = (stackItems: any[]): {
    isValid: boolean;
    warnings: string[];
    errors: string[];
} => {
    const warnings: string[] = [];
    const errors: string[] = [];

    // Check for too many peptides
    if (stackItems.length > 5) {
        warnings.push("Consider reducing stack size - more than 5 peptides may be complex to manage");
    }

    // Check for out of stock items
    const outOfStock = stackItems.filter(item => !item.inStock);
    if (outOfStock.length > 0) {
        warnings.push(`${outOfStock.length} item(s) are out of stock`);
    }

    // Check for very long durations
    const longDurations = stackItems.filter(item => item.duration > 16);
    if (longDurations.length > 0) {
        warnings.push("Some cycles are longer than 16 weeks - consider cycling breaks");
    }

    // Check for missing coupon codes
    const missedSavings = stackItems.filter(item => !item.couponCode && item.discountedPrice);
    if (missedSavings.length > 0) {
        warnings.push("Some items may have available discount codes");
    }

    return {
        isValid: errors.length === 0,
        warnings,
        errors,
    };
};

/**
 * Calculate stack statistics
 */
export const calculateStackStats = (stackItems: any[]) => {
    const totalCost = stackItems.reduce((sum, item) =>
        sum + (item.discountedPrice || item.pricePerUnit) * item.quantity, 0
    );

    const totalSavings = stackItems.reduce((sum, item) => {
        if (item.discountedPrice) {
            return sum + (item.pricePerUnit - item.discountedPrice) * item.quantity;
        }
        return sum;
    }, 0);

    const avgDuration = stackItems.length > 0
        ? stackItems.reduce((sum, item) => sum + item.duration, 0) / stackItems.length
        : 0;

    const categories = Array.from(new Set(stackItems.map(item => item.category)));

    const retailers = Array.from(new Set(stackItems.map(item => item.retailerId)));

    return {
        totalCost,
        totalSavings,
        avgDuration: Math.round(avgDuration),
        categoriesCount: categories.length,
        retailersCount: retailers.length,
        itemsCount: stackItems.length,
        totalQuantity: stackItems.reduce((sum, item) => sum + item.quantity, 0),
        savingsPercentage: totalCost > 0 ? (totalSavings / (totalCost + totalSavings)) * 100 : 0,
    };
};

/**
 * Export stack data for sharing or saving
 */
export const exportStackData = (stackItems: any[], format: 'json' | 'csv' | 'text' = 'json') => {
    const stats = calculateStackStats(stackItems);

    switch (format) {
        case 'json':
            return JSON.stringify({
                stack: stackItems,
                summary: stats,
                exportDate: new Date().toISOString(),
            }, null, 2);

        case 'csv':
            const headers = 'Peptide,Retailer,Dosage,Quantity,Duration,Price,Discounted Price,Coupon Code,In Stock';
            const rows = stackItems.map(item =>
                `"${item.peptideName}","${item.retailerName}","${item.dosage}",${item.quantity},${item.duration},${item.pricePerUnit},${item.discountedPrice || ''},"${item.couponCode || ''}",${item.inStock}`
            );
            return [headers, ...rows].join('\n');

        case 'text':
            const textOutput = [
                'PEPTIDE STACK SUMMARY',
                '===================',
                '',
                `Total Items: ${stats.itemsCount}`,
                `Total Cost: ${stats.totalCost.toFixed(2)}`,
                `Total Savings: ${stats.totalSavings.toFixed(2)}`,
                `Average Duration: ${stats.avgDuration} weeks`,
                '',
                'STACK ITEMS:',
                '------------',
                ...stackItems.map(item =>
                    `• ${item.peptideName} (${item.dosage}) - ${item.retailerName} - ${(item.discountedPrice || item.pricePerUnit).toFixed(2)}${item.couponCode ? ` (Code: ${item.couponCode})` : ''}`
                ),
                '',
                `Exported on: ${new Date().toLocaleDateString()}`,
            ];
            return textOutput.join('\n');

        default:
            return JSON.stringify(stackItems);
    }
};

/**
 * Generate stack recommendations based on user preferences
 */
export const generateStackRecommendations = (
    peptides: StackBuilderPeptide[],
    userGoals: string[],
    experience: 'beginner' | 'intermediate' | 'advanced' = 'beginner',
    budget?: number
): {
    recommended: StackBuilderPeptide[];
    reasoning: string[];
} => {
    let recommended: StackBuilderPeptide[] = [];
    const reasoning: string[] = [];

    if (userGoals.length === 0) {
        return { recommended: [], reasoning: ['Please select your goals to get recommendations'] };
    }

    // Filter by goals
    const goalPeptides = filterPeptidesByGoals(peptides, userGoals);

    // Filter by experience level
    let experienceFiltered = goalPeptides;
    if (experience === 'beginner') {
        experienceFiltered = goalPeptides.filter(p =>
            !p.stackDifficulty || p.stackDifficulty === 'Beginner'
        );
        reasoning.push('Filtered to beginner-friendly peptides');
    } else if (experience === 'advanced') {
        experienceFiltered = goalPeptides.filter(p =>
            p.stackDifficulty === 'Advanced' || p.stackDifficulty === 'Intermediate'
        );
        reasoning.push('Including intermediate and advanced peptides');
    }

    // Sort by best value (price, availability, ratings)
    const sorted = experienceFiltered.sort((a, b) => {
        const aRetailer = getBestRetailer(a);
        const bRetailer = getBestRetailer(b);

        const aPrice = aRetailer.discounted_price || aRetailer.price;
        const bPrice = bRetailer.discounted_price || bRetailer.price;

        // Prioritize in-stock items
        if (aRetailer.stock !== bRetailer.stock) {
            return bRetailer.stock ? 1 : -1;
        }

        // Then sort by price
        return aPrice - bPrice;
    });

    // Select appropriate number based on experience
    const maxPeptides = experience === 'beginner' ? 2 : experience === 'intermediate' ? 3 : 4;
    recommended = sorted.slice(0, maxPeptides);

    // Filter by budget if provided
    if (budget) {
        const totalCost = recommended.reduce((sum, p) => {
            const retailer = getBestRetailer(p);
            return sum + (retailer.discounted_price || retailer.price);
        }, 0);

        if (totalCost > budget) {
            // Try to fit within budget
            recommended = [];
            let currentCost = 0;

            for (const peptide of sorted) {
                const retailer = getBestRetailer(peptide);
                const cost = retailer.discounted_price || retailer.price;

                if (currentCost + cost <= budget) {
                    recommended.push(peptide);
                    currentCost += cost;
                }
            }

            reasoning.push(`Adjusted recommendations to fit ${budget} budget`);
        }
    }

    // Add reasoning based on selections
    if (recommended.length > 0) {
        reasoning.push(`Selected ${recommended.length} peptides for your ${userGoals.join(', ')} goals`);
        reasoning.push('Prioritized in-stock items with best prices');
    } else {
        reasoning.push('No suitable peptides found for your criteria');
    }

    return { recommended, reasoning };
};