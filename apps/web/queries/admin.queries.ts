import { queryOptions } from "@tanstack/react-query";
import { AdminService } from "../services/admin.service";

export const adminQueries = {
  all: ["admin"] as const,
  
  // Dashboard
  dashboard: () => [...adminQueries.all, "dashboard"] as const,
  dashboardData: (range?: string) =>
    queryOptions({
      queryKey: [...adminQueries.dashboard(), range].filter(Boolean),
      queryFn: () => AdminService.getDashboardData(range),
      staleTime: 60 * 1000,
    }),

  // Products
  products: () => [...adminQueries.all, "products"] as const,
  productList: (params?: any) =>
    queryOptions({
      queryKey: [...adminQueries.products(), "list", params] as const,
      queryFn: () => AdminService.getProducts(params),
      staleTime: 5 * 60 * 1000,
    }),

  // Orders
  orders: () => [...adminQueries.all, "orders"] as const,
  orderList: (params?: any) =>
    queryOptions({
      queryKey: [...adminQueries.orders(), "list", params] as const,
      queryFn: () => AdminService.getOrders(params),
      staleTime: 5 * 60 * 1000,
    }),

  // Users
  users: () => [...adminQueries.all, "users"] as const,
  userList: (params?: any) =>
    queryOptions({
      queryKey: [...adminQueries.users(), "list", params] as const,
      queryFn: () => AdminService.getUsers(params),
      staleTime: 5 * 60 * 1000,
    }),
    
  // Brands
  brands: () => [...adminQueries.all, "brands"] as const,
  brandList: (params?: any) =>
    queryOptions({
      queryKey: [...adminQueries.brands(), "list", params] as const,
      queryFn: () => AdminService.getBrands(params),
      staleTime: 5 * 60 * 1000,
    }),

  // Categories
  categories: () => [...adminQueries.all, "categories"] as const,
  
  // Collections
  collections: () => [...adminQueries.all, "collections"] as const,
  
  // Occasions
  occasions: () => [...adminQueries.all, "occasions"] as const,
  
  // Returns
  returns: () => [...adminQueries.all, "returns"] as const,
  returnList: (params?: any) => 
    queryOptions({
      queryKey: [...adminQueries.returns(), "list", params] as const,
      queryFn: () => AdminService.getReturns(params),
      staleTime: 5 * 60 * 1000,
    }),

  // Taxes
  taxes: () => [...adminQueries.all, "taxes"] as const,
  
  // Reviews
  reviews: () => [...adminQueries.all, "reviews"] as const,
  
  // Audit Logs
  auditLogs: () => [...adminQueries.all, "auditLogs"] as const,
  auditLogList: () =>
    queryOptions({
      queryKey: adminQueries.auditLogs(),
      queryFn: () => AdminService.getAuditLogs(),
      staleTime: 5 * 60 * 1000,
    }),

  // Flash Sale
  flashSale: () => [...adminQueries.all, "flashSale"] as const,
  
  // Hero Carousel
  heroCarousel: () => [...adminQueries.all, "heroCarousel"] as const,
  
  // Settings
  settings: () => [...adminQueries.all, "settings"] as const,
  
  // Featured
  featuredPieces: () => [...adminQueries.all, "featuredPieces"] as const,
  featuredCollections: () => [...adminQueries.all, "featuredCollections"] as const,
};
