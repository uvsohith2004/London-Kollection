import { z } from "zod"

export const CreateBrandSchema = z.object({
  name: z.string().min(2, "Brand name must be at least 2 characters."),
  slug: z.string().min(2, "Slug must be at least 2 characters."),
  website: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  image: z.any().optional().nullable(),
  isActive: z.boolean().default(true).optional(),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
  seoKeywords: z.array(z.string()).optional().nullable(),
})

export const UpdateBrandSchema = CreateBrandSchema.partial()
