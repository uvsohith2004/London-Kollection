import { z } from "zod"

export const CartItemSummarySchema = z.object({
  id: z.string().uuid(),
  productId: z.string(),
  variantId: z.string().nullable().optional(),
  productName: z.string(),
  productSlug: z.string(),
  sku: z.string(),
  image: z.string().nullable().optional(),
  optionValues: z.record(z.string()).optional(),
  quantity: z.number().int().positive(),
  unitPrice: z.number(),
  compareAtPrice: z.number().optional(),
  discountValue: z.number(),
  subtotal: z.number(),
  isAvailable: z.boolean(),
  stock: z.number(),
})

export type CartItemSummary = z.infer<typeof CartItemSummarySchema>

export const CartSummarySchema = z.object({
  id: z.string().uuid(),
  items: z.array(CartItemSummarySchema),
  subtotal: z.number(),
  taxTotal: z.number(),
  discountTotal: z.number(),
  deliveryFee: z.number(),
  grandTotal: z.number(),
  couponCode: z.string().nullable().optional(),
})

export type CartSummary = z.infer<typeof CartSummarySchema>

export const AddItemSchema = z.object({
  productId: z.string(),
  variantId: z.string().nullable().optional(),
  quantity: z.number().int().positive(),
})

export type AddItemDTO = z.infer<typeof AddItemSchema>

export const UpdateItemSchema = z.object({
  quantity: z.number().int().nonnegative(),
})

export type UpdateItemDTO = z.infer<typeof UpdateItemSchema>

export const ApplyCouponSchema = z.object({
  couponCode: z.string().nullable(),
})

export type ApplyCouponDTO = z.infer<typeof ApplyCouponSchema>

export const UpdateGiftNoteSchema = z.object({
  giftNote: z.string().nullable(),
})

export type UpdateGiftNoteDTO = z.infer<typeof UpdateGiftNoteSchema>

export const SyncCartSchema = z.object({
  items: z.array(AddItemSchema),
})

export type SyncCartDTO = z.infer<typeof SyncCartSchema>
