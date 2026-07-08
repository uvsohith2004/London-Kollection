import { z } from "zod"

export const CreateReviewSchema = z.object({
  productId: z.string().uuid("Invalid product ID"),
  rating: z.number().int().min(1).max(5, "Rating must be between 1 and 5"),
  title: z.string().optional(),
  comment: z.string().optional(),
  images: z.array(z.string().url()).optional(),
})

export const ModerateReviewSchema = z.object({
  approve: z.boolean(),
})
