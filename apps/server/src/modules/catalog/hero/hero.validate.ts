import { z } from "zod"

export const CreateHeroSlideSchema = z.object({
  image: z.any(),
  title: z.union([z.string(), z.literal("")]).optional(),
  description: z.union([z.string(), z.literal("")]).optional(),
  buttonText: z.union([z.string(), z.literal("")]).optional(),
  linkUrl: z.union([z.string().url(), z.literal("")]).optional(),
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
  linkUrl: z.union([z.string().url(), z.literal("")]).optional(),
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
