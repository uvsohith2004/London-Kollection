"use client"

import * as React from "react"
import { UseFormReturn } from "react-hook-form"
import { Skeleton } from "@workspace/ui/components/skeleton"
import MultipleSelector from "@workspace/ui/components/multi-select"
import { Field, FieldLabel, FieldError, FieldDescription } from "@workspace/ui/components/field"
import { Switch } from "@workspace/ui/components/switch"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import {
  CreateCategoryDialog,
  CreateCollectionDialog,
  CreateOccasionDialog,
} from "../inline-creation-dialogs"
import { ProductFormValues } from "../use-product-form"
import { Layers } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"

interface OrganizationSectionProps {
  form: UseFormReturn<ProductFormValues>
  referenceData: {
    categoryOptions: any[]
    collectionOptions: any[]
    occasionOptions: any[]
    brandOptions: any[]
    isLoading: boolean
  }
}

export function OrganizationSection({ form, referenceData }: OrganizationSectionProps) {
  return (
    <Card id="organization" className="overflow-hidden border-border/60 ">
      
      {/* Matched Premium Header Design */}
      <CardHeader className="flex flex-row items-center gap-5 border-b border-border/40 bg-muted/10 px-6 py-6 sm:px-8">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border/50 bg-background text-primary ">
          <Layers className="h-6 w-6" />
        </div>
        <div className="flex flex-col space-y-1.5">
          <CardTitle className="text-xl font-semibold tracking-tight text-foreground">
            Organization
          </CardTitle>
          <CardDescription className="text-sm font-medium text-muted-foreground">
            Categorize and label your product for storefront filtering and internal management.
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col space-y-8 px-6 py-8 sm:px-8">
        
        {/* ROW 1: Brand and Category */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          
          {/* Brand */}
          <div className="w-full min-w-0">
            <Field className="space-y-2">
              <FieldLabel className="font-semibold">Brand</FieldLabel>
              {referenceData.isLoading ? (
                <Skeleton className="h-11 w-full" />
              ) : (
                <Select
                  onValueChange={(val) => form.setValue("brandId", val ?? undefined)}
                  value={form.watch("brandId") ?? ""}
                >
                  <SelectTrigger className="h-11 w-full min-w-0 bg-background text-base sm:text-sm">
                    <SelectValue placeholder="Select Brand">
                      {form.watch("brandId")
                        ? referenceData.brandOptions.find(b => b.id === form.watch("brandId"))?.name ?? "Select Brand"
                        : "Select Brand"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="w-full">
                    {referenceData.brandOptions.map(brand => (
                      <SelectItem key={brand.id} value={brand.id} className="py-2.5">
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <FieldError errors={[form.formState.errors.brandId]} />
            </Field>
          </div>

          {/* Category */}
          <div className="w-full min-w-0">
            <Field className="space-y-2">
              <div className="flex items-center justify-between">
                <FieldLabel className="font-semibold">Category</FieldLabel>
                <CreateCategoryDialog categories={referenceData.categoryOptions} />
              </div>
              {referenceData.isLoading ? (
                <Skeleton className="h-11 w-full" />
              ) : (
                <Select
                  onValueChange={(val) => form.setValue("categoryId", val ?? undefined)}
                  value={form.watch("categoryId") ?? ""}
                >
                  <SelectTrigger className="h-11 w-full min-w-0 bg-background text-base sm:text-sm">
                    <SelectValue placeholder="Select Category">
                      {form.watch("categoryId")
                        ? referenceData.categoryOptions.find(c => c.id === form.watch("categoryId"))?.name ?? "Select Category"
                        : "Select Category"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="w-full">
                    {referenceData.categoryOptions.map(cat => (
                      <SelectItem key={cat.id} value={cat.id} className="py-2.5">
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <FieldError errors={[form.formState.errors.categoryId]} />
            </Field>
          </div>
        </div>

        {/* Visual Divider */}
        <div className="h-px w-full bg-border/40" />

        {/* ROW 2: Collections and Occasions */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          
          {/* Collections */}
          <div className="w-full min-w-0">
            <Field className="space-y-2">
              <div className="flex items-center justify-between">
                <FieldLabel className="font-semibold">Collections</FieldLabel>
                <CreateCollectionDialog />
              </div>
              {referenceData.isLoading ? (
                <Skeleton className="h-11 w-full" />
              ) : (
                <MultipleSelector
                  defaultOptions={referenceData.collectionOptions}
                  placeholder="Search collections..."
                  emptyIndicator={<p className="p-2 text-center text-sm text-muted-foreground">No collections found.</p>}
                  className="min-h-11 w-full min-w-0 bg-background text-base sm:text-sm"
                  value={form.watch("collections")}
                  onChange={(val) => form.setValue("collections", val)}
                />
              )}
              <FieldError errors={[form.formState.errors.collections]} />
            </Field>
          </div>

          {/* Occasions */}
          <div className="w-full min-w-0">
            <Field className="space-y-2">
              <div className="flex items-center justify-between">
                <FieldLabel className="font-semibold">Occasions</FieldLabel>
                <CreateOccasionDialog />
              </div>
              {referenceData.isLoading ? (
                <Skeleton className="h-11 w-full" />
              ) : (
                <MultipleSelector
                  defaultOptions={referenceData.occasionOptions}
                  placeholder="Search occasions..."
                  emptyIndicator={<p className="p-2 text-center text-sm text-muted-foreground">No occasions found.</p>}
                  className="min-h-11 w-full min-w-0 bg-background text-base sm:text-sm"
                  value={form.watch("occasions")}
                  onChange={(val) => form.setValue("occasions", val)}
                />
              )}
              <FieldError errors={[form.formState.errors.occasions]} />
            </Field>
          </div>
        </div>


       
      </CardContent>
    </Card>
  )
}
