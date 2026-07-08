import { z } from "zod"

export const PrepareOrderSchema = z.object({
  cartId: z.string().uuid("Invalid cart ID"),
  shippingAddressId: z.string().uuid("Invalid shipping address ID"),
  billingAddressId: z.string().uuid("Invalid billing address ID").optional(),
})
