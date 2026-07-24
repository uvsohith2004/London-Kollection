"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Settings,
  Users,
  ShoppingBag,
  Package,
  Search,
  LogOut,
  Menu,
  X,
  Monitor,
  FolderTree,
  Receipt,
  Megaphone,
} from "lucide-react"

import { cn } from "@workspace/ui/lib/utils"
import { authClient } from "@/lib/auth-client"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import { TooltipProvider } from "@workspace/ui/components/tooltip"
import { useLogout } from "@/hooks/use-logout"

import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  useSidebar,
  SidebarRail,
} from "@workspace/ui/components/sidebar"
import { Input } from "@workspace/ui/components/input"

const NAV_ITEMS = [
  { name: "Overview", href: "/admin", icon: LayoutDashboard },
  { name: "Home", href: "/admin/homepage", icon: Monitor },
  { name: "Products", href: "/admin/products", icon: Package },
  { name: "Catalog", href: "/admin/catalog", icon: FolderTree },

  { name: "Taxes", href: "/admin/taxes", icon: Receipt },
  { name: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { name: "Returns & Exchanges", href: "/admin/returns", icon: Users },
  { name: "Settings", href: "/admin/settings", icon: Settings },
]

function AppSidebar({ pathname, session }: { pathname: string; session: any }) {
  const { state, toggleSidebar, isMobile } = useSidebar()
  const isCollapsed = state === "collapsed"
  const { logout } = useLogout()
  if (isMobile) return null

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-border/60 bg-background *:data-[sidebar=sidebar]:bg-background"
    >
      <SidebarHeader className="flex h-24 shrink-0 items-center justify-center border-b border-border/60 p-0">
        <button
          onClick={toggleSidebar}
          className="flex h-full w-full items-center justify-center font-heading text-2xl font-bold tracking-[0.2em] uppercase transition-opacity hover:opacity-50 focus:outline-none"
          title="Toggle Sidebar"
        >
          {isCollapsed ? "LK" : "LK."}
        </button>
      </SidebarHeader>

      <SidebarContent>
        <ScrollArea className="flex-1">
          <SidebarMenu className="gap-2 p-4">
            {NAV_ITEMS.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(`${item.href}/`)

              return (
                <SidebarMenuItem key={item.href}>
                  {/* shadcn automatically renders tooltips when collapsible="icon" using the tooltip prop */}
                  <SidebarMenuButton
                    tooltip={item.name}
                    isActive={isActive}
                    className={cn(
                      "h-12 rounded-none border border-transparent transition-all duration-300",
                      isActive
                        ? "bg-foreground font-medium text-background hover:bg-foreground/90 hover:text-background"
                        : "text-muted-foreground hover:border-border/60 hover:bg-transparent hover:text-foreground"
                    )}
                  >
                    <Link
                      href={item.href}
                      className="flex items-center gap-4 text-xs tracking-[0.2em] uppercase"
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </ScrollArea>
      </SidebarContent>

      <SidebarFooter className="shrink-0 border-t border-border/60 p-4">
        <div
          className={cn(
            "flex items-center",
            isCollapsed ? "justify-center" : "gap-4"
          )}
        >
          <div suppressHydrationWarning className="flex h-10 w-10 shrink-0 items-center justify-center rounded-none bg-foreground font-heading text-lg text-background uppercase">
            {session?.user?.name?.[0] || "A"}
          </div>

          {!isCollapsed && (
            <div className="flex-1 overflow-hidden">
              <p suppressHydrationWarning className="truncate text-xs font-medium tracking-widest uppercase">
                {session?.user?.name || "Admin"}
              </p>
              <p suppressHydrationWarning className="truncate text-[10px] tracking-widest text-muted-foreground uppercase">
                {session?.user?.role || "System"}
              </p>
            </div>
          )}

          <button
            onClick={() => logout()}
            className={cn(
              "text-muted-foreground transition-colors hover:text-destructive",
              isCollapsed && "hidden"
            )}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            <span className="sr-only">Sign Out</span>
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}

import { useRouter } from "next/navigation"
import { MobileNavBar } from "./mobile-nav-bar"

function SaveBarPortalContainer() {
  const { state, isMobile } = useSidebar()
  return (
    <div 
      id="admin-save-bar-portal" 
      className={cn(
        "fixed bottom-0 right-0 z-50 pointer-events-none transition-[left] ease-linear duration-200",
        isMobile ? "left-0" : state === "expanded" ? "left-[var(--sidebar-width)]" : "left-[var(--sidebar-width-icon)]"
      )} 
    />
  )
}

function MobileConnectedNavBar({ pathname }: { pathname: string }) {
  const { isMobile } = useSidebar()
  const router = useRouter()
  
  if (!isMobile) return null

  // Find index of current route in NAV_ITEMS
  // Be careful with "/admin" matching everything, so we check exact match for root, or startsWith for others
  const selectedIndex = NAV_ITEMS.findIndex(item => {
    if (item.href === "/admin") return pathname === "/admin" || pathname === "/en/admin" || pathname === "/ar/admin";
    return pathname === item.href || pathname.startsWith(`${item.href}/`) || pathname.includes(item.href)
  })
  
  const safeIndex = selectedIndex === -1 ? 0 : selectedIndex;

  const handleSelect = (idx: number) => {
    const item = NAV_ITEMS[idx];
    if (item) {
      router.push(item.href)
    }
  }

  return (
    <div className="md:hidden">
      <MobileNavBar items={NAV_ITEMS} selectedIndex={safeIndex} onSelectIndex={handleSelect} />
    </div>
  )
}

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { data: session } = authClient.useSession()

  return (
    <SidebarProvider defaultOpen={false} className="h-screen overflow-hidden">
      <style>{`
        body, html {
          overflow: hidden !important;
        }
      `}</style>
      <AppSidebar pathname={pathname} session={session} />

      <div className="w-full flex flex-col h-full overflow-hidden">
        <SidebarInset className="bg-background w-full pt-10 px-4 flex-1 overflow-y-auto custom-scrollbar md:pb-24">
          <main className="flex min-w-0 gap-2 px-0 md:px-4 w-full min-h-max">
            {children}
          </main>
        </SidebarInset>
        <SaveBarPortalContainer />
        <MobileConnectedNavBar pathname={pathname} />
      </div>
    </SidebarProvider>
  )
}

