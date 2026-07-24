"use client"

import * as React from "react"
import { UseFormReturn } from "react-hook-form"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"
import { Field, FieldLabel, FieldError } from "@workspace/ui/components/field"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Package } from "lucide-react"

import { ProductFormValues } from "../use-product-form"
import { fetchProductBySlug } from "@/api-client"

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
        <span className="inline-flex h-11 items-center rounded-l-md border border-r-0 border-input bg-muted/40 px-3 font-mono text-sm text-muted-foreground whitespace-nowrap">
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


// ==========================================
// MAIN COMPONENT: BasicInformation
// ==========================================
interface BasicInformationProps {
  form: UseFormReturn<ProductFormValues>
  isEditing: boolean
}

export function BasicInformation({ form, isEditing }: BasicInformationProps) {
  const slugTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)

  const shortDesc = form.watch("shortDescription") || ""
  const fullDesc = form.watch("description") || ""
 const TextareaInputRef = React.useRef<HTMLTextAreaElement>(null);

  const handleInput = () => {
    const textarea = TextareaInputRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`; 
  };
  return (
    <Card id="product-identity" className="overflow-hidden border-border/60 shadow-sm">
      
      <CardHeader className="flex flex-row items-center gap-5 border-b border-border/40 bg-muted/10 px-6 py-6 sm:px-8">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border/50 bg-background text-primary shadow-sm">
          <Package className="h-6 w-6" />
        </div>
        <div className="flex flex-col space-y-1.5">
          <CardTitle className="text-xl font-semibold tracking-tight text-foreground">
            Basic Information
          </CardTitle>
          <CardDescription className="text-sm font-medium text-muted-foreground">
            Manage the core identity, routing, and descriptive content for your product.
          </CardDescription>
        </div>
      </CardHeader>
      
      <CardContent className="flex flex-col min-w-0 space-y-8 px-6 py-8 sm:px-8">
        
        {/* ROW 1: Title and Product Type */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Field className="space-y-2">
            <FieldLabel htmlFor="title" className="font-semibold">Product Title *</FieldLabel>
            <Input 
              id="title" 
              placeholder="e.g. Classic White T-Shirt" 
              {...form.register("title")} 
              onChange={(e) => {
                form.register("title").onChange(e)
                const isSlugManuallyEdited = form.formState.touchedFields.slug
                
                if (!isEditing && !isSlugManuallyEdited) {
                  const titleValue = e.target.value
                  const baseSlug = titleValue.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
                  
                  form.setValue("slug", baseSlug, { shouldValidate: true })
                  
                  if (slugTimeoutRef.current) clearTimeout(slugTimeoutRef.current)
                  
                  if (baseSlug) {
                    slugTimeoutRef.current = setTimeout(async () => {
                      try {
                        const existing = await fetchProductBySlug(baseSlug)
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
              // FIX: Added w-full min-w-0
              className="h-11 w-full min-w-0" 
            />
            <FieldError errors={[form.formState.errors.title]} />
          </Field>

          <Field className="space-y-2">
            <FieldLabel htmlFor="productType" className="font-semibold">Product Type</FieldLabel>
            <Input 
              id="productType" 
              placeholder="e.g. Apparel" 
              {...form.register("productType")} 
              // FIX: Added w-full min-w-0
              className="h-11 w-full min-w-0" 
            />
            <FieldError errors={[form.formState.errors.productType]} />
          </Field>
        </div>

        {/* ROW 2: URL Slug */}
        <div className="w-full min-w-0">
          <Field className="space-y-2">
            <div className="flex items-center justify-between">
              <FieldLabel htmlFor="slug" className="font-semibold">URL Slug *</FieldLabel>
              <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Auto-generated</span>
            </div>
            
            <SlugInput 
              id="slug"
              prefix="/products/"
              placeholder="classic-white-tshirt"
              {...form.register("slug")} 
            />
            
            <FieldError errors={[form.formState.errors.slug]} />
          </Field>
        </div>

        <div className="h-px w-full bg-border/40" />

        {/* ROW 3: Short Description */}
        <div className="w-full min-w-0">
          <Field className="space-y-2">
            <div className="flex items-center justify-between">
              <FieldLabel htmlFor="shortDescription" className="font-semibold">Short Description</FieldLabel>
              <span className={`text-xs font-medium ${shortDesc.length >= 60 ? 'text-destructive' : 'text-muted-foreground'}`}>
                {shortDesc.length} / 60
              </span>
            </div>
            <Input 
              id="shortDescription" 
              placeholder="A brief, 60-character overview of the product..." 
              maxLength={60}
              {...form.register("shortDescription")} 
              // FIX: Added w-full min-w-0
              className="h-11 w-full min-w-0"
            />
            <FieldError errors={[form.formState.errors.shortDescription]} />
          </Field>
        </div>
        
   
        <div className="w-full min-w-0">
          <Field className="space-y-2">
            <div className="flex items-center justify-between">
              <FieldLabel htmlFor="description" className="font-semibold">Full Description</FieldLabel>
              <span className={`text-xs font-medium ${fullDesc.length >= 1000 ? 'text-destructive' : 'text-muted-foreground'}`}>
                {fullDesc.length} / 1000
              </span>
            </div>
            <div className="w-full">
              {(() => {
                const { ref, onChange, ...rest } = form.register("description");
                return (
                  <Textarea 
                    id="description" 
                    placeholder="Detailed product information..." 
                    maxLength={1000}
                    {...rest}
                    onChange={(e) => {
                      onChange(e);
                      handleInput();
                    }}
                    ref={(e) => {
                      ref(e);
                      // @ts-ignore
                      TextareaInputRef.current = e;
                    }}
                    rows={10}
                    className="w-full min-w-0 resize-none warp-break-word p-4 text-base sm:text-sm" 
                  />
                )
              })()}
            </div>
            <FieldError errors={[form.formState.errors.description]} />
          </Field>
        </div>
        
      </CardContent>
    </Card>
  )
}
