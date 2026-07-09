"use client";

import { DesktopCart } from "./components/desktop-cart";
import { MobileCart } from "./components/mobile-cart";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@workspace/ui/components/button";
import { ShoppingBag } from "lucide-react";

import { useCartQuery } from "./queries";

export default function CartPage() {
  const [mounted, setMounted] = useState(false);
  const { data: cartSummary, isLoading } = useCartQuery();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-16 w-16 bg-muted rounded-full mb-6"></div>
          <div className="h-8 w-48 bg-muted rounded mb-2"></div>
          <div className="h-4 w-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  const items = cartSummary?.items || [];
  
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <ShoppingBag className="h-16 w-16 text-muted-foreground/30 mb-6" />
        <h1 className="text-2xl md:text-4xl font-serif tracking-tight mb-2">Your cart is empty</h1>
        <p className="text-muted-foreground text-center mb-8">
          Discover our latest collection and find something you love.
        </p>
        <Link href="/">
          <Button size="lg" className="rounded-full px-8 uppercase tracking-widest text-xs font-bold">
            Continue Shopping
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background pb-32 md:pb-12 pt-24 md:pt-32">
      {/* Mobile Layout (Hidden on md and up) */}
      <div className="block md:hidden">
        <MobileCart summary={cartSummary} />
      </div>

      {/* Desktop Layout (Hidden on small screens) */}
      <div className="hidden md:block max-w-7xl mx-auto px-6 lg:px-8">
        <DesktopCart summary={cartSummary} />
      </div>
    </main>
  );
}
