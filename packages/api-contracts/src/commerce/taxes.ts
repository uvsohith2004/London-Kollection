import { z } from "zod"

export const TaxClassSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable().optional(),
  isDefault: z.boolean(),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
})

export type TaxClass = z.infer<typeof TaxClassSchema>

export const TaxRateSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  countryCode: z.string(),
  region: z.string().nullable().optional(),
  percentage: z.string().or(z.number()),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
})

export type TaxRate = z.infer<typeof TaxRateSchema>

export const TaxRuleSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  taxClassId: z.string().uuid(),
  taxRateId: z.string().uuid(),
  effectiveFrom: z.string().or(z.date()),
  effectiveTo: z.string().or(z.date()).nullable().optional(),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
  taxClass: TaxClassSchema.optional(),
  taxRate: TaxRateSchema.optional(),
})

export type TaxRule = z.infer<typeof TaxRuleSchema>

export const CreateTaxClassSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  isDefault: z.boolean().optional(),
})

export const UpdateTaxClassSchema = CreateTaxClassSchema.partial()

export const CreateTaxRateSchema = z.object({
  name: z.string().min(1),
  countryCode: z.string().length(2),
  region: z.string().optional(),
  percentage: z.number().min(0),
})

export const UpdateTaxRateSchema = CreateTaxRateSchema.partial()

export const CreateTaxRuleSchema = z.object({
  name: z.string().min(1),
  taxClassId: z.string().uuid(),
  taxRateId: z.string().uuid(),
  effectiveFrom: z.string().optional(),
  effectiveTo: z.string().optional(),
})

export const UpdateTaxRuleSchema = CreateTaxRuleSchema.partial()
