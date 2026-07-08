import { z } from "zod"

export const toggleFlashSaleSchema = z.object({
  isActive: z.boolean(),
  endTime: z.string().optional(),
})

export const addFlashSaleItemSchema = z.object({
  productId: z.string(),
  flashPrice: z.union([z.string(), z.number()]).transform(v => String(v)),
})

export const updateFlashSaleItemSchema = z.object({
  flashPrice: z.union([z.string(), z.number()]).transform(v => String(v)),
  sortOrder: z.number().optional(),
})
