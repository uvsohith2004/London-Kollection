"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { Loader2, CreditCard, Wallet, Server, ShieldCheck } from "lucide-react"

import { cn } from "@workspace/ui/lib/utils"
import { Button } from "@workspace/ui/components/button"
import { Label } from "@workspace/ui/components/label"
import { Input } from "@workspace/ui/components/input"
import { PasswordInput } from "@workspace/ui/components/password-input"
import { Switch } from "@workspace/ui/components/switch"

const paymentFormSchema = z.object({
  // Stripe
  stripeEnabled: z.boolean(),
  stripePublicKey: z.string().optional(),
  stripeSecretKey: z.string().optional(),
  
  // Checkout.com
  checkoutEnabled: z.boolean(),
  checkoutPublicKey: z.string().optional(),
  checkoutSecretKey: z.string().optional(),
  
  // Tap Payments
  tapEnabled: z.boolean(),
  tapPublicKey: z.string().optional(),
  tapSecretKey: z.string().optional(),
  
  // Manual / R2 Storage
  manualEnabled: z.boolean(),
  r2BucketName: z.string().optional(),
  r2Endpoint: z.string().optional(),
  r2AccessKeyId: z.string().optional(),
  r2SecretAccessKey: z.string().optional(),
}).superRefine((data, ctx) => {
  const activeCount = [
    data.stripeEnabled, 
    data.checkoutEnabled, 
    data.tapEnabled, 
    data.manualEnabled
  ].filter(Boolean).length

  if (activeCount > 2) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "A maximum of two payment gateways can be active simultaneously.",
      path: ["root"],
    })
  }
})

type PaymentFormValues = z.infer<typeof paymentFormSchema>

const defaultValues: Partial<PaymentFormValues> = {
  stripeEnabled: true,
  stripePublicKey: "",
  stripeSecretKey: "", 
  checkoutEnabled: false,
  checkoutPublicKey: "",
  checkoutSecretKey: "",
  tapEnabled: false,
  tapPublicKey: "",
  tapSecretKey: "",
  manualEnabled: false,
  r2BucketName: "",
  r2Endpoint: "",
  r2AccessKeyId: "",
  r2SecretAccessKey: "",
}

export default function SettingsPaymentsPage() {
  const [isPending, setIsPending] = React.useState(false)

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues,
  })

  // Watch values to enforce the max 2 constraint
  const { stripeEnabled, checkoutEnabled, tapEnabled, manualEnabled } = form.watch()
  const activeCount = [stripeEnabled, checkoutEnabled, tapEnabled, manualEnabled].filter(Boolean).length
  const canEnableMore = activeCount < 2

  async function onSubmit(data: PaymentFormValues) {
    setIsPending(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      console.log(data)
      toast.success("Payment infrastructure updated securely.", {
        className: "rounded-xl",
      })
    } catch (err) {
      toast.error("Failed to update payment settings.")
    } finally {
      setIsPending(false)
    }
  }

  const softInputClass = "h-12 w-full rounded-xl border border-transparent bg-muted/40 px-4 text-sm transition-all hover:bg-muted/60 focus-visible:border-border focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-none"

  return (
    <div className="mx-auto max-w-4xl space-y-10 pb-16 font-sans">
      
      <div>
        <h2 className="text-3xl font-semibold tracking-tight text-foreground">
          Payment Infrastructure
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Configure secure payment gateways and receipt storage. You may enable up to two simultaneous methods.
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        
        {form.formState.errors.root && (
          <div className="rounded-xl bg-destructive/10 p-4 text-sm font-medium text-destructive">
            {form.formState.errors.root.message}
          </div>
        )}

        {/* STRIPE CARD */}
        <div className={cn("overflow-hidden rounded-2xl border border-border/40 bg-card transition-all shadow-sm", stripeEnabled ? "ring-1 ring-primary/20" : "")}>
          <div className="flex items-center justify-between p-6 sm:p-8">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-medium text-foreground">Stripe</h3>
                <p className="text-xs text-muted-foreground">Global credit card processing.</p>
              </div>
            </div>
            <Switch 
              checked={stripeEnabled} 
              disabled={!stripeEnabled && !canEnableMore}
              onCheckedChange={(checked) => form.setValue("stripeEnabled", checked, { shouldValidate: true })}
            />
          </div>
          
          {stripeEnabled && (
            <div className="animate-in fade-in slide-in-from-top-4 border-t border-border/40 bg-muted/10 p-6 sm:p-8">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2.5">
                  <Label htmlFor="stripePublicKey" className="text-xs font-medium text-muted-foreground">Publishable Key</Label>
                  <Input id="stripePublicKey" placeholder="pk_live_..." {...form.register("stripePublicKey")} className={softInputClass} />
                </div>
                <div className="space-y-2.5">
                  <Label htmlFor="stripeSecretKey" className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                    Secret Key <ShieldCheck className="h-3 w-3 text-emerald-500" />
                  </Label>
                  <PasswordInput id="stripeSecretKey" placeholder="sk_live_..." {...form.register("stripeSecretKey")} className={softInputClass} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* CHECKOUT.COM CARD */}
        <div className={cn("overflow-hidden rounded-2xl border border-border/40 bg-card transition-all shadow-sm", checkoutEnabled ? "ring-1 ring-primary/20" : "")}>
          <div className="flex items-center justify-between p-6 sm:p-8">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-medium text-foreground">Checkout.com</h3>
                <p className="text-xs text-muted-foreground">Alternative high-volume processing.</p>
              </div>
            </div>
            <Switch 
              checked={checkoutEnabled} 
              disabled={!checkoutEnabled && !canEnableMore}
              onCheckedChange={(checked) => form.setValue("checkoutEnabled", checked, { shouldValidate: true })}
            />
          </div>
          
          {checkoutEnabled && (
            <div className="animate-in fade-in slide-in-from-top-4 border-t border-border/40 bg-muted/10 p-6 sm:p-8">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2.5">
                  <Label htmlFor="checkoutPublicKey" className="text-xs font-medium text-muted-foreground">Public Key</Label>
                  <Input id="checkoutPublicKey" placeholder="pk_..." {...form.register("checkoutPublicKey")} className={softInputClass} />
                </div>
                <div className="space-y-2.5">
                  <Label htmlFor="checkoutSecretKey" className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                    Secret Key <ShieldCheck className="h-3 w-3 text-emerald-500" />
                  </Label>
                  <PasswordInput id="checkoutSecretKey" placeholder="sk_..." {...form.register("checkoutSecretKey")} className={softInputClass} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* TAP PAYMENTS CARD */}
        <div className={cn("overflow-hidden rounded-2xl border border-border/40 bg-card transition-all shadow-sm", tapEnabled ? "ring-1 ring-primary/20" : "")}>
          <div className="flex items-center justify-between p-6 sm:p-8">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                <Wallet className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-medium text-foreground">Tap Payments</h3>
                <p className="text-xs text-muted-foreground">MENA region focused gateway.</p>
              </div>
            </div>
            <Switch 
              checked={tapEnabled} 
              disabled={!tapEnabled && !canEnableMore}
              onCheckedChange={(checked) => form.setValue("tapEnabled", checked, { shouldValidate: true })}
            />
          </div>
          
          {tapEnabled && (
            <div className="animate-in fade-in slide-in-from-top-4 border-t border-border/40 bg-muted/10 p-6 sm:p-8">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2.5">
                  <Label htmlFor="tapPublicKey" className="text-xs font-medium text-muted-foreground">Public Key</Label>
                  <Input id="tapPublicKey" placeholder="pk_test_..." {...form.register("tapPublicKey")} className={softInputClass} />
                </div>
                <div className="space-y-2.5">
                  <Label htmlFor="tapSecretKey" className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                    Secret Key <ShieldCheck className="h-3 w-3 text-emerald-500" />
                  </Label>
                  <PasswordInput id="tapSecretKey" placeholder="sk_test_..." {...form.register("tapSecretKey")} className={softInputClass} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* MANUAL / R2 STORAGE CARD */}
        <div className={cn("overflow-hidden rounded-2xl border border-border/40 bg-card transition-all shadow-sm", manualEnabled ? "ring-1 ring-primary/20" : "")}>
          <div className="flex items-center justify-between p-6 sm:p-8">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                <Server className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-medium text-foreground">Manual & Wire Transfers</h3>
                <p className="text-xs text-muted-foreground">Requires Cloudflare R2 for secure receipt uploads.</p>
              </div>
            </div>
            <Switch 
              checked={manualEnabled} 
              disabled={!manualEnabled && !canEnableMore}
              onCheckedChange={(checked) => form.setValue("manualEnabled", checked, { shouldValidate: true })}
            />
          </div>
          
          {manualEnabled && (
            <div className="animate-in fade-in slide-in-from-top-4 border-t border-border/40 bg-muted/10 p-6 sm:p-8">
              <div className="mb-6 rounded-xl border border-border/40 bg-background/50 p-4">
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Manual payments require clientele to upload proof of transfer (e.g., wire receipts). 
                  To ensure privacy and security, these documents are routed directly to your isolated Cloudflare R2 bucket.
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2.5">
                  <Label htmlFor="r2BucketName" className="text-xs font-medium text-muted-foreground">R2 Bucket Name</Label>
                  <Input id="r2BucketName" placeholder="lk-receipts-vault" {...form.register("r2BucketName")} className={softInputClass} />
                </div>
                <div className="space-y-2.5">
                  <Label htmlFor="r2Endpoint" className="text-xs font-medium text-muted-foreground">Account Endpoint URL</Label>
                  <Input id="r2Endpoint" placeholder="https://<account_id>.r2.cloudflarestorage.com" {...form.register("r2Endpoint")} className={softInputClass} />
                </div>
                <div className="space-y-2.5">
                  <Label htmlFor="r2AccessKeyId" className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                    Access Key ID <ShieldCheck className="h-3 w-3 text-emerald-500" />
                  </Label>
                  <PasswordInput id="r2AccessKeyId" {...form.register("r2AccessKeyId")} className={softInputClass} />
                </div>
                <div className="space-y-2.5">
                  <Label htmlFor="r2SecretAccessKey" className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                    Secret Access Key <ShieldCheck className="h-3 w-3 text-emerald-500" />
                  </Label>
                  <PasswordInput id="r2SecretAccessKey" {...form.register("r2SecretAccessKey")} className={softInputClass} />
                </div>
              </div>
            </div>
          )}
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
            {isPending ? "Securing Keys..." : "Save Payment Routing"}
          </Button>
        </div>
        
      </form>
    </div>
  )
}
