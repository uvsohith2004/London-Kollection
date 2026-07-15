import { z } from "zod"

export const FlashSaleSchema = z.object({
  id: z.string().uuid(),
  isActive: z.boolean(),
  scheduleStart: z.string().or(z.date()).nullable().optional(),
  scheduleEnd: z.string().or(z.date()).nullable().optional(),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
})

export type FlashSale = z.infer<typeof FlashSaleSchema>

export const FlashSaleItemSchema = z.object({
  id: z.string().uuid(),
  flashSaleId: z.string().uuid(),
  productId: z.string(),
  flashPrice: z.string().or(z.number()),
  sortOrder: z.number(),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
  product: z.any().optional(),
})

export type FlashSaleItem = z.infer<typeof FlashSaleItemSchema>

export const ToggleFlashSaleSchema = z.object({
  isActive: z.boolean(),
  endTime: z.string().optional(),
})

export const AddFlashSaleItemSchema = z.object({
  productId: z.string(),
  flashPrice: z.union([z.string(), z.number()]),
})

export const UpdateFlashSaleItemSchema = z.object({
  flashPrice: z.union([z.string(), z.number()]),
  sortOrder: z.number().optional(),
})
