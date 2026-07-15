import { useInfiniteQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import { PaginatedOrdersResponse } from "@workspace/api-contracts";

interface UseOrdersOptions {
  search: string;
  status: string;
  limit?: number;
  initialData?: PaginatedOrdersResponse;
}

export function useOrders({ search, status, limit = 10, initialData }: UseOrdersOptions) {
  return useInfiniteQuery({
    queryKey: ["orders", search, status, limit],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await apiClient.get(
        `/orders?page=${pageParam}&limit=${limit}&search=${encodeURIComponent(search)}&status=${encodeURIComponent(status)}`
      );
      return res.data as PaginatedOrdersResponse;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialData: initialData
      ? {
          pages: [initialData],
          pageParams: [1],
        }
      : undefined,
  });
}
