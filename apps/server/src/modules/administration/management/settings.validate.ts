import { z } from "zod"

export const UpdateSettingSchema = z.object({
  value: z.any(),
  description: z.string().optional(),
})
