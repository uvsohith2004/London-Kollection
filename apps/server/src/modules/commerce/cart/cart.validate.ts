import { z } from "zod"

export const AddCartItemSchema = z.object({
  productId: z.string().uuid("Invalid product ID format"),
  variantId: z.string().uuid("Invalid variant ID format").nullable().optional(),
  quantity: z.number().int().positive("Quantity must be a positive integer"),
})

export const UpdateCartItemSchema = z.object({
  quantity: z.number().int().nonnegative("Quantity cannot be negative"),
})

export const ApplyCouponSchema = z.object({
  couponCode: z.string().nullable(),
})

export const UpdateGiftNoteSchema = z.object({
  giftNote: z.string().nullable(),
})

export const SyncCartSchema = z.object({
  items: z.array(z.object({
    productId: z.string().uuid("Invalid product ID format"),
    variantId: z.string().uuid("Invalid variant ID format").nullable().optional(),
    quantity: z.number().int().positive("Quantity must be positive"),
  }))
})
