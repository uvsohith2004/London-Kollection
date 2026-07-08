import { useQuery } from "@tanstack/react-query"
import {
  fetchAdminProducts,
  fetchCategories,
  fetchAdminCollections,
  fetchAdminOccasions,
} from "@/lib/api/index"

export const adminCatalogKeys = {
  products: ["adminProducts"] as const,
  categories: ["adminCategories"] as const,
  collections: ["adminCollections"] as const,
  occasions: ["adminOccasions"] as const,
  brands: ["adminBrands"] as const,
  taxClasses: ["adminTaxClasses"] as const,
}

export function useAdminProductsQuery(params?: any) {
  return useQuery({
    queryKey: [...adminCatalogKeys.products, params],
    queryFn: () => fetchAdminProducts(params),
  })
}

export function useAdminCategoriesQuery() {
  return useQuery({
    queryKey: adminCatalogKeys.categories,
    queryFn: fetchCategories,
  })
}

export function useAdminCollectionsQuery(params?: any) {
  return useQuery({
    queryKey: [...adminCatalogKeys.collections, params],
    queryFn: () => fetchAdminCollections(params),
  })
}

export function useAdminOccasionsQuery(params?: any) {
  return useQuery({
    queryKey: [...adminCatalogKeys.occasions, params],
    queryFn: () => fetchAdminOccasions(params),
  })
}

export function useAdminBrandsQuery(params?: any) {
  return useQuery({
    queryKey: [...adminCatalogKeys.brands, params],
    queryFn: async () => {
      const { fetchAdminBrands } = await import("@/lib/api")
      return fetchAdminBrands(params)
    },
  })
}

export function useTaxClassesQuery(params?: any) {
  return useQuery({
    queryKey: [...adminCatalogKeys.taxClasses, params],
    queryFn: async () => {
      const { fetchTaxClasses } = await import("@/lib/api")
      return fetchTaxClasses(params)
    },
  })
}
