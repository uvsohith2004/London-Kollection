import { z } from "zod"

export const InvoiceSchema = z.object({
  id: z.string().uuid(),
  orderId: z.string().uuid(),
  invoiceNumber: z.string(),
  pdfUrl: z.string().nullable().optional(),
  issueDate: z.string().or(z.date()),
  dueDate: z.string().or(z.date()).nullable().optional(),
  status: z.string(),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
})

export type Invoice = z.infer<typeof InvoiceSchema>

export const GenerateInvoiceSchema = z.object({
  orderId: z.string().uuid(),
})

export type GenerateInvoiceDTO = z.infer<typeof GenerateInvoiceSchema>
