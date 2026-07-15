import { z } from "zod"

export const ReturnFormFieldSchema = z.object({
  id: z.string(),
  type: z.enum(["rating", "radio", "checkbox", "select", "multiselect", "short_text", "long_text", "number", "yes_no"]),
  label: z.string(),
  description: z.string().optional(),
  required: z.boolean().default(false),
  options: z.array(z.string()).optional(), // For radio, select, multiselect
  placeholder: z.string().optional(),
})

export const CreateReturnFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  schema: z.array(ReturnFormFieldSchema),
})

export const UpdateReturnFormSchema = CreateReturnFormSchema.partial()
