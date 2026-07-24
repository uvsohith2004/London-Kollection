"use client"

import { useEffect, useRef } from "react"
import { useForm, useFieldArray, UseFormReturn, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { 
  useCreateProductMutation, 
  useUpdateProductMutation 
} from "../../mutations"
import { 
  useAdminCategoriesQuery, 
  useAdminCollectionsQuery, 
  useAdminBrandsQuery,
  useAdminOccasionsQuery
} from "../../queries"
import { useSettingsQuery, useTaxClassesQuery } from "../../../queries"
import { useQuery } from "@tanstack/react-query"


const productFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  brandId: z.string().optional(),
  productType: z.string().optional(),
  shortDescription: z.string().optional(),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "Price must be positive"),
  discount: z.coerce.number().optional(),
  categoryId: z.string().optional(),
  taxClassId: z.string().optional(),
  collections: z.array(z.any()).optional(),
  occasions: z.array(z.any()).optional(),
  options: z.array(z.object({
    name: z.string().min(1, "Option name is required"),
    values: z.array(z.string())
  })).optional(),
  variants: z.array(z.object({
    sku: z.string().optional(),
    stock: z.coerce.number().optional(),
    price: z.coerce.number().optional(),
    inventoryStatus: z.enum(["in_stock", "out_of_stock", "pre_order", "coming_soon"]).optional(),
    images: z.array(z.object({
      url: z.string(),
      isPrimary: z.boolean().optional()
    })).optional(),
    combinationsRaw: z.string().optional(),
    name: z.string().optional()
  })),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  seoKeywords: z.array(z.string()).optional(),
  weight: z.coerce.number().optional(),
  length: z.coerce.number().optional(),
  width: z.coerce.number().optional(),
  height: z.coerce.number().optional(),
  published: z.boolean().default(false),
  featured: z.boolean().default(false),
  isNewArrival: z.boolean().default(false),
  isReturnable: z.boolean().default(true),
  isExchangeable: z.boolean().default(true),
  returnWindowDays: z.coerce.number().min(0).optional().nullable().or(z.literal("")),
  exchangeWindowDays: z.coerce.number().min(0).optional().nullable().or(z.literal("")),
  status: z.enum(["draft", "published", "archived", "scheduled", "hidden"]).default("draft"),
})

export type ProductFormValues = z.infer<typeof productFormSchema>

export function useProductForm(initialData?: any, onSuccess?: () => void) {
  const isEditing = !!initialData

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema) as any,
    defaultValues: {
      title: initialData?.title || "",
      slug: initialData?.slug || "",
      brandId: initialData?.brandId || "",
      productType: initialData?.productType || "",
      shortDescription: initialData?.shortDescription || "",
      description: initialData?.description || "",
      price: initialData?.price ? Number(initialData.price) : 0,
      discount: initialData?.discount ? Number(initialData.discount) : undefined,
      categoryId: initialData?.categoryId || "",
      taxClassId: initialData?.taxClassId || "",
      collections: Array.isArray(initialData?.collection) ? initialData.collection.map((c: any) => ({ label: c.name || c.title, value: c.id })) 
        : Array.isArray(initialData?.collections) ? initialData.collections.map((c: any) => ({ label: c.name || c.title, value: c.id })) : [],
      occasions: Array.isArray(initialData?.occasions) ? initialData.occasions.map((o: any) => ({ label: o.name || o.title, value: o.id })) : [],
      options: Array.isArray(initialData?.options) ? initialData.options.map((opt: any) => ({
        name: opt.name,
        values: Array.isArray(opt.values) ? opt.values : (typeof opt.values === 'string' ? opt.values.split(',').map((v: string) => v.trim()) : [])
      })) : [],
      variants: Array.isArray(initialData?.variants) && initialData.variants.length > 0 ? initialData.variants.map((v: any) => ({
        sku: v.sku || "",
        stock: v.stock || 0,
        price: v.price ? Number(v.price) : undefined,
        inventoryStatus: v.inventoryStatus || "in_stock",
        images: Array.isArray(v.images) ? v.images.map((img: any) => ({ url: img.url, isPrimary: img.isPrimary })) : [],
        combinationsRaw: v.optionValues ? Object.entries(v.optionValues).map(([k, val]) => `${k}:${val}`).join(", ") : ""
      })) : [{
        sku: "",
        stock: 0,
        price: undefined,
        inventoryStatus: "in_stock",
        images: [],
      }],
      metaTitle: initialData?.metaTitle || "",
      metaDescription: initialData?.metaDescription || "",
      seoKeywords: Array.isArray(initialData?.seoKeywords) 
        ? initialData.seoKeywords 
        : (typeof initialData?.seoKeywords === 'string' ? initialData.seoKeywords.split(',').map((k: string) => k.trim()).filter(Boolean) : []),
      weight: initialData?.weight,
      length: initialData?.length,
      width: initialData?.width,
      height: initialData?.height,
      published: initialData?.published || initialData?.visibility === "public" || false,
      featured: initialData?.featured ?? false,
      isNewArrival: initialData?.isNewArrival ?? false,
      isReturnable: initialData?.isReturnable ?? true,
      isExchangeable: initialData?.isExchangeable ?? true,
      returnWindowDays: initialData?.returnWindowDays ?? "",
      exchangeWindowDays: initialData?.exchangeWindowDays ?? "",
      status: initialData?.status || (initialData?.published ? "published" : "draft"),
    }
  })

  const { fields: optionFields, append: appendOption, remove: removeOption, replace: replaceOptions } = useFieldArray({
    control: form.control,
    name: "options"
  })

  const { fields: variantFields, append: appendVariant, remove: removeVariant, replace: replaceVariants } = useFieldArray({
    control: form.control,
    name: "variants"
  })

  const createMutation = useCreateProductMutation()
  const updateMutation = useUpdateProductMutation()

  const isPending = createMutation.isPending || updateMutation.isPending

  const { data: colsRes, isLoading: isLoadingCols } = useAdminCollectionsQuery()
  const { data: occsRes, isLoading: isLoadingOccs } = useAdminOccasionsQuery()
  const { data: catsRes, isLoading: isLoadingCats } = useAdminCategoriesQuery()

  const { data: taxesRes, isLoading: isLoadingTaxes } = useTaxClassesQuery()
  const { data: brandsRes, isLoading: isLoadingBrands } = useAdminBrandsQuery()
  
  const { data: globalSettingsRes, isLoading: isLoadingGlobalSettings } = useSettingsQuery()

  // Global settings for currency
  const { data: settingsRes, isLoading: isLoadingSettings } = useQuery({
    queryKey: ["admin", "settings", "general"],
    queryFn: async () => {
      // Mock global settings fetch
      return { currency: "KWD" }
    }
  })
  
  const referenceData = {
    collectionOptions: colsRes?.items?.map((c: any) => ({ label: c.title || c.name, value: c.id })) || [],
    occasionOptions: occsRes?.items?.map((o: any) => ({ label: o.title || o.name, value: o.id })) || [],
    categoryOptions: catsRes?.items || [],
    taxClasses: taxesRes?.items || [],
    brandOptions: brandsRes?.items || [],
    currency: settingsRes?.currency || "KWD",
    settings: globalSettingsRes?.data || {},
    isLoading: isLoadingCols || isLoadingOccs || isLoadingCats || isLoadingTaxes || isLoadingBrands || isLoadingSettings || isLoadingGlobalSettings
  }

  // Auto variant generation logic
  const watchedOptions = useWatch({ control: form.control, name: "options" })
  const watchedPrice = useWatch({ control: form.control, name: "price" })
  
  const isInitialMount = useRef(true)

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }

    const currentOptions = watchedOptions || []
    const validOptions = currentOptions.filter((o: any) => o?.name?.trim() && o?.values?.length > 0)

    if (validOptions.length === 0) {
      // If options removed completely, reset to single base variant
      const currentVariants = form.getValues("variants")
      if (currentVariants.length > 1 || (currentVariants.length === 1 && currentVariants[0]?.combinationsRaw)) {
        replaceVariants([{
          sku: `SKU-${Math.floor(Math.random() * 10000)}`,
          stock: 0,
          price: watchedPrice,
          combinationsRaw: "",
          images: [],
          inventoryStatus: "in_stock"
        }])
      }
      return
    }

    // Parse values
    const parsedOptions = validOptions.map((o: any) => ({
      name: o.name.trim(),
      values: o.values.filter(Boolean)
    }))

    // Cartesian product to generate combinations
    const combine = (opts: any[], idx: number, currentCombo: any[], acc: any[]) => {
      if (idx === opts.length) {
        acc.push([...currentCombo])
        return
      }
      for (const val of opts[idx].values) {
        currentCombo.push({ name: opts[idx].name, value: val })
        combine(opts, idx + 1, currentCombo, acc)
        currentCombo.pop()
      }
    }

    const combinations: any[] = []
    combine(parsedOptions, 0, [], combinations)

    const expectedRawCombos = combinations.map(combo => 
      combo.map((c: any) => `${c.name}:${c.value}`).join(", ")
    )

    const currentVariants = form.getValues("variants") || []
    
    // We want to preserve existing variants that match the expected combos,
    // and add new ones that are missing.
    const nextVariants = expectedRawCombos.map(rawCombo => {
      const existing = currentVariants.find((v: any) => v.combinationsRaw === rawCombo)
      if (existing) return existing
      
      return {
        sku: `SKU-${Math.floor(Math.random() * 10000)}`,
        stock: 10,
        price: watchedPrice,
        combinationsRaw: rawCombo,
        images: [],
        inventoryStatus: "in_stock"
      }
    })

    // Avoid unnecessary rerenders if lengths and combos match exactly (deep check)
    const isSame = nextVariants.length === currentVariants.length && 
                   nextVariants.every((v, i) => v.combinationsRaw === currentVariants[i]?.combinationsRaw)

    if (!isSame) {
      replaceVariants(nextVariants as any)
    }
  }, [JSON.stringify(watchedOptions)])

  const onSubmit = form.handleSubmit((data) => {
    // Transform options
    const finalOptions = (data.options || [])
      .filter((o: any) => o.name.trim() && o.values.length > 0)
      .map((o: any) => ({
        name: o.name.trim(),
        values: o.values.filter(Boolean)
      }))

    // Transform variants
    const finalVariants = data.variants.map((v: any) => {
      const combinations: Record<string, string> = {}
      if (v.combinationsRaw) {
        v.combinationsRaw.split(",").forEach((pair: string) => {
          const [key, val] = pair.split(":")
          if (key && val) {
            combinations[key.trim()] = val.trim()
          }
        })
      }
      
      const variantImages = (v.images || []).slice(0, 6).map((img: any, index: number) => {
        const urlStr = typeof img.url === 'string' ? img.url : (img.url?.webp?.url || img.url?.avif?.url || img.url?.url || '');
        return {
          url: urlStr,
          isPrimary: index === 0 || img.isPrimary,
          sortOrder: index
        };
      })

      return {
        name: v.name || undefined,
        sku: v.sku,
        stock: Number(v.stock || 0),
        price: v.price ? v.price.toString() : undefined,
        combinations,
        images: variantImages,
        inventoryStatus: v.inventoryStatus || "in_stock"
      }
    })

    const payload = {
      title: data.title,
      slug: data.slug,
      price: data.price.toString(),
      description: data.description,
      shortDescription: data.shortDescription,
      visibility: data.status === "hidden" ? "hidden" : "public",
      status: data.status,
      published: data.status === "published",
      categoryId: data.categoryId || null,
      taxClassId: data.taxClassId || null,
      categoryIds: data.categoryId ? [data.categoryId] : [],
      collectionIds: (data.collections || []).map((c: any) => c.value || c),
      occasionIds: (data.occasions || []).map((o: any) => o.value || o),
      options: finalOptions,
      variants: finalVariants,
      brandId: data.brandId || null,
      productType: data.productType || null,
      discount: data.discount?.toString(),
      metaTitle: data.metaTitle,
      metaDescription: data.metaDescription,
      seoKeywords: Array.isArray(data.seoKeywords) ? data.seoKeywords : [],
      dimensions: {
        weight: Number(data.weight || 0),
        length: Number(data.length || 0),
        width: Number(data.width || 0),
        height: Number(data.height || 0),
        lengthUnit: "cm",
        weightUnit: "kg"
      },
      featured: data.featured,
      isNewArrival: data.isNewArrival,
      isReturnable: data.isReturnable,
      isExchangeable: data.isExchangeable,
      returnWindowDays: data.returnWindowDays === "" || data.returnWindowDays == null || isNaN(Number(data.returnWindowDays)) ? null : Number(data.returnWindowDays),
      exchangeWindowDays: data.exchangeWindowDays === "" || data.exchangeWindowDays == null || isNaN(Number(data.exchangeWindowDays)) ? null : Number(data.exchangeWindowDays)
    }

    if (isEditing) {
      updateMutation.mutate({ id: initialData.id, data: payload }, { onSuccess: onSuccess || (() => {}) })
    } else {
      createMutation.mutate(payload, { onSuccess: onSuccess || (() => {}) })
    }
  })

  return {
    form,
    optionFields,
    appendOption,
    removeOption,
    variantFields,
    removeVariant,
    replaceVariants,
    onSubmit,
    isPending,
    isEditing,
    referenceData
  }
}

export type { UseFormReturn }
