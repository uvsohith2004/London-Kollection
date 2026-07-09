import { useFormContext, Controller } from "react-hook-form";
import { Input } from "@workspace/ui/components/input";
import { PhoneInput } from "@/components/phone-input";
import { Field, FieldError, FieldLabel } from "@workspace/ui/components/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { useTranslations } from "next-intl";

export const KUWAIT_GOVERNORATES = [
  "Al Asimah",
  "Hawalli",
  "Farwaniya",
  "Mubarak Al-Kabeer",
  "Ahmadi",
  "Jahra",
];

export function AddressForm({ prefix = "" }: { prefix?: string }) {
  const { register, formState: { errors }, setValue, watch, control } = useFormContext();
  const t = useTranslations("AddressForm");

  const getFieldName = (field: string) => (prefix ? `${prefix}.${field}` : field);
  const getError = (field: string) => {
    if (!prefix) return errors[field] as any;
    const prefixErrors = errors[prefix] as Record<string, any>;
    return prefixErrors?.[field] as any;
  };

  const governorateValue = watch(getFieldName("governorate"));

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-4">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_1.5fr] gap-x-16 gap-y-10">
        
        {/* Left Column: Contact & General */}
        <div className="space-y-6">
          <div className="border-b border-border/40 pb-3 mb-6 hidden md:block">
            <h3 className="text-base font-medium text-foreground tracking-tight">{t("contactInfo")}</h3>
            <p className="text-xs text-muted-foreground mt-1">{t("contactInfoDesc")}</p>
          </div>
          
          <Field className="space-y-1.5">
            <FieldLabel className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{t("fullName")}</FieldLabel>
            <Input 
              {...register(getFieldName("name"))} 
              className="h-14 md:h-12 bg-secondary/40 md:bg-secondary/30 border-border/40 md:border-border/50 focus-visible:ring-primary/20 text-base md:text-sm rounded-2xl md:rounded-xl px-4 transition-colors hover:bg-secondary/50 ltr:text-left rtl:text-right" 
              placeholder={t("fullNamePlaceholder")} 
            />
            <FieldError errors={[getError("name")]} />
          </Field>
          
          <Controller
            control={control}
            name={getFieldName("phone")}
            render={({ field, fieldState }) => (
              <Field className="space-y-1.5">
                <FieldLabel className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{t("mobileNumber")}</FieldLabel>
                <PhoneInput 
                  value={field.value}
                  onChange={(val) => field.onChange(val ? val.toString() : "")}
                  defaultCountry="KW"
                  className="h-14 md:h-12 bg-secondary/40 md:bg-secondary/30 rounded-2xl md:rounded-xl [&>input]:rounded-e-2xl md:[&>input]:rounded-e-xl [&>button]:rounded-s-2xl md:[&>button]:rounded-s-xl [&>button]:border-border/40 md:[&>button]:border-border/50 [&>input]:border-border/40 md:[&>input]:border-border/50 text-base md:text-sm [&>input]:bg-transparent transition-colors hover:[&>input]:bg-secondary/50"
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
        </div>

        {/* Right Column: Kuwait Specific Location */}
        <div className="space-y-6">
          <div className="border-b border-border/40 pb-3 mb-6 hidden md:block">
            <h3 className="text-base font-medium text-foreground tracking-tight">{t("deliveryAddress")}</h3>
            <p className="text-xs text-muted-foreground mt-1">{t("deliveryAddressDesc")}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-x-4 md:gap-x-6 gap-y-6">
            <Controller
              control={control}
              name={getFieldName("governorate")}
              render={({ field, fieldState }) => (
                <Field className="w-full space-y-1.5">
                  <FieldLabel className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{t("governorate")}</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange} >
                    <SelectTrigger className="w-full h-14 md:h-12 bg-secondary/40 md:bg-secondary/30 border-border/40 md:border-border/50 text-foreground text-base md:text-sm rounded-2xl md:rounded-xl px-4 transition-colors hover:bg-secondary/50 py-6 md:py-6 rtl:flex-row-reverse ltr:text-left rtl:text-right">
                      <SelectValue placeholder={t("select")} />
                    </SelectTrigger>
                    <SelectContent>
                      {KUWAIT_GOVERNORATES.map(gov => (
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
              <Input 
                {...register(getFieldName("area"))} 
                className="h-14 md:h-12 bg-secondary/40 md:bg-secondary/30 border-border/40 md:border-border/50 rounded-2xl md:rounded-xl text-base md:text-sm px-4 transition-colors hover:bg-secondary/50 ltr:text-left rtl:text-right" 
                placeholder={t("areaPlaceholder")} 
              />
              <FieldError errors={[getError("area")]} />
            </Field>
          </div>

          <div className="grid grid-cols-[1fr_1.5fr] md:grid-cols-[1fr_2fr] gap-x-4 md:gap-x-6 gap-y-6">
            <Field className="space-y-1.5">
              <FieldLabel className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Block</FieldLabel>
              <Input 
                {...register(getFieldName("block"))} 
                className="h-14 md:h-12 bg-secondary/40 md:bg-secondary/30 border-border/40 md:border-border/50 text-center rounded-2xl md:rounded-xl text-base md:text-sm transition-colors hover:bg-secondary/50 ltr:text-left rtl:text-right" 
                placeholder="4" 
              />
              <FieldError errors={[getError("block")]} />
            </Field>
            <Field className="space-y-1.5">
              <FieldLabel className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Building/House</FieldLabel>
              <Input 
                {...register(getFieldName("building"))} 
                className="h-14 md:h-12 bg-secondary/40 md:bg-secondary/30 border-border/40 md:border-border/50 rounded-2xl md:rounded-xl text-base md:text-sm px-4 transition-colors hover:bg-secondary/50 ltr:text-left rtl:text-right" 
                placeholder="15" 
              />
              <FieldError errors={[getError("building")]} />
            </Field>
          </div>

          <Field className="space-y-1.5">
            <FieldLabel className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Street</FieldLabel>
            <Input 
              {...register(getFieldName("street"))} 
              className="h-14 md:h-12 bg-secondary/40 md:bg-secondary/30 border-border/40 md:border-border/50 rounded-2xl md:rounded-xl text-base md:text-sm px-4 transition-colors hover:bg-secondary/50 ltr:text-left rtl:text-right" 
              placeholder="Salem Al Mubarak" 
            />
            <FieldError errors={[getError("street")]} />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 md:gap-x-6 gap-y-6">
            <Field className="space-y-1.5">
              <FieldLabel className="text-xs font-medium uppercase tracking-wider text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis">Floor/Flat <span className="opacity-70 normal-case tracking-normal">(Optional)</span></FieldLabel>
              <Input 
                {...register(getFieldName("floorFlat"))} 
                className="h-14 md:h-12 bg-secondary/40 md:bg-secondary/30 border-border/40 md:border-border/50 rounded-2xl md:rounded-xl text-base md:text-sm px-4 transition-colors hover:bg-secondary/50 ltr:text-left rtl:text-right" 
              />
              <FieldError errors={[getError("floorFlat")]} />
            </Field>
            <Field className="space-y-1.5">
              <FieldLabel className="text-xs font-medium uppercase tracking-wider text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis">Landmark <span className="opacity-70 normal-case tracking-normal">(Optional)</span></FieldLabel>
              <Input 
                {...register(getFieldName("landmark"))} 
                className="h-14 md:h-12 bg-secondary/40 md:bg-secondary/30 border-border/40 md:border-border/50 rounded-2xl md:rounded-xl text-base md:text-sm px-4 transition-colors hover:bg-secondary/50 ltr:text-left rtl:text-right" 
              />
              <FieldError errors={[getError("landmark")]} />
            </Field>
          </div>
        </div>
      </div>
    </div>
  );
}
