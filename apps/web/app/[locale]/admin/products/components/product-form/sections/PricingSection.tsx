"use client"

import * as React from "react"
import { UseFormReturn } from "react-hook-form"
import { Input } from "@workspace/ui/components/input"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Field, FieldLabel, FieldError, FieldDescription } from "@workspace/ui/components/field"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { ProductFormValues } from "../use-product-form"
import { CircleDollarSign } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { NumberInput } from "@workspace/ui/components/number-input"
import { TaxClass } from "@workspace/api-contracts"

interface PricingSectionProps {
  form: UseFormReturn<ProductFormValues>
  currency: string
  taxClasses: TaxClass[]
  isLoadingTaxes: boolean
}

export function PricingSection({ form, currency, taxClasses, isLoadingTaxes }: PricingSectionProps) {
  return (
    <Card id="pricing" className="overflow-hidden border-border/60 shadow-sm">
      
      {/* Matched Premium Header Design */}
      <CardHeader className="flex flex-row items-center gap-5 border-b border-border/40 bg-muted/10 px-6 py-6 sm:px-8">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border/50 bg-background text-primary shadow-sm">
          <CircleDollarSign className="h-6 w-6" />
        </div>
        <div className="flex flex-col space-y-1.5">
          <CardTitle className="text-xl font-semibold tracking-tight text-foreground">
            Pricing & Tax
          </CardTitle>
          <CardDescription className="text-sm font-medium text-muted-foreground">
            Manage the base price, promotional pricing, and tax calculation rules.
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col space-y-8 px-6 py-8 sm:px-8">
        
        {/* ROW 1: Price Inputs Side-by-Side */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          
          {/* Base Price */}
          <div className="w-full min-w-0">
            <Field className="space-y-2">
              <FieldLabel htmlFor="price" className="font-semibold">Base Price *</FieldLabel>
              <div className="relative w-full min-w-0">
                <NumberInput 
                  id="price" 
                  placeholder="0.00" 
                  {...form.register("price")} 
                  className="h-11 w-full min-w-0 pl-4 pr-16 text-base sm:text-sm" 
                />
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                  <span className="text-sm font-medium text-muted-foreground">{currency}</span>
                </div>
              </div>
              <FieldError errors={[form.formState.errors.price]} />
            </Field>
          </div>

          {/* Compare at Price */}
          <div className="w-full min-w-0">
            <Field className="space-y-2">
              <FieldLabel htmlFor="discount" className="font-semibold">Compare at Price</FieldLabel>
              <div className="relative w-full min-w-0">
                <NumberInput 
                  id="discount" 
                  placeholder="0.00" 
                  {...form.register("discount")} 
                  className="h-11 w-full min-w-0 pl-4 pr-16 text-base sm:text-sm" 
                />
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                  <span className="text-sm font-medium text-muted-foreground">{currency}</span>
                </div>
              </div>
              <FieldDescription className="text-xs text-muted-foreground">
                To show a markdown, enter a value higher than the base price.
              </FieldDescription>
              <FieldError errors={[form.formState.errors.discount]} />
            </Field>
          </div>
        </div>

        {/* Visual Divider */}
        <div className="h-px w-full bg-border/40" />

        {/* ROW 2: Tax Class (Full Width) */}
        <div className="w-full min-w-0">
          <Field className="space-y-2">
            <FieldLabel className="font-semibold">Tax Class</FieldLabel>
            {isLoadingTaxes ? (
              <Skeleton className="h-11 w-full" />
            ) : (
              <Select
                onValueChange={(val) => form.setValue("taxClassId", val ?? undefined)}
                value={form.watch("taxClassId") ?? ""}
              >
                <SelectTrigger className="h-11 w-full min-w-0 py-5 text-base sm:text-sm">
                  <SelectValue placeholder="Select a tax class...">
                    {form.watch("taxClassId")
                      ? taxClasses.find(t => t.id === form.watch("taxClassId"))?.name ?? "Select a tax class..."
                      : "Select a tax class..."}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="w-full">
                  {taxClasses.map(tax => (
                    <SelectItem key={tax.id} value={tax.id} className="py-2.5">
                      {tax.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <FieldDescription className="text-xs text-muted-foreground">
              Used to calculate accurate taxes at checkout based on regional rules.
            </FieldDescription>
            <FieldError errors={[form.formState.errors.taxClassId]} />
          </Field>
        </div>
         
      </CardContent>
    </Card>
  )
}
