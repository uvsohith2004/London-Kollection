"use client"

import * as React from "react"
import { UseFormReturn } from "react-hook-form"
import { Field, FieldLabel, FieldError } from "@workspace/ui/components/field"
import { NumberInput  as Input } from "@workspace/ui/components/number-input"
import { Ruler } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { ProductFormValues } from "../use-product-form"

interface DimensionsSectionProps {
  form: UseFormReturn<ProductFormValues>
}

export function DimensionsSection({ form }: DimensionsSectionProps) {
  return (
    <Card id="dimensions" className="overflow-hidden border-border/60">
      <CardHeader className="flex flex-row items-center gap-5 border-b border-border/40 bg-muted/10 px-6 py-6 sm:px-8">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border/50 bg-background text-primary">
          <Ruler className="h-6 w-6" />
        </div>
        <div className="flex flex-col space-y-1.5">
          <CardTitle className="text-xl font-semibold tracking-tight text-foreground">
            Dimensions
          </CardTitle>
          <CardDescription className="text-sm font-medium text-muted-foreground">
            Provide the physical dimensions and weight of the product for shipping calculations and customer details.
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col space-y-8 px-6 py-8 sm:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Weight */}
          <div className="w-full min-w-0">
            <Field className="space-y-2">
              <FieldLabel className="font-semibold">Weight</FieldLabel>
              <div className="relative">
                <Input
                 
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  {...form.register("weight")}
                  className="h-11 w-full pr-12 bg-background text-base sm:text-sm"
                />
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                  <span className="text-sm text-muted-foreground">kg</span>
                </div>
              </div>
              <FieldError errors={[form.formState.errors.weight]} />
            </Field>
          </div>

          {/* Length */}
          <div className="w-full min-w-0">
            <Field className="space-y-2">
              <FieldLabel className="font-semibold">Length</FieldLabel>
              <div className="relative">
                <Input
                
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  {...form.register("length")}
                  className="h-11 w-full pr-12 bg-background text-base sm:text-sm"
                />
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                  <span className="text-sm text-muted-foreground">cm</span>
                </div>
              </div>
              <FieldError errors={[form.formState.errors.length]} />
            </Field>
          </div>

          {/* Width */}
          <div className="w-full min-w-0">
            <Field className="space-y-2">
              <FieldLabel className="font-semibold">Width</FieldLabel>
              <div className="relative">
                <Input
               
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  {...form.register("width")}
                  className="h-11 w-full pr-12 bg-background text-base sm:text-sm"
                />
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                  <span className="text-sm text-muted-foreground">cm</span>
                </div>
              </div>
              <FieldError errors={[form.formState.errors.width]} />
            </Field>
          </div>

          {/* Height */}
          <div className="w-full min-w-0">
            <Field className="space-y-2">
              <FieldLabel className="font-semibold">Height</FieldLabel>
              <div className="relative">
                <Input
               
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  {...form.register("height")}
                  className="h-11 w-full pr-12 bg-background text-base sm:text-sm"
                />
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                  <span className="text-sm text-muted-foreground">cm</span>
                </div>
              </div>
              <FieldError errors={[form.formState.errors.height]} />
            </Field>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
