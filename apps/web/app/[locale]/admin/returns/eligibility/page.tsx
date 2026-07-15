"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

import { Card } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { useSettingsQuery } from "../../queries"
import { useUpdateSettingsMutation } from "../../mutations"
import { useSettings } from "@/components/providers/settings-provider"

const eligibilitySchema = z.object({
  defaultReturnWindow: z.number().int().min(0).default(14),
  defaultExchangeWindow: z.number().int().min(0).default(30),
})

type EligibilityFormValues = z.infer<typeof eligibilitySchema>

export default function EligibilitySettingsPage() {
  const { data: settingsData, isLoading } = useSettingsQuery()
  const { mutateAsync: updateSettings, isPending } = useUpdateSettingsMutation()
  const { setSettings } = useSettings()

  const form = useForm<EligibilityFormValues>({
    resolver: zodResolver(eligibilitySchema),
    defaultValues: {
      defaultReturnWindow: 14,
      defaultExchangeWindow: 30,
    },
  })

  React.useEffect(() => {
    if (settingsData?.data) {
      form.reset({
        defaultReturnWindow: settingsData.data.defaultReturnWindow ?? 14,
        defaultExchangeWindow: settingsData.data.defaultExchangeWindow ?? 30,
      })
    }
  }, [settingsData, form])

  async function onSubmit(data: EligibilityFormValues) {
    try {
      await updateSettings(data)
      setSettings((prev: any) => ({
        ...prev,
        ...data
      }))
    } catch (err) {
      console.error(err)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex items-center justify-between space-y-2">
        <h3 className="text-xl font-bold tracking-tight">Eligibility Settings</h3>
      </div>
      <p className="text-sm text-muted-foreground">
        Configure global return windows and fallback rules for products.
      </p>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Default Return Window (Days)</Label>
              <Input
                type="number"
                {...form.register("defaultReturnWindow", { valueAsNumber: true })}
              />
              {form.formState.errors.defaultReturnWindow && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.defaultReturnWindow.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                This is the default return window for products that do not have a specific window set in the catalog.
              </p>
            </div>
            
            <div className="space-y-2 pt-4">
              <Label>Default Exchange Window (Days)</Label>
              <Input
                type="number"
                {...form.register("defaultExchangeWindow", { valueAsNumber: true })}
              />
              {form.formState.errors.defaultExchangeWindow && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.defaultExchangeWindow.message}
                </p>
              )}
            </div>
            
            <div className="pt-4">
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Settings
              </Button>
            </div>
          </div>
        </Card>
      </form>
      
      <Card className="p-6 mt-6 bg-muted/50 border-dashed">
        <h4 className="font-semibold text-sm mb-2">Product-Specific Overrides</h4>
        <p className="text-xs text-muted-foreground">
          To set a specific return window or assign a custom Return Form for an individual product, go to the <strong>Catalog {'>'} Products</strong> section, edit a product, and update its Return Eligibility settings.
        </p>
      </Card>
    </div>
  )
}
