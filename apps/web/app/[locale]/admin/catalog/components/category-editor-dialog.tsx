"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, ImageIcon, FolderTree } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"
import { Label } from "@workspace/ui/components/label"
import { Switch } from "@workspace/ui/components/switch"
import { Field, FieldLabel, FieldError } from "@workspace/ui/components/field"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { MediaUploader } from "@/components/media-uploader"
import { StickySaveBar } from "@workspace/ui/components/sticky-save-bar"
import { SEOFormSection } from "../../components/seo-form-section"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@workspace/ui/components/command"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"
import {
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
} from "../../mutations"
import { useAdminCategoriesQuery } from "../../queries"
import { fetchCategoryBySlug } from "@/api-client"

// ==========================================
// REUSABLE COMPONENT: SlugInput
// ==========================================
interface SlugInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  prefix?: string
}

export const SlugInput = React.forwardRef<HTMLInputElement, SlugInputProps>(
  ({ prefix = "/", className, ...props }, ref) => {
    return (
      <div className="flex w-full min-w-0 rounded-md shadow-sm">
        <span className="inline-flex h-11 items-center rounded-l-md border border-r-0 border-input bg-muted/40 px-3 font-mono text-sm whitespace-nowrap text-muted-foreground">
          {prefix}
        </span>
        <Input
          ref={ref}
          className={`h-11 w-full min-w-0 rounded-l-none font-mono text-sm ${className || ""}`}
          {...props}
        />
      </div>
    )
  }
)
SlugInput.displayName = "SlugInput"

const categorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  slug: z.string().min(2, "Slug must be at least 2 characters."),
  description: z.string().optional().nullable(),
  image: z.any().optional().nullable(),
  icon: z.any().optional().nullable(),
  parentId: z.string().optional().nullable(),
  isActive: z.boolean(),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
  seoKeywords: z.array(z.string()).optional().nullable(),
})

type CategoryFormValues = z.infer<typeof categorySchema>

export interface CategoryFormProps {
  initialData?: any
  onSuccess?: () => void
  onCancel?: () => void
}

export function CategoryForm({
  initialData,
  onSuccess,
  onCancel,
}: CategoryFormProps) {
  const { data: categoriesRes } = useAdminCategoriesQuery()
  const categories = categoriesRes?.items || []

  const isEditing = !!initialData
  const slugTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: initialData?.name || "",
      slug: initialData?.slug || "",
      description: initialData?.description || "",
      parentId: initialData?.parentId || "none",
      isActive: initialData?.isActive ?? true,
      seoTitle: initialData?.seoTitle || "",
      seoDescription: initialData?.seoDescription || "",
      seoKeywords: initialData?.seoKeywords || [],
      image: initialData?.image || null,
      icon: initialData?.icon || null,
    },
  })

  React.useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name || "",
        slug: initialData.slug || "",
        description: initialData.description || "",
        parentId: initialData.parentId || "none",
        isActive: initialData.isActive ?? true,
        seoTitle: initialData.seoTitle || "",
        seoDescription: initialData.seoDescription || "",
        seoKeywords: initialData.seoKeywords || [],
        image: initialData.image,
        icon: initialData.icon,
      })
    } else {
      form.reset({
        name: "",
        slug: "",
        description: "",
        parentId: "none",
        isActive: true,
        seoTitle: "",
        seoDescription: "",
        seoKeywords: [],
        image: null,
        icon: null,
      })
    }
  }, [initialData, form])

  const { mutate: createCategory, isPending: isCreating } =
    useCreateCategoryMutation()
  const { mutate: updateCategory, isPending: isUpdating } =
    useUpdateCategoryMutation()
  const isPending = isCreating || isUpdating

  const onSubmit = async (data: CategoryFormValues) => {
    const payload = {
      ...data,
      seoKeywords: data.seoKeywords?.length ? data.seoKeywords : undefined,
      parentId: data.parentId === "none" ? undefined : data.parentId,
    }

    if (isEditing) {
      updateCategory(
        { id: initialData.id, data: payload },
        {
          onSuccess: () => {
            if (onSuccess) onSuccess()
          },
        }
      )
    } else {
      createCategory(payload, {
        onSuccess: () => {
          if (onSuccess) onSuccess()
        },
      })
    }
  }

  const softInputClass =
    "h-11 w-full rounded-xl border border-transparent bg-muted/40 px-4 text-sm transition-all hover:bg-muted/60 focus-visible:border-border focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-none"

  const parentOptions = categories.filter(
    (c: any) => !isEditing || c.id !== initialData?.id
  )

  const getParentPath = (parentId: string | null | undefined): string => {
    if (!parentId || parentId === "none") return "/categories/"

    const buildPath = (id: string, currentPath: string[] = []): string[] => {
      const p = categories.find((c: any) => c.id === id)
      if (p) {
        currentPath.unshift(p.slug)
        if (p.parentId && p.parentId !== "none") {
          return buildPath(p.parentId, currentPath)
        }
      }
      return currentPath
    }

    const hierarchy = buildPath(parentId)
    return `/categories/${hierarchy.join("/")}/`
  }

  const dynamicPrefix = getParentPath(form.watch("parentId"))

  return (
    <Card className="overflow-hidden border-border/40">
      <div className="border-b border-border/40 bg-muted/20 px-8 py-6 text-left">
        <h2 className="text-2xl font-semibold tracking-tight">
          {isEditing ? "Edit Category" : "New Category"}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {isEditing
            ? "Update category details and preferences."
            : "Create a new product category."}
        </p>
      </div>

      <div className="bg-background px-8 pb-12">
        <form
          id="category-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="mx-auto max-w-3xl space-y-12 py-8"
        >
          {/* Basic Details Section */}
          <Card className="overflow-hidden border-border/60 shadow-sm">
            <CardHeader className="flex flex-row items-center gap-5 border-b border-border/40 bg-muted/10 px-6 py-6 sm:px-8">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border/50 bg-background text-primary shadow-sm">
                <FolderTree className="h-6 w-6" />
              </div>
              <div className="flex flex-col space-y-1.5">
                <CardTitle className="text-xl font-semibold tracking-tight text-foreground">
                  Basic Details
                </CardTitle>
                <CardDescription className="text-sm font-medium text-muted-foreground">
                  Manage the core information for this category.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col space-y-8 px-6 py-8 sm:px-8">
              <div className="flex flex-col space-y-8">
                {/* Row 1: Name and Status */}
                <div className="grid gap-8 md:grid-cols-2">
                  <div className="space-y-2.5">
                    <Field className="space-y-2">
                      <FieldLabel htmlFor="name" className="font-semibold">
                        Category Name
                      </FieldLabel>
                      <Input
                        id="name"
                        {...form.register("name")}
                        onChange={(e) => {
                          form.register("name").onChange(e)
                          const isSlugManuallyEdited =
                            form.formState.touchedFields.slug

                          if (!isEditing && !isSlugManuallyEdited) {
                            const titleValue = e.target.value
                            const baseSlug = titleValue
                              .toLowerCase()
                              .replace(/[^a-z0-9]+/g, "-")
                              .replace(/(^-|-$)+/g, "")

                            form.setValue("slug", baseSlug, {
                              shouldValidate: true,
                            })

                            if (slugTimeoutRef.current)
                              clearTimeout(slugTimeoutRef.current)

                            if (baseSlug) {
                              slugTimeoutRef.current = setTimeout(async () => {
                                try {
                                  const existing =
                                    await fetchCategoryBySlug(baseSlug)
                                  if (existing && existing.id) {
                                    const gibberish = Math.random()
                                      .toString(36)
                                      .substring(2, 6)
                                    form.setValue(
                                      "slug",
                                      `${baseSlug}-${gibberish}`,
                                      { shouldValidate: true }
                                    )
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
                      <FieldLabel className="font-semibold">Status</FieldLabel>
                      <div className="flex h-11 items-center justify-between rounded-xl border border-input bg-background px-4">
                        <span className="text-sm font-medium">Active</span>
                        <Switch
                          checked={form.watch("isActive")}
                          onCheckedChange={(val) =>
                            form.setValue("isActive", val)
                          }
                        />
                      </div>
                    </Field>
                  </div>
                </div>
                <div className="flex-1 space-y-2.5">
                  <Field className="space-y-2">
                    <div className="flex items-center justify-between">
                      <FieldLabel htmlFor="slug" className="font-semibold">
                        Slug
                      </FieldLabel>
                      <span className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                        Auto-generated
                      </span>
                    </div>
                    <SlugInput
                      id="slug"
                      prefix={dynamicPrefix}
                      placeholder="category-name"
                      {...form.register("slug")}
                    />
                    <FieldError errors={[form.formState.errors.slug]} />
                  </Field>
                </div>
                {/* Row 2: Parent Category and Slug */}
              
                  <div className="w-full space-y-2.5 ">
                    <Field className="flex flex-col space-y-2">
                      <FieldLabel htmlFor="parentId" className="font-semibold">
                        Parent Category
                      </FieldLabel>
                      <Popover>
                        <PopoverTrigger
                          render={
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                "h-11 w-full justify-between border-transparent bg-muted/40 hover:bg-muted/60",
                                !form.watch("parentId") &&
                                  "text-muted-foreground"
                              )}
                            >
                              {form.watch("parentId") &&
                              form.watch("parentId") !== "none"
                                ? parentOptions.find(
                                    (c: any) => c.id === form.watch("parentId")
                                  )?.name || "None (Top Level)"
                                : "None (Top Level)"}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          }
                        />

                        <PopoverContent
                          className="w-[300px] rounded-xl border-border/40 p-0 shadow-xl"
                          align="start"
                        >
                          <Command>
                            <CommandInput placeholder="Search category..." />
                            <CommandList>
                              <CommandEmpty>No category found.</CommandEmpty>
                              <CommandGroup>
                                <CommandItem
                                  value="none"
                                  onSelect={() =>
                                    form.setValue("parentId", "none")
                                  }
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      form.watch("parentId") === "none" ||
                                        !form.watch("parentId")
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  None (Top Level)
                                </CommandItem>
                                {parentOptions.map((category: any) => (
                                  <CommandItem
                                    value={category.name}
                                    key={category.id}
                                    onSelect={() => {
                                      form.setValue("parentId", category.id)
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        category.id === form.watch("parentId")
                                          ? "opacity-100"
                                          : "opacity-0"
                                      )}
                                    />
                                    {category.name}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FieldError errors={[form.formState.errors.parentId]} />
                    </Field>
                  </div>
                </div>
          

              <div className="space-y-2.5">
                <Field className="space-y-2">
                  <FieldLabel htmlFor="description" className="font-semibold">
                    Description
                  </FieldLabel>
                  <Textarea
                    id="description"
                    {...form.register("description")}
                    className="min-h-[120px] w-full min-w-0 resize-none py-4"
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
                  Upload an image or icon to represent this category.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col space-y-8 px-6 py-8 sm:px-8">
              <div className="grid gap-8 md:grid-cols-2">
                <div className="space-y-4">
                  <Field className="space-y-4">
                    <FieldLabel className="font-semibold">
                      Category Image
                    </FieldLabel>
                    <MediaUploader
                      value={form.watch("image")}
                      onChange={(val) =>
                        form.setValue("image", val, { shouldDirty: true })
                      }
                      preset="category"
                      multiple={false}
                      cropAspect={1}
                      cropShape="rect"
                    />
                  </Field>
                </div>

                <div className="space-y-4">
                  <Field className="space-y-4">
                    <FieldLabel className="font-semibold">
                      Category Icon
                    </FieldLabel>
                    <MediaUploader
                      value={form.watch("icon")}
                      onChange={(val) =>
                        form.setValue("icon", val, { shouldDirty: true })
                      }
                      preset="category"
                      multiple={false}
                      cropAspect={1}
                      cropShape="rect"
                    />
                  </Field>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SEO Section */}
          <SEOFormSection form={form} />
        </form>

        <StickySaveBar
          formId="category-form"
          onCancel={onCancel}
          isPending={isPending}
          saveActionLabel={isEditing ? "Update Category" : "Create Category"}
          infoPanel={
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground">
                {isEditing ? "Edit Category" : "New Category"}
              </span>
              <span className="text-muted-foreground">&bull;</span>
              <span>{form.watch("name") || "Untitled"}</span>
            </div>
          }
        />
      </div>
    </Card>
  )
}
