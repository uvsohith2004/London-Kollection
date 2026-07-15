import { queryOptions } from "@tanstack/react-query";
import { api } from "@/api-client";

export const wishlistQueries = {
  all: () => ["wishlist"] as const,
  current: () =>
    queryOptions({
      queryKey: wishlistQueries.all(),
      queryFn: async () => {
        const res = await api.get("/wishlist");
        return res.data || res;
      },
      staleTime: 5 * 60 * 1000,
    }),
};
