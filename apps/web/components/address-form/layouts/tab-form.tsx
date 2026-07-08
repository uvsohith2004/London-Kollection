import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Loader2 } from "lucide-react"
import { PhoneInput } from "@/components/phone-input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { Field, FieldError, FieldLabel } from "@workspace/ui/components/field"
import { GOVERNORATES, AddressFormValues } from "../index"
import { UseFormReturn, Controller } from "react-hook-form"

import { useTranslations } from "next-intl"

export default function TabAddressForm({ 
  form, onSubmit, isSaving, onCancel 
}: any) {
  const t = useTranslations("AddressForm")
  return (
    <form onSubmit={onSubmit} className="space-y-8 animate-in fade-in duration-300 pb-2">
      
      <div className="space-y-5">
        <Field className="space-y-1.5">
          <FieldLabel className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{t("fullName")}</FieldLabel>
          <Input {...form.register('name')} className="h-12 bg-secondary/30 border-border/50 rounded-xl text-sm px-4 focus-visible:ring-primary/20 ltr:text-left rtl:text-right" placeholder={t("fullNamePlaceholder")} />
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
                className="h-12 bg-secondary/30 rounded-xl [&>input]:rounded-e-xl [&>button]:rounded-s-xl [&>button]:border-border/50 [&>input]:border-border/50 text-sm [&>input]:bg-transparent"
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
      </div>

      <div className="border-t border-border/30 pt-2" />

      <div className="grid grid-cols-2 gap-x-5 gap-y-5">
        <Controller
          control={form.control}
          name="governorate"
          render={({ field, fieldState }) => (
            <Field className="w-full space-y-1.5">
              <FieldLabel className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{t("governorate")}</FieldLabel>
              <Select value={field.value} onValueChange={field.onChange} >
                <SelectTrigger className="w-full h-12 bg-secondary/30 border-border/50 rounded-xl text-foreground px-4 py-6.75 rtl:flex-row-reverse ltr:text-left rtl:text-right">
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
          <Input {...form.register('area')} className="h-12 bg-secondary/30 border-border/50 rounded-xl text-sm px-4 ltr:text-left rtl:text-right" placeholder={t("areaPlaceholder")} />
          <FieldError errors={[form.formState.errors.area]} />
        </Field>
      </div>

      <div className="grid grid-cols-[1fr_2fr] gap-x-5 gap-y-5">
        <Field className="space-y-1.5">
          <FieldLabel className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{t("block")}</FieldLabel>
          <Input {...form.register('block')} className="h-12 bg-secondary/30 border-border/50 rounded-xl text-center text-sm ltr:text-left rtl:text-right" />
          <FieldError errors={[form.formState.errors.block]} />
        </Field>
        <Field className="space-y-1.5">
          <FieldLabel className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{t("street")}</FieldLabel>
          <Input {...form.register('street')} className="h-12 bg-secondary/30 border-border/50 rounded-xl text-sm px-4 ltr:text-left rtl:text-right" />
          <FieldError errors={[form.formState.errors.street]} />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-x-5 gap-y-5">
        <Field className="space-y-1.5">
          <FieldLabel className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{t("avenue")} <span className="opacity-70 normal-case tracking-normal">{t("opt")}</span></FieldLabel>
          <Input {...form.register('avenue')} className="h-12 bg-secondary/30 border-border/50 rounded-xl text-sm px-4 ltr:text-left rtl:text-right" />
          <FieldError errors={[form.formState.errors.avenue]} />
        </Field>
        <Field className="space-y-1.5">
          <FieldLabel className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{t("building")}</FieldLabel>
          <Input {...form.register('building')} className="h-12 bg-secondary/30 border-border/50 rounded-xl text-sm px-4 ltr:text-left rtl:text-right" />
          <FieldError errors={[form.formState.errors.building]} />
        </Field>
      </div>

      <div className="grid grid-cols-3 gap-x-4 gap-y-5">
        <Field className="space-y-1.5">
          <FieldLabel className="text-xs font-medium uppercase tracking-wider text-muted-foreground w-full text-center block">{t("floor")} <span className="opacity-70 normal-case tracking-normal">{t("opt")}</span></FieldLabel>
          <Input {...form.register('floor')} className="h-12 bg-secondary/30 border-border/50 rounded-xl text-center text-sm ltr:text-left rtl:text-right" />
          <FieldError errors={[form.formState.errors.floor]} />
        </Field>
        <Field className="space-y-1.5">
          <FieldLabel className="text-xs font-medium uppercase tracking-wider text-muted-foreground w-full text-center block">{t("flat")} <span className="opacity-70 normal-case tracking-normal">{t("opt")}</span></FieldLabel>
          <Input {...form.register('flat')} className="h-12 bg-secondary/30 border-border/50 rounded-xl text-center text-sm ltr:text-left rtl:text-right" />
          <FieldError errors={[form.formState.errors.flat]} />
        </Field>
        <Field className="space-y-1.5">
          <FieldLabel className="text-xs font-medium uppercase tracking-wider text-muted-foreground w-full text-center block">{t("paci")} <span className="opacity-70 normal-case tracking-normal">{t("opt")}</span></FieldLabel>
          <Input {...form.register('paci')} className="h-12 bg-secondary/30 border-border/50 rounded-xl text-center text-sm ltr:text-left rtl:text-right" />
          <FieldError errors={[form.formState.errors.paci]} />
        </Field>
      </div>

      <Field className="space-y-1.5">
        <FieldLabel className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{t("extraDirections")} <span className="opacity-70 normal-case tracking-normal">{t("opt")}</span></FieldLabel>
        <Input {...form.register('directions')} className="h-12 bg-secondary/30 border-border/50 rounded-xl text-sm px-4 ltr:text-left rtl:text-right" />
        <FieldError errors={[form.formState.errors.directions]} />
      </Field>

      <Controller
        control={form.control}
        name="isDefault"
        render={({ field }) => (
          <div className="flex items-center gap-3 pt-3 pb-2 cursor-pointer group">
            <input 
              type="checkbox" 
              id="isDefault-tab" 
              checked={field.value}
              onChange={field.onChange}
              className="w-5 h-5 rounded-md border-border/60 cursor-pointer accent-foreground transition-all group-hover:border-foreground/50" 
            />
            <label htmlFor="isDefault-tab" className="font-medium cursor-pointer text-foreground text-sm select-none">{t("setDefaultLabel")}</label>
          </div>
        )}
      />

      <div className="flex gap-4 pt-6 mt-6">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1 h-12 rounded-xl text-[12px] uppercase tracking-widest font-semibold border-border/50 hover:bg-secondary/50">
          {t("cancel")}
        </Button>
        <Button type="submit" disabled={isSaving} className="flex-1 h-12 rounded-xl bg-foreground text-background text-[12px] uppercase tracking-widest font-semibold shadow-lg hover:bg-foreground/90 transition-all">
          {isSaving ? <Loader2 className="w-4 h-4 ltr:mr-2 rtl:ml-2 animate-spin" /> : t("saveAddress")}
        </Button>
      </div>
    </form>
  )
}
