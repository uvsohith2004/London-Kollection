import { queryOptions } from "@tanstack/react-query";
import { CategoryService } from "../services/category.service";

export const categoryQueries = {
  all: () => ["categories"] as const,
  list: () =>
    queryOptions({
      queryKey: [...categoryQueries.all(), "list"] as const,
      queryFn: () => CategoryService.getAll(),
      staleTime: 5 * 60 * 1000,
    }),
};
