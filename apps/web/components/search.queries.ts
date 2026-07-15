import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api-client/client";

export interface SearchProduct {
  id: string;
  title: string;
  price: string;
  slug: string;
  images: Array<{
    id: string;
    url: string;
    isPrimary: boolean;
  }>;
  variants: Array<{
    sku: string;
    price: string | null;
    stock: number;
  }>;
}

export interface SearchResponse {
  success: boolean;
  items: SearchProduct[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const useSearchQuery = (query: string) => {
  return useQuery({
    queryKey: ["search", query],
    queryFn: async () => {
      // apiClient baseURL is already "/api", so path should be "/search" only
      const response = await apiClient.get<SearchResponse>("/search", {
        params: { q: query, limit: 5 },
      });
      // Interceptor already unwraps response.data, so `response` IS the data
      return response as unknown as SearchResponse;
    },
    enabled: query.trim().length >= 3,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
};
