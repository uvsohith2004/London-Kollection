"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@workspace/ui/lib/utils"

const sidebarNavItems = [
  { title: "General", href: "/admin/settings" },
  { title: "Payments", href: "/admin/settings/payments" },
  { title: "Emails", href: "/admin/settings/emails" },
  { title: "Team & Roles", href: "/admin/settings/team" },
  { title: "Audit Logs", href: "/admin/settings/audit" },
]

interface SettingsLayoutProps {
  children: React.ReactNode
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  const pathname = usePathname()

  return (
    <div className="flex w-full flex-col font-sans">
      
      {/* Settings Header - Matches our Audit page styling */}
      <div className="mb-8 flex flex-col items-start gap-2">
        <h1 className="font-heading text-3xl font-light tracking-tight text-foreground uppercase">
          Registry
        </h1>
        <p className="text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
          System Preferences & Configuration
        </p>
      </div>

      {/* Horizontal Navigation Bar */}
      <div className="mb-8 border-b border-border/60">
        <nav className="flex w-full overflow-x-auto no-scrollbar">
          {sidebarNavItems.map((item) => {
            // Exact match for base /settings route, starts-with for sub-routes
            const isActive = item.href === "/admin/settings" 
              ? pathname === item.href 
              : pathname.startsWith(item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex h-14 shrink-0 items-center justify-center border-b-2 px-6 text-xs font-bold tracking-[0.2em] uppercase transition-all duration-300",
                  isActive
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:border-border/60 hover:text-foreground"
                )}
              >
                {item.title}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Settings Content Area */}
      <div className="w-full animate-in fade-in duration-500">
        <div className="mx-auto w-full max-w-5xl">
          {children}
        </div>
      </div>
      
    </div>
  )
}
