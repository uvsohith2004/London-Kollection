"use client"

import * as React from "react"
import { UseFormReturn } from "react-hook-form"
import { Field, FieldLabel, FieldDescription, FieldError } from "@workspace/ui/components/field"
import { Switch } from "@workspace/ui/components/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Eye } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"

import { ProductFormValues } from "../use-product-form"

interface VisibilitySectionProps {
  form: UseFormReturn<ProductFormValues>
}

export function VisibilitySection({ form }: VisibilitySectionProps) {
  return (
    <Card id="visibility-publishing" className="overflow-hidden border-border/60">
      <CardHeader className="flex flex-row items-center gap-5 border-b border-border/40 bg-muted/10 px-6 py-6 sm:px-8">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border/50 bg-background text-primary">
          <Eye className="h-6 w-6" />
        </div>
        <div className="flex flex-col space-y-1.5">
          <CardTitle className="text-xl font-semibold tracking-tight text-foreground">
            Visibility & Publishing
          </CardTitle>
          <CardDescription className="text-sm font-medium text-muted-foreground">
            Control product status, storefront visibility, and promotional badges.
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col space-y-8 px-6 py-8 sm:px-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Status */}
          <div className="w-full min-w-0">
            <Field className="space-y-2">
              <FieldLabel className="font-semibold">Product Status</FieldLabel>
              <Select
                onValueChange={(val) => {
                  form.setValue("status", val as any, { shouldDirty: true })
                  if (val === "published") {
                    form.setValue("published", true, { shouldDirty: true })
                  } else {
                    form.setValue("published", false, { shouldDirty: true })
                  }
                }}
                value={form.watch("status") || "draft"}
              >
                <SelectTrigger className="h-11 w-full min-w-0 bg-background text-base sm:text-sm">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent className="w-full">
                  <SelectItem value="draft" className="py-2.5">Draft</SelectItem>
                  <SelectItem value="published" className="py-2.5">Published</SelectItem>
                  <SelectItem value="archived" className="py-2.5">Archived</SelectItem>
                  <SelectItem value="scheduled" className="py-2.5">Scheduled</SelectItem>
                  <SelectItem value="hidden" className="py-2.5">Hidden</SelectItem>
                </SelectContent>
              </Select>
              <FieldError errors={[form.formState.errors.status]} />
            </Field>
          </div>
        </div>

        <div className="h-px w-full bg-border/40" />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Featured */}
          <div className="w-full min-w-0">
            <Field className="flex flex-row items-center justify-between rounded-xl border border-border/50 bg-background p-4 shadow-sm h-full">
              <div className="space-y-0.5 mr-4">
                <FieldLabel className="text-sm font-semibold">Featured</FieldLabel>
                <FieldDescription className="text-xs text-muted-foreground">
                  Highlight this product in featured sections on the storefront.
                </FieldDescription>
              </div>
              <Switch
                checked={form.watch("featured")}
                onCheckedChange={(checked) => form.setValue("featured", checked, { shouldDirty: true })}
              />
            </Field>
          </div>

          {/* New Arrival */}
          <div className="w-full min-w-0">
            <Field className="flex flex-row items-center justify-between rounded-xl border border-border/50 bg-background p-4 shadow-sm h-full">
              <div className="space-y-0.5 mr-4">
                <FieldLabel className="text-sm font-semibold">New Arrival</FieldLabel>
                <FieldDescription className="text-xs text-muted-foreground">
                  Add a "New" badge and feature it in new arrival lists.
                </FieldDescription>
              </div>
              <Switch
                checked={form.watch("isNewArrival")}
                onCheckedChange={(checked) => form.setValue("isNewArrival", checked, { shouldDirty: true })}
              />
            </Field>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
