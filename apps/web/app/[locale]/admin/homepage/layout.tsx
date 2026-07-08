"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@workspace/ui/lib/utils"

const sidebarNavItems = [
  { title: "Hero Carousel", href: "/admin/homepage" },
  { title: "Flash Sale", href: "/admin/homepage/flash-sale" },
  { title: "Featured Pieces", href: "/admin/homepage/featured-pieces" },
  { title: "Featured Collections", href: "/admin/homepage/featured-collections" },
]

export default function HomepageLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex w-full flex-col font-sans">
      {/* Header */}
      <div className="mb-8 flex flex-col items-start gap-2">
        <h1 className="font-heading text-3xl font-light tracking-tight text-foreground uppercase">
          Storefront
        </h1>
        <p className="text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
          Manage Homepage Sections & Promotions
        </p>
      </div>

      {/* Horizontal Navigation Bar */}
      <div className="mb-8 border-b border-border/60">
        <nav className="flex w-full overflow-x-auto no-scrollbar">
          {sidebarNavItems.map((item) => {
            const isActive = item.href === "/admin/homepage"
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

      {/* Content Area */}
      <div className="w-full animate-in fade-in duration-500">
        <div className="mx-auto w-full max-w-5xl">
          {children}
        </div>
      </div>
    </div>
  )
}
