import { z } from "zod"

export const BrandSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  website: z.string().nullable().optional(),
  image: z.any().nullable().optional(),
  description: z.string().nullable().optional(),
  isActive: z.boolean(),
  seoTitle: z.string().nullable().optional(),
  seoDescription: z.string().nullable().optional(),
  seoKeywords: z.array(z.string()).nullable().optional(),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
})

export type Brand = z.infer<typeof BrandSchema>

export const CreateBrandSchema = z.object({
  name: z.string().min(1),
  slug: z.string().optional(),
  website: z.string().url().optional(),
  description: z.string().optional(),
  image: z.any().optional(),
  isActive: z.boolean().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  seoKeywords: z.array(z.string()).optional(),
})

export const UpdateBrandSchema = CreateBrandSchema.partial()
