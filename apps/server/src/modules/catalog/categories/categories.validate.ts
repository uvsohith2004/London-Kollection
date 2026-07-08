import { z } from "zod"

export const CreateCategorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional().nullable(),
  parentId: z.string().min(1).optional().nullable(),
  image: z.any().optional().nullable(),
  icon: z.any().optional().nullable(),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
  seoKeywords: z.array(z.string()).optional().nullable(),
})

export const UpdateCategorySchema = CreateCategorySchema.partial()
