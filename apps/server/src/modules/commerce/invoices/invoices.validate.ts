import { z } from "zod"

export const GenerateInvoiceSchema = z.object({
  orderId: z.string().min(1),
})
