"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, Globe, ImageIcon } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"
import { Label } from "@workspace/ui/components/label"
import { Switch } from "@workspace/ui/components/switch"
import { Field, FieldLabel, FieldError } from "@workspace/ui/components/field"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { MediaUploader } from "@/components/media-uploader"
import { StickySaveBar } from "@workspace/ui/components/sticky-save-bar"
import { SEOFormSection } from "../../components/seo-form-section"
import {
  useCreateBrandMutation,
  useUpdateBrandMutation,
} from "../../mutations"
import { fetchBrandBySlug } from "@/api"
import { SlugInput } from "./category-editor-dialog"

const brandSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  slug: z.string().min(2, "Slug must be at least 2 characters."),
  description: z.string().optional().nullable(),
  image: z.any().optional().nullable(),
  isActive: z.boolean(),
  website: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .nullable()
    .or(z.literal("")),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
  seoKeywords: z.array(z.string()).optional().nullable(),
})

type BrandFormValues = z.infer<typeof brandSchema>

export interface BrandFormProps {
  initialData?: any
  onSuccess?: () => void
  onCancel?: () => void
}

export function BrandForm({ initialData, onSuccess, onCancel }: BrandFormProps) {
  const isEditing = !!initialData
  const slugTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)

  const form = useForm<BrandFormValues>({
    resolver: zodResolver(brandSchema),
    defaultValues: {
      name: initialData?.name || "",
      slug: initialData?.slug || "",
      website: initialData?.website || "",
      description: initialData?.description || "",
      isActive: initialData?.isActive ?? true,
      seoTitle: initialData?.seoTitle || "",
      seoDescription: initialData?.seoDescription || "",
      seoKeywords: initialData?.seoKeywords || [],
      image: initialData?.image || null,
    },
  })

  const { mutate: createBrand, isPending: isCreating } = useCreateBrandMutation()
  const { mutate: updateBrand, isPending: isUpdating } = useUpdateBrandMutation()
  const isPending = isCreating || isUpdating

  const onSubmit = async (data: BrandFormValues) => {
    const payload = {
      ...data,
      seoKeywords: data.seoKeywords?.length ? data.seoKeywords : undefined,
    }

    if (isEditing) {
      updateBrand(
        { id: initialData.id, data: payload },
        {
          onSuccess: () => {
            if (onSuccess) onSuccess()
          },
        }
      )
    } else {
      createBrand(payload, {
        onSuccess: () => {
          if (onSuccess) onSuccess()
        },
      })
    }
  }

  const softInputClass =
    "h-11 w-full rounded-xl border border-transparent bg-muted/40 px-4 text-sm transition-all hover:bg-muted/60 focus-visible:border-border focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-none"

  return (
    <Card className="overflow-hidden border-border/40">
      <div className="border-b border-border/40 px-8 py-6 bg-muted/20 text-left">
        <h2 className="text-2xl font-semibold tracking-tight">
          {isEditing ? "Edit Brand" : "New Brand"}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {isEditing ? "Update brand details and preferences." : "Create a new brand to associate with your products."}
        </p>
      </div>

      <div className="px-8 pb-12 bg-background">

          <form
            id="brand-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="mx-auto max-w-3xl space-y-12 py-8"
          >
            {/* Basic Details Section */}
            <Card className="overflow-hidden border-border/60 shadow-sm">
              <CardHeader className="flex flex-row items-center gap-5 border-b border-border/40 bg-muted/10 px-6 py-6 sm:px-8">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border/50 bg-background text-primary shadow-sm">
                  <Globe className="h-6 w-6" />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <CardTitle className="text-xl font-semibold tracking-tight text-foreground">
                    Basic Details
                  </CardTitle>
                  <CardDescription className="text-sm font-medium text-muted-foreground">
                    Manage the core information for this brand.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col space-y-8 px-6 py-8 sm:px-8">
                <div className="grid gap-8 md:grid-cols-2">
                  <div className="space-y-2.5">
                    <Field className="space-y-2">
                      <FieldLabel htmlFor="name" className="font-semibold">Brand Name</FieldLabel>
                      <Input
                        id="name"
                        {...form.register("name")}
                        onChange={(e) => {
                          form.register("name").onChange(e)
                          const isSlugManuallyEdited = form.formState.touchedFields.slug
                          
                          if (!isEditing && !isSlugManuallyEdited) {
                            const titleValue = e.target.value
                            const baseSlug = titleValue.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
                            
                            form.setValue("slug", baseSlug, { shouldValidate: true })
                            
                            if (slugTimeoutRef.current) clearTimeout(slugTimeoutRef.current)
                            
                            if (baseSlug) {
                              slugTimeoutRef.current = setTimeout(async () => {
                                try {
                                  const existing = await fetchBrandBySlug(baseSlug)
                                  if (existing && existing.id) {
                                    const gibberish = Math.random().toString(36).substring(2, 6)
                                    form.setValue("slug", `${baseSlug}-${gibberish}`, { shouldValidate: true })
                                  }
                                } catch (err) {
                                  // 404 means available
                                }
                              }, 600)
                            }
                          }
                        }}
                        className="h-11 w-full min-w-0"
                      />
                      <FieldError errors={[form.formState.errors.name]} />
                    </Field>
                  </div>

                  <div className="space-y-2.5">
                    <Field className="space-y-2">
                      <div className="flex items-center justify-between">
                        <FieldLabel htmlFor="slug" className="font-semibold">Slug</FieldLabel>
                        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Auto-generated</span>
                      </div>
                      <SlugInput
                        id="slug"
                        prefix="/brands/"
                        placeholder="brand-name"
                        {...form.register("slug")}
                      />
                      <FieldError errors={[form.formState.errors.slug]} />
                    </Field>
                  </div>

                  <div className="space-y-2.5">
                    <Field className="space-y-2">
                      <FieldLabel htmlFor="website" className="font-semibold">Website</FieldLabel>
                      <Input
                        id="website"
                        type="url"
                        placeholder="https://"
                        {...form.register("website")}
                        className="h-11 w-full min-w-0"
                      />
                      <FieldError errors={[form.formState.errors.website]} />
                    </Field>
                  </div>

                  <div className="space-y-2.5">
                    <Field className="space-y-2">
                      <FieldLabel className="font-semibold">Status</FieldLabel>
                      <div className="flex h-11 items-center justify-between rounded-xl border border-input bg-background px-4">
                        <span className="text-sm font-medium">Active</span>
                        <Switch
                          checked={form.watch("isActive")}
                          onCheckedChange={(val) => form.setValue("isActive", val)}
                        />
                      </div>
                    </Field>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <Field className="space-y-2">
                    <FieldLabel htmlFor="description" className="font-semibold">Description</FieldLabel>
                    <Textarea
                      id="description"
                      {...form.register("description")}
                      className="min-h-[120px] resize-none py-4 w-full min-w-0"
                    />
                    <FieldError errors={[form.formState.errors.description]} />
                  </Field>
                </div>
              </CardContent>
            </Card>

            {/* Media Section */}
            <Card className="overflow-hidden border-border/60 shadow-sm">
              <CardHeader className="flex flex-row items-center gap-5 border-b border-border/40 bg-muted/10 px-6 py-6 sm:px-8">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border/50 bg-background text-primary shadow-sm">
                  <ImageIcon className="h-6 w-6" />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <CardTitle className="text-xl font-semibold tracking-tight text-foreground">
                    Media
                  </CardTitle>
                  <CardDescription className="text-sm font-medium text-muted-foreground">
                    Upload a logo or image to represent this brand.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col space-y-8 px-6 py-8 sm:px-8">
                <Field className="space-y-4">
                  <FieldLabel className="font-semibold">Brand Logo</FieldLabel>
                  <MediaUploader
                    value={form.watch("image")}
                    onChange={(val) => form.setValue("image", val, { shouldDirty: true })}
                    preset="logo"
                    multiple={false}
                    cropAspect={1}
                    cropShape="rect"
                  />
                </Field>
              </CardContent>
            </Card>

            {/* SEO Section */}
            <SEOFormSection form={form} />
          </form>

        <StickySaveBar 
          formId="brand-form"
          onCancel={onCancel}
          isPending={isPending}
          saveActionLabel={isEditing ? "Update Brand" : "Create Brand"}
          infoPanel={
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground">{isEditing ? "Edit Brand" : "New Brand"}</span>
              <span className="text-muted-foreground">&bull;</span>
              <span>{form.watch("name") || "Untitled"}</span>
            </div>
          }
        />
      </div>
    </Card>
  )
}
