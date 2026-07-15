import { z } from "zod"

export const UpdateSettingSchema = z.object({
  crNumber: z.string().optional().nullable(),
  vatNumber: z.string().optional().nullable(),
  defaultReturnWindow: z.number().int().min(0).default(14),
  defaultExchangeWindow: z.number().int().min(0).default(30),
})
