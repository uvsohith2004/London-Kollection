"use client";

import { DesktopCart } from "./components/desktop-cart";
import { MobileCart } from "./components/mobile-cart";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@workspace/ui/components/button";
import { ShoppingBag, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { cartQueries } from "@/queries/cart.queries";

export function CartClientView() {
  const [mounted, setMounted] = useState(false);
  const { data: cartSummary, isLoading } = useQuery(cartQueries.current());

  useEffect(() => {
    setMounted(true);
    window.scrollTo(0, 0);
  }, []);

  if (!mounted) return null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
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
    <>
      <div className="block md:hidden">
        <MobileCart summary={cartSummary} />
      </div>
      <div className="hidden md:block max-w-7xl mx-auto px-6 lg:px-8">
        <DesktopCart summary={cartSummary} />
      </div>
    </>
  );
}
