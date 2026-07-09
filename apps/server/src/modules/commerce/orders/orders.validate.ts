import { z } from "zod"

export const UpdateOrderStatusSchema = z.object({
  status: z.string().optional(),
  paymentStatus: z.string().optional(),
  description: z.string().optional(),
})
