import { Button, buttonVariants } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Loader2, Camera, User, CalendarIcon } from "lucide-react"
import { PhoneInput } from "@/components/phone-input"
import { UserAvatar } from "@/components/user-avatar"
import { Calendar } from "@workspace/ui/components/calendar"
import { ThemeSelector } from "../components/theme-selector"
import { Popover, PopoverContent, PopoverTrigger } from "@workspace/ui/components/popover"
import { format } from "date-fns"
import { cn } from "@workspace/ui/lib/utils"
import { useRef } from "react"
import { useTranslations } from "next-intl"
import { ProfileFormProps } from "./desktop-layout"

export default function TabProfileLayout({ session, formData, setFormData, handleSubmit, isLoading, uploadAvatarMutation, onAvatarFileSelect }: ProfileFormProps) {
  const t = useTranslations("Profile")
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onAvatarFileSelect(file)
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="max-w-2xl pb-10">
      <div className="mb-8">
        <h1 className="text-2xl font-serif tracking-tight mb-2 text-foreground">{t("title")}</h1>
        <p className="text-muted-foreground text-sm font-light">
          {t("description")}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-8 bg-card border border-border p-8 rounded-2xl shadow-sm">
        <div className="flex items-center gap-6">
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <UserAvatar user={session?.user} className="w-24 h-24 border border-border/40 shadow-sm" iconClassName="w-10 h-10" />
            <div className={cn("absolute inset-0 bg-black/40 rounded-full flex items-center justify-center transition-opacity", uploadAvatarMutation.isPending ? "opacity-100" : "opacity-0 group-hover:opacity-100")}>
              {uploadAvatarMutation.isPending ? (
                <Loader2 className="w-5 h-5 text-white animate-spin" />
              ) : (
                <Camera className="w-5 h-5 text-white" />
              )}
            </div>
          </div>
          <div>
            <h3 className="font-medium text-foreground">{t("photoTitle")}</h3>
            <p className="text-xs text-muted-foreground mt-1">{t("photoDesc")}</p>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handleFileChange} 
          />
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-6">
          <div className="space-y-2 col-span-2 md:col-span-1">
            <Label htmlFor="email-tab" className="text-muted-foreground text-sm">{t("email")}</Label>
            <Input 
              id="email-tab"
              value={session?.user?.email || ""}
              disabled
              className="bg-muted text-muted-foreground border-border/50 rounded-xl h-12 ltr:text-left rtl:text-right"
            />
          </div>

          <div className="space-y-2 col-span-2 md:col-span-1">
            <Label htmlFor="name-tab" className="text-foreground text-sm">{t("name")}</Label>
            <Input 
              id="name-tab"
              value={formData.name}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, name: e.target.value }))}
              placeholder={t("namePlaceholder")}
              className="rounded-xl h-12 border-border/50 bg-background text-foreground ltr:text-left rtl:text-right"
              required
            />
          </div>

          <div className="space-y-2 col-span-2 md:col-span-1">
            <Label htmlFor="phone-tab" className="text-foreground text-sm">{t("phone")}</Label>
            <PhoneInput 
              id="phone-tab"
              value={formData.phone}
              onChange={(val) => setFormData((prev: any) => ({ ...prev, phone: val || "" }))}
              placeholder={t("phonePlaceholder")}
              className="rounded-xl h-12 bg-background focus-within:ring-1 focus-within:ring-primary/20 focus-within:border-primary/20"
            />
          </div>

          <div className="space-y-2 col-span-2 md:col-span-1">
            <Label className="text-foreground text-sm">{t("gender")}</Label>
            <Select 
              value={formData.gender} 
              onValueChange={(val) => setFormData((prev: any) => ({ ...prev, gender: val || "" }))}
            >
              <SelectTrigger className="h-12! w-full rounded-xl border-border/50 bg-background text-foreground rtl:flex-row-reverse ltr:text-left rtl:text-right">
                <SelectValue placeholder={t("selectGender")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="female">{t("female")}</SelectItem>
                <SelectItem value="male">{t("male")}</SelectItem>
                <SelectItem value="non-binary">{t("nonBinary")}</SelectItem>
                <SelectItem value="prefer-not-to-say">{t("preferNotToSay")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 col-span-2 md:col-span-1 flex flex-col">
            <Label htmlFor="dob-tab" className="text-foreground text-sm">{t("dob")}</Label>
            <Popover>
              <PopoverTrigger
                id="dob-tab"
                type="button"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "w-full justify-start rtl:flex-row-reverse ltr:text-left rtl:text-right font-normal rounded-xl h-12 border-border/50 bg-background",
                  !formData.dateOfBirth ? "text-muted-foreground" : "text-foreground"
                )}
              >
                <CalendarIcon className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
                {formData.dateOfBirth ? format(new Date(formData.dateOfBirth + "T00:00:00"), "PPP") : <span>{t("pickDate")}</span>}
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.dateOfBirth ? new Date(formData.dateOfBirth + "T00:00:00") : undefined}
                  onSelect={(d) => setFormData((prev: any) => ({ ...prev, dateOfBirth: d ? format(d, 'yyyy-MM-dd') : "" }))}
                  defaultMonth={formData.dateOfBirth ? new Date(formData.dateOfBirth + "T00:00:00") : new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="pt-6 mt-2 border-t border-border">
          <ThemeSelector />
        </div>

        <div className="pt-6 mt-2 border-t border-border flex justify-end">
          <Button 
            type="submit" 
            disabled={isLoading}
            className="h-12 px-8 rounded-xl bg-foreground text-background font-medium hover:bg-foreground/90 uppercase tracking-widest text-[11px]"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 ltr:mr-2 rtl:ml-2 animate-spin" />
                {t("saving")}
              </>
            ) : t("saveChanges")}
          </Button>
        </div>
      </form>
    </div>
  )
}
