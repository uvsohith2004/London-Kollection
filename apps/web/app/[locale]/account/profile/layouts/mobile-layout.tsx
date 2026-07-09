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

export default function MobileProfileLayout({ session, formData, setFormData, handleSubmit, isLoading, uploadAvatarMutation, onAvatarFileSelect }: ProfileFormProps) {
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
    <div className="flex flex-col min-h-[calc(100vh-4rem)] pb-24 text-foreground">
      <div className="mb-8 px-4">
        <h1 className="text-2xl font-serif tracking-tight mb-2">{t("title")}</h1>
        <p className="text-muted-foreground font-light text-sm">
          {t("description")}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6 px-4 flex-1">
        
        <div className="flex flex-col items-center justify-center py-4 mb-2">
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <UserAvatar user={session?.user} className="w-20 h-20 border border-border/40 shadow-sm mx-auto" iconClassName="w-8 h-8" />
            <div className={cn("absolute inset-0 bg-black/40 rounded-full flex items-center justify-center transition-opacity", uploadAvatarMutation.isPending ? "opacity-100" : "opacity-0 group-hover:opacity-100")}>
              {uploadAvatarMutation.isPending ? (
                <Loader2 className="w-6 h-6 text-white animate-spin" />
              ) : (
                <button type="button" className="w-8 h-8 bg-foreground rounded-full flex items-center justify-center text-background shadow-md active:scale-95 transition-transform pointer-events-none">
                  <Camera className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handleFileChange} 
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="name-mobile" className="text-sm font-medium">{t("name")}</Label>
          <Input 
            id="name-mobile"
            value={formData.name}
            onChange={(e) => setFormData((prev: any) => ({ ...prev, name: e.target.value }))}
            placeholder={t("namePlaceholder")}
            className="rounded-xl h-14 border-border bg-card px-4 text-base ltr:text-left rtl:text-right"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email-mobile" className="text-sm font-medium">{t("email")}</Label>
          <Input 
            id="email-mobile"
            value={session?.user?.email || ""}
            disabled
            className="rounded-xl h-14 border-border bg-secondary/50 px-4 text-base text-muted-foreground ltr:text-left rtl:text-right"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone-mobile" className="text-sm font-medium">{t("phone")}</Label>
          <PhoneInput 
            id="phone-mobile"
            value={formData.phone}
            onChange={(val) => setFormData((prev: any) => ({ ...prev, phone: val || "" }))}
            placeholder={t("phonePlaceholder")}
            className="rounded-xl h-14 bg-card [&>input]:rounded-e-xl [&>button]:rounded-s-xl [&>button]:border-border [&>input]:border-border focus-within:ring-1 focus-within:ring-primary/20 focus-within:border-primary/20"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">{t("gender")}</Label>
          <Select 
            value={formData.gender} 
            onValueChange={(val) => setFormData((prev: any) => ({ ...prev, gender: val || "" }))}
          >
            <SelectTrigger className="h-14! w-full rounded-xl border-border bg-card px-4 text-base rtl:flex-row-reverse ltr:text-left rtl:text-right">
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

        <div className="space-y-2 flex flex-col pb-4">
          <Label htmlFor="dob-mobile" className="text-sm font-medium">{t("dob")}</Label>
          <Popover>
            <PopoverTrigger
              id="dob-mobile"
              type="button"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "w-full justify-start rtl:flex-row-reverse ltr:text-left rtl:text-right font-normal rounded-xl h-14 border-border bg-card px-4 text-base",
                !formData.dateOfBirth ? "text-muted-foreground" : "text-foreground"
              )}
            >
              <CalendarIcon className="ltr:mr-3 rtl:ml-3 h-5 w-5 opacity-70" />
              {formData.dateOfBirth ? format(new Date(formData.dateOfBirth + "T00:00:00"), "PPP") : <span>{t("pickDate")}</span>}
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="center">
              <Calendar
                mode="single"
                selected={formData.dateOfBirth ? new Date(formData.dateOfBirth + "T00:00:00") : undefined}
                onSelect={(d) => setFormData((prev: any) => ({ ...prev, dateOfBirth: d ? format(d, 'yyyy-MM-dd') : "" }))}
                defaultMonth={formData.dateOfBirth ? new Date(formData.dateOfBirth + "T00:00:00") : new Date()}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="pb-8">
          <ThemeSelector />
        </div>

        <div className="fixed bottom-16 left-0 right-0 p-4 bg-background/80 backdrop-blur-xl border-t border-border z-10 md:hidden pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full h-14 rounded-xl bg-foreground text-background font-medium hover:bg-foreground/90 uppercase tracking-widest text-sm transition-colors shadow-lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 ltr:mr-2 rtl:ml-2 animate-spin" />
                {t("saving")}
              </>
            ) : t("saveChanges")}
          </Button>
        </div>
      </form>
    </div>
  )
}
