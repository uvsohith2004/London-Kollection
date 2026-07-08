import { z } from "zod"

export const WishlistItemSchema = z.object({
  productId: z.string().uuid("Invalid product ID format"),
  variantId: z.string().uuid("Invalid variant ID format").nullable().optional(),
})
