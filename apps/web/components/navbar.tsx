"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search as SearchIcon, ShoppingBag, User, Heart, Home, Grid } from "lucide-react";
import { Search } from "./search";
import { cn } from "@workspace/ui/lib/utils";
import { useCartQuery } from "@/app/[locale]/cart/queries";
import { authClient } from "@/lib/auth-client";
import { UserAvatar } from "@/components/user-avatar";
import { Logo } from "@/components/logo";

export function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const { data: cartSummary } = useCartQuery();
  const totalItems = cartSummary?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;
  
  const { data: sessionData } = authClient.useSession();

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Hide navbar on auth pages and admin pages
  const isHiddenRoute = pathname.match(/^\/(en|ar)\/(sign-in|sign-up|admin)/) || 
                        pathname.startsWith("/sign-in") || 
                        pathname.startsWith("/sign-up") || 
                        pathname.startsWith("/admin");
  if (isHiddenRoute) {
    return null;
  }

  return (
    <>
      {/* Desktop & Mobile Top Navbar */}
      <header
        className={cn(
          "sticky top-0 z-50 w-full transition-all duration-300 bg-background/80 backdrop-blur-md border-b border-border/40",
          isScrolled ? "py-2 shadow-sm" : "py-4"
        )}
      >
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between gap-4 md:gap-8">
            
            {/* Logo */}
            <Logo />

            {/* Desktop Search Area (Large) */}
            <div className="hidden md:flex flex-1 max-w-2xl relative group">
              <Search />
            </div>

            {/* Mobile Search Area (Compact) */}
            <div className="flex md:hidden flex-1 relative group">
              <Search isMobile />
            </div>

            {/* Desktop Actions */}
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/account/wishlist" className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors group">
                <Heart className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                <span className="text-[10px] uppercase tracking-widest font-medium">Wishlist</span>
              </Link>
              <Link href="/account" className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors group">
                {sessionData?.user ? (
                  <UserAvatar user={sessionData.user} className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" iconClassName="w-3 h-3" />
                ) : (
                  <User className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                )}
                <span className="text-[10px] uppercase tracking-widest font-medium">Account</span>
              </Link>
              <Link href="/cart" className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors group relative">
                <ShoppingBag className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                <span className="text-[10px] uppercase tracking-widest font-medium">Cart</span>
                {mounted && totalItems > 0 && (
                  <span className="absolute -top-1 -right-2 bg-foreground text-background text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center animate-in zoom-in">
                    {totalItems > 9 ? "9+" : totalItems}
                  </span>
                )}
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (Tab Bar) */}
      <div id="mobile-bottom-nav" className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl border-t border-border/40 pb-safe shadow-[0_-5px_15px_-10px_rgba(0,0,0,0.1)]">
        <nav className="flex items-center justify-around h-16 px-2">
          
          <Link href="/" className={cn(
            "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors",
            pathname === "/" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
          )}>
            <Home className={cn("h-5 w-5 transition-transform duration-200", pathname === "/" && "scale-110")} />
            <span className="text-[10px] uppercase tracking-wider font-medium">Home</span>
          </Link>

          <Link href="/categories" className={cn(
            "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors",
            pathname.startsWith("/categories") ? "text-foreground" : "text-muted-foreground hover:text-foreground"
          )}>
            <Grid className={cn("h-5 w-5 transition-transform duration-200", pathname.startsWith("/categories") && "scale-110")} />
            <span className="text-[10px] uppercase tracking-wider font-medium">Shop</span>
          </Link>

          <Link href="/cart" className={cn(
            "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors relative",
            pathname === "/cart" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
          )}>
            <div className="relative">
              <ShoppingBag className={cn("h-5 w-5 transition-transform duration-200", pathname === "/cart" && "scale-110")} />
              {mounted && totalItems > 0 && (
                <span className="absolute -top-1 -right-2 bg-foreground text-background text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center border border-background animate-in zoom-in">
                  {totalItems > 9 ? "9+" : totalItems}
                </span>
              )}
            </div>
            <span className="text-[10px] uppercase tracking-wider font-medium">Cart</span>
          </Link>

          <Link href="/account/wishlist" className={cn(
            "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors",
            pathname === "/account/wishlist" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
          )}>
            <Heart className={cn("h-5 w-5 transition-transform duration-200", pathname === "/account/wishlist" && "scale-110")} />
            <span className="text-[10px] uppercase tracking-wider font-medium">Saved</span>
          </Link>

          <Link href="/account" className={cn(
            "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors",
            pathname.startsWith("/account") && !pathname.includes("wishlist") ? "text-foreground" : "text-muted-foreground hover:text-foreground"
          )}>
            {sessionData?.user ? (
              <UserAvatar user={sessionData.user} className={cn("w-5 h-5 transition-transform duration-200", pathname.startsWith("/account") && !pathname.includes("wishlist") && "scale-110")} iconClassName="w-3 h-3" />
            ) : (
              <User className={cn("h-5 w-5 transition-transform duration-200", pathname.startsWith("/account") && !pathname.includes("wishlist") && "scale-110")} />
            )}
            <span className="text-[10px] uppercase tracking-wider font-medium">Me</span>
          </Link>

        </nav>
      </div>
    </>
  );
}
