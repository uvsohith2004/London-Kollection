import { z } from "zod"

export const CategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  image: z.any().nullable().optional(),
  icon: z.any().nullable().optional(),
  description: z.string().nullable().optional(),
  parentId: z.string().uuid().nullable().optional(),
  path: z.string().nullable().optional(),
  level: z.number().default(0),
  isActive: z.boolean().default(true),
  seoTitle: z.string().nullable().optional(),
  seoDescription: z.string().nullable().optional(),
  seoKeywords: z.array(z.string()).nullable().optional(),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
})

export type Category = z.infer<typeof CategorySchema>

export const CreateCategorySchema = CategorySchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  path: true,
  level: true,
}).partial({
  isActive: true,
})

export type CreateCategoryDTO = z.infer<typeof CreateCategorySchema>

export const UpdateCategorySchema = CreateCategorySchema.partial()

export type UpdateCategoryDTO = z.infer<typeof UpdateCategorySchema>
