import { useQuery, useInfiniteQuery } from "@tanstack/react-query"
import {
  fetchAdminProducts,
  fetchCategories,
  fetchAdminCollections,
  fetchAdminOccasions,
} from "@/api-client/index"

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

export function useInfiniteAdminProductsQuery(params?: any, initialData?: any) {
  return useInfiniteQuery({
    queryKey: [...adminCatalogKeys.products, 'infinite', params],
    queryFn: async ({ pageParam = 0 }) => {
      return fetchAdminProducts({ ...params, offset: pageParam, limit: 20 })
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage: any, allPages: any[]) => {
      const items = lastPage?.items || lastPage || [];
      if (items.length < 20) return undefined;
      return allPages.length * 20;
    },
    initialData: initialData ? {
      pages: [initialData],
      pageParams: [0]
    } : undefined
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
      const { fetchAdminBrands } = await import("@/api")
      return fetchAdminBrands(params)
    },
  })
}

export function useTaxClassesQuery(params?: any) {
  return useQuery({
    queryKey: [...adminCatalogKeys.taxClasses, params],
    queryFn: async () => {
      const { fetchTaxClasses } = await import("@/api")
      return fetchTaxClasses(params)
    },
  })
}

