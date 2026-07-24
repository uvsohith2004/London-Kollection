import { z } from "zod"

export const SearchQuerySchema = z.object({
  q: z.string().optional(),
  categoryId: z.string().optional(),
  collectionId: z.string().optional(),
  minPrice: z.string().optional(),
  maxPrice: z.string().optional(),
  featured: z.string().optional(),
  discount: z.string().optional(),
  sortBy: z.enum(["newest", "price_asc", "price_desc", "popularity", "discount"]).optional(),
  isBranded: z.enum(["true", "false"]).optional(),
  limit: z.string().optional(),
  page: z.string().optional(),
})

export type SearchQuery = z.infer<typeof SearchQuerySchema>
