import { z } from "zod"

const ImageSchema = z.object({
  url: z.string().min(1, "URL is required"),
  alt: z.string().optional(),
  isPrimary: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
})

const OptionSchema = z.object({
  name: z.string().min(1),
  position: z.number().int().optional(),
  values: z.array(z.string().min(1)),
})

const VariantSchema = z.object({
  name: z.string().optional(),
  sku: z.string().min(1, "SKU is required"),
  isDefault: z.boolean().optional(),
  price: z
    .string()
    .refine((val) => !isNaN(Number(val)), {
      message: "Price must be a valid number string",
    })
    .optional(),
  discountValue: z
    .string()
    .refine((val) => !isNaN(Number(val)), {
      message: "Discount must be a valid number string",
    })
    .optional(),
  compareAtPrice: z
    .string()
    .refine((val) => !isNaN(Number(val)), {
      message: "Compare price must be a valid number string",
    })
    .optional()
    .nullable(),
  stock: z.number().int().nonnegative(),
  combinations: z.record(z.string(), z.string()),
  barcode: z.string().optional().nullable(),
  inventoryStatus: z
    .enum(["in_stock", "out_of_stock", "pre_order", "coming_soon"])
    .optional(),
  images: z.array(ImageSchema).optional(),
})

const DimensionsSchema = z
  .object({
    length: z.number(),
    width: z.number(),
    height: z.number(),
    weight: z.number(),
    lengthUnit: z.enum(["in", "cm"]),
    weightUnit: z.enum(["kg", "lb"]),
  })
  .optional()
  .nullable()

export const CreateProductSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  shortDescription: z.string().optional(),
  description: z.string().optional(),
  visibility: z.enum(["public", "hidden"]).optional(),
  status: z
    .enum(["draft", "published", "archived", "scheduled", "hidden"])
    .optional(),

  // Pricing
  price: z
    .string()
    .refine((val) => !isNaN(Number(val)), {
      message: "Price must be a valid number string",
    }),
  discount: z
    .string()
    .refine((val) => !isNaN(Number(val)), {
      message: "Discount must be a valid number string",
    })
    .optional(),
  currency: z.string().optional(),

  // Taxonomy
  brandId: z.string().min(1).optional().nullable(),
  productType: z.string().optional().nullable(),
  categoryId: z.string().min(1).optional().nullable(),
  taxClassId: z.string().min(1).optional().nullable(),

  // Flags
  published: z.boolean().optional(),
  featured: z.boolean().optional(),
  isNewArrival: z.boolean().optional(),
  isReturnable: z.boolean().optional(),
  isExchangeable: z.boolean().optional(),

  // SEO
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  seoKeywords: z.array(z.string()).optional(),

  // Physical
  dimensions: DimensionsSchema,

  // Relations
  categoryIds: z.array(z.string().min(1)).optional(),
  collectionIds: z.array(z.string().min(1)).optional(),
  occasionIds: z.array(z.string().min(1)).optional(),
  images: z.array(ImageSchema).optional(),
  options: z.array(OptionSchema).optional(),
  variants: z.array(VariantSchema).optional(),
})

export const UpdateProductSchema = CreateProductSchema.partial()
