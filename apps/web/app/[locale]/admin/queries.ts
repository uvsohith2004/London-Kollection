import { useQuery } from "@tanstack/react-query"
import {
  fetchAdminProducts,
  fetchCategories,
  fetchAdminCollections,
  fetchAdminOccasions,
  fetchAdminOrders,
  fetchAdminReturns,
  fetchAdminUsers,
  fetchCustomerReviews, // using as admin review fetch for now
  overviewApi,
  auditApi,
  fetchAdminFlashSale,
  fetchAdminHeroCarousel,
} from "@/lib/api"
import type { DashboardOverviewResponse } from "@/types/overview-types"

export const adminKeys = {
  all: ["admin"] as const,
  // Catalog
  products: () => [...adminKeys.all, "products"] as const,
  categories: () => [...adminKeys.all, "categories"] as const,
  collections: () => [...adminKeys.all, "collections"] as const,
  occasions: () => [...adminKeys.all, "occasions"] as const,
  brands: () => [...adminKeys.all, "brands"] as const,
  heroCarousel: () => [...adminKeys.all, "heroCarousel"] as const,
  // Commerce
  orders: () => [...adminKeys.all, "orders"] as const,
  returns: () => [...adminKeys.all, "returns"] as const,
  taxes: () => [...adminKeys.all, "taxes"] as const,
  // Identity & Engagement
  users: () => [...adminKeys.all, "users"] as const,
  reviews: () => [...adminKeys.all, "reviews"] as const,
  // Dashboard
  dashboard: () => [...adminKeys.all, "dashboard"] as const,
  auditLogs: () => [...adminKeys.all, "audit-logs"] as const,
  // Flash Sale
  flashSale: () => [...adminKeys.all, "flashSale"] as const,
}

export function useAdminProductsQuery(params?: any) {
  return useQuery({
    queryKey: [...adminKeys.products(), params],
    queryFn: () => fetchAdminProducts(params),
  })
}

export function useAdminCategoriesQuery() {
  return useQuery({
    queryKey: adminKeys.categories(),
    queryFn: fetchCategories,
  })
}

export function useAdminCollectionsQuery(params?: any) {
  return useQuery({
    queryKey: [...adminKeys.collections(), params],
    queryFn: () => fetchAdminCollections(params),
  })
}

export function useAdminOccasionsQuery(params?: any) {
  return useQuery({
    queryKey: [...adminKeys.occasions(), params],
    queryFn: () => fetchAdminOccasions(params),
  })
}

export function useAdminBrandsQuery(params?: any) {
  return useQuery({
    queryKey: [...adminKeys.brands(), params],
    queryFn: async () => {
      const { fetchAdminBrands } = await import("@/lib/api")
      return fetchAdminBrands(params)
    },
  })
}

export function useTaxClassesQuery(params?: any) {
  return useQuery({
    queryKey: [...adminKeys.taxes(), "classes", params],
    queryFn: async () => {
      const { fetchTaxClasses } = await import("@/lib/api")
      return fetchTaxClasses(params)
    },
  })
}

export function useTaxRatesQuery(params?: any) {
  return useQuery({
    queryKey: [...adminKeys.taxes(), "rates", params],
    queryFn: async () => {
      const { fetchTaxRates } = await import("@/lib/api")
      return fetchTaxRates(params)
    },
  })
}

export function useTaxRulesQuery(params?: any) {
  return useQuery({
    queryKey: [...adminKeys.taxes(), "rules", params],
    queryFn: async () => {
      const { fetchTaxRules } = await import("@/lib/api")
      return fetchTaxRules(params)
    },
  })
}

export function useAdminOrdersQuery(params?: any) {
  return useQuery({
    queryKey: [...adminKeys.orders(), params],
    queryFn: () => fetchAdminOrders(params),
  })
}

export function useAdminReturnsQuery(params?: any) {
  return useQuery({
    queryKey: [...adminKeys.returns(), params],
    queryFn: () => fetchAdminReturns(params),
  })
}

export function useAdminUsersQuery(params?: any) {
  return useQuery({
    queryKey: [...adminKeys.users(), params],
    queryFn: () => fetchAdminUsers(params),
  })
}

export function useAdminReviewsQuery() {
  return useQuery({
    queryKey: adminKeys.reviews(),
    queryFn: fetchCustomerReviews,
  })
}

export function useDashboardQuery() {
  return useQuery<DashboardOverviewResponse, Error>({
    queryKey: adminKeys.dashboard(),
    queryFn: overviewApi.getDashboardData,
  })
}

export function useSettingsQuery() {
  return useQuery({
    queryKey: [...adminKeys.all, "settings"],
    queryFn: async () => {
      const { getSettings } = await import("@/lib/api")
      return getSettings()
    },
  })
}

export function useAuditLogsQuery() {
  return useQuery({
    queryKey: adminKeys.auditLogs(),
    queryFn: auditApi.getLogs,
  })
}

export function useAdminFlashSaleQuery() {
  return useQuery({
    queryKey: adminKeys.flashSale(),
    queryFn: fetchAdminFlashSale,
  })
}

export function useAdminHeroCarouselQuery() {
  return useQuery({
    queryKey: adminKeys.heroCarousel(),
    queryFn: fetchAdminHeroCarousel,
  })
}

export function useAdminFeaturedPiecesQuery() {
  return useQuery({
    queryKey: [...adminKeys.all, "featuredPieces"],
    queryFn: async () => {
      const { fetchAdminFeaturedPieces } = await import("@/lib/api")
      return fetchAdminFeaturedPieces()
    },
  })
}

export function useAdminFeaturedCollectionsQuery() {
  return useQuery({
    queryKey: [...adminKeys.all, "featuredCollections"],
    queryFn: async () => {
      const { fetchAdminFeaturedCollections } = await import("@/lib/api")
      return fetchAdminFeaturedCollections()
    },
  })
}
