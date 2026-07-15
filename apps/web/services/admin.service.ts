import { AdminApi } from "@/api/admin";

export const AdminService = {
  getDashboardData: async (range?: string) => AdminApi.getDashboardData(range),
  getProducts: async (params?: any) => AdminApi.getProducts(params),
  getOrders: async (params?: any) => AdminApi.getOrders(params),
  getUsers: async (params?: any) => AdminApi.getUsers(params),
  getBrands: async (params?: any) => AdminApi.getBrands(params),
  getReturns: async (params?: any) => AdminApi.getReturns(params),
  getTaxClasses: async (params?: any) => AdminApi.getTaxClasses(params),
  getTaxRates: async (params?: any) => AdminApi.getTaxRates(params),
  getTaxRules: async (params?: any) => AdminApi.getTaxRules(params),
  getAuditLogs: async () => AdminApi.getAuditLogs(),
  getFlashSale: async () => AdminApi.getFlashSale(),
  getHeroCarousel: async () => AdminApi.getHeroCarousel(),
  getFeaturedPieces: async () => AdminApi.getFeaturedPieces(),
  getFeaturedCollections: async () => AdminApi.getFeaturedCollections(),
  getSettings: async () => AdminApi.getSettings(),
};
