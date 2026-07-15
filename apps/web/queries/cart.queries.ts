import { queryOptions } from "@tanstack/react-query";
import { CartService } from "../services/cart.service";

export const cartQueries = {
  all: () => ["cart"] as const,
  current: () =>
    queryOptions({
      queryKey: [...cartQueries.all(), "current"] as const,
      queryFn: () => CartService.getCart(),
      staleTime: 1 * 60 * 1000, // cart gets stale quicker
    }),
};
