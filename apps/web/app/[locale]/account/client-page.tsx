"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { useRouter, Link } from "@/i18n/routing"

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
  LogOut,
  LayoutDashboard
} from "lucide-react"
import { useLogout } from "@/hooks/use-logout"
import { authClient } from "@/lib/auth-client"

export default function AccountMobileMenuPage() {
  const { data: session } = authClient.useSession()
  const router = useRouter()
  const t = useTranslations("Account")
  const [mounted, setMounted] = useState(false)
  const { logout } = useLogout()

  useEffect(() => {
    setMounted(true)
    if (window.innerWidth >= 768) {
      router.replace("/account/profile")
    }
  }, [router])

  if (!mounted) {
    return null // wait for mount to prevent hydration mismatch on screen size
  }

  const mobileMenuGroups = [
    {
      label: t("groups.quickActions"),
      items: [
        ...(session?.user?.role === "admin" 
          ? [{ title: "Admin Dashboard", href: "/admin", icon: LayoutDashboard }] 
          : []),
        { title: t("items.orders"), href: "/account/orders", icon: Package },
        { title: t("items.helpCenter"), href: "/account/help", icon: HelpCircle },
      ],
    },
    {
      label: t("groups.account"),
      items: [
        { title: t("items.profileSettings"), href: "/account/profile", icon: User },
        {
          title: t("items.manageDevices"),
          href: "/account/devices",
          icon: MonitorSmartphone,
        },
        { title: t("items.addresses"), href: "/account/addresses", icon: MapPin },
        { title: t("items.languages"), href: "/account/languages", icon: Globe },
      ],
    },
    {
      label: t("groups.preferences"),
      items: [
        { title: t("items.notifications"), href: "/account/notifications", icon: Bell },

      ],
    },
    {
      label: t("groups.support"),
      items: [
        { title: t("items.terms"), href: "/terms", icon: FileText },
        { title: t("items.faq"), href: "/faq", icon: MessageCircleQuestion },
      ],
    },
  ]

  return (
    <div className="flex w-full animate-in flex-col gap-6 duration-300 fade-in md:hidden">
      <div className="mb-4">
        <h1 className="font-serif text-3xl tracking-tight">{t("title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("description")}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {mobileMenuGroups.map((group, index) => (
          <div
            key={index}
            className="flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm"
          >
            <div className="border-b border-border/50 bg-muted/30 px-4 py-3">
              <h3 className="text-xs font-semibold tracking-wider text-foreground/80 uppercase">
                {group.label}
              </h3>
            </div>
            <div className="flex flex-col divide-y divide-border/30">
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href as any}
                  className="group flex items-center gap-4 px-4 py-4 transition-colors hover:bg-secondary/20"
                >
                  <div className="rounded-full bg-secondary/50 p-2 transition-colors group-hover:bg-foreground group-hover:text-background">
                    <item.icon className="h-5 w-5 text-foreground transition-colors group-hover:text-background" />
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {item.title}
                  </span>
                  <div className="ml-auto opacity-50 transition-all rtl:-translate-x-1 ltr:group-hover:translate-x-1 rtl:group-hover:-translate-x-1 group-hover:opacity-100">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="rtl:rotate-180"
                    >
                      <path
                        d="M9 18L15 12L9 6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 mb-20 px-4">
        <button
          onClick={() => logout()}
          className="flex w-full items-center justify-center gap-3 py-4 rounded-xl text-sm font-bold tracking-widest uppercase text-destructive border border-destructive/20 bg-destructive/5 hover:bg-destructive/10 transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span>{t("signOut")}</span>
        </button>
      </div>
    </div>
  )
}
