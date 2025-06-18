export interface ProductData {
    id: string
    product_name: string
    size: string
    retailer_id: string
    price: number
    discounted_price?: number
    available: boolean
    recorded_at: string
    url: string
}

export interface Peptide {
    id: string
    name: string
    slug: string
    category: string
    subcategory?: string
    description: string
    dosages: string[]
    unit: 'mg' | 'mcg' | 'iu'
    tags: string[]
    image?: string
    retailers: RetailerProduct[]
    price_history: PriceHistoryEntry[]
}

export interface RetailerProduct {
    retailer_id: string
    product_id: string
    price: number
    original_price?: number
    discounted_price?: number
    discount_percentage?: number
    stock: boolean
    rating: number
    review_count: number
    affiliate_url: string
    coupon_code?: string
    size: string
    last_updated: string
}

export interface Retailer {
    id: string
    name: string
    slug: string
    logo: string
    website: string
    rating: number
    total_reviews: number
    coupon_code?: string
    shipping_countries: string[]
    description: string
    color: string
}

export interface Category {
    id: string
    name: string
    slug: string
    description: string
    color: string
    icon: string
    peptide_count: number
}

export interface PriceHistoryEntry {
    date: string
    prices: {
        retailer_id: string
        price: number
    }[]
}

export interface Review {
    id: string
    retailer_id: string
    rating: number
    comment: string
    verified_purchase: boolean
    created_at: string
    helpful_count?: number
}

export interface Country {
    code: string
    name: string
    flag: string
    currency: string
    supported_retailers: string[]
}

export interface FilterState {
    search: string
    companies: string[]
    categories: string[]
    priceRange: {
        min: number
        max: number
    }
    availability: boolean
    country: string
}

export interface SortOption {
    key: string
    label: string
    value: 'name_asc' | 'name_desc' | 'price_asc' | 'price_desc' | 'rating_desc'
}

export interface ViewMode {
    type: 'grid' | 'table'
    itemsPerPage: number
}

export interface FAQ {
    id: string
    question: string
    answer: string
    category: string
    tags: string[]
    helpful_count: number
}