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

// ----------------------------------------------------------------------
// MOBILE NAVIGATION (Kept intact per request)
// ----------------------------------------------------------------------
function MobileNav({ pathname, session }: { pathname: string; session: any }) {
  const { isMobile } = useSidebar()
  const [menuOpen, setMenuOpen] = React.useState(false)
  const { logout } = useLogout()

  React.useEffect(() => {
    if (menuOpen) document.body.style.overflow = "hidden"
    else document.body.style.overflow = "unset"
  }, [menuOpen])

  // Only render this custom layout on mobile devices
  if (!isMobile) return null

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between border-b border-border/60 bg-background/80 px-4 backdrop-blur-md">
        <span className="font-heading text-xl font-bold tracking-[0.2em] uppercase">
          LK.
        </span>
        <button onClick={() => setMenuOpen(true)} className="p-2">
          <Menu className="h-6 w-6 text-foreground" />
        </button>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-50 flex animate-in flex-col bg-background duration-200 fade-in">
          <div className="flex h-16 shrink-0 items-center justify-between border-b border-border/60 px-4">
            <span className="font-heading text-xl font-bold tracking-[0.2em] uppercase">
              MENU
            </span>
            <button onClick={() => setMenuOpen(false)} className="p-2">
              <X className="h-6 w-6 text-foreground" />
            </button>
          </div>

          <ScrollArea className="flex-1 p-6">
            <div className="flex flex-col gap-2">
              {NAV_ITEMS.map((item) => {
                const isActive =
                  pathname === item.href || pathname.startsWith(`${item.href}/`)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-6 border-b border-border/30 py-6 text-sm tracking-[0.2em] uppercase transition-colors",
                      isActive
                        ? "font-bold text-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-5 w-5",
                        isActive ? "text-foreground" : "text-muted-foreground"
                      )}
                    />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </ScrollArea>

          <div className="flex shrink-0 items-center justify-between border-t border-border/60 p-6">
            <span suppressHydrationWarning className="text-xs tracking-widest uppercase">
              {session?.user?.name || "Admin"}
            </span>
            <button
              onClick={() => logout()}
              className="text-xs font-bold tracking-widest text-destructive uppercase"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}

      <div className="pb-safe fixed inset-x-0 bottom-0 z-30 flex h-16 items-center justify-around border-t border-border/60 bg-background/90 backdrop-blur-lg">
        {NAV_ITEMS.slice(0, 4).map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 p-2 transition-colors",
                isActive ? "text-foreground" : "text-muted-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {isActive && (
                <div className="mt-1 h-1 w-1 rounded-full bg-foreground" />
              )}
            </Link>
          )
        })}
      </div>
    </>
  )
}

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

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { data: session } = authClient.useSession()

  return (

      <SidebarProvider defaultOpen={false}>
        <AppSidebar pathname={pathname} session={session} />

        <MobileNav pathname={pathname} session={session} />

        <ScrollArea className="w-full ">
          <SidebarInset className="bg-background w-full pt-10 px-4 ">
            <main className="flex min-w-0 gap-2 px-4 pb-24 w-full">
              {children}
            </main>
          </SidebarInset>
          <SaveBarPortalContainer />
        </ScrollArea>
      </SidebarProvider>
  
  )
}
