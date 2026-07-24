import { queryOptions, infiniteQueryOptions } from "@tanstack/react-query";
import { ProductService } from "../services/product.service";
import type { SearchQuery } from "@workspace/api-contracts";

export const productQueries = {
  all: () => ["products"] as const,
  lists: () => [...productQueries.all(), "list"] as const,
  list: (filters: SearchQuery) =>
    queryOptions({
      queryKey: [...productQueries.lists(), filters] as const,
      queryFn: () => ProductService.search(filters),
      staleTime: 5 * 60 * 1000,
    }),
  listInfinite: (filters: SearchQuery) =>
    infiniteQueryOptions({
      queryKey: [...productQueries.lists(), filters, "infinite"] as const,
      queryFn: ({ pageParam }) => ProductService.search({ ...filters, page: pageParam?.toString() }),
      initialPageParam: 1,
      getNextPageParam: (lastPage, allPages) => {
        const limit = parseInt(filters.limit || "12", 10);
        if (!lastPage || !lastPage.items) return undefined;
        if (lastPage.items.length < limit) return undefined;
        return allPages.length + 1;
      },
      staleTime: 5 * 60 * 1000,
    }),
  newArrivals: () =>
    queryOptions({
      queryKey: [...productQueries.all(), "new-arrivals"] as const,
      queryFn: () => ProductService.getNewArrivals(),
      staleTime: 5 * 60 * 1000,
    }),
  trending: () =>
    queryOptions({
      queryKey: [...productQueries.all(), "trending"] as const,
      queryFn: () => ProductService.getTrending(),
      staleTime: 5 * 60 * 1000,
    }),
  recommendations: () =>
    queryOptions({
      queryKey: [...productQueries.all(), "recommendations"] as const,
      queryFn: () => ProductService.getPersonalizedRecommendations(),
      staleTime: 5 * 60 * 1000,
    }),
  details: () => [...productQueries.all(), "detail"] as const,
  detailBySlug: (slug: string) =>
    queryOptions({
      queryKey: [...productQueries.details(), "slug", slug] as const,
      queryFn: () => ProductService.getBySlug(slug),
      staleTime: 5 * 60 * 1000,
    }),
  detailById: (id: string) =>
    queryOptions({
      queryKey: [...productQueries.details(), "id", id] as const,
      queryFn: () => ProductService.getById(id),
      staleTime: 5 * 60 * 1000,
    }),
  relatedProducts: (id: string, limit?: number) =>
    queryOptions({
      queryKey: [...productQueries.details(), "id", id, "related"] as const,
      queryFn: () => ProductService.getRelatedProducts(id, limit),
      staleTime: 5 * 60 * 1000,
      enabled: !!id,
    }),
  suggestions: (id: string, limit?: number) =>
    queryOptions({
      queryKey: [...productQueries.details(), "id", id, "suggestions"] as const,
      queryFn: () => ProductService.getSuggestions(id, limit),
      staleTime: 5 * 60 * 1000,
      enabled: !!id,
    }),
};
