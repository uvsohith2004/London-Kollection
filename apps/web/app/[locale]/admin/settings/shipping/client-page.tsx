"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { Loader2, Package, Truck, Info } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Label } from "@workspace/ui/components/label"
import { Input } from "@workspace/ui/components/input"
import { useSettingsQuery } from "../../queries"
import { useUpdateSettingsMutation } from "../../mutations"
import { useSettings } from "@/components/providers/settings-provider"
import { StickySaveBar } from "@workspace/ui/components/sticky-save-bar"

export default function ShippingSettingsClientPage() {
  const { data: settingsData, isLoading } = useSettingsQuery()
  const { mutateAsync: updateSettings } = useUpdateSettingsMutation()
  const [isPending, setIsPending] = React.useState(false)

  const { setSettings } = useSettings()

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm({
    defaultValues: {
      shippingProvider: "none",
      shippingCredentials: {} as any,
    },
  })

  const provider = watch("shippingProvider")

  React.useEffect(() => {
    if (settingsData?.data) {
      reset({
        shippingProvider: settingsData.data.shippingProvider || "none",
        shippingCredentials: settingsData.data.shippingCredentials || {},
      })
    }
  }, [settingsData, reset])

  async function onSubmit(data: any) {
    setIsPending(true)
    try {
      await updateSettings(data)
      setSettings(data)
      toast.success("Shipping settings updated successfully")
    } catch (err: any) {
      toast.error(err?.message || "Failed to update shipping settings")
    } finally {
      setIsPending(false)
    }
  }

  const softInputClass =
    "h-12 w-full rounded-xl border border-transparent bg-muted/40 px-4 text-sm transition-all hover:bg-muted/60 focus-visible:border-border focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-none"

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-10 pb-16 font-sans">
      <div>
        <h2 className="text-3xl font-semibold tracking-tight text-foreground">
          Shipping Providers
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Configure the active shipping plugin and its API credentials.
        </p>
      </div>

      <form id="shipping-settings-form" onSubmit={handleSubmit(onSubmit)} className="space-y-10">
        <div className="rounded-2xl border border-border/40 bg-card p-6 shadow-sm sm:p-8">
          <div className="mb-6 flex items-center gap-3 border-b border-border/40 pb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Package className="h-4 w-4" />
            </div>
            <h3 className="text-lg font-medium text-foreground">
              Provider Selection
            </h3>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <Label className="text-xs font-medium text-muted-foreground">
                Active Provider
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* None Option */}
                <label
                  className={`flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition-all ${
                    provider === "none"
                      ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                      : "border-border/60 hover:bg-muted/30"
                  }`}
                >
                  <input
                    type="radio"
                    value="none"
                    {...register("shippingProvider")}
                    className="sr-only"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">None / Manual</p>
                    <p className="text-xs text-muted-foreground">Mock shipping for testing</p>
                  </div>
                </label>

                {/* Aramex Option */}
                <label
                  className={`flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition-all ${
                    provider === "aramex"
                      ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                      : "border-border/60 hover:bg-muted/30"
                  }`}
                >
                  <input
                    type="radio"
                    value="aramex"
                    {...register("shippingProvider")}
                    className="sr-only"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">Aramex</p>
                    <p className="text-xs text-muted-foreground">Official Aramex Plugin</p>
                  </div>
                </label>

                {/* FedEx Option */}
                <label
                  className={`flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition-all ${
                    provider === "fedex"
                      ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                      : "border-border/60 hover:bg-muted/30"
                  }`}
                >
                  <input
                    type="radio"
                    value="fedex"
                    {...register("shippingProvider")}
                    className="sr-only"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">FedEx</p>
                    <p className="text-xs text-muted-foreground">Official FedEx Plugin</p>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Credentials Form Dynamically Rendered based on selected provider */}
        {provider === "aramex" && (
          <div className="rounded-2xl border border-border/40 bg-card p-6 shadow-sm sm:p-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="mb-6 flex items-center gap-3 border-b border-border/40 pb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500">
                <Truck className="h-4 w-4" />
              </div>
              <h3 className="text-lg font-medium text-foreground">
                Aramex Configuration
              </h3>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Account PIN</Label>
                <Input
                  {...register("shippingCredentials.accountPin", { required: "Account PIN is required" })}
                  className={softInputClass}
                  placeholder="E.g. 112233"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Account Entity</Label>
                <Input
                  {...register("shippingCredentials.accountEntity", { required: "Account Entity is required" })}
                  className={softInputClass}
                  placeholder="E.g. LHR"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Account Number</Label>
                <Input
                  {...register("shippingCredentials.accountNumber", { required: "Account Number is required" })}
                  className={softInputClass}
                  placeholder="E.g. 200160000"
                />
              </div>
            </div>
          </div>
        )}

        {provider === "fedex" && (
          <div className="rounded-2xl border border-border/40 bg-card p-6 shadow-sm sm:p-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="mb-6 flex items-center gap-3 border-b border-border/40 pb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500">
                <Truck className="h-4 w-4" />
              </div>
              <h3 className="text-lg font-medium text-foreground">
                FedEx Configuration
              </h3>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Client ID (API Key)</Label>
                <Input
                  {...register("shippingCredentials.clientId", { required: "Client ID is required" })}
                  className={softInputClass}
                  placeholder="Enter FedEx Client ID"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Client Secret</Label>
                <Input
                  type="password"
                  {...register("shippingCredentials.clientSecret", { required: "Client Secret is required" })}
                  className={softInputClass}
                  placeholder="Enter FedEx Client Secret"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Account Number</Label>
                <Input
                  {...register("shippingCredentials.accountNumber", { required: "Account Number is required" })}
                  className={softInputClass}
                  placeholder="Enter FedEx Account Number"
                />
              </div>
            </div>
          </div>
        )}

      </form>

      <StickySaveBar 
        formId="shipping-settings-form"
        isPending={isPending}
        saveActionLabel="Save Configuration"
        infoPanel={
          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground">Shipping Provider</span>
            <span className="text-muted-foreground">&bull;</span>
            <span className="capitalize">{provider === "none" ? "Disabled" : provider}</span>
          </div>
        }
      />
    </div>
  )
}
