"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Globe, Map, Percent, Loader2 } from "lucide-react"


import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { NumberInput } from "@workspace/ui/components/number-input"

import { Card } from "@workspace/ui/components/card"
import {
  useCreateTaxRateMutation,
  useUpdateTaxRateMutation,
} from "../../mutations"
import { useTaxClassesQuery } from "../../queries"

const taxRateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  countryCode: z
    .string()
    .length(2, "Country code must be exactly 2 characters (e.g., US, GB)."),
  region: z.string().optional().nullable(),
  percentage: z
    .number()
    .min(0, "Percentage must be greater than or equal to 0"),
})

type TaxRateFormValues = z.infer<typeof taxRateSchema>

export interface TaxRateFormProps {
  initialData?: any
  onSuccess?: () => void
  onCancel?: () => void
}

export function TaxRateForm({ initialData, onSuccess, onCancel }: TaxRateFormProps) {
  const { data: classesRes } = useTaxClassesQuery()
  const taxClasses = classesRes?.items || []

  const isEditing = !!initialData

  const form = useForm<TaxRateFormValues>({
    resolver: zodResolver(taxRateSchema),
    defaultValues: {
      name: initialData?.name || "",
      countryCode: initialData?.countryCode || "",
      region: initialData?.region || "",
      percentage: Number(initialData?.percentage) || 0,
    },
  })

  const { mutate: createTaxRate, isPending: isCreating } = useCreateTaxRateMutation()
  const { mutate: updateTaxRate, isPending: isUpdating } = useUpdateTaxRateMutation()

  const isPending = isCreating || isUpdating

  const onSubmit = async (data: TaxRateFormValues) => {
    const payload = {
      ...data,
      countryCode: data.countryCode.toUpperCase(),
    }
    if (isEditing) {
      updateTaxRate(
        { id: initialData.id, data: payload },
        {
          onSuccess: () => {
            if (onSuccess) onSuccess()
          },
        }
      )
    } else {
      createTaxRate(payload, {
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
          {isEditing ? "Edit Tax Rate" : "New Tax Rate"}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {isEditing ? "Update tax rate details." : "Create a new product tax rate."}
        </p>
      </div>

      <div className="px-8 pb-12 bg-background">

          <form
            id="tax-rate-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="mx-auto space-y-12 py-8"
          >
            {/* Basic Details Section */}
            <div className="space-y-8 rounded-2xl border border-border/40 bg-card p-8 shadow-sm">
              <div className="flex items-center gap-3 border-b border-border/40 pb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Percent className="h-4 w-4" />
                </div>
                <h3 className="text-lg font-medium text-foreground">
                  Rate Details
                </h3>
              </div>

              <div className="grid gap-8 md:grid-cols-2">
                <div className="space-y-2.5 md:col-span-2">
                  <Label className="text-xs font-medium text-muted-foreground">
                    Rate Name
                  </Label>
                  <Input
                    {...form.register("name")}
                    className={softInputClass}
                    placeholder="e.g. UK VAT 20%"
                  />
                  {form.formState.errors.name && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2.5">
                  <Label className="text-xs font-medium text-muted-foreground">
                    Percentage (%)
                  </Label>
                  <NumberInput
                    value={form.watch("percentage")}
                    onChange={(e) =>
                      form.setValue("percentage", Number(e.target.value) || 0)
                    }
                  />
                  {form.formState.errors.percentage && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.percentage.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Geographical Section */}
            <div className="space-y-8 rounded-2xl border border-border/40 bg-card p-8 shadow-sm">
              <div className="flex items-center gap-3 border-b border-border/40 pb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Globe className="h-4 w-4" />
                </div>
                <h3 className="text-lg font-medium text-foreground">
                  Geographical Area
                </h3>
              </div>

              <div className="grid gap-8 md:grid-cols-2">
                <div className="space-y-2.5">
                  <Label className="text-xs font-medium text-muted-foreground">
                    Country Code
                  </Label>
                  <Input
                    {...form.register("countryCode")}
                    className={`${softInputClass} uppercase`}
                    placeholder="e.g. GB"
                    maxLength={2}
                  />
                  <p className="text-[10px] text-muted-foreground">
                    2-letter ISO code.
                  </p>
                  {form.formState.errors.countryCode && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.countryCode.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2.5">
                  <Label className="text-xs font-medium text-muted-foreground">
                    Region / State (Optional)
                  </Label>
                  <Input
                    {...form.register("region")}
                    className={softInputClass}
                    placeholder="e.g. California, London"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Leave blank to apply to whole country.
                  </p>
                </div>
              </div>
            </div>
          </form>


        <div className="mt-4 flex items-center justify-end gap-4 border-t border-border/40 pt-6">
          <Button
            type="button"
            variant="outline"
            className="h-11 px-8 rounded-xl"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => {
              const formElement = document.getElementById(
                "tax-rate-form"
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
            {isEditing ? "Update Tax Rate" : "Create Tax Rate"}
          </Button>
        </div>
      </div>
    </Card>
  )
}
