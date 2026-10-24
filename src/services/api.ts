export interface Product {
  id: number
  name: string
  description: string
  price: number
  priceVND: number
  image: string
  images: string[]
  categoryId: number
  category: Category
  stock: number
  rating: number
  reviewCount: number
  isFeatured: boolean
  isActive: boolean
  slug: string
  weight?: number
  dimensions?: string
  material?: string
  origin?: string
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: number
  name: string
  description?: string
  image?: string
  slug: string
  products?: Product[]
  createdAt: string
  updatedAt: string
}

export interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface ProductsResponse {
  products: Product[]
  pagination: PaginationInfo
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  error?: string
  count?: number
}

export interface CategoriesResponse {
  data: Category[]
  count: number
}

// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api'

// Generic API call function
async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || `API call failed: ${response.statusText}`)
  }

  return response.json()
}

// Product API functions
export const productAPI = {
  // Get all products with pagination and filters
  getProducts: async (params?: {
    page?: number
    limit?: number
    category?: string
    search?: string
    featured?: boolean
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }): Promise<ProductsResponse> => {
    const searchParams = new URLSearchParams()
    
    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    if (params?.category) searchParams.append('category', params.category)
    if (params?.search) searchParams.append('search', params.search)
    if (params?.featured) searchParams.append('featured', 'true')
    if (params?.sortBy) searchParams.append('sortBy', params.sortBy)
    if (params?.sortOrder) searchParams.append('sortOrder', params.sortOrder)

    const queryString = searchParams.toString()
    const endpoint = `/products${queryString ? `?${queryString}` : ''}`
    
    const response = await apiCall<ApiResponse<ProductsResponse>>(endpoint)
    return response.data
  },

  // Get featured products
  getFeaturedProducts: async (): Promise<Product[]> => {
    const response = await productAPI.getProducts({ featured: true, limit: 6 })
    return response.products
  },

  // Get single product by ID
  getProduct: async (id: number): Promise<Product> => {
    const response = await apiCall<ApiResponse<Product>>(`/products/${id}`)
    return response.data
  },

  // Get single product by slug
  getProductBySlug: async (slug: string): Promise<Product> => {
    const products = await productAPI.getProducts({ search: slug, limit: 1 })
    if (products.products.length === 0) {
      throw new Error('Product not found')
    }
    return products.products[0]
  },

  // Create new product
  createProduct: async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'category'> & { categoryId: number }): Promise<Product> => {
    const response = await apiCall<ApiResponse<Product>>('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    })
    return response.data
  },

  // Update product
  updateProduct: async (id: number, productData: Partial<Product>): Promise<Product> => {
    const response = await apiCall<ApiResponse<Product>>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    })
    return response.data
  },

  // Delete product
  deleteProduct: async (id: number): Promise<void> => {
    await apiCall(`/products/${id}`, {
      method: 'DELETE',
    })
  },
}

// Category API functions
export const categoryAPI = {
  // Get all categories
  getCategories: async (includeProducts?: boolean): Promise<Category[]> => {
    const searchParams = new URLSearchParams()
    if (includeProducts) {
      searchParams.append('includeProducts', 'true')
    }
    
    const queryString = searchParams.toString()
    const endpoint = `/categories${queryString ? `?${queryString}` : ''}`
    
    const response = await apiCall<ApiResponse<Category[]>>(endpoint)
    return response.data
  },

  // Get single category by ID
  getCategory: async (id: number): Promise<Category> => {
    const response = await apiCall<ApiResponse<Category>>(`/categories/${id}`)
    return response.data
  },

  // Get single category by slug
  getCategoryBySlug: async (slug: string): Promise<Category> => {
    const categories = await categoryAPI.getCategories(true)
    const category = categories.find(cat => cat.slug === slug)
    if (!category) {
      throw new Error('Category not found')
    }
    return category
  },

  // Create new category
  createCategory: async (categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt' | 'products'>): Promise<Category> => {
    const response = await apiCall<ApiResponse<Category>>('/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    })
    return response.data
  },
}

// Utility functions
export const QUOTE_PRICE_LABEL = 'Liên hệ để báo giá'

export const formatPrice = (price: number, currency: 'USD' | 'VND' = 'VND'): string => {
  if (!price || price <= 0) return QUOTE_PRICE_LABEL
  if (currency === 'USD') {
    return `$${price.toFixed(2)}`
  }
  return `${price.toLocaleString('vi-VN')} VNĐ`
}

export const formatPriceVND = (priceVND: number): string => {
  if (!priceVND || priceVND <= 0) return QUOTE_PRICE_LABEL
  return `${priceVND.toLocaleString('vi-VN')} VNĐ`
}

export const parseDisplayedPrice = (price: string): number => {
  const digits = price.replace(/[^\d]/g, '')
  return digits ? parseInt(digits, 10) : 0
}

export const convertVNDToUSD = (vndAmount: number): number => {
  // Approximate conversion rate (you should use real-time rates in production)
  return Math.round(vndAmount / 24000)
} 