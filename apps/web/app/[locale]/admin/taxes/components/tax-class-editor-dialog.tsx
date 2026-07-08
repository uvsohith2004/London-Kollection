"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, Settings2 } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"
import { Label } from "@workspace/ui/components/label"
import { Switch } from "@workspace/ui/components/switch"

import { Card } from "@workspace/ui/components/card"
import {
  useCreateTaxClassMutation,
  useUpdateTaxClassMutation,
} from "../../mutations"

const taxClassSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  description: z.string().optional().nullable(),
  isDefault: z.boolean(),
})

type TaxClassFormValues = z.infer<typeof taxClassSchema>

export interface TaxClassFormProps {
  initialData?: any
  onSuccess?: () => void
  onCancel?: () => void
}

export function TaxClassForm({ initialData, onSuccess, onCancel }: TaxClassFormProps) {
  const isEditing = !!initialData

  const form = useForm<TaxClassFormValues>({
    resolver: zodResolver(taxClassSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      isDefault: initialData?.isDefault || false,
    },
  })

  React.useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        description: initialData.description || "",
        isDefault: initialData.isDefault,
      })
    } else {
      form.reset({
        name: "",
        description: "",
        isDefault: false,
      })
    }
  }, [initialData, form])

  const { mutate: createTaxClass, isPending: isCreating } =
    useCreateTaxClassMutation()
  const { mutate: updateTaxClass, isPending: isUpdating } =
    useUpdateTaxClassMutation()

  const isPending = isCreating || isUpdating

  const onSubmit = async (data: TaxClassFormValues) => {
    if (isEditing) {
      updateTaxClass(
        { id: initialData.id, data },
        {
          onSuccess: () => {
            if (onSuccess) onSuccess()
          },
        }
      )
    } else {
      createTaxClass(data, {
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
          {isEditing ? "Edit Tax Class" : "New Tax Class"}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {isEditing ? "Update tax class details." : "Create a new product tax class."}
        </p>
      </div>

      <div className="px-8 pb-12 bg-background">

          <form
            id="tax-class-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="mx-auto space-y-12 py-8"
          >
            {/* Basic Details Section */}
            <div className="space-y-8 rounded-2xl border border-border/40 bg-card p-8 shadow-sm">
              <div className="flex items-center gap-3 border-b border-border/40 pb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Settings2 className="h-4 w-4" />
                </div>
                <h3 className="text-lg font-medium text-foreground">
                  Class Details
                </h3>
              </div>

              <div className="space-y-6">
                <div className="space-y-2.5">
                  <Label className="text-xs font-medium text-muted-foreground">
                    Class Name
                  </Label>
                  <Input
                    {...form.register("name")}
                    className={softInputClass}
                    placeholder="e.g. Standard, Luxury, Zero-rated"
                  />
                  {form.formState.errors.name && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2.5">
                  <Label className="text-xs font-medium text-muted-foreground">
                    Default Class
                  </Label>
                  <div className="flex h-11 items-center justify-between rounded-xl border border-transparent bg-muted/40 px-4">
                    <span className="text-sm text-muted-foreground">
                      Apply to products by default
                    </span>
                    <Switch
                      checked={form.watch("isDefault")}
                      onCheckedChange={(val) => form.setValue("isDefault", val)}
                    />
                  </div>
                </div>

                <div className="space-y-2.5">
                  <Label className="text-xs font-medium text-muted-foreground">
                    Description
                  </Label>
                  <Textarea
                    {...form.register("description")}
                    className={`${softInputClass} min-h-[100px] resize-none py-4`}
                  />
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
                "tax-class-form"
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
            {isEditing ? "Update Tax Class" : "Create Tax Class"}
          </Button>
        </div>
      </div>
    </Card>
  )
}
