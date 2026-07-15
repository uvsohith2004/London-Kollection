import { z } from "zod"

export const HeroCarouselSchema = z.object({
  id: z.string().uuid(),
  image: z.any(),
  title: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  buttonText: z.string().nullable().optional(),
  linkUrl: z.string().nullable().optional(),
  published: z.boolean(),
  sortOrder: z.number(),
  scheduleStart: z.string().or(z.date()).nullable().optional(),
  scheduleEnd: z.string().or(z.date()).nullable().optional(),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
})

export type HeroCarousel = z.infer<typeof HeroCarouselSchema>

export const CreateHeroSlideSchema = z.object({
  image: z.any(),
  title: z.union([z.string(), z.literal("")]).optional(),
  description: z.union([z.string(), z.literal("")]).optional(),
  buttonText: z.union([z.string(), z.literal("")]).optional(),
  linkUrl: z.union([z.string(), z.literal("")]).optional(),
  published: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  scheduleStart: z.string().datetime().optional().transform((val) => (val ? new Date(val) : undefined)),
  scheduleEnd: z.string().datetime().optional().transform((val) => (val ? new Date(val) : undefined)),
})

export const UpdateHeroSlideSchema = z.object({
  image: z.any().optional(),
  title: z.union([z.string(), z.literal("")]).optional(),
  description: z.union([z.string(), z.literal("")]).optional(),
  buttonText: z.union([z.string(), z.literal("")]).optional(),
  linkUrl: z.union([z.string(), z.literal("")]).optional(),
  published: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  scheduleStart: z.string().datetime().nullable().optional().transform((val) => (val ? new Date(val) : val)),
  scheduleEnd: z.string().datetime().nullable().optional().transform((val) => (val ? new Date(val) : val)),
})

export const ReorderHeroSlidesSchema = z.object({
  orderList: z.array(
    z.object({
      id: z.string().min(1),
      sortOrder: z.number().int(),
    })
  ),
})
