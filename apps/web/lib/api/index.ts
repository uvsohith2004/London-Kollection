import { apiClient } from "./client"
import type {
  Product,
  Collection,
  CustomerReview,
  Occasion,
} from "@/types/types"
import type {
  BannerCarouselResponse,
  ProductsResponse,
  LookBookResponse,
  CustomerReviewResponse,
  OccasionResponse,
} from "@/types/home-types"
import type { DashboardOverviewResponse } from "@/types/overview-types"

export interface AuditLog {
  id: string
  action: string
  userId: string
  details: string
  createdAt: string
  [key: string]: any
}

const get = async <T = any>(url: string, config?: any): Promise<T> =>
  (await apiClient.get(url, config)) as unknown as T
const post = async <T = any>(
  url: string,
  data?: any,
  config?: any
): Promise<T> => (await apiClient.post(url, data, config)) as unknown as T
const put = async <T = any>(
  url: string,
  data?: any,
  config?: any
): Promise<T> => (await apiClient.put(url, data, config)) as unknown as T
const patch = async <T = any>(
  url: string,
  data?: any,
  config?: any
): Promise<T> => (await apiClient.patch(url, data, config)) as unknown as T
const del = async <T = any>(url: string, config?: any): Promise<T> =>
  (await apiClient.delete(url, config)) as unknown as T

// --- Public API Endpoints ---

export interface SearchParams {
  q?: string
  category?: string
  collectionId?: string
  minPrice?: number
  maxPrice?: number
  limit?: number
  sort?: string
}

export const fetchSearchProducts = async (
  params: SearchParams
): Promise<ProductsResponse> => {
  return await get("/products/search", { params })
}

export const fetchHeroCarouselImages =
  async (): Promise<BannerCarouselResponse> => {
    return await get("/hero-carousel")
  }

export const fetchFlashSaleProducts = async (): Promise<ProductsResponse> => {
  return await get(`/flash-sale/flash-sale-products`)
}

export const fetchNewArrival = async (): Promise<ProductsResponse> => {
  return await get("/products/new-arrivals")
}

export const fetchTrendingProducts = async (): Promise<ProductsResponse> => {
  return await get("/products/trending")
}

export const fetchFeaturedProducts = async (): Promise<ProductsResponse> => {
  return await get(`/featured/pieces`)
}

export const fetchPersonalizedRecommendations =
  async (): Promise<ProductsResponse> => {
    return await get(`/history/recommended`)
  }

export const fetchCustomerReviews =
  async (): Promise<CustomerReviewResponse> => {
    return await get(`/customer-reviews`)
  }

export const fetchOccasions = async (): Promise<OccasionResponse> => {
  return await get(`/collections/occasions`)
}

export const fetchFeaturedCollections = async (): Promise<Collection[]> => {
  return await get(`/featured/collections`)
}

export const fetchProductBySlug = async (slug: string): Promise<Product> => {
  return await get(`/products/slug/${slug}`)
}

export const fetchProductById = async (id: string): Promise<Product> => {
  return await get(`/products/${id}`)
}

export const fetchCategories = async () => {
  return await get("/categories")
}

export const fetchCategoriesById = async (id: string) => {
  return await get(`/categories/${id}`)
}

export const fetchFeaturedCategories = async () => {
  return await get("/categories/featured")
}

export const fetchRecentlyUpdatedCategories = async () => {
  return await get("/categories/recently-updated")
}

// --- Cart & Wishlist API ---
export const fetchWishlist = async () => {
  return await get(`/wishlist`)
}

export const addToWishlistApi = async (
  productId: string,
  variantId?: string | null
) => {
  return await post(`/wishlist`, { productId, variantId })
}

export const removeFromWishlistApi = async (productId: string) => {
  return await del(`/wishlist/${productId}`)
}

export const fetchCart = async () => {
  return await get(`/cart`)
}

export const addToCartApi = async (
  productId: string,
  quantity: number,
  variantId?: string | null
) => {
  return await post(`/cart/items`, { productId, variantId, quantity })
}

export const mergeCartApi = async (items: Array<{productId: string, variantId?: string | null, quantity: number}>) => {
  return await post(`/cart/merge`, { items })
}

// --- Checkout API ---
export const fetchCheckoutPreview = async (payload: { cartId: string, shippingCountryCode: string }) => {
  return await post(`/checkout/preview`, payload)
}

export const submitCheckout = async (payload: { cartId: string, shippingAddressId: string, billingAddressId?: string }) => {
  return await post(`/checkout`, payload)
}

// --- Addresses API ---
export const fetchAddresses = async () => {
  return await get(`/fulfillment/addresses`)
}

export const createAddress = async (payload: any) => {
  return await post(`/fulfillment/addresses`, payload)
}

export const updateAddress = async (id: string, payload: any) => {
  return await put(`/fulfillment/addresses/${id}`, payload)
}

export const deleteAddress = async (id: string) => {
  return await del(`/fulfillment/addresses/${id}`)
}

export const setDefaultAddress = async (id: string, type: string) => {
  return await put(`/fulfillment/addresses/${id}`, { default: true, type })
}

export const getStoreSettings = async () => {
  return await get("/store/settings")
}

// --- Admin API Endpoints ---

// Dashboard
export const overviewApi = {
  getDashboardData: async () => {
    return await get("/admin/dashboard")
  },
  exportReport: async (payload: any) => {
    return await post("/admin/export", payload)
  },
}

// Audit Logs
export const auditApi = {
  getLogs: async () => {
    return await get("/admin/audit-logs")
  },
  deleteLog: async (id: string) => {
    return await del(`/admin/audit-logs/${id}`)
  },
}

// Settings
export const getSettings = async () => {
  return await get("/admin/settings")
}
export const updateSettings = async (payload: any) => {
  return await put("/admin/settings", payload)
}

// Hero Carousel
export const fetchAdminHeroCarousel = async () => {
  return await get("/admin/hero-carousel")
}
export const createHeroCarousel = async (payload: any) => {
  return await post("/admin/hero-carousel", payload)
}
export const updateHeroCarousel = async (id: string, payload: any) => {
  return await put(`/admin/hero-carousel/${id}`, payload)
}
export const deleteHeroCarousel = async (id: string) => {
  return await del(`/admin/hero-carousel/${id}`)
}
export const reorderHeroCarousel = async (payload: any) => {
  return await post("/admin/hero-carousel/reorder", payload)
}

// Products
export const fetchAdminProducts = async (params?: any) => {
  return await get("/admin/products", { params })
}
export const createProduct = async (payload: any) => {
  return await post("/admin/products", payload)
}
export const updateProduct = async (id: string, payload: any) => {
  return await put(`/admin/products/${id}`, payload)
}
export const deleteProduct = async (id: string) => {
  return await del(`/admin/products/${id}`)
}

// Categories
export const createCategory = async (payload: any) => {
  return await post("/admin/categories", payload)
}
export const updateCategory = async (id: string, payload: any) => {
  return await put(`/admin/categories/${id}`, payload)
}
export const deleteCategory = async (id: string) => {
  return await del(`/admin/categories/${id}`)
}

// Collections
export const fetchAdminCollections = async (params?: any) => {
  return await get("/collections", { params })
}
export const createCollection = async (payload: any) => {
  
  return await post("/admin/collections", payload)
}
export const updateCollection = async (id: string, payload: any) => {
  console.log("update: ",payload)
  return await put(`/admin/collections/${id}`, payload)
}
export const deleteCollection = async (id: string) => {
  return await del(`/admin/collections/${id}`)
}

// Occasions
export const fetchAdminOccasions = async (params?: any) => {
  return await get("/admin/occasions", { params })
}
export const createOccasion = async (payload: any) => {
  return await post("/admin/occasions", payload)
}
export const updateOccasion = async (id: string, payload: any) => {
  return await put(`/admin/occasions/${id}`, payload)
}
export const deleteOccasion = async (id: string) => {
  return await del(`/admin/occasions/${id}`)
}

// Users
export const fetchAdminUsers = async (params?: any) => {
  return await get("/admin/users", { params })
}
export const searchAdminUsers = async (q: string) => {
  return await get("/admin/users/search", { params: { q } })
}
export const updateAdminUserRole = async (
  id: string,
  payload: { role: string }
) => {
  return await patch(`/admin/users/${id}/role`, payload)
}

// Orders
export const fetchAdminOrders = async (params?: any) => {
  return await get("/admin/orders", { params })
}
export const updateAdminOrderStatus = async (
  id: string,
  payload: { status?: string; paymentStatus?: string; description?: string }
) => {
  return await put(`/admin/orders/${id}/status`, payload)
}

export const cancelOrderApi = async (id: string, payload: { reason: string }) => {
  return await post(`/orders/${id}/cancel`, payload)
}

// Returns
export const fetchAdminReturns = async (params?: any) => {
  return await get("/admin/returns", { params })
}
export const updateAdminReturnStatus = async (
  id: string,
  payload: { status: string; resolutionDetails?: string }
) => {
  return await put(`/admin/returns/${id}/status`, payload)
}

// Flash Sale
export const fetchAdminFlashSale = async () => {
  return await get("/flash-sale/admin")
}
export const toggleFlashSale = async (payload: { isActive: boolean; endTime?: string }) => {
  return await post("/flash-sale/admin", payload)
}
export const createFlashSaleProduct = async (payload: any) => {
  return await post("/flash-sale/admin/flash-sale-products", payload)
}
export const updateFlashSaleProduct = async (id: string, payload: any) => {
  return await put(`/flash-sale/admin/flash-sale-products/${id}`, payload)
}
export const deleteFlashSaleProduct = async (id: string) => {
  return await del(`/flash-sale/admin/flash-sale-products/${id}`)
}

// Brands
export const fetchAdminBrands = async (params?: any) => {
  return await get("/admin/brands", { params })
}
export const createBrand = async (payload: any) => {
  return await post("/admin/brands", payload)
}
export const updateBrand = async (id: string, payload: any) => {
  return await put(`/admin/brands/${id}`, payload)
}
export const deleteBrand = async (id: string) => {
  return await del(`/admin/brands/${id}`)
}

// Taxes - Classes
export const fetchTaxClasses = async (params?: any) => {
  return await get("/admin/taxes/classes", { params })
}
export const createTaxClass = async (payload: any) => {
  return await post("/admin/taxes/classes", payload)
}
export const updateTaxClass = async (id: string, payload: any) => {
  return await put(`/admin/taxes/classes/${id}`, payload)
}
export const deleteTaxClass = async (id: string) => {
  return await del(`/admin/taxes/classes/${id}`)
}

// Taxes - Rates
export const fetchTaxRates = async (params?: any) => {
  return await get("/admin/taxes/rates", { params })
}
export const createTaxRate = async (payload: any) => {
  return await post("/admin/taxes/rates", payload)
}
export const updateTaxRate = async (id: string, payload: any) => {
  return await put(`/admin/taxes/rates/${id}`, payload)
}
export const deleteTaxRate = async (id: string) => {
  return await del(`/admin/taxes/rates/${id}`)
}

// Taxes - Rules
export const fetchTaxRules = async (params?: any) => {
  return await get("/admin/taxes/rules", { params })
}
export const createTaxRule = async (payload: any) => {
  return await post("/admin/taxes/rules", payload)
}
export const updateTaxRule = async (id: string, payload: any) => {
  return await put(`/admin/taxes/rules/${id}`, payload)
}
export const deleteTaxRule = async (id: string) => {
  return await del(`/admin/taxes/rules/${id}`)
}

// Featured
export const fetchAdminFeaturedPieces = async () => {
  return await get("/admin/featured/pieces")
}
export const setFeaturedPieces = async (payload: any) => {
  return await post("/admin/featured/pieces", payload)
}
export const updateFeaturedPieceStatus = async (id: string, payload: any) => {
  return await patch(`/admin/featured/pieces/${id}/status`, payload)
}

export const fetchAdminFeaturedCollections = async () => {
  return await get("/admin/featured/collections")
}
export const setFeaturedCollections = async (payload: any) => {
  return await post("/admin/featured/collections", payload)
}
export const updateFeaturedCollectionStatus = async (id: string, payload: any) => {
  return await patch(`/admin/featured/collections/${id}/status`, payload)
}

export const api = apiClient
