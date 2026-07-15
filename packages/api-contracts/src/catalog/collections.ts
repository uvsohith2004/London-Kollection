import { z } from "zod"

export const CollectionSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  image: z.any().nullable().optional(),
  icon: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  isActive: z.boolean().default(true),
  seoTitle: z.string().nullable().optional(),
  seoDescription: z.string().nullable().optional(),
  seoKeywords: z.array(z.string()).nullable().optional(),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
})

export type Collection = z.infer<typeof CollectionSchema>

export const CreateCollectionSchema = CollectionSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).partial({
  isActive: true,
})

export type CreateCollectionDTO = z.infer<typeof CreateCollectionSchema>

export const UpdateCollectionSchema = CreateCollectionSchema.partial()

export type UpdateCollectionDTO = z.infer<typeof UpdateCollectionSchema>
