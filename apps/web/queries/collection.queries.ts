import { queryOptions } from "@tanstack/react-query";
import { CollectionService } from "../services/collection.service";

export const collectionQueries = {
  all: () => ["collections"] as const,
  featured: () =>
    queryOptions({
      queryKey: [...collectionQueries.all(), "featured"] as const,
      queryFn: () => CollectionService.getFeatured(),
      staleTime: 5 * 60 * 1000,
    }),
};
