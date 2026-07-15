import { z } from "zod"

export const ReturnRequestSchema = z.object({
  id: z.string().uuid(),
  orderId: z.string().uuid(),
  userId: z.string(),
  status: z.string(),
  returnType: z.string(),
  reason: z.string().nullable().optional(),
  images: z.any().nullable().optional(),
  adminNotes: z.string().nullable().optional(),
  pickupDate: z.string().or(z.date()).nullable().optional(),
  pickedUpAt: z.string().or(z.date()).nullable().optional(),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
  order: z.any().optional(),
  user: z.any().optional(),
})

export type ReturnRequest = z.infer<typeof ReturnRequestSchema>

export const CreateReturnRequestSchema = z.object({
  orderId: z.string().uuid(),
  returnType: z.string().min(1),
  reason: z.string().optional(),
  images: z.array(z.string().url()).optional(),
})

export type CreateReturnRequestDTO = z.infer<typeof CreateReturnRequestSchema>

export const UpdateReturnStatusSchema = z.object({
  status: z.string(),
  adminNotes: z.string().optional(),
  pickupDate: z.string().optional(),
})

export type UpdateReturnStatusDTO = z.infer<typeof UpdateReturnStatusSchema>
