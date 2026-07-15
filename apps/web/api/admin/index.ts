import { get, post, put, patch, del } from "../client";
import type { DashboardOverviewResponse } from "@workspace/api-contracts";

export const AdminApi = {
  // Dashboard
  getDashboardData: async (range?: string): Promise<DashboardOverviewResponse> => {
    return await get("/admin/dashboard", { params: { range } });
  },

  exportReport: async (payload: any) => {
    return await post("/admin/export", payload);
  },

  // Audit Logs
  getAuditLogs: async () => {
    return await get("/admin/audit-logs");
  },
  deleteAuditLog: async (id: string) => {
    return await del(`/admin/audit-logs/${id}`);
  },

  // Settings
  getSettings: async () => {
    return await get("/admin/settings");
  },
  updateSettings: async (payload: any) => {
    return await put("/admin/settings", payload);
  },

  // Hero Carousel
  getHeroCarousel: async () => {
    return await get("/admin/hero-carousel");
  },
  createHeroCarousel: async (payload: any) => {
    return await post("/admin/hero-carousel", payload);
  },
  updateHeroCarousel: async (id: string, payload: any) => {
    return await put(`/admin/hero-carousel/${id}`, payload);
  },
  deleteHeroCarousel: async (id: string) => {
    return await del(`/admin/hero-carousel/${id}`);
  },
  reorderHeroCarousel: async (payload: any) => {
    return await post("/admin/hero-carousel/reorder", payload);
  },

  // Products
  getProducts: async (params?: any) => {
    return await get("/admin/products", { params });
  },
  createProduct: async (payload: any) => {
    return await post("/admin/products", payload);
  },
  updateProduct: async (id: string, payload: any) => {
    return await put(`/admin/products/${id}`, payload);
  },
  deleteProduct: async (id: string) => {
    return await del(`/admin/products/${id}`);
  },

  // Users
  getUsers: async (params?: any) => {
    return await get("/admin/users", { params });
  },
  searchUsers: async (q: string) => {
    return await get("/admin/users/search", { params: { q } });
  },
  updateUserRole: async (id: string, payload: { role: string }) => {
    return await patch(`/admin/users/${id}/role`, payload);
  },

  // Orders
  getOrders: async (params?: any) => {
    return await get("/admin/orders", { params });
  },
  updateOrderStatus: async (id: string, payload: { status?: string; paymentStatus?: string; description?: string }) => {
    return await put(`/admin/orders/${id}/status`, payload);
  },

  // Returns
  getReturns: async (params?: any) => {
    return await get("/admin/returns", { params });
  },
  updateReturnStatus: async (id: string, payload: { status: string; resolutionDetails?: string }) => {
    return await put(`/admin/returns/${id}/status`, payload);
  },

  // Flash Sale
  getFlashSale: async () => {
    return await get("/flash-sale/admin");
  },
  toggleFlashSale: async (payload: { isActive: boolean; endTime?: string }) => {
    return await post("/flash-sale/admin", payload);
  },
  createFlashSaleProduct: async (payload: any) => {
    return await post("/flash-sale/admin/flash-sale-products", payload);
  },
  updateFlashSaleProduct: async (id: string, payload: any) => {
    return await put(`/flash-sale/admin/flash-sale-products/${id}`, payload);
  },
  deleteFlashSaleProduct: async (id: string) => {
    return await del(`/flash-sale/admin/flash-sale-products/${id}`);
  },

  // Brands
  getBrands: async (params?: any) => {
    return await get("/admin/brands", { params });
  },
  createBrand: async (payload: any) => {
    return await post("/admin/brands", payload);
  },
  updateBrand: async (id: string, payload: any) => {
    return await put(`/admin/brands/${id}`, payload);
  },
  deleteBrand: async (id: string) => {
    return await del(`/admin/brands/${id}`);
  },

  // Taxes
  getTaxClasses: async (params?: any) => {
    return await get("/admin/taxes/classes", { params });
  },
  createTaxClass: async (payload: any) => {
    return await post("/admin/taxes/classes", payload);
  },
  updateTaxClass: async (id: string, payload: any) => {
    return await put(`/admin/taxes/classes/${id}`, payload);
  },
  deleteTaxClass: async (id: string) => {
    return await del(`/admin/taxes/classes/${id}`);
  },
  getTaxRates: async (params?: any) => {
    return await get("/admin/taxes/rates", { params });
  },
  createTaxRate: async (payload: any) => {
    return await post("/admin/taxes/rates", payload);
  },
  updateTaxRate: async (id: string, payload: any) => {
    return await put(`/admin/taxes/rates/${id}`, payload);
  },
  deleteTaxRate: async (id: string) => {
    return await del(`/admin/taxes/rates/${id}`);
  },
  getTaxRules: async (params?: any) => {
    return await get("/admin/taxes/rules", { params });
  },
  createTaxRule: async (payload: any) => {
    return await post("/admin/taxes/rules", payload);
  },
  updateTaxRule: async (id: string, payload: any) => {
    return await put(`/admin/taxes/rules/${id}`, payload);
  },
  deleteTaxRule: async (id: string) => {
    return await del(`/admin/taxes/rules/${id}`);
  },

  // Featured
  getFeaturedPieces: async () => {
    return await get("/admin/featured/pieces");
  },
  setFeaturedPieces: async (payload: any) => {
    return await post("/admin/featured/pieces", payload);
  },
  updateFeaturedPieceStatus: async (id: string, payload: any) => {
    return await patch(`/admin/featured/pieces/${id}/status`, payload);
  },
  getFeaturedCollections: async () => {
    return await get("/admin/featured/collections");
  },
  setFeaturedCollections: async (payload: any) => {
    return await post("/admin/featured/collections", payload);
  },
  updateFeaturedCollectionStatus: async (id: string, payload: any) => {
    return await patch(`/admin/featured/collections/${id}/status`, payload);
  }
};
