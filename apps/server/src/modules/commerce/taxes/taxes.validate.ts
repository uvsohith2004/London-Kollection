import { z } from "zod"

// -- Tax Classes --
export const CreateTaxClassSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  description: z.string().optional().nullable(),
  isDefault: z.boolean().default(false).optional(),
})
export const UpdateTaxClassSchema = CreateTaxClassSchema.partial()

// -- Tax Rates --
export const CreateTaxRateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  countryCode: z.string().min(2, "Valid country code required."),
  region: z.string().optional().nullable(),
  percentage: z.number().min(0, "Percentage must be positive."),
})
export const UpdateTaxRateSchema = CreateTaxRateSchema.partial()

// -- Tax Rules --
export const CreateTaxRuleSchema = z.object({
  name: z.string().min(1, "Name is required"),
  taxClassId: z.string().uuid("Invalid Tax Class ID"),
  taxRateId: z.string().uuid("Invalid Tax Rate ID"),
  effectiveFrom: z.string().optional().nullable(),
  effectiveTo: z.string().optional().nullable(),
})
export const UpdateTaxRuleSchema = CreateTaxRuleSchema.partial()
