"use client"

import { useTranslations } from "next-intl"
import { useRouter, usePathname } from "@/i18n/routing"
import { cn } from "@workspace/ui/lib/utils"
import { Check } from "lucide-react"
import { useParams } from "next/navigation"
import { useTransition } from "react"

export default function LanguagesPage() {
  const t = useTranslations("Languages")
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams()
  const currentLocale = params?.locale as string || "en"
  const [isPending, startTransition] = useTransition()

  const handleLanguageChange = (newLocale: string) => {
    if (newLocale === currentLocale) return
    startTransition(() => {
      // @ts-ignore - The router accepts locale as an option
      router.replace({ pathname }, { locale: newLocale })
    })
  }

  return (
    <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 space-y-1.5">
        <h1 className="text-2xl md:text-3xl font-serif tracking-tight text-foreground">{t("title")}</h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {t("description")}
        </p>
      </div>

      <div className="bg-secondary/20 rounded-2xl border border-border/40 overflow-hidden divide-y divide-border/40 transition-all">
        {/* English Option */}
        <button
          onClick={() => handleLanguageChange('en')}
          disabled={isPending}
          className={cn(
            "w-full flex items-center justify-between px-6 py-5 bg-transparent hover:bg-secondary/40 transition-colors text-left",
            isPending && "opacity-50 cursor-not-allowed"
          )}
        >
          <span className={cn(
            "text-base font-medium transition-colors",
            currentLocale === 'en' ? "text-foreground" : "text-muted-foreground"
          )}>
            {t("english")}
          </span>
          {currentLocale === 'en' && (
            <Check className="w-5 h-5 text-foreground animate-in zoom-in duration-300" />
          )}
        </button>

        {/* Arabic Option */}
        <button
          onClick={() => handleLanguageChange('ar')}
          disabled={isPending}
          className={cn(
            "w-full flex items-center justify-between px-6 py-5 bg-transparent hover:bg-secondary/40 transition-colors text-left",
            isPending && "opacity-50 cursor-not-allowed"
          )}
        >
          <span className={cn(
            "text-base font-medium transition-colors font-arabic-sans",
            currentLocale === 'ar' ? "text-foreground" : "text-muted-foreground"
          )}>
            {t("arabic")}
          </span>
          {currentLocale === 'ar' && (
            <Check className="w-5 h-5 text-foreground animate-in zoom-in duration-300" />
          )}
        </button>
      </div>
    </div>
  )
}
