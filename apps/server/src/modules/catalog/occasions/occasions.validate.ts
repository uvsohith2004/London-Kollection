import { z } from "zod"

export const CreateOccasionSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
  seoKeywords: z.array(z.string()).optional().nullable(),
  image: z.any().optional().nullable(),
})

export const UpdateOccasionSchema = CreateOccasionSchema.partial()
