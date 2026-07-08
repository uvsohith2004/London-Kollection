"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, Globe, Search, ImageIcon, Settings2 } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"
import { Label } from "@workspace/ui/components/label"
import { Switch } from "@workspace/ui/components/switch"
import { NumberInput } from "@workspace/ui/components/number-input"

import { Card } from "@workspace/ui/components/card"
import { MediaUploader } from "@/components/media-uploader"
import {
  useCreateBrandMutation,
  useUpdateBrandMutation,

} from "../../mutations"

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
  seoKeywords: z.string().optional().nullable(),
})

type BrandFormValues = z.infer<typeof brandSchema>

export interface BrandFormProps {
  initialData?: any
  onSuccess?: () => void
  onCancel?: () => void
}

export function BrandForm({ initialData, onSuccess, onCancel }: BrandFormProps) {
  const isEditing = !!initialData

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
      seoKeywords: (initialData?.seoKeywords || []).join(", "),
      image: initialData?.image || null,
    },
  })

  const { mutate: createBrand, isPending: isCreating } = useCreateBrandMutation()
  const { mutate: updateBrand, isPending: isUpdating } = useUpdateBrandMutation()
  const isPending = isCreating || isUpdating

  const onSubmit = async (data: BrandFormValues) => {
    const payload = {
      ...data,
      seoKeywords: data.seoKeywords
        ? data.seoKeywords.split(",").map((k: string) => k.trim()).filter(Boolean)
        : undefined,
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
            <div className="space-y-8 rounded-2xl border border-border/40 bg-card p-8 shadow-sm">
              <div className="flex items-center gap-3 border-b border-border/40 pb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Globe className="h-4 w-4" />
                </div>
                <h3 className="text-lg font-medium text-foreground">
                  Basic Details
                </h3>
              </div>

              <div className="grid gap-8 md:grid-cols-2">
                <div className="space-y-2.5">
                  <Label className="text-xs font-medium text-muted-foreground">
                    Brand Name
                  </Label>
                  <Input
                    {...form.register("name")}
                    className={softInputClass}
                  />
                  {form.formState.errors.name && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2.5">
                  <Label className="text-xs font-medium text-muted-foreground">
                    Slug
                  </Label>
                  <Input
                    {...form.register("slug")}
                    className={softInputClass}
                  />
                  {form.formState.errors.slug && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.slug.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2.5">
                  <Label className="text-xs font-medium text-muted-foreground">
                    Website
                  </Label>
                  <Input
                    type="url"
                    placeholder="https://"
                    {...form.register("website")}
                    className={softInputClass}
                  />
                </div>

                <div className="space-y-2.5">
                  <Label className="text-xs font-medium text-muted-foreground">
                    Status
                  </Label>
                  <div className="flex h-11 items-center justify-between rounded-xl border border-transparent bg-muted/40 px-4">
                    <span className="text-sm">Active</span>
                    <Switch
                      checked={form.watch("isActive")}
                      onCheckedChange={(val) => form.setValue("isActive", val)}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2.5">
                <Label className="text-xs font-medium text-muted-foreground">
                  Description
                </Label>
                <Textarea
                  {...form.register("description")}
                  className={`${softInputClass} min-h-[120px] resize-none py-4`}
                />
              </div>
            </div>

            {/* Media Section */}
            <div className="space-y-8 rounded-2xl border border-border/40 bg-card p-8 shadow-sm">
              <div className="flex items-center gap-3 border-b border-border/40 pb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <ImageIcon className="h-4 w-4" />
                </div>
                <h3 className="text-lg font-medium text-foreground">Media</h3>
              </div>

              <div className="space-y-4">
                <Label className="text-xs font-medium text-muted-foreground">
                  Brand Logo
                </Label>
                <MediaUploader
                  value={form.watch("image")}
                  onChange={(val) => form.setValue("image", val, { shouldDirty: true })}
                  preset="logo"
                  multiple={false}
                  cropAspect={1}
                  cropShape="rect"
                />
              </div>
            </div>

            {/* SEO Section */}
            <div className="space-y-8 rounded-2xl border border-border/40 bg-card p-8 shadow-sm">
              <div className="flex items-center gap-3 border-b border-border/40 pb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Search className="h-4 w-4" />
                </div>
                <h3 className="text-lg font-medium text-foreground">
                  Search Engine Optimization
                </h3>
              </div>

              <div className="space-y-6">
                <div className="space-y-2.5">
                  <Label className="text-xs font-medium text-muted-foreground">
                    SEO Title
                  </Label>
                  <Input
                    {...form.register("seoTitle")}
                    className={softInputClass}
                  />
                </div>

                <div className="space-y-2.5">
                  <Label className="text-xs font-medium text-muted-foreground">
                    SEO Description
                  </Label>
                  <Textarea
                    {...form.register("seoDescription")}
                    className={`${softInputClass} min-h-[100px] resize-none py-4`}
                  />
                </div>

                <div className="space-y-2.5">
                  <Label className="text-xs font-medium text-muted-foreground">
                    SEO Keywords (comma separated)
                  </Label>
                  <Input
                    {...form.register("seoKeywords")}
                    className={softInputClass}
                  />
                </div>
              </div>
            </div>

            {/* Advanced Section */}
            <div className="space-y-8 rounded-2xl border border-border/40 bg-card p-8 shadow-sm">
              <div className="flex items-center gap-3 border-b border-border/40 pb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Settings2 className="h-4 w-4" />
                </div>
                <h3 className="text-lg font-medium text-foreground">
                  Advanced
                </h3>
              </div>

              <div className="grid gap-8 md:grid-cols-2">
              </div>
            </div>
          </form>


        <div className="mt-4 flex items-center justify-end gap-4 border-t border-border/40 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => onCancel?.()}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => {
              const formElement = document.getElementById(
                "brand-form"
              ) as HTMLFormElement
              if (formElement) {
                formElement.requestSubmit()
              }
            }}
            disabled={!form.formState.isDirty || isPending}
          >
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {isEditing ? "Update Brand" : "Create Brand"}
          </Button>
        </div>
      </div>
    </Card>
  )
}
