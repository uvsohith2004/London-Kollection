"use client"

import { useState, useEffect } from "react"
import { useTranslations, useLocale } from "next-intl"
import { Link } from "@/i18n/routing"
import { usePathname } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { cn } from "@workspace/ui/lib/utils"
import { 
  User, 
  Package, 
  MapPin, 
  Star, 
  Bell,
  MonitorSmartphone,
  Globe,
  FileText,
  MessageCircleQuestion,
  HelpCircle,
  ChevronLeft,
  LogOut,
  LayoutDashboard
} from "lucide-react"
import { useLogout } from "@/hooks/use-logout"

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const locale = useLocale()
  
  // Create a locale-stripped pathname for easy comparison
  const strippedPathname = pathname?.replace(new RegExp(`^/${locale}`), '') || '/'
  const isMobileRoot = strippedPathname === "/account"
  
  const [mounted, setMounted] = useState(false)
  const { data: session, isPending } = authClient.useSession()
  const t = useTranslations("Account")
  const tCommon = useTranslations("Common")
  const { logout } = useLogout()

  useEffect(() => {
    setMounted(true)
  }, [])

  const sidebarGroups = [
    {
      label: t("groups.quickActions"),
      items: [
        ...(session?.user?.role === "admin" 
          ? [{ title: "Admin Dashboard", href: "/admin", icon: LayoutDashboard }] 
          : []),
        { title: t("items.orders"), href: "/account/orders", icon: Package },
        { title: t("items.helpCenter"), href: "/account/help", icon: HelpCircle },
      ]
    },
    {
      label: t("groups.account"),
      items: [
        { title: t("items.profileSettings"), href: "/account/profile", icon: User },
        { title: t("items.manageDevices"), href: "/account/devices", icon: MonitorSmartphone },
        { title: t("items.addresses"), href: "/account/addresses", icon: MapPin },
        { title: t("items.languages"), href: "/account/languages", icon: Globe },
      ]
    },
    {
      label: t("groups.preferences"),
      items: [
        { title: t("items.notifications"), href: "/account/notifications", icon: Bell },
        { title: t("items.reviews"), href: "/account/reviews", icon: Star },
      ]
    },
    {
      label: t("groups.support"),
      items: [
        { title: t("items.terms"), href: "/terms", icon: FileText },
        { title: t("items.faq"), href: "/faq", icon: MessageCircleQuestion },
      ]
    }
  ]

  if (!mounted) {
    return (
      <div className="hidden">{children}</div>
    )
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-6 md:py-24 max-w-7xl min-h-screen">
      <div className="flex flex-col md:flex-row md:space-x-12 rtl:space-x-reverse">
        
        {/* Desktop Sidebar (Hidden on mobile) */}
        <aside className="hidden md:block w-full md:w-1/4 lg:w-1/5 shrink-0">
          <div className="mb-8">
            <h2 className="text-2xl font-serif tracking-tight">{t("title")}</h2>
          </div>
          
          <div className="flex flex-col gap-6">
            {sidebarGroups.map((group, index) => (
              <div key={index} className="flex flex-col gap-2">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">
                  {group.label}
                </h3>
                <nav className="flex flex-col space-y-1">
                  {group.items.map((item) => {
                    const isActive = strippedPathname === item.href || (item.href !== '/account' && item.href !== '/account/profile' && strippedPathname.startsWith(`${item.href}/`))
                    return (
                      <Link
                        key={item.href}
                        href={item.href as any}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all",
                          isActive
                            ? "bg-secondary/50 text-foreground font-semibold"
                            : "text-muted-foreground hover:bg-secondary/30 hover:text-foreground"
                        )}
                      >
                        <item.icon className={cn("w-4 h-4", isActive ? "text-foreground" : "text-muted-foreground")} />
                        <span>{item.title}</span>
                      </Link>
                    )
                  })}
                </nav>
              </div>
            ))}
          </div>

          <div className="mt-8 border-t border-border/40 pt-6">
            <button
              onClick={() => logout()}
              className="flex w-full items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-destructive hover:bg-destructive/10 transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>{t("signOut")}</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 w-full">
          {/* Mobile Back Button (Visible on subpages) */}
          {!isMobileRoot && (
            <div className="md:hidden mb-6 flex items-center">
              <Link href="/account" className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2">
                <ChevronLeft className="w-5 h-5 mr-1 rtl:rotate-180" /> {tCommon("backToAccount")}
              </Link>
            </div>
          )}
          {children}
        </main>
        
      </div>
    </div>
  )
}
