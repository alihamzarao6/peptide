export const dummy_data = {
  retailers: [
    {
      id: "aminoasylum",
      name: "Amino Asylum",
      slug: "amino-asylum",
      logo: "/logos/amino-asylum.png",
      website: "https://aminoasylum.shop",
      rating: 4.6,
      total_reviews: 1250,
      coupon_code: "derek",
      shipping_countries: ["US", "CA"],
      description: "Premium research peptides with fast shipping",
      color: "#3B82F6",
    },
    {
      id: "modernaminos",
      name: "Modern Aminos",
      slug: "modern-aminos",
      logo: "/logos/modern-aminos.png",
      website: "https://modernaminos.com",
      rating: 4.7,
      total_reviews: 890,
      coupon_code: "derek",
      shipping_countries: ["US", "CA", "EU"],
      description: "High-quality peptides with excellent customer service",
      color: "#10B981",
    },
    {
      id: "ascension",
      name: "Ascension Peptides",
      slug: "ascension-peptides",
      logo: "/logos/ascension.png",
      website: "https://ascensionpeptides.com",
      rating: 4.5,
      total_reviews: 756,
      coupon_code: "derek",
      shipping_countries: ["US"],
      description: "USA-made peptides with third-party testing",
      color: "#8B5CF6",
    },
    {
      id: "simple",
      name: "Simple Peptide",
      slug: "simple-peptide",
      logo: "/logos/simple-peptide.png",
      website: "https://simplepeptide.com",
      rating: 5.0,
      total_reviews: 432,
      coupon_code: "derek",
      shipping_countries: ["US", "CA"],
      description: "Simplified ordering with premium quality",
      color: "#F59E0B",
    },
    {
      id: "prime",
      name: "Prime Peptides",
      slug: "prime-peptides",
      logo: "/logos/prime-peptides.png",
      website: "https://primepeptides.co",
      rating: 4.3,
      total_reviews: 567,
      shipping_countries: ["US", "CA", "EU"],
      description: "Premium peptides at competitive prices",
      color: "#EF4444",
    },
    {
      id: "solution",
      name: "Solution Peptides",
      slug: "solution-peptides",
      logo: "/logos/solution-peptides.png",
      website: "https://solutionpeptides.com",
      rating: 5.0,
      total_reviews: 289,
      coupon_code: "derek",
      shipping_countries: ["US"],
      description: "Affordable solutions for research needs",
      color: "#06B6D4",
    },
  ],
  categories: [
    {
      id: "fat-loss",
      name: "Fat Loss",
      slug: "fat-loss",
      description: "Peptides for weight management and fat burning",
      color: "#EF4444",
      icon: "Zap",
      peptide_count: 15,
    },
    {
      id: "healing",
      name: "Healing",
      slug: "healing",
      description: "Recovery and tissue repair peptides",
      color: "#10B981",
      icon: "Heart",
      peptide_count: 12,
    },
    {
      id: "growth-hormone",
      name: "Growth Hormone",
      slug: "growth-hormone",
      description: "Growth hormone releasing peptides",
      color: "#3B82F6",
      icon: "TrendingUp",
      peptide_count: 18,
    },
    {
      id: "anti-aging",
      name: "Anti-Aging",
      slug: "anti-aging",
      description: "Longevity and anti-aging compounds",
      color: "#8B5CF6",
      icon: "Clock",
      peptide_count: 8,
    },
    {
      id: "nootropic",
      name: "Nootropic",
      slug: "nootropic",
      description: "Cognitive enhancement peptides",
      color: "#F59E0B",
      icon: "Brain",
      peptide_count: 6,
    },
  ],
  peptides: [
    {
      id: "retatrutide",
      name: "Retatrutide",
      slug: "retatrutide",
      category: "fat-loss",
      description:
        "Retatrutide is an investigational once-weekly injectable peptide that acts as a triple agonist of the GLP-1, GIP, and glucagon receptors.",
      dosages: ["5mg", "10mg", "15mg"],
      unit: "mg",
      tags: ["GLP-1", "Weight Loss", "Diabetes"],
      retailers: [
        {
          retailer_id: "aminoasylum",
          product_id: "retatru-5mg",
          price: 174.99,
          discounted_price: 139.99,
          discount_percentage: 20,
          stock: true,
          rating: 4.8,
          review_count: 89,
          affiliate_url:
            "https://aminoasylum.shop/product/retatru/?v=0b3b97fa6688/ref/1616/",
          coupon_code: "derek",
          size: "5mg",
          last_updated: "2025-06-16T22:54:01.548466+00:00",
        },
        {
          retailer_id: "modernaminos",
          product_id: "retatrutide-5mg",
          price: 68.0,
          discounted_price: 61.2,
          discount_percentage: 10,
          stock: true,
          rating: 4.7,
          review_count: 45,
          affiliate_url:
            "https://modernaminos.com/product/retatrutide/?ref=derek",
          coupon_code: "derek",
          size: "5mg",
          last_updated: "2025-06-16T22:54:01.548466+00:00",
        },
        {
          retailer_id: "ascension",
          product_id: "retatrutide-5mg",
          price: 174.99,
          discounted_price: 139.99,
          discount_percentage: 20,
          stock: false,
          rating: 4.5,
          review_count: 67,
          affiliate_url:
            "https://ascensionpeptides.com/product/retatrutide-5mg/ref/derekpruski/",
          coupon_code: "derek",
          size: "5mg",
          last_updated: "2025-06-16T22:54:01.548466+00:00",
        },
      ],
      price_history: [
        {
          date: "2025-06-01",
          prices: [
            { retailer_id: "aminoasylum", price: 139.99 },
            { retailer_id: "modernaminos", price: 61.2 },
            { retailer_id: "ascension", price: 139.99 },
          ],
        },
      ],
    },
    {
      id: "nad-plus",
      name: "NAD+",
      slug: "nad-plus",
      category: "anti-aging",
      description:
        "NAD+ (nicotinamide adenine dinucleotide) is a vital coenzyme found in all living cells that acts as an electron carrier in redox reactions.",
      dosages: ["500mg", "1000mg", "200mg"],
      unit: "mg",
      tags: ["Anti-aging", "Energy", "Longevity"],
      retailers: [
        {
          retailer_id: "prime",
          product_id: "nad-1000mg",
          price: 190.0,
          discounted_price: 171.0,
          discount_percentage: 10,
          stock: true,
          rating: 4.3,
          review_count: 34,
          affiliate_url:
            "https://primepeptides.co/products/nad?sca_ref=8658472.73VW1Vo4d1",
          size: "1000mg",
          last_updated: "2025-06-16T22:54:01.548466+00:00",
        },
        {
          retailer_id: "aminoasylum",
          product_id: "nad-500mg",
          price: 59.99,
          discounted_price: 47.99,
          discount_percentage: 20,
          stock: true,
          rating: 4.6,
          review_count: 78,
          affiliate_url: "https://aminoasylum.shop/product/nad/?ref=derek",
          coupon_code: "derek",
          size: "500mg",
          last_updated: "2025-06-16T22:54:01.548466+00:00",
        },
      ],
      price_history: [
        {
          date: "2025-06-01",
          prices: [
            { retailer_id: "prime", price: 171.0 },
            { retailer_id: "aminoasylum", price: 47.99 },
          ],
        },
      ],
    },
  ],
};
