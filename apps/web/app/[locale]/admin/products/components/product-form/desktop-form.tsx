"use client"

import * as React from "react"
import { UseFormReturn } from "react-hook-form"
import { ProductFormValues } from "./use-product-form"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"
import { Button } from "@workspace/ui/components/button"
import { Switch } from "@workspace/ui/components/switch"
import { OptionBuilder } from "./option-builder"
import { VariantManager } from "./variant-manager"
import {
  CreateCategoryDialog,
  CreateCollectionDialog,
  CreateOccasionDialog,
} from "./inline-creation-dialogs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Label } from "@workspace/ui/components/label"
import { Card } from "@workspace/ui/components/card"
import { Separator } from "@workspace/ui/components/separator"
import { Skeleton } from "@workspace/ui/components/skeleton"
import MultipleSelector from "@workspace/ui/components/multi-select"
import { 
  Save, 
  Plus, 
  Loader2, 
  ArrowLeft, 
  Settings, 
  DollarSign, 
  Package, 
  Search, 
  Truck, 
  Eye, 
  CheckCircle2, 
  AlertCircle,
  Receipt
} from "lucide-react"
import { fetchProductBySlug } from "@/lib/api"

const LABEL = "text-sm font-medium text-foreground"

interface DesktopFormProps {
  form: UseFormReturn<ProductFormValues>
  isPending: boolean
  isEditing: boolean
  onSubmit: (e: React.FormEvent) => void
  onCancel?: () => void
  optionFields: any[]
  appendOption: (val: any) => void
  removeOption: (index: number) => void
  variantFields: any[]
  removeVariant: (index: number) => void
  referenceData: {
    categoryOptions: any[]
    collectionOptions: any[]
    occasionOptions: any[]
    taxClasses: any[]
    brandOptions: any[]
    currency: string
    isLoading: boolean
  }
}

export function DesktopForm(props: DesktopFormProps) {
  const { 
    form, 
    onSubmit, 
    onCancel, 
    isPending, 
    isEditing, 
    optionFields, 
    appendOption, 
    removeOption, 
    variantFields, 
    removeVariant, 
    referenceData 
  } = props

  const slugTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)

  const hasOptions = optionFields.length > 0

  // Calculate some stats for the sidebar
  const totalStock = variantFields.reduce((sum, v) => sum + (Number(form.watch(`variants.${variantFields.indexOf(v)}.stock`)) || 0), 0)
  const isValid = form.formState.isValid
  const formErrors = Object.keys(form.formState.errors).length

  return (
    <form onSubmit={onSubmit} className="min-h-screen bg-muted/30">
      {/* Fixed Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/50 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" type="button" onClick={onCancel} className="h-10 w-10">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground tracking-tight">
                {isEditing ? "Edit Product" : "New Product"}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" type="button" onClick={onCancel} className="hidden sm:flex">
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="min-w-[140px]">
              {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              <Save className="w-4 h-4 mr-2" />
              {isEditing ? "Save Changes" : "Create Product"}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content with Sidebar */}
      <div className="max-w-350 mx-auto w-full px-6 py-8 flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Main Builder Area */}
        <div className="flex-1 space-y-8 w-full min-w-0">
          {/* Section 1: Basic Information */}
          <section className="space-y-4" id="product-identity">
            <div className="flex items-center gap-3 px-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
                <Package className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Product Identity</h2>
                <p className="text-sm text-muted-foreground">Title, descriptions and categories</p>
              </div>
            </div>

            <Card className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className={LABEL}>Product Title <span className="text-destructive">*</span></Label>
                  <Input 
                    id="title" 
                    placeholder="e.g. Classic White T-Shirt" 
                    {...form.register("title")} 
                    onChange={(e) => {
                      form.register("title").onChange(e)
                      if (!isEditing && !form.formState.dirtyFields.slug) {
                        const baseSlug = e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
                        form.setValue("slug", baseSlug, { shouldValidate: true })
                        
                        if (slugTimeoutRef.current) clearTimeout(slugTimeoutRef.current)
                        slugTimeoutRef.current = setTimeout(async () => {
                          if (!baseSlug) return
                          try {
                            const existing = await fetchProductBySlug(baseSlug)
                            if (existing && existing.id) {
                              const gibberish = Math.random().toString(36).substring(2, 6)
                              form.setValue("slug", `${baseSlug}-${gibberish}`, { shouldValidate: true })
                            }
                          } catch (err) {
                            // usually 404 means available
                          }
                        }, 600)
                      }
                    }}
                    className="h-11" 
                  />
                  {form.formState.errors.title && (
                    <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug" className={LABEL}>URL Slug <span className="text-destructive">*</span></Label>
                  <Input id="slug" placeholder="e.g. classic-white-tshirt" {...form.register("slug")} className="h-11" />
                  {form.formState.errors.slug && (
                    <p className="text-sm text-destructive">{form.formState.errors.slug.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className={LABEL}>Brand</Label>
                  {referenceData.isLoading ? (
                    <Skeleton className="h-11 w-full" />
                  ) : (
                    <Select
                      onValueChange={(val) => form.setValue("brandId", val ?? undefined)}
                      value={form.watch("brandId") ?? ""}
                    >
                      <SelectTrigger className="h-11 w-full py-5">
                        <SelectValue placeholder="Select Brand">
                          {form.watch("brandId")
                            ? referenceData.brandOptions.find(b => b.id === form.watch("brandId"))?.name ?? "Select Brand"
                            : "Select Brand"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="w-full py-5">
                        {referenceData.brandOptions.map(brand => (
                          <SelectItem key={brand.id} value={brand.id}>{brand.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="productType" className={LABEL}>Product Type</Label>
                  <Input id="productType" placeholder="e.g. Apparel" {...form.register("productType")} className="h-11" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 ">
                  <div className="flex items-center justify-between ">
                    <Label className={LABEL}>Category</Label>
                    <CreateCategoryDialog categories={referenceData.categoryOptions} />
                  </div>
                  {referenceData.isLoading ? (
                    <Skeleton className="h-11 w-full" />
                  ) : (
                    <Select
                      onValueChange={(val) => form.setValue("categoryId", val ?? undefined)}
                      value={form.watch("categoryId") ?? ""}
                    >
                      <SelectTrigger className="h-11 w-full py-5">
                        <SelectValue placeholder="Select Category">
                          {form.watch("categoryId")
                            ? referenceData.categoryOptions.find(c => c.id === form.watch("categoryId"))?.name ?? "Select Category"
                            : "Select Category"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="w-full py-5">
                        {referenceData.categoryOptions.map(cat => (
                          <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className={LABEL}>Collections</Label>
                    <CreateCollectionDialog />
                  </div>
                  {referenceData.isLoading ? (
                    <Skeleton className="h-11 w-full" />
                  ) : (
                    <MultipleSelector
                      value={form.watch("collections") || []}
                      onChange={(opts) => form.setValue("collections", opts)}
                      defaultOptions={referenceData.collectionOptions}
                      placeholder="Select collections..."
                      emptyIndicator={<p className="text-center text-sm">No collections found</p>}
                    />
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className={LABEL}>Occasions</Label>
                  <CreateOccasionDialog />
                </div>
                {referenceData.isLoading ? (
                  <Skeleton className="h-11 w-full" />
                ) : (
                  <MultipleSelector
                    value={form.watch("occasions") || []}
                    onChange={(opts) => form.setValue("occasions", opts)}
                    defaultOptions={referenceData.occasionOptions}
                    placeholder="Select occasions..."
                    emptyIndicator={<p className="text-center text-sm">No occasions found</p>}
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="shortDescription" className={LABEL}>Short Description</Label>
                <Textarea
                  id="shortDescription"
                  placeholder="A brief overview..."
                  {...form.register("shortDescription")}
                  className="resize-none h-20"
                />
              </div>

              <div className="space-y-2">
                  <Label className={LABEL}>Tags / SEO Keywords</Label>
                  <MultipleSelector
                    value={((form.watch("seoKeywords") ?? "").split(',').filter(Boolean).map(s => ({ label: s.trim(), value: s.trim() })))}
                    onChange={(opts) => form.setValue("seoKeywords", opts.map(o => o.value).join(', '))}
                    placeholder="Type and press enter to create tags..."
                    creatable
                    emptyIndicator={<p className="text-center text-sm">Type to create tags</p>}
                  />
                  <p className="text-xs text-muted-foreground">Used for search and filtering</p>
              </div>
            </Card>
          </section>

          <Separator className="my-8" />

          {/* Section 2: Pricing & Taxes */}
          <section className="space-y-4" id="pricing">
            <div className="flex items-center gap-3 px-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Pricing & Taxes</h2>
                <p className="text-sm text-muted-foreground">Set base prices and tax rules</p>
              </div>
            </div>

            <Card className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col h-full space-y-2">
                  <Label htmlFor="price" className={LABEL}>Base Price <span className="text-destructive">*</span></Label>
                  <div className="relative mt-auto">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-xs">
                      {referenceData.currency}
                    </span>
                    <Input id="price" type="number" step="0.01" {...form.register("price")} className="pl-12 h-11" />
                  </div>
                  {form.formState.errors.price && (
                    <p className="text-sm text-destructive">{form.formState.errors.price.message}</p>
                  )}
                </div>

                <div className="flex flex-col h-full space-y-2">
                  <Label htmlFor="discount" className={LABEL}>Compare at Price (Discount)</Label>
                  <div className="relative mt-auto">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-xs">
                      {referenceData.currency}
                    </span>
                    <Input id="discount" type="number" step="0.01" {...form.register("discount")} className="pl-12 h-11" />
                  </div>
                  {form.formState.errors.discount && (
                    <p className="text-sm text-destructive">{form.formState.errors.discount.message}</p>
                  )}
                </div>

                <div className="flex flex-col h-full space-y-2">
                  <Label className={LABEL}>Tax Class</Label>
                  {referenceData.isLoading ? (
                    <div className="mt-auto"><Skeleton className="h-11 w-full" /></div>
                  ) : (
                    <div className="mt-auto">
                      <Select
                        onValueChange={(val) => form.setValue("taxClassId", val ?? undefined)}
                        value={form.watch("taxClassId") ?? ""}
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Tax Class">
                            {form.watch("taxClassId")
                              ? referenceData.taxClasses.find(t => t.id === form.watch("taxClassId"))?.name
                              : "Select Tax Class"}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {referenceData.taxClasses.map((tax: any) => (
                            <SelectItem key={tax.id} value={tax.id}>{tax.name} ({tax.rate}%)</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </section>

          <Separator className="my-8" />

          {/* Section 3: Options */}
          <section className="space-y-4" id="options">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
                  <Settings className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Options</h2>
                  <p className="text-sm text-muted-foreground">Add options like size or color to auto-generate variants</p>
                </div>
              </div>
              <Button type="button" variant="outline" onClick={() => appendOption({ name: "", values: [] })}>
                <Plus className="w-4 h-4 mr-2" /> Add Option
              </Button>
            </div>

            {hasOptions ? (
              <Card className="p-8 space-y-4">
                {optionFields.map((field, idx) => (
                  <OptionBuilder
                    key={field.id}
                    form={form}
                    index={idx}
                    onRemove={() => removeOption(idx)}
                  />
                ))}
              </Card>
            ) : (
              <Card className="p-8 border-dashed bg-muted/30">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">No options added. This product will have a single variant.</p>
                </div>
              </Card>
            )}
          </section>

          {/* Section 4: Variants & Live Preview */}
          <section className="space-y-4 pt-4" id="variants">
             <div className="flex items-center gap-3 px-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
                <Package className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Variants & Inventory</h2>
                <p className="text-sm text-muted-foreground">Manage stock, SKUs, prices and variant images</p>
              </div>
            </div>

            <VariantManager 
              form={form} 
              variantFields={variantFields} 
              removeVariant={removeVariant} 
            />
          </section>

          <Separator className="my-8" />

          {/* Section 5: Shipping & Dimensions */}
          <section className="space-y-4" id="shipping">
            <div className="flex items-center gap-3 px-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
                <Truck className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Shipping Details</h2>
                <p className="text-sm text-muted-foreground">Dimensions and weight for calculated shipping rates</p>
              </div>
            </div>

            <Card className="p-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <Label className={LABEL}>Weight (kg)</Label>
                  <Input type="number" step="0.01" {...form.register("weight")} className="h-11" />
                </div>
                <div className="space-y-2">
                  <Label className={LABEL}>Length (cm)</Label>
                  <Input type="number" step="0.1" {...form.register("length")} className="h-11" />
                </div>
                <div className="space-y-2">
                  <Label className={LABEL}>Width (cm)</Label>
                  <Input type="number" step="0.1" {...form.register("width")} className="h-11" />
                </div>
                <div className="space-y-2">
                  <Label className={LABEL}>Height (cm)</Label>
                  <Input type="number" step="0.1" {...form.register("height")} className="h-11" />
                </div>
              </div>
            </Card>
          </section>

          {/* Section 6: SEO */}
          <section className="space-y-4" id="seo">
            <div className="flex items-center gap-3 px-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
                <Search className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Search Engine Optimization</h2>
                <p className="text-sm text-muted-foreground">Improve discoverability on search engines</p>
              </div>
            </div>

            <Card className="p-8 space-y-6">
              <div className="space-y-2">
                <Label className={LABEL}>Meta Title</Label>
                <Input {...form.register("metaTitle")} placeholder="Defaults to product title" className="h-11" />
              </div>

              <div className="space-y-2">
                <Label className={LABEL}>Meta Description</Label>
                <Textarea {...form.register("metaDescription")} placeholder="Brief SEO description..." className="resize-none h-20" />
              </div>

              <div className="space-y-2">
                <Label className={LABEL}>SEO Keywords</Label>
                <Input {...form.register("seoKeywords")} placeholder="e.g. t-shirt, casual, white (comma separated)" className="h-11" />
              </div>
            </Card>
          </section>

        </div>

        {/* Sticky Sidebar */}
        <aside className="w-full lg:w-80 shrink-0">
          <div className="sticky top-[100px] space-y-6">
            
            <Card className="p-5 border-t-4 border-t-primary shadow-sm">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Eye className="w-4 h-4" /> Visibility & Status
              </h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    onValueChange={(val) => form.setValue("status", val as any)}
                    value={form.watch("status")}
                  >
                    <SelectTrigger className="h-10 font-medium">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="hidden">Hidden</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <Label htmlFor="featured" className="text-sm">Featured</Label>
                  <Switch
                    id="featured"
                    checked={form.watch("featured")}
                    onCheckedChange={(val) => form.setValue("featured", val)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="isNewArrival" className="text-sm">New Arrival</Label>
                  <Switch
                    id="isNewArrival"
                    checked={form.watch("isNewArrival")}
                    onCheckedChange={(val) => form.setValue("isNewArrival", val)}
                  />
                </div>
              </div>
            </Card>

            <Card className="p-5 shadow-sm">
              <h3 className="font-semibold text-foreground mb-4">Summary</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Variants:</span>
                  <span className="font-medium">{variantFields.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Stock:</span>
                  <span className="font-medium">{totalStock}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Base Price:</span>
                  <span className="font-medium">
                    {referenceData.currency} {form.watch("price") || 0}
                  </span>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="space-y-2">
                {formErrors > 0 ? (
                  <div className="flex items-center gap-2 text-destructive text-sm font-medium">
                    <AlertCircle className="w-4 h-4" />
                    {formErrors} validation errors
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
                    <CheckCircle2 className="w-4 h-4" />
                    Ready to save
                  </div>
                )}
              </div>
            </Card>

          </div>
        </aside>
      </div>
    </form>
  )
}
