import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Loader2 } from "lucide-react"
import { PhoneInput } from "@/components/phone-input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Field, FieldError, FieldLabel } from "@workspace/ui/components/field"
import { GOVERNORATES, AddressFormValues } from "../index"
import { UseFormReturn, Controller } from "react-hook-form"

import { useTranslations } from "next-intl"

export default function DesktopAddressForm({ 
  form, onSubmit, isSaving, onCancel 
}: any) {
  const t = useTranslations("AddressForm")
  return (
    <form onSubmit={onSubmit} className="space-y-8 animate-in fade-in duration-500 pb-4">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_1.5fr] gap-x-16 gap-y-10">
        
        {/* Left Column: Contact & General */}
        <div className="space-y-6">
          <div className="border-b border-border/40 pb-3 mb-6">
            <h3 className="text-base font-medium text-foreground tracking-tight">{t("contactInfo")}</h3>
            <p className="text-xs text-muted-foreground mt-1">{t("contactInfoDesc")}</p>
          </div>
          
          <Field className="space-y-1.5">
            <FieldLabel className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{t("fullName")}</FieldLabel>
            <Input {...form.register('name')} className="h-12 bg-secondary/30 border-border/50 focus-visible:ring-primary/20 text-sm rounded-xl px-4 transition-colors hover:bg-secondary/50 ltr:text-left rtl:text-right" placeholder={t("fullNamePlaceholder")} />
            <FieldError errors={[form.formState.errors.name]} />
          </Field>
          
          <Controller
            control={form.control}
            name="phone"
            render={({ field, fieldState }) => (
              <Field className="space-y-1.5">
                <FieldLabel className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{t("mobileNumber")}</FieldLabel>
                <PhoneInput 
                  value={field.value}
                  onChange={(val) => field.onChange(val ? val.toString() : "")}
                  defaultCountry="KW"
                  className="h-12 bg-secondary/30 rounded-xl [&>input]:rounded-e-xl [&>button]:rounded-s-xl [&>button]:border-border/50 [&>input]:border-border/50 text-sm [&>input]:bg-transparent transition-colors hover:[&>input]:bg-secondary/50"
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />


          <Controller
            control={form.control}
            name="isDefault"
            render={({ field }) => (
              <div className="flex items-center gap-3 pt-6 cursor-pointer group">
                <input 
                  type="checkbox" 
                  id="isDefault" 
                  checked={field.value}
                  onChange={field.onChange}
                  className="w-5 h-5 rounded-md border-border/60 accent-foreground cursor-pointer transition-all group-hover:border-foreground/50" 
                />
                <label htmlFor="isDefault" className="font-medium cursor-pointer text-foreground text-sm select-none">{t("setDefaultLabel")}</label>
              </div>
            )}
          />
        </div>

        {/* Right Column: Kuwait Specific Location */}
        <div className="space-y-6">
          <div className="border-b border-border/40 pb-3 mb-6">
            <h3 className="text-base font-medium text-foreground tracking-tight">{t("deliveryAddress")}</h3>
            <p className="text-xs text-muted-foreground mt-1">{t("deliveryAddressDesc")}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-x-6 gap-y-6">
            <Controller
              control={form.control}
              name="governorate"
              render={({ field, fieldState }) => (
                <Field className="w-full space-y-1.5">
                  <FieldLabel className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{t("governorate")}</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange} >
                    <SelectTrigger className="w-full h-12 bg-secondary/30 border-border/50 text-foreground rounded-xl px-4 transition-colors hover:bg-secondary/50 py-6 rtl:flex-row-reverse ltr:text-left rtl:text-right">
                      <SelectValue placeholder={t("select")} />
                    </SelectTrigger>
                    <SelectContent>
                      {GOVERNORATES.map(gov => (
                        <SelectItem key={gov} value={gov}>{gov}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
            
            <Field className="space-y-1.5">
              <FieldLabel className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{t("area")}</FieldLabel>
              <Input {...form.register('area')} className="h-12 bg-secondary/30 border-border/50 rounded-xl text-sm px-4 transition-colors hover:bg-secondary/50 ltr:text-left rtl:text-right" placeholder={t("areaPlaceholder")} />
              <FieldError errors={[form.formState.errors.area]} />
            </Field>
          </div>

          <div className="grid grid-cols-[1fr_2fr] gap-x-6 gap-y-6">
            <Field className="space-y-1.5">
              <FieldLabel className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Block</FieldLabel>
              <Input {...form.register('block')} className="h-12 bg-secondary/30 border-border/50 text-center rounded-xl text-sm transition-colors hover:bg-secondary/50 ltr:text-left rtl:text-right" placeholder="4" />
              <FieldError errors={[form.formState.errors.block]} />
            </Field>
            <Field className="space-y-1.5">
              <FieldLabel className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Building/House</FieldLabel>
              <Input {...form.register('building')} className="h-12 bg-secondary/30 border-border/50 rounded-xl text-sm px-4 transition-colors hover:bg-secondary/50 ltr:text-left rtl:text-right" placeholder="15" />
              <FieldError errors={[form.formState.errors.building]} />
            </Field>
          </div>

          <Field className="space-y-1.5">
            <FieldLabel className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Street</FieldLabel>
            <Input {...form.register('street')} className="h-12 bg-secondary/30 border-border/50 rounded-xl text-sm px-4 transition-colors hover:bg-secondary/50 ltr:text-left rtl:text-right" placeholder="Salem Al Mubarak" />
            <FieldError errors={[form.formState.errors.street]} />
          </Field>

          <div className="grid grid-cols-2 gap-x-6 gap-y-6">
            <Field className="space-y-1.5">
              <FieldLabel className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Floor/Flat <span className="opacity-70 normal-case tracking-normal">(Optional)</span></FieldLabel>
              <Input {...form.register('floorFlat')} className="h-12 bg-secondary/30 border-border/50 rounded-xl text-sm px-4 transition-colors hover:bg-secondary/50 ltr:text-left rtl:text-right" />
              <FieldError errors={[form.formState.errors.floorFlat]} />
            </Field>
            <Field className="space-y-1.5">
              <FieldLabel className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Landmark <span className="opacity-70 normal-case tracking-normal">(Optional)</span></FieldLabel>
              <Input {...form.register('landmark')} className="h-12 bg-secondary/30 border-border/50 rounded-xl text-sm px-4 transition-colors hover:bg-secondary/50 ltr:text-left rtl:text-right" />
              <FieldError errors={[form.formState.errors.landmark]} />
            </Field>
          </div>
        </div>
      </div>

      <div className="flex gap-4 pt-10 mt-8 justify-end">
        <Button type="button" variant="outline" onClick={onCancel} className="h-12 px-10 rounded-full border-border/50 uppercase tracking-widest text-[11px] font-semibold hover:bg-secondary/50">
          {t("cancel")}
        </Button>
        <Button type="submit" disabled={isSaving} className="h-12 px-12 rounded-full bg-foreground text-background uppercase tracking-widest text-[11px] font-semibold hover:bg-foreground/90 transition-all shadow-lg">
          {isSaving ? <Loader2 className="w-4 h-4 ltr:mr-2 rtl:ml-2 animate-spin" /> : t("saveAddress")}
        </Button>
      </div>
    </form>
  )
}
