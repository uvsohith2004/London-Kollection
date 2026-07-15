import { z } from "zod"

export const PrepareOrderSchema = z.object({
  cartId: z.string().uuid(),
  shippingAddressId: z.string().uuid(),
  billingAddressId: z.string().uuid().optional(),
})

export type PrepareOrderDTO = z.infer<typeof PrepareOrderSchema>

export const PreviewOrderSchema = z.object({
  cartId: z.string().uuid(),
  shippingCountryCode: z.string().length(2),
})

export type PreviewOrderDTO = z.infer<typeof PreviewOrderSchema>

export const OrderPreviewSummarySchema = z.object({
  subtotal: z.number(),
  taxTotal: z.number(),
  discountTotal: z.number(),
  deliveryFee: z.number(),
  grandTotal: z.number(),
})

export type OrderPreviewSummary = z.infer<typeof OrderPreviewSummarySchema>
