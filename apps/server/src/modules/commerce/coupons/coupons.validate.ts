import { z } from "zod"

export const CreateCouponSchema = z.object({
  code: z.string().min(3).max(50),
  discountType: z.enum(["percentage", "fixed"]),
  discountValue: z.number().positive(),
  minPurchaseAmount: z.number().min(0).default(0),
  maxDiscountAmount: z.number().positive().optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  usageLimit: z.number().int().min(0).default(0),
})

export const UpdateCouponSchema = CreateCouponSchema.partial().extend({
  active: z.boolean().optional(),
})
