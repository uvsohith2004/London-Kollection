import { z } from "zod"

export const CouponSchema = z.object({
  id: z.string().uuid(),
  code: z.string(),
  discountType: z.string(),
  discountValue: z.string().or(z.number()),
  minPurchaseAmount: z.string().or(z.number()),
  maxDiscountAmount: z.string().or(z.number()).nullable().optional(),
  startDate: z.string().or(z.date()),
  endDate: z.string().or(z.date()),
  usageLimit: z.number().int(),
  usageCount: z.number().int(),
  active: z.boolean(),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
})

export type Coupon = z.infer<typeof CouponSchema>

export const CreateCouponSchema = z.object({
  code: z.string().min(3),
  discountType: z.enum(["percentage", "fixed"]),
  discountValue: z.number().positive(),
  minPurchaseAmount: z.number().min(0),
  maxDiscountAmount: z.number().positive().optional(),
  startDate: z.string(),
  endDate: z.string(),
  usageLimit: z.number().int().min(0),
})

export type CreateCouponDTO = z.infer<typeof CreateCouponSchema>

export const UpdateCouponSchema = CreateCouponSchema.partial().extend({
  active: z.boolean().optional(),
})

export type UpdateCouponDTO = z.infer<typeof UpdateCouponSchema>
