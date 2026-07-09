"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { Loader2, Check, ChevronsUpDown, Globe, Upload } from "lucide-react"

import { cn } from "@workspace/ui/lib/utils"
import { Button } from "@workspace/ui/components/button"
import { Label } from "@workspace/ui/components/label"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@workspace/ui/components/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover"
import { useSettingsQuery } from "../queries"
import { useUpdateSettingsMutation, useUploadMediaMutation } from "../mutations"

// Expanded schema
const profileFormSchema = z.object({
  siteName: z
    .string()
    .min(2, { message: "Brand name must be at least 2 characters." })
    .max(30),
  brandTagline: z.string().max(60).optional().nullable(),
  siteDescription: z.string().max(160).optional().nullable(),
  supportEmail: z
    .string()
    .email({ message: "Please enter a valid email address." }),
  defaultCurrency: z.string().min(1, { message: "Please select a currency." }),
  orderPrefix: z.string().max(5).optional().nullable(),
  logoUrl: z.any().optional(), // Light background logo
  logoDarkUrl: z.any().optional(), // Dark background logo
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

// Currency Data for the Combobox
const currencies = [
  { label: "GBP - British Pound", value: "GBP" },
  { label: "USD - US Dollar", value: "USD" },
  { label: "EUR - Euro", value: "EUR" },
  { label: "KWD - Kuwaiti Dinar", value: "KWD" },
  { label: "AED - UAE Dirham", value: "AED" },
  { label: "SAR - Saudi Riyal", value: "SAR" },
  { label: "QAR - Qatari Riyal", value: "QAR" },
  { label: "BHD - Bahraini Dinar", value: "BHD" },
  { label: "JPY - Japanese Yen", value: "JPY" },
  { label: "AUD - Australian Dollar", value: "AUD" },
  { label: "CAD - Canadian Dollar", value: "CAD" },
  { label: "CHF - Swiss Franc", value: "CHF" },
  { label: "INR - Indian Rupee", value: "INR" },
]

export default function SettingsProfilePage() {
  const { data: settingsData, isLoading } = useSettingsQuery()
  const { mutateAsync: updateSettings } = useUpdateSettingsMutation()
  const { mutateAsync: uploadMedia } = useUploadMediaMutation()

  const [isPending, setIsPending] = React.useState(false)
  const [logoPreview, setLogoPreview] = React.useState<string | null>(null)
  const [logoDarkPreview, setLogoDarkPreview] = React.useState<string | null>(null)

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      siteName: "",
      brandTagline: "",
      siteDescription: "",
      supportEmail: "",
      defaultCurrency: "GBP",
      orderPrefix: "",
      logoUrl: "",
      logoDarkUrl: "",
    },
  })

  // Reset form when data is loaded
  React.useEffect(() => {
    if (settingsData?.data) {
      form.reset({
        siteName: settingsData.data.siteName || "",
        brandTagline: settingsData.data.brandTagline || "",
        siteDescription: settingsData.data.siteDescription || "",
        supportEmail: settingsData.data.supportEmail || "",
        defaultCurrency: settingsData.data.defaultCurrency || "GBP",
        orderPrefix: settingsData.data.orderPrefix || "",
        logoUrl: settingsData.data.logoUrl || "",
        logoDarkUrl: settingsData.data.logoDarkUrl || "",
      })

      if (settingsData.data.logoUrl?.url) {
        setLogoPreview(settingsData.data.logoUrl.url)
      } else if (typeof settingsData.data.logoUrl === "string") {
        setLogoPreview(settingsData.data.logoUrl)
      }

      if (settingsData.data.logoDarkUrl?.url) {
        setLogoDarkPreview(settingsData.data.logoDarkUrl.url)
      } else if (typeof settingsData.data.logoDarkUrl === "string") {
        setLogoDarkPreview(settingsData.data.logoDarkUrl)
      }
    }
  }, [settingsData, form])

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>, isDark: boolean = false) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      // Show local preview
      const objectUrl = URL.createObjectURL(file)
      if (isDark) {
        setLogoDarkPreview(objectUrl)
      } else {
        setLogoPreview(objectUrl)
      }

      const res = await uploadMedia({ file, preset: "logo" })

      if (res?.data?.url || res?.data?.key) {
        if (isDark) {
          form.setValue("logoDarkUrl", res.data)
        } else {
          form.setValue("logoUrl", res.data)
        }
      }
    } catch (err) {
      toast.error("Logo upload failed")
      if (isDark) {
        setLogoDarkPreview(null)
      } else {
        setLogoPreview(null)
      }
    }
  }

  async function onSubmit(data: ProfileFormValues) {
    setIsPending(true)
    try {
      await updateSettings(data)
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
      {/* Header */}
      <div>
        <h2 className="text-3xl font-semibold tracking-tight text-foreground">
          General Settings
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage your brand identity, operational defaults, and public registry
          details.
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
        {/* BRAND IDENTITY CARD */}
        <div className="rounded-2xl border border-border/40 bg-card p-6 shadow-sm sm:p-8">
          <div className="mb-6 flex items-center gap-3 border-b border-border/40 pb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Globe className="h-4 w-4" />
            </div>
            <h3 className="text-lg font-medium text-foreground">
              Brand Identity
            </h3>
          </div>

          <div className="mb-8 grid gap-8 md:grid-cols-2">
            <div>
              <Label className="mb-2 block text-xs font-medium text-muted-foreground">
                Brand Logo (Light Background)
              </Label>
              <div className="flex items-center gap-6">
                {logoPreview ? (
                  <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-xl border border-border bg-white">
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="h-full w-full object-contain p-2"
                    />
                  </div>
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-xl border border-dashed border-border bg-white text-muted-foreground">
                    <Globe className="h-8 w-8 opacity-20" />
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <label className="relative inline-flex h-10 w-32 cursor-pointer items-center justify-center rounded-xl border border-input bg-background text-sm font-medium hover:bg-accent hover:text-accent-foreground">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Logo
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleLogoUpload(e, false)}
                    />
                  </label>
                  <p className="text-[10px] text-muted-foreground leading-tight">
                    For light interfaces.<br/>Max 2MB.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <Label className="mb-2 block text-xs font-medium text-muted-foreground">
                Brand Logo (Dark Background)
              </Label>
              <div className="flex items-center gap-6">
                {logoDarkPreview ? (
                  <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-xl border border-border bg-slate-950">
                    <img
                      src={logoDarkPreview}
                      alt="Logo dark preview"
                      className="h-full w-full object-contain p-2"
                    />
                  </div>
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-xl border border-dashed border-border bg-slate-950 text-muted-foreground">
                    <Globe className="h-8 w-8 opacity-20" />
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <label className="relative inline-flex h-10 w-32 cursor-pointer items-center justify-center rounded-xl border border-input bg-background text-sm font-medium hover:bg-accent hover:text-accent-foreground">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Logo
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleLogoUpload(e, true)}
                    />
                  </label>
                  <p className="text-[10px] text-muted-foreground leading-tight">
                    For dark interfaces.<br/>Max 2MB.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-2.5">
              <Label
                htmlFor="siteName"
                className="text-xs font-medium text-muted-foreground"
              >
                Brand Name
              </Label>
              <Input
                id="siteName"
                {...form.register("siteName")}
                className={softInputClass}
              />
              {form.formState.errors.siteName && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.siteName.message}
                </p>
              )}
            </div>

            <div className="space-y-2.5">
              <Label
                htmlFor="brandTagline"
                className="text-xs font-medium text-muted-foreground"
              >
                Tagline
              </Label>
              <Input
                id="brandTagline"
                placeholder="The New Standard"
                {...form.register("brandTagline")}
                className={softInputClass}
              />
            </div>
          </div>

          <div className="mt-8 space-y-2.5">
            <Label
              htmlFor="siteDescription"
              className="text-xs font-medium text-muted-foreground"
            >
              Brand Synopsis (SEO)
            </Label>
            <Textarea
              id="siteDescription"
              placeholder="Brief description of the collection..."
              className={cn(softInputClass, "min-h-[120px] resize-none py-4")}
              {...form.register("siteDescription")}
            />
          </div>
        </div>

        {/* STORE OPERATIONS CARD */}
        <div className="rounded-2xl border border-border/40 bg-card p-6 shadow-sm sm:p-8">
          <div className="mb-6 border-b border-border/40 pb-4">
            <h3 className="text-lg font-medium text-foreground">
              Store Operations
            </h3>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-2.5">
              <Label
                htmlFor="supportEmail"
                className="text-xs font-medium text-muted-foreground"
              >
                Support Email
              </Label>
              <Input
                id="supportEmail"
                type="email"
                {...form.register("supportEmail")}
                className={softInputClass}
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* SHADCN COMBOBOX FOR CURRENCY */}
              <div className="space-y-2.5">
                <Label className="text-xs font-medium text-muted-foreground">
                  Base Currency
                </Label>
                <Popover>
                  <PopoverTrigger
                    role="combobox"
                    className={cn(
                      "flex h-12 w-full items-center justify-between rounded-xl border-transparent bg-muted/40 px-4 text-sm font-normal hover:bg-muted/60",
                      !form.watch("defaultCurrency") && "text-muted-foreground"
                    )}
                  >
                    {form.watch("defaultCurrency")
                      ? currencies.find(
                          (currency) =>
                            currency.value === form.watch("defaultCurrency")
                        )?.value
                      : "Select..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </PopoverTrigger>
                  <PopoverContent className="w-[200px] rounded-xl p-0 shadow-lg">
                    <Command>
                      <CommandInput
                        placeholder="Search currency..."
                        className="border-none focus:ring-0"
                      />
                      <CommandList>
                        <CommandEmpty>No currency found.</CommandEmpty>
                        <CommandGroup>
                          {currencies.map((currency) => (
                            <CommandItem
                              key={currency.value}
                              value={currency.value}
                              onSelect={() => {
                                form.setValue(
                                  "defaultCurrency",
                                  currency.value,
                                  { shouldValidate: true }
                                )
                              }}
                              className="rounded-lg"
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  form.watch("defaultCurrency") ===
                                    currency.value
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {currency.label}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {form.formState.errors.defaultCurrency && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.defaultCurrency.message}
                  </p>
                )}
              </div>

              <div className="space-y-2.5">
                <Label
                  htmlFor="orderPrefix"
                  className="text-xs font-medium text-muted-foreground"
                >
                  Order Prefix
                </Label>
                <Input
                  id="orderPrefix"
                  {...form.register("orderPrefix")}
                  className={softInputClass}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Action */}
        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            disabled={isPending}
            className="h-12 rounded-full px-8 text-sm font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {isPending ? "Saving..." : "Save Preferences"}
          </Button>
        </div>
      </form>
    </div>
  )
}
