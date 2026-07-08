import { z } from "zod"

export const CreateAddressSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(1, "Phone is required"),
  country: z.string().min(1, "Country is required"),
  state: z.string().min(1, "State is required"),
  city: z.string().min(1, "City is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  landmark: z.string().optional(),
  addressLine1: z.string().min(1, "Address Line 1 is required"),
  addressLine2: z.string().optional(),
  type: z.enum(["shipping", "billing"]).optional(),
  default: z.boolean().optional(),
})

export const UpdateAddressSchema = CreateAddressSchema.partial()
