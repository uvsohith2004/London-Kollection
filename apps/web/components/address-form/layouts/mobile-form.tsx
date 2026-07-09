import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Loader2 } from "lucide-react"
import { PhoneInput } from "@/components/phone-input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { Field, FieldError, FieldLabel } from "@workspace/ui/components/field"
import { GOVERNORATES, AddressFormValues } from "../index"
import { UseFormReturn, Controller } from "react-hook-form"

import { useTranslations } from "next-intl"

export default function MobileAddressForm({ 
  form, onSubmit, isSaving, onCancel 
}: any) {
  const t = useTranslations("AddressForm")
  return (
    <form onSubmit={onSubmit} className="space-y-6 animate-in fade-in duration-300 pb-4">
      
      <div className="space-y-5">
        <Field className="space-y-1.5">
          <FieldLabel className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{t("fullName")}</FieldLabel>
          <Input {...form.register('name')} className="h-14 bg-secondary/40 border-border/40 rounded-2xl text-base px-4 focus-visible:ring-primary/20 transition-colors ltr:text-left rtl:text-right" placeholder={t("fullNamePlaceholder")} />
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
                className="h-14 bg-secondary/40 rounded-2xl [&>input]:rounded-e-2xl [&>button]:rounded-s-2xl [&>button]:border-border/40 [&>input]:border-border/40 [&>input]:bg-transparent transition-colors"
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
      </div>

      <div className="border-t border-border/30 pt-1" />

      <div className="grid grid-cols-2 gap-4">
        <Controller
          control={form.control}
          name="governorate"
          render={({ field, fieldState }) => (
            <Field className="w-full space-y-1.5">
              <FieldLabel className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{t("governorate")}</FieldLabel>
              <Select value={field.value} onValueChange={field.onChange} >
                <SelectTrigger className="w-full h-14 bg-secondary/40 border-border/40 rounded-2xl text-foreground text-base px-4 transition-colors py-6.75 rtl:flex-row-reverse ltr:text-left rtl:text-right">
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
          <Input {...form.register('area')} className="h-14 bg-secondary/40 border-border/40 rounded-2xl text-base px-4 transition-colors ltr:text-left rtl:text-right" placeholder={t("areaPlaceholder")} />
          <FieldError errors={[form.formState.errors.area]} />
        </Field>
      </div>

      <div className="grid grid-cols-[1fr_1.5fr] gap-4">
        <Field className="space-y-1.5">
          <FieldLabel className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Block</FieldLabel>
          <Input {...form.register('block')} className="h-14 bg-secondary/40 border-border/40 rounded-2xl text-center text-base transition-colors ltr:text-left rtl:text-right" />
          <FieldError errors={[form.formState.errors.block]} />
        </Field>
        <Field className="space-y-1.5">
          <FieldLabel className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Building/House</FieldLabel>
          <Input {...form.register('building')} className="h-14 bg-secondary/40 border-border/40 rounded-2xl text-base px-4 transition-colors ltr:text-left rtl:text-right" />
          <FieldError errors={[form.formState.errors.building]} />
        </Field>
      </div>

      <Field className="space-y-1.5">
        <FieldLabel className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Street</FieldLabel>
        <Input {...form.register('street')} className="h-14 bg-secondary/40 border-border/40 rounded-2xl text-base px-4 transition-colors ltr:text-left rtl:text-right" />
        <FieldError errors={[form.formState.errors.street]} />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field className="space-y-1.5">
          <FieldLabel className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Floor/Flat <span className="opacity-70 normal-case tracking-normal">(Optional)</span></FieldLabel>
          <Input {...form.register('floorFlat')} className="h-14 bg-secondary/40 border-border/40 rounded-2xl text-base px-4 transition-colors ltr:text-left rtl:text-right" />
          <FieldError errors={[form.formState.errors.floorFlat]} />
        </Field>
        <Field className="space-y-1.5">
          <FieldLabel className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Landmark <span className="opacity-70 normal-case tracking-normal">(Optional)</span></FieldLabel>
          <Input {...form.register('landmark')} className="h-14 bg-secondary/40 border-border/40 rounded-2xl text-base px-4 transition-colors ltr:text-left rtl:text-right" />
          <FieldError errors={[form.formState.errors.landmark]} />
        </Field>
      </div>

      <Controller
        control={form.control}
        name="isDefault"
        render={({ field }) => (
          <div className="flex items-center gap-3 pt-2 pb-4">
            <input 
              type="checkbox" 
              id="isDefault-mobile" 
              checked={field.value}
              onChange={field.onChange}
              className="w-6 h-6 rounded-md border-border/60 cursor-pointer accent-foreground" 
            />
            <label htmlFor="isDefault-mobile" className="font-medium cursor-pointer text-foreground text-sm">{t("setDefaultLabel")}</label>
          </div>
        )}
      />

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1 h-14 rounded-full text-[14px] font-medium border-border/50 bg-transparent hover:bg-secondary/40 transition-colors">
          {t("cancel")}
        </Button>
        <Button type="submit" disabled={isSaving} className="flex-1 h-14 rounded-full bg-foreground text-background text-[14px] font-medium shadow-lg transition-colors">
          {isSaving ? <Loader2 className="w-5 h-5 ltr:mr-2 rtl:ml-2 animate-spin" /> : t("saveAddress")}
        </Button>
      </div>
    </form>
  )
}
