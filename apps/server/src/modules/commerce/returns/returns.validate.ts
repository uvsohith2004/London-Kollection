import { z } from "zod"

export const CreateReturnRequestSchema = z.object({
  orderId: z.string().uuid("Invalid order ID"),
  returnType: z.string().min(1, "Return type is required"),
  reason: z.string().optional(),
  images: z.array(z.string().url()).optional(),
})

export const UpdateReturnStatusSchema = z.object({
  status: z.enum(["Approved", "Rejected"]),
  adminNotes: z.string().optional(),
})
