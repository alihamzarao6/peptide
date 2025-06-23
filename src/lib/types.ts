// Backend API Response Types
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

export interface RetailerProduct {
    _id?: string
    retailer_id: string
    retailer_name?: string
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

export interface Peptide {
    _id: string
    id: string // For backward compatibility
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
    status?: 'active' | 'inactive'
    createdAt?: string
    updatedAt?: string
    // Calculator specific fields
    startingDose?: string
    maintenanceDose?: string
    frequency?: string
    dosageNotes?: string
    // Stack builder specific fields
    recommendedForGoals?: string[]
    stackDifficulty?: 'Beginner' | 'Intermediate' | 'Advanced'
    stackTiming?: string
    stackDuration?: number
}

export interface Retailer {
    id: string
    name: string
    slug: string
    logo?: string
    website?: string
    rating?: number
    total_reviews?: number
    coupon_code?: string
    shipping_countries?: string[]
    description?: string
    color?: string
}

export interface Category {
    id: string
    name: string
    slug: string
    description?: string
    color?: string
    icon?: string
    peptide_count?: number
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

// Admin specific types
export interface AdminPeptide {
    _id: string
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
    status: 'active' | 'inactive'
    createdAt: string
    updatedAt: string
    // Calculator fields
    startingDose?: string
    maintenanceDose?: string
    frequency?: string
    dosageNotes?: string
    // Stack builder fields
    recommendedForGoals?: string[]
    stackDifficulty?: 'Beginner' | 'Intermediate' | 'Advanced'
    stackTiming?: string
    stackDuration?: number
    // Computed fields for admin view
    retailersCount?: number
    lowestPrice?: number
    highestPrice?: number
    avgRating?: number
    totalReviews?: number
}

export interface AdminUser {
    id: string
    email: string
    role?: string
}

export interface LoginCredentials {
    email: string
    password: string
}

export interface LoginResponse {
    message: string
    token: string
    admin: AdminUser
}

export interface ApiResponse<T = any> {
    message?: string
    data?: T
    error?: string
}

// Stack Builder Types
export interface StackItem {
    id: string
    peptideId: string
    peptideName: string
    category: string
    dosage: string
    quantity: number
    duration: number // weeks
    retailerId: string
    retailerName: string
    pricePerUnit: number
    discountedPrice?: number
    couponCode?: string
    inStock: boolean
}

export interface Goal {
    id: string
    name: string
    icon: any
    color: string
    description: string
    recommendedPeptides: string[]
}

export interface StackTemplate {
    id: string
    name: string
    description: string
    goals: string[]
    peptides: {
        peptideId: string
        name?: string
        dosage: string
        duration: number
        timing: string
    }[]
    estimatedCost: number
    difficulty: "Beginner" | "Intermediate" | "Advanced"
}

// Calculator Types
export interface CalculationResult {
    totalDoses: number
    durationDays: number
    durationWeeks: number
    costPerDose: number
    costPerWeek: number
    costPerMonth: number
    concentration: number
    injectionVolume: number
}

export interface DosageGuide {
    name: string
    category: string
    startingDose: string
    maintenanceDose: string
    frequency: string
    notes: string
    color: string
}

// API Error Types
export interface ApiError {
    message: string
    status?: number
    code?: string
}

// Form Types for Admin
export interface PeptideFormData {
    name: string
    category: string
    description: string
    dosages: string[]
    unit: 'mg' | 'mcg' | 'iu'
    tags: string[]
    image?: string
    // Calculator fields
    startingDose?: string
    maintenanceDose?: string
    frequency?: string
    dosageNotes?: string
    // Stack builder fields
    recommendedForGoals?: string[]
    stackDifficulty?: 'Beginner' | 'Intermediate' | 'Advanced'
    stackTiming?: string
    stackDuration?: number
    // Status
    status?: 'active' | 'inactive'
}

export interface RetailerFormData {
    retailer_id: string
    retailer_name: string
    product_id: string
    price: number
    discounted_price?: number
    discount_percentage?: number
    stock: boolean
    rating: number
    review_count: number
    affiliate_url: string
    coupon_code?: string
    size: string
}

// API Endpoints Types
export type BulkAction = 'activate' | 'deactivate' | 'delete'

export interface BulkUpdateRequest {
    action: BulkAction
    peptideIds: string[]
}

export interface BulkUpdateResponse {
    message: string
    modifiedCount?: number
    deletedCount?: number
    result: any
}

// Utility Types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error'

export interface AsyncState<T> {
    data: T | null
    loading: boolean
    error: string | null
}

// Props Types for Components
export interface PeptideCardProps {
    peptide: Peptide
    onPriceHistoryClick: (peptideId: string) => void
}

export interface FilterSidebarProps {
    filters: FilterState
    onFiltersChange: (filters: FilterState) => void
    companies: string[]
    categories: string[]
    totalResults: number
}

export interface SortingControlsProps {
    sortBy: string
    onSortChange: (sort: string) => void
    viewMode: ViewMode
    onViewModeChange: (mode: ViewMode) => void
    totalResults: number
    showingResults: number
    activeFiltersCount: number
}

export interface SearchHeroProps {
    searchQuery: string
    onSearchChange: (query: string) => void
    selectedCountry: string
    onCountryChange: (country: string) => void
}

// Auth Context Types
export interface AuthContextType {
    admin: AdminUser | null
    isAuthenticated: boolean
    isLoading: boolean
    login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string; data?: LoginResponse }>
    logout: () => void
    checkAuthStatus: () => Promise<void>
}