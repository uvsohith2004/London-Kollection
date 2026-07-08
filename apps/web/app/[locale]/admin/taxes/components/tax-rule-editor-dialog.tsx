"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { ShieldAlert, Activity, Loader2 } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Label } from "@workspace/ui/components/label"

import { Card } from "@workspace/ui/components/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import {
  useCreateTaxRuleMutation,
  useUpdateTaxRuleMutation,
} from "../../mutations"
import { useTaxClassesQuery, useTaxRatesQuery } from "../../queries"

const taxRuleSchema = z.object({
  name: z.string().min(1, "Name is required"),
  taxClassId: z.string().min(1, "Please select a tax class"),
  taxRateId: z.string().min(1, "Please select a tax rate"),
  effectiveFrom: z.string().optional().nullable(),
  effectiveTo: z.string().optional().nullable(),
})

type TaxRuleFormValues = z.infer<typeof taxRuleSchema>

export interface TaxRuleFormProps {
  initialData?: any
  onSuccess?: () => void
  onCancel?: () => void
}

export function TaxRuleForm({ initialData, onSuccess, onCancel }: TaxRuleFormProps) {
  const isEditing = !!initialData

  const { data: classesData } = useTaxClassesQuery()
  const { data: ratesData } = useTaxRatesQuery()

  const taxClasses = classesData?.items || []
  const taxRates = ratesData?.items || []

  const form = useForm<TaxRuleFormValues>({
    resolver: zodResolver(taxRuleSchema),
    defaultValues: {
      name: initialData?.name || "",
      taxClassId: initialData?.taxClassId || "",
      taxRateId: initialData?.taxRateId || "",
      effectiveFrom: initialData?.effectiveFrom || "",
      effectiveTo: initialData?.effectiveTo || "",
    },
  })

  React.useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name || "",
        taxClassId: initialData.taxClassId || "",
        taxRateId: initialData.taxRateId || "",
        effectiveFrom: initialData.effectiveFrom || "",
        effectiveTo: initialData.effectiveTo || "",
      })
    } else {
      form.reset({
        name: "",
        taxClassId: "",
        taxRateId: "",
        effectiveFrom: "",
        effectiveTo: "",
      })
    }
  }, [initialData, form])

  const { mutate: createTaxRule, isPending: isCreating } =
    useCreateTaxRuleMutation()
  const { mutate: updateTaxRule, isPending: isUpdating } =
    useUpdateTaxRuleMutation()

  const isPending = isCreating || isUpdating

  const onSubmit = async (data: TaxRuleFormValues) => {
    if (isEditing) {
      updateTaxRule(
        { id: initialData.id, data },
        {
          onSuccess: () => {
            if (onSuccess) onSuccess()
          },
        }
      )
    } else {
      createTaxRule(data, {
        onSuccess: () => {
          if (onSuccess) onSuccess()
        },
      })
    }
  }

  const softSelectClass =
    "h-11 w-full rounded-xl border border-transparent bg-muted/40 px-4 text-sm hover:bg-muted/60 focus:ring-2 focus:ring-primary/20"

  return (
    <Card className="overflow-hidden border-border/40">
      <div className="border-b border-border/40 px-8 py-6 bg-muted/20 text-left">
        <h2 className="text-2xl font-semibold tracking-tight">
          {isEditing ? "Edit Tax Rule" : "New Tax Rule"}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {isEditing ? "Update tax rule details." : "Create a new product tax rule."}
        </p>
      </div>

      <div className="px-8 pb-12 bg-background">

          <form
            id="tax-rule-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="mx-auto space-y-12 py-8"
          >
            {/* Connection Section */}
            <div className="space-y-8 rounded-2xl border border-border/40 bg-card p-8 shadow-sm">
              <div className="flex items-center gap-3 border-b border-border/40 pb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Activity className="h-4 w-4" />
                </div>
                <h3 className="text-lg font-medium text-foreground">
                  Rule Configuration
                </h3>
              </div>

              <div className="grid gap-8">
                <div className="space-y-2.5">
                  <Label className="text-xs font-medium text-muted-foreground">
                    Rule Name
                  </Label>
                  <div className="flex flex-col">
                    <input
                      {...form.register("name")}
                      className="h-11 w-full rounded-xl border border-transparent bg-muted/40 px-4 text-sm hover:bg-muted/60 focus:ring-2 focus:ring-primary/20 focus:outline-none"
                      placeholder="e.g. Standard UK Tax"
                    />
                    {form.formState.errors.name && (
                      <p className="mt-1 text-xs text-destructive">
                        {form.formState.errors.name.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2.5">
                  <Label className="text-xs font-medium text-muted-foreground">
                    Tax Class
                  </Label>
                  <Select
                    value={form.watch("taxClassId") || ""}
                    onValueChange={(val) => form.setValue("taxClassId", val as string)}
                  >
                    <SelectTrigger className={softSelectClass}>
                      <SelectValue placeholder="Select a tax class...">
                        {form.watch("taxClassId") 
                          ? taxClasses.find((tc: any) => tc.id === form.watch("taxClassId"))?.name 
                          : "Select a tax class..."}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {taxClasses.map((tc: any) => (
                        <SelectItem key={tc.id} value={tc.id}>
                          {tc.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.taxClassId && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.taxClassId.message}
                    </p>
                  )}
                </div>

                <div className="flex justify-center">
                  <ShieldAlert className="h-6 w-6 text-muted-foreground/30" />
                </div>

                <div className="space-y-2.5">
                  <Label className="text-xs font-medium text-muted-foreground">
                    Tax Rate
                  </Label>
                  <Select
                    value={form.watch("taxRateId") || ""}
                    onValueChange={(val) => form.setValue("taxRateId", val as string)}
                  >
                    <SelectTrigger className={softSelectClass}>
                      <SelectValue placeholder="Select a tax rate...">
                        {form.watch("taxRateId")
                          ? (() => {
                              const tr = taxRates.find((t: any) => t.id === form.watch("taxRateId"));
                              return tr ? `${tr.name} (${tr.countryCode}) - ${Number(tr.percentage)}%` : "Select a tax rate...";
                            })()
                          : "Select a tax rate..."}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {taxRates.map((tr: any) => (
                        <SelectItem key={tr.id} value={tr.id}>
                          {tr.name} ({tr.countryCode}) - {Number(tr.percentage)}
                          %
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.taxRateId && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.taxRateId.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </form>


        <div className="mt-4 flex items-center justify-end gap-4 border-t border-border/40 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => {
              const formElement = document.getElementById(
                "tax-rule-form"
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
            {isEditing ? "Update Rule" : "Create Rule"}
          </Button>
        </div>
      </div>
    </Card>
  )
}
