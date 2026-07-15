"use client"

import * as React from "react"
import { UseFormReturn } from "react-hook-form"
import { Field, FieldLabel, FieldDescription, FieldError } from "@workspace/ui/components/field"
import { Switch } from "@workspace/ui/components/switch"
import { NumberInput } from "@workspace/ui/components/number-input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { RotateCcw } from "lucide-react"

import { ProductFormValues } from "../use-product-form"

interface ReturnsSectionProps {
  form: UseFormReturn<ProductFormValues>
  referenceData?: any
}

export function ReturnsSection({ form, referenceData }: ReturnsSectionProps) {
  const isReturnable = form.watch("isReturnable")
  const isExchangeable = form.watch("isExchangeable")

  return (
    <Card id="returns-exchanges" className="overflow-hidden border-border/60">
      <CardHeader className="flex flex-row items-center gap-5 border-b border-border/40 bg-muted/10 px-6 py-6 sm:px-8">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border/50 bg-background text-primary">
          <RotateCcw className="h-6 w-6" />
        </div>
        <div className="flex flex-col space-y-1.5">
          <CardTitle className="text-xl font-semibold tracking-tight text-foreground">
            Returns & Exchanges
          </CardTitle>
          <CardDescription className="text-sm font-medium text-muted-foreground">
            Configure return eligibility and policies for this product.
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col space-y-8 px-6 py-8 sm:px-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Returnable */}
          <div className="w-full min-w-0">
            <Field className="flex flex-row items-center justify-between rounded-xl border border-border/50 bg-background p-4 shadow-sm h-full">
              <div className="space-y-0.5 mr-4">
                <FieldLabel className="text-sm font-semibold">Eligible for Return</FieldLabel>
                <FieldDescription className="text-xs text-muted-foreground">
                  Can this product be returned by the customer?
                </FieldDescription>
              </div>
              <Switch
                checked={form.watch("isReturnable") ?? true}
                onCheckedChange={(checked) => form.setValue("isReturnable", checked, { shouldDirty: true })}
              />
            </Field>
          </div>

          {/* Exchangeable */}
          <div className="w-full min-w-0">
            <Field className="flex flex-row items-center justify-between rounded-xl border border-border/50 bg-background p-4 shadow-sm h-full">
              <div className="space-y-0.5 mr-4">
                <FieldLabel className="text-sm font-semibold">Eligible for Exchange</FieldLabel>
                <FieldDescription className="text-xs text-muted-foreground">
                  Can this product be exchanged for another?
                </FieldDescription>
              </div>
              <Switch
                checked={form.watch("isExchangeable") ?? true}
                onCheckedChange={(checked) => form.setValue("isExchangeable", checked, { shouldDirty: true })}
              />
            </Field>
          </div>
        </div>

        {(isReturnable || isExchangeable) && (
          <>
            <div className="h-px w-full bg-border/40" />
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {isReturnable && (
                <div className="w-full min-w-0">
                  <Field className="space-y-2">
                    <FieldLabel htmlFor="returnWindowDays" className="font-semibold">Return Window (Days)</FieldLabel>
                    <NumberInput
                      id="returnWindowDays"
                      min={0}
                      placeholder={referenceData?.settings?.defaultReturnWindow?.toString() || "14"}
                      {...form.register("returnWindowDays")}
                      className="h-11 w-full min-w-0"
                    />
                    <FieldDescription className="text-xs text-muted-foreground">
                      Number of days a customer has to return this product.
                    </FieldDescription>
                    <FieldError errors={[form.formState.errors.returnWindowDays]} />
                  </Field>
                </div>
              )}

              {isExchangeable && (
                <div className="w-full min-w-0">
                  <Field className="space-y-2">
                    <FieldLabel htmlFor="exchangeWindowDays" className="font-semibold">Exchange Window (Days)</FieldLabel>
                    <NumberInput
                      id="exchangeWindowDays"
                      min={0}
                      placeholder={referenceData?.settings?.defaultExchangeWindow?.toString() || "30"}
                      {...form.register("exchangeWindowDays")}
                      className="h-11 w-full min-w-0"
                    />
                    <FieldDescription className="text-xs text-muted-foreground">
                      Number of days a customer has to exchange this product.
                    </FieldDescription>
                    <FieldError errors={[form.formState.errors.exchangeWindowDays]} />
                  </Field>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
