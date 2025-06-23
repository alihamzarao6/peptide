import {
  AdminPeptide,
  LoginCredentials,
  LoginResponse,
  PeptideFormData,
  BulkUpdateRequest,
  BulkUpdateResponse,
  Category,
  Retailer,
  ApiError,
  AdminUser,
  RetailerFormData
} from '@/lib/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Custom error class for API errors
class APIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// Generic API request function with proper typing
const apiRequest = async <T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Add auth token if available
  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }

  try {
    const response = await fetch(url, config);

    // Handle non-JSON responses
    const contentType = response.headers.get('Content-Type');
    let data: any;

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = { message: await response.text() };
    }

    if (!response.ok) {
      throw new APIError(
        data.message || `HTTP error! status: ${response.status}`,
        response.status,
        data.code
      );
    }

    return data as T;
  } catch (error) {
    console.error('API Error:', error);

    if (error instanceof APIError) {
      throw error;
    }

    // Handle network errors
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new APIError('Network error: Unable to connect to server');
    }

    throw new APIError(error instanceof Error ? error.message : 'Unknown API error');
  }
};

// Public API functions (no authentication required)
export const publicApi = {
  // Get all active peptides
  getPeptides: (): Promise<AdminPeptide[]> =>
    apiRequest<AdminPeptide[]>('/peptides'),

  // Get all categories
  getCategories: (): Promise<Category[]> =>
    apiRequest<Category[]>('/categories'),

  // Get all retailers
  getRetailers: (): Promise<Retailer[]> =>
    apiRequest<Retailer[]>('/retailers'),
};

// Admin API functions (require authentication)
export const adminApi = {
  // Authentication
  login: (credentials: LoginCredentials): Promise<LoginResponse> =>
    apiRequest<LoginResponse>('/admin/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  verifyToken: (): Promise<{ message: string; admin: AdminUser }> =>
    apiRequest<{ message: string; admin: AdminUser }>('/admin/verify'),

  // Peptide management
  getAllPeptides: (): Promise<AdminPeptide[]> =>
    apiRequest<AdminPeptide[]>('/admin/peptides'),

  getPeptideById: (id: string): Promise<AdminPeptide> => {
    if (!id) throw new APIError('Peptide ID is required');
    return apiRequest<AdminPeptide>(`/admin/peptides/${id}`);
  },

  createPeptide: (peptideData: PeptideFormData & { retailers: RetailerFormData[] }): Promise<{ message: string; peptide: AdminPeptide }> => {
    // Validate required fields before sending
    if (!peptideData.name || !peptideData.category || !peptideData.description) {
      throw new APIError('Name, category, and description are required');
    }

    if (!peptideData.dosages || peptideData.dosages.filter(d => d.trim()).length === 0) {
      throw new APIError('At least one dosage is required');
    }

    if (!peptideData.retailers || peptideData.retailers.filter(r => r.retailer_id && r.affiliate_url && r.size && r.price > 0).length === 0) {
      throw new APIError('At least one valid retailer is required');
    }

    return apiRequest<{ message: string; peptide: AdminPeptide }>('/admin/peptides', {
      method: 'POST',
      body: JSON.stringify(peptideData),
    });
  },


  updatePeptide: (id: string, peptideData: Partial<PeptideFormData>): Promise<{ message: string; peptide: AdminPeptide }> => {
    if (!id) throw new APIError('Peptide ID is required');
    return apiRequest<{ message: string; peptide: AdminPeptide }>(`/admin/peptides/${id}`, {
      method: 'PUT',
      body: JSON.stringify(peptideData),
    });
  },

  deletePeptide: (id: string): Promise<{ message: string }> => {
    if (!id) throw new APIError('Peptide ID is required');
    return apiRequest<{ message: string }>(`/admin/peptides/${id}`, {
      method: 'DELETE',
    });
  },

  updatePeptideStatus: (id: string, status: 'active' | 'inactive'): Promise<{ message: string; peptide: AdminPeptide }> => {
    if (!id) throw new APIError('Peptide ID is required');
    if (!['active', 'inactive'].includes(status)) {
      throw new APIError('Status must be either active or inactive');
    }
    return apiRequest<{ message: string; peptide: AdminPeptide }>(`/admin/peptides/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  bulkUpdate: (action: BulkUpdateRequest['action'], peptideIds: string[]): Promise<BulkUpdateResponse> => {
    if (!action || !peptideIds || peptideIds.length === 0) {
      throw new APIError('Action and peptide IDs are required');
    }
    if (!['activate', 'deactivate', 'delete'].includes(action)) {
      throw new APIError('Invalid action. Must be activate, deactivate, or delete');
    }
    return apiRequest<BulkUpdateResponse>('/admin/peptides/bulk', {
      method: 'POST',
      body: JSON.stringify({ action, peptideIds }),
    });
  },

  // Admin dashboard stats (optional - if you want to add this later)
  getStats: (): Promise<{
    totalPeptides: number;
    activePeptides: number;
    inactivePeptides: number;
    totalCategories: number;
    totalRetailers: number;
    totalProducts: number;
    avgPrice: number;
  }> =>
    apiRequest('/admin/stats'),
};

// Utility functions
export const apiUtils = {
  // Check if error is API error
  isAPIError: (error: any): error is APIError =>
    error instanceof APIError,

  // Handle API errors consistently
  handleAPIError: (error: any): string => {
    if (error instanceof APIError) {
      return error.message;
    }
    return 'An unexpected error occurred';
  },

  // Validate required fields
  validateRequired: (data: Record<string, any>, requiredFields: string[]): void => {
    const missingFields = requiredFields.filter(field => !data[field]);
    if (missingFields.length > 0) {
      throw new APIError(`Missing required fields: ${missingFields.join(', ')}`);
    }
  },

  // Format API errors for display
  formatError: (error: any): { message: string; status?: number } => {
    if (error instanceof APIError) {
      return {
        message: error.message,
        status: error.status,
      };
    }

    return {
      message: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  },
};

// Export the error class for use in components
export { APIError };

// Type guards for API responses
export const typeGuards = {
  isPeptide: (obj: any): obj is AdminPeptide => {
    return obj && typeof obj === 'object' &&
      typeof obj._id === 'string' &&
      typeof obj.name === 'string' &&
      typeof obj.category === 'string' &&
      Array.isArray(obj.retailers);
  },

  isLoginResponse: (obj: any): obj is LoginResponse => {
    return obj && typeof obj === 'object' &&
      typeof obj.token === 'string' &&
      obj.admin && typeof obj.admin === 'object';
  },

  isCategory: (obj: any): obj is Category => {
    return obj && typeof obj === 'object' &&
      typeof obj.id === 'string' &&
      typeof obj.name === 'string';
  },

  isRetailer: (obj: any): obj is Retailer => {
    return obj && typeof obj === 'object' &&
      typeof obj.id === 'string' &&
      typeof obj.name === 'string';
  },
};

// API configuration
export const apiConfig = {
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
  retryAttempts: 3,
  retryDelay: 1000, // 1 second
};
