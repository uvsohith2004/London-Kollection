import { z } from "zod"

export const CartSummaryResponse = z.object({
  id: z.string(),
  items: z.array(z.object({
    id: z.string(),
    productId: z.string(),
    variantId: z.string().nullable(),
    productName: z.string(),
    productSlug: z.string(),
    sku: z.string(),
    image: z.string().optional(),
    optionValues: z.record(z.string(), z.any()),
    quantity: z.number(),
    unitPrice: z.number(),
    compareAtPrice: z.number().optional(),
    discountValue: z.number(),
    subtotal: z.number(),
    isAvailable: z.boolean(),
  })),
  subtotal: z.number(),
  taxTotal: z.number(),
  discountTotal: z.number(),
  deliveryFee: z.number(),
  grandTotal: z.number(),
  couponCode: z.string().nullable().optional(),
})

export type CartSummaryResponseDTO = z.infer<typeof CartSummaryResponse>
